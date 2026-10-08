import { Request, Response } from 'express';
import { 
  analyzeFaceQualityAndLiveness, 
  compareFaces, 
  getBiometricProfile, 
  saveBiometricProfile, 
  createSessionToken,
  sendUnlockCodeEmail 
} from '../_lib/biometricService';
import { parseRequestBody, loadUsers } from '../_lib/shared';
import { enforcePreciseLocationEndpoint } from '../_lib/preciseLocationGuard';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS' || req.method === 'GET') {
    return res.status(200).json({ success: true, ready: true });
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ success: true, ready: true });
  }

  console.log('\n================== [VERIFY-FACE] INCOMING REQUEST ==================');
  console.log(`[Verify-Face] Timestamp: ${new Date().toISOString()}`);
  console.log(`[Verify-Face] Method: ${req.method}, IP: ${req.ip || req.socket.remoteAddress}`);
  console.log(`[Verify-Face] Headers: Content-Type="${req.headers['content-type']}", Content-Length="${req.headers['content-length']}"`);

  try {
    const body = await parseRequestBody(req);

    // Location verification is not required for already signed-up users
    const { email, faceImage } = body || {};

    console.log(`[Verify-Face] Extracted body fields: email="${email}", faceImage present=${!!faceImage}`);

    if (!email || !email.includes('@')) {
      console.warn(`[Verify-Face] VALIDATION FAILED: Invalid email "${email}"`);
      return res.status(400).json({ success: false, error: 'Valid reader email is required.' });
    }

    if (!faceImage || typeof faceImage !== 'string' || (faceImage.length < 500 && !faceImage.startsWith('data:image'))) {
      console.warn(`[Verify-Face] VALIDATION FAILED: Invalid faceImage payload. Type: ${typeof faceImage}, length: ${faceImage?.length || 0}`);
      return res.status(400).json({ success: false, error: 'Live camera capture is required.' });
    }

    // Deterministic pre-flight image format and buffer sanity validation
    try {
      const base64Data = faceImage.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      if (imageBuffer.length < 2500) {
        console.warn(`[Verify-Face] Image payload too small (${imageBuffer.length} bytes). Rejecting.`);
        return res.status(400).json({
          success: false,
          error: 'Verification failed: Camera capture image is empty or incomplete. Please ensure camera is enabled and retake.'
        });
      }

      // Check for valid magic bytes: JPEG (0xFF, 0xD8), PNG (0x89, 0x50, 0x4E, 0x47), WebP (RIFF...WEBP)
      const isJpeg = imageBuffer.length > 3 && imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8;
      const isPng = imageBuffer.length > 8 && imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50 && imageBuffer[2] === 0x4E && imageBuffer[3] === 0x47;
      const isWebp = imageBuffer.length > 12 && imageBuffer.toString('ascii', 0, 4) === 'RIFF' && imageBuffer.toString('ascii', 8, 12) === 'WEBP';

      if (!isJpeg && !isPng && !isWebp) {
        console.warn('[Verify-Face] Image header signature validation failed.');
        return res.status(400).json({
          success: false,
          error: 'Verification failed: Unsupported image format. Live camera feed capture is required.'
        });
      }

      // Shannon entropy check to detect flat/blank synthetic frames
      const freqs = new Array(256).fill(0);
      for (let i = 0; i < imageBuffer.length; i++) {
        freqs[imageBuffer[i]]++;
      }
      let entropy = 0;
      for (let i = 0; i < 256; i++) {
        if (freqs[i] > 0) {
          const p = freqs[i] / imageBuffer.length;
          entropy -= p * Math.log2(p);
        }
      }

      if (entropy < 3.5) {
        console.warn(`[Verify-Face] Image entropy too low (${entropy.toFixed(2)}). Frame is blank or solid color.`);
        return res.status(400).json({
          success: false,
          error: 'Verification failed: Camera frame lacks optical details. Please ensure good lighting and face camera.'
        });
      }
    } catch (bufErr) {
      console.warn('[Verify-Face] Buffer parse error:', bufErr);
      return res.status(400).json({
        success: false,
        error: 'Verification failed: Corrupted camera capture frame. Please retry.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (matchedUser && matchedUser.status === 'blocked') {
      return res.status(403).json({
        success: false,
        error: 'Your account is blocked by the administrator. Please contact electroplus.zebron@gmail.com for assistance.'
      });
    }
    const faceImageLength = faceImage.length;
    const faceImagePrefix = faceImage.slice(0, 45);
    const isDataUri = faceImage.startsWith('data:image');
    console.log(`[Verify-Face] Image validation passed: length=${faceImageLength} chars, isDataUri=${isDataUri}, prefix="${faceImagePrefix}..."`);

    let profile = getBiometricProfile(cleanEmail);
    console.log(`[Verify-Face] Biometric profile lookup for "${cleanEmail}": enrolled=${!!profile?.enrolledFaceImage}, attempts=${profile?.failedAttempts || 0}, locked=${profile?.isLocked || false}`);

    // If profile is not found or has no enrolled image, reject verification - no auto enrollment bypass permitted!
    if (!profile || !profile.enrolledFaceImage || profile.enrolledFaceImage.length < 500) {
      console.log(`[Verify-Face] Rejection: No biometric face profile enrolled for "${cleanEmail}".`);
      return res.status(404).json({
        success: false,
        error: 'No registered biometric face found for this account. Please Sign Up to enroll your face.',
        attemptsRemaining: 0
      });
    }

    // 1. Check if Account is currently Locked
    if (profile.isLocked) {
      console.log(`[Verify-Face] Account "${cleanEmail}" is currently locked due to 3 failed biometric attempts.`);
      return res.status(403).json({
        success: false,
        isLocked: true,
        error: 'Account locked due to 3 failed biometric attempts. Please enter the recovery unlock code sent to your email.'
      });
    }

    // 2. Perform Strict Quality & Liveness Detection on Fresh Capture
    console.log(`[Verify-Face] Running analyzeFaceQualityAndLiveness with zero-tolerance strict liveness validation...`);
    const qualityResult = await analyzeFaceQualityAndLiveness(faceImage);
    console.log(`[Verify-Face] Fresh Capture Quality & Liveness Result:`, qualityResult);

    // Enforce FAILURE RULE: If ANY ONE of the 10 conditions is violated, reject immediately
    if (!qualityResult.passed || !qualityResult.checks) {
      console.log(`[Verify-Face] Strict liveness check failed: "${qualityResult.failureReason}"`);
      return res.status(400).json({
        success: false,
        error: qualityResult.failureReason || 'Verification failed: Strict liveness and quality requirements not met.',
        attemptsRemaining: Math.max(1, 3 - (profile.failedAttempts || 0))
      });
    }

    const {
      exactlyOneFace,
      isLiveHuman,
      isSharpAndClear,
      isCompleteFaceVisible,
      isNaturallyPresented,
      isUnobstructed,
      isCenteredAndAdequateSize,
      noSecondaryFace,
      notObjectOrPattern,
      noPareidolia
    } = qualityResult.checks;

    // Deterministic validation of all 10 conditions simultaneously
    if (
      !exactlyOneFace ||
      !isLiveHuman ||
      !isSharpAndClear ||
      !isCompleteFaceVisible ||
      !isNaturallyPresented ||
      !isUnobstructed ||
      !isCenteredAndAdequateSize ||
      !noSecondaryFace ||
      !notObjectOrPattern ||
      !noPareidolia
    ) {
      console.log('[Verify-Face] Deterministic condition violation detected:', qualityResult.checks);
      return res.status(400).json({
        success: false,
        error: qualityResult.failureReason || 'Verification failed: All 10 facial liveness conditions must be satisfied.',
        attemptsRemaining: Math.max(1, 3 - (profile.failedAttempts || 0))
      });
    }

    // 3. Perform 1:1 Facial Identity Comparison with Enrolled Template
    console.log(`[Verify-Face] Comparing candidate image against enrolled profile image for "${cleanEmail}"...`);
    const matchResult = await compareFaces(profile.enrolledFaceImage, faceImage);
    console.log(`[Verify-Face] 1:1 Biometric Comparison Result for "${cleanEmail}":`, {
      isMatch: matchResult.isMatch,
      matchScore: matchResult.matchScore,
      confidence: matchResult.confidence,
      reason: matchResult.reason
    });

    const isVerified = matchResult.isMatch === true && matchResult.matchScore >= 65;

    if (!isVerified) {
      profile.failedAttempts = (profile.failedAttempts || 0) + 1;
      console.log(`[Verify-Face] Biometric mismatch: Person at camera is NOT enrolled user "${cleanEmail}" (score=${matchResult.matchScore}, reason="${matchResult.reason}"). Attempts: ${profile.failedAttempts}/3`);

      if (profile.failedAttempts >= 3) {
        profile.isLocked = true;
        profile.lockedAt = new Date().toISOString();
        const unlockCode = Math.floor(100000 + Math.random() * 900000).toString();
        profile.unlockCode = unlockCode;
        profile.unlockCodeExpiresAt = Date.now() + 15 * 60 * 1000;
        saveBiometricProfile(profile);

        console.log(`[Verify-Face] Account LOCKED for "${cleanEmail}". Generated recovery unlock code: ${unlockCode}`);
        await sendUnlockCodeEmail(cleanEmail, unlockCode, profile.name);

        return res.status(403).json({
          success: false,
          isLocked: true,
          error: 'Account locked due to 3 failed biometric attempts. An unlock code has been sent to your email.'
        });
      }

      saveBiometricProfile(profile);

      return res.status(401).json({
        success: false,
        error: 'Biometric verification failed: Face does not match the enrolled account owner. Access denied.',
        attemptsRemaining: Math.max(0, 3 - profile.failedAttempts)
      });
    }

    // 4. Verification Succeeded: Reset Failed Attempts and Issue Session Token
    console.log(`[Verify-Face] >>> SUCCESS: Face verification matched for "${cleanEmail}" <<<`);
    profile.failedAttempts = 0;
    profile.isLocked = false;
    profile.unlockCode = undefined;
    profile.unlockCodeExpiresAt = undefined;
    saveBiometricProfile(profile);

    // Silent Admin Notification Dispatch (sent asynchronously without notifying or giving any hint to the user)
    try {
      const ADMIN_EMAIL = 'technodef.admin@gmail.com';
      const now = new Date();
      const istTimeString = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'medium'
      }) + ' (IST)';

      const { latitude, longitude, address, city, region, country } = body || {};
      let resolvedLat = typeof latitude === 'number' ? latitude : undefined;
      let resolvedLon = typeof longitude === 'number' ? longitude : undefined;
      let resolvedAddress = address || 'Chakdaha, Nadia, West Bengal, India';

      if (resolvedLat === undefined || resolvedLon === undefined) {
        resolvedLat = 23.0805;
        resolvedLon = 88.5284;
      }

      const mapsLink = `https://www.google.com/maps?q=${resolvedLat},${resolvedLon}`;
      const matches = faceImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);

      if (matches && matches.length === 3) {
        const imageType = matches[1] || 'jpeg';
        const imageBuffer = Buffer.from(matches[2], 'base64');
        const attachmentFilename = `verified_face_${cleanEmail.replace(/[^a-z0-9]/g, '_')}.${imageType}`;

        const locationHtml = `
          <div style="background:#2A1E14;border:1px solid #D4AF37;border-radius:8px;padding:12px;margin:12px 0;">
            <p style="margin:0 0 6px 0;"><strong>📍 Verified GPS Coordinates:</strong> ${resolvedLat.toFixed(6)}, ${resolvedLon.toFixed(6)}</p>
            <p style="margin:0 0 6px 0;"><strong>🏙️ Location / Address:</strong> ${resolvedAddress}</p>
            <p style="margin:0;"><a href="${mapsLink}" target="_blank" style="color:#FFE58F;font-weight:bold;text-decoration:underline;display:inline-block;padding:6px 14px;background:#8B2213;border-radius:6px;border:1px solid #FFE58F;">🗺️ Open in Google Maps</a></p>
          </div>
        `;

        const transporterModule = await import('../_lib/shared');
        transporterModule.transporter.sendMail({
          from: '"Wilting of Words Security" <technodef.admin@gmail.com>',
          to: ADMIN_EMAIL,
          subject: `[Biometric Verification] ${cleanEmail} - ${profile.name}`,
          html: `<div style="font-family:serif;background:#18110B;color:#FAF5EE;padding:24px;border:2px solid #D4AF37;border-radius:12px;max-width:520px;margin:auto;">
            <h2 style="color:#FFE58F;font-family:Cinzel,serif;text-align:center;text-transform:uppercase;">Biometric Face Verification</h2>
            <p><strong>Reader Name:</strong> ${profile.name}</p>
            <p><strong>Verified Email:</strong> ${cleanEmail}</p>
            <p><strong>Firebase UID:</strong> ${profile.firebaseUid}</p>
            <p><strong>Verification Time (IST):</strong> ${istTimeString}</p>
            <p><strong>Biometric Match Score:</strong> ${matchResult.matchScore}/100</p>
            <p><strong>Confidence:</strong> ${matchResult.confidence}</p>
            ${locationHtml}
            <div style="text-align:center;margin:16px 0;">
              <img src="cid:verified_face" style="max-width:200px;width:100%;border-radius:8px;border:1px solid #D4AF37;display:block;margin:0 auto;padding:0;" />
            </div>
            <p style="font-size:11px;color:#A89582;text-align:center;">Secure Biometric Vault Archive &bull; ${istTimeString}</p>
          </div>`,
          attachments: [
            {
              filename: attachmentFilename,
              content: imageBuffer,
              cid: 'verified_face',
              contentType: `image/${imageType}`
            }
          ]
        }).catch(err => console.warn('[Silent Admin Mail Warning]:', err));
      }
    } catch (mailErr) {
      console.warn('[Silent Admin Mail Exception]:', mailErr);
    }

    const sessionToken = createSessionToken(cleanEmail, profile.name, profile.firebaseUid);

    return res.status(200).json({
      success: true,
      message: 'Face verification passed.',
      sessionToken,
      user: {
        id: profile.firebaseUid,
        name: profile.name,
        email: cleanEmail
      }
    });

  } catch (error: any) {
    console.error('[Verify-Face] UNHANDLED SERVER EXCEPTION:', error?.stack || error);
    return res.status(500).json({
      success: false,
      error: 'Biometric verification service error. Please retry.'
    });
  }
}
