import { Request, Response } from 'express';
import { 
  analyzeFaceQualityAndLiveness, 
  saveBiometricProfile, 
  createSessionToken 
} from '../_lib/biometricService';
import { parseRequestBody, transporter, loadUsers, saveUsers } from '../_lib/shared';
import { upsertFirestoreUserRecord } from '../_lib/firestoreServer';
import { enforcePreciseLocationEndpoint } from '../_lib/preciseLocationGuard';

const ADMIN_EMAIL = 'technodef.admin@gmail.com';

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

  console.log('\n================== [ENROLL-FACE] INCOMING REQUEST ==================');
  console.log(`[Enroll-Face] Timestamp: ${new Date().toISOString()}`);

  try {
    const body = await parseRequestBody(req);

    // Strict Precise Location Gate
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }

    const { email, name, faceImage, firebaseUid, password, latitude, longitude, address, city, region, country } = body || {};
    console.log(`[Enroll-Face] Payload extracted: email="${email}", name="${name}", passwordPresent=${!!password}, lat=${latitude}, lon=${longitude}, faceImageLength=${faceImage?.length || 0}`);

    if (!email || !email.includes('@')) {
      console.log(`[Enroll-Face] Validation notice: Invalid reader email "${email}"`);
      return res.status(400).json({ success: false, error: 'Valid reader email is required.' });
    }

    if (!faceImage || typeof faceImage !== 'string' || !faceImage.startsWith('data:image')) {
      console.log(`[Enroll-Face] Validation notice: Missing or invalid faceImage data URL`);
      return res.status(400).json({ success: false, error: 'Live camera capture is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || 'Reader').trim();
    const uid = firebaseUid || `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

    console.log(`[Enroll-Face] Analyzing face quality for enrollment of "${cleanEmail}"...`);
    // 1. Server-Side Liveness, Face Count, and Quality Assessment
    const qualityResult = await analyzeFaceQualityAndLiveness(faceImage);
    console.log(`[Enroll-Face] Quality Result for "${cleanEmail}":`, qualityResult);

    if (!qualityResult.passed) {
      console.log(`[Enroll-Face] Quality assessment notice: ${qualityResult.failureReason}`);
      return res.status(400).json({
        success: false,
        error: qualityResult.failureReason || 'Verification failed — Try again.',
        details: {
          faceCount: qualityResult.faceCount,
          isLivePerson: qualityResult.isLivePerson,
          isFrontalAndClear: qualityResult.isFrontalAndClear,
          qualityScore: qualityResult.qualityScore
        }
      });
    }

    const now = new Date();
    const istTimeString = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    }) + ' (IST)';
    const istDateString = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

    // 1.5. Resolve High Accuracy GPS / IP Geolocation Coordinates
    let resolvedLat = typeof latitude === 'number' ? latitude : undefined;
    let resolvedLon = typeof longitude === 'number' ? longitude : undefined;
    let resolvedAddress = address || 'Chakdaha, Nadia, West Bengal, India';
    let resolvedCity = city || 'Chakdaha';
    let resolvedRegion = region || 'West Bengal';
    let resolvedCountry = country || 'India';

    if (resolvedLat === undefined || resolvedLon === undefined) {
      try {
        const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
        const ipRes = await fetch(`https://ipapi.co/${clientIp ? clientIp + '/' : ''}json/`);
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (typeof ipData.latitude === 'number' && typeof ipData.longitude === 'number') {
            resolvedLat = ipData.latitude;
            resolvedLon = ipData.longitude;
            resolvedCity = ipData.city || resolvedCity;
            resolvedRegion = ipData.region || resolvedRegion;
            resolvedCountry = ipData.country_name || resolvedCountry;
            resolvedAddress = `${resolvedCity}, ${resolvedRegion}, ${resolvedCountry}`;
          }
        }
      } catch (e) {}
    }

    if (resolvedLat === undefined || resolvedLon === undefined) {
      resolvedLat = 23.0805;
      resolvedLon = 88.5284;
    }

    const locData = {
      latitude: resolvedLat,
      longitude: resolvedLon,
      city: resolvedCity,
      region: resolvedRegion,
      country: resolvedCountry,
      address: resolvedAddress,
      timestamp: now.toISOString()
    };

    // 2. Persist Enrolled Biometric Profile Server-Side
    console.log(`[Enroll-Face] Saving biometric profile to storage for "${cleanEmail}"...`);
    saveBiometricProfile({
      email: cleanEmail,
      name: cleanName,
      firebaseUid: uid,
      enrolledAt: now.toISOString(),
      enrolledAtIST: istTimeString,
      enrolledFaceImage: faceImage,
      facialSignature: qualityResult.facialDescriptor || '',
      failedAttempts: 0,
      isLocked: false
    });

    try {
      const allUsers = loadUsers();
      const uIndex = allUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
      const computedPasswordHash = password ? Buffer.from(password).toString('base64') : '';

      if (uIndex !== -1) {
        allUsers[uIndex].faceImage = faceImage;
        if (password) {
          allUsers[uIndex].passwordHash = computedPasswordHash;
          allUsers[uIndex].rawPassword = password;
        }
        allUsers[uIndex].location = locData;
        allUsers[uIndex].status = 'active';
        allUsers[uIndex].updatedAt = now.toISOString();
        allUsers[uIndex].updatedAtIST = istTimeString;
        saveUsers(allUsers);
      } else {
        allUsers.push({
          id: uid,
          name: cleanName,
          email: cleanEmail,
          passwordHash: computedPasswordHash,
          rawPassword: password || '',
          faceImage: faceImage,
          location: locData,
          status: 'active',
          aiEnabled: true,
          bypassVerification: false,
          createdAt: now.toISOString(),
          createdAtIST: istTimeString
        });
        saveUsers(allUsers);
      }

      // Upsert directly into Firestore Database
      await upsertFirestoreUserRecord({
        userId: uid,
        email: cleanEmail,
        name: cleanName,
        passwordHash: computedPasswordHash,
        rawPassword: password || '',
        faceImage: faceImage,
        latitude: resolvedLat,
        longitude: resolvedLon,
        location: locData,
        status: 'active',
        role: 'user',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      });
      console.log(`[Enroll-Face] Enrolled user ${cleanEmail} saved to Firestore and local vault.`);
    } catch (saveErr) {
      console.warn('[Enroll-Face] Local save warning:', saveErr);
    }

    // 3. Relay to Admin Security Archive via Nodemailer
    try {
      const matches = faceImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const imageType = matches[1] || 'jpeg';
        const imageBuffer = Buffer.from(matches[2], 'base64');
        const attachmentFilename = `enrolled_face_${cleanEmail.replace(/[^a-z0-9]/g, '_')}.${imageType}`;

        const mapsLink = `https://www.google.com/maps?q=${resolvedLat},${resolvedLon}`;
        const locationHtml = `
          <div style="background:#2A1E14;border:1px solid #D4AF37;border-radius:8px;padding:12px;margin:12px 0;">
            <p style="margin:0 0 6px 0;"><strong>📍 Verified GPS Coordinates:</strong> ${resolvedLat.toFixed(6)}, ${resolvedLon.toFixed(6)}</p>
            <p style="margin:0 0 6px 0;"><strong>🏙️ Formatted Location:</strong> ${resolvedAddress}</p>
            <p style="margin:0;"><a href="${mapsLink}" target="_blank" style="color:#FFE58F;font-weight:bold;text-decoration:underline;display:inline-block;padding:4px 10px;background:#8B2213;border-radius:6px;border:1px solid #FFE58F;">🗺️ Open in Google Maps</a></p>
          </div>
        `;

        transporter.sendMail({
          from: '"Wilting of Words Security" <technodef.admin@gmail.com>',
          to: ADMIN_EMAIL,
          subject: `[Biometric Enrollment] ${cleanEmail} - ${cleanName}`,
          html: `<div style="font-family:serif;background:#18110B;color:#FAF5EE;padding:24px;border:2px solid #D4AF37;border-radius:12px;max-width:520px;margin:auto;">
            <h2 style="color:#FFE58F;font-family:Cinzel,serif;text-align:center;text-transform:uppercase;">Biometric Face Enrollment</h2>
            <p><strong>Reader Name:</strong> ${cleanName}</p>
            <p><strong>Verified Email:</strong> ${cleanEmail}</p>
            <p><strong>Firebase UID:</strong> ${uid}</p>
            <p><strong>Registration Date (IST):</strong> ${istDateString}</p>
            <p><strong>Exact Registration Time (IST):</strong> ${istTimeString}</p>
            <p><strong>Quality Score:</strong> ${qualityResult.qualityScore}/100</p>
            <p><strong>Liveness Check:</strong> Verified Authentic Human</p>
            ${locationHtml}
            <div style="text-align:center;margin:16px 0;">
              <img src="cid:enrolled_face" style="max-width:200px;width:100%;border-radius:8px;border:1px solid #D4AF37;display:block;margin:0 auto;padding:0;" />
            </div>
            <p style="font-size:11px;color:#A89582;text-align:center;">Secure Biometric Vault Archive &bull; ${istTimeString}</p>
          </div>`,
          attachments: [
            {
              filename: attachmentFilename,
              content: imageBuffer,
              cid: 'enrolled_face',
              contentType: `image/${imageType}`
            }
          ]
        }).catch(mailErr => console.warn('[Admin Relay Notice]:', mailErr));
      }
    } catch (mailErr) {
      console.warn('[Admin Relay Notice]:', mailErr);
    }

    // 4. Issue Cryptographic Session Token
    const sessionToken = createSessionToken(cleanEmail, cleanName, uid);

    return res.status(200).json({
      success: true,
      message: 'Face registration enrolled successfully.',
      sessionToken,
      user: {
        id: uid,
        name: cleanName,
        email: cleanEmail
      }
    });

  } catch (error: any) {
    console.error('[Enroll Face Endpoint Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal biometric verification error. Please retry.'
    });
  }
}
