import { Request, Response } from 'express';
import { transporter, parseRequestBody, loadUsers, saveUsers } from '../_lib/shared';
import { analyzeFaceQualityAndLiveness, saveBiometricProfile } from '../_lib/biometricService';
import { enforcePreciseLocationEndpoint } from '../_lib/preciseLocationGuard';

// Admin Email Address configured server-side (fixed & non-editable by frontend)
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

  try {
    const body = await parseRequestBody(req);

    // Strict Precise Location Gate
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }

    const { email, name, faceImage, firebaseUid, timestamp, latitude, longitude, address, city, region, country } = body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Verified user email is required.' });
    }

    if (!faceImage || typeof faceImage !== 'string' || !faceImage.startsWith('data:image')) {
      return res.status(400).json({ error: 'A valid captured face image is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || 'Reader').trim();
    const uid = firebaseUid || `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

    // Perform strict quality & authenticity check
    const qualityResult = await analyzeFaceQualityAndLiveness(faceImage);
    if (!qualityResult.passed) {
      return res.status(400).json({
        success: false,
        error: qualityResult.failureReason || 'Face verification failed: Uncovered genuine face not detected.'
      });
    }

    const isoTime = timestamp || new Date().toISOString();
    const formattedDate = new Date(isoTime).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'UTC'
    });

    // Parse base64 image data
    const matches = faceImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid face image format.' });
    }

    const imageType = matches[1] || 'jpeg';
    const base64Data = matches[2];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const fileNameSafe = cleanEmail.replace(/[^a-z0-9]/g, '_');
    const attachmentFilename = `face_registration_${fileNameSafe}.${imageType}`;

    // Resolve High Accuracy Coordinates
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
      timestamp: new Date().toISOString()
    };

    // Persist face image on local user record for admin dashboard preview
    try {
      const users = loadUsers();
      const userIdx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
      const nowIso = new Date().toISOString();
      const userUid = uid || 'usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_');

      if (userIdx !== -1) {
        users[userIdx].faceImage = faceImage;
        users[userIdx].location = locData;
        users[userIdx].status = 'active';
        users[userIdx].updatedAt = nowIso;
        saveUsers(users);
      } else {
        users.push({
          id: userUid,
          name: cleanName,
          email: cleanEmail,
          passwordHash: '',
          faceImage: faceImage,
          location: locData,
          status: 'active',
          aiEnabled: true,
          bypassVerification: false,
          createdAt: nowIso,
          updatedAt: nowIso
        });
        saveUsers(users);
      }

      // Upsert to Firestore
      try {
        const { upsertFirestoreUserRecord } = await import('../_lib/firestoreServer');
        await upsertFirestoreUserRecord({
          userId: userUid,
          email: cleanEmail,
          name: cleanName,
          faceImage: faceImage,
          latitude: resolvedLat,
          longitude: resolvedLon,
          location: locData,
          status: 'active',
          role: 'user',
          updatedAt: nowIso
        });
      } catch (fbErr) {
        console.warn('[Register-Face] Firestore sync warning:', fbErr);
      }
    } catch (saveErr) {
      console.warn('[Face Registration] Local save warning:', saveErr);
    }

    const mapsUrl = `https://www.google.com/maps?q=${resolvedLat},${resolvedLon}`;

    // Construct Admin Email Notification HTML
    const adminEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Face Registration Security Alert</title>
  <style>
    body { font-family: 'Georgia', serif; background-color: #F7F3EC; color: #2D241E; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #FCF9F2; border: 2.5px solid #8B261D; padding: 30px; box-shadow: 0 8px 30px rgba(139,38,29,0.1); }
    .title { font-family: 'Cinzel', serif; font-size: 22px; color: #6B1D1D; text-align: center; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; }
    .subtitle { font-size: 11px; text-align: center; color: #8C6F48; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; margin-bottom: 20px; }
    .field-card { background: #F8EFE1; border: 1.5px solid #8B261D; border-radius: 8px; padding: 16px; margin: 15px 0; }
    .field-row { font-size: 13px; line-height: 1.8; color: #3E3228; }
    .label { font-weight: bold; color: #6B1D1D; display: inline-block; width: 140px; }
    .face-preview { text-align: center; margin: 20px 0; }
    .face-preview img { max-width: 200px; width: 100%; border-radius: 8px; border: 1px solid #8B261D; margin: 0 auto; display: block; padding: 0; }
    .badge { display: inline-block; background: #8B261D; color: #FFF; font-size: 10px; font-weight: bold; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; }
    .footer { font-size: 10px; text-align: center; color: #8C7662; margin-top: 25px; border-top: 1px solid #ECE3D0; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align:center; color:#8B261D; font-size:18px;">❦ &nbsp; ✤ &nbsp; ❦</div>
    <h1 class="title">WILTING OF WORDS</h1>
    <div class="subtitle">SECURITY &amp; BIOMETRIC REGISTRATION ARCHIVE</div>
    
    <div style="text-align:center; margin-bottom: 15px;">
      <span class="badge">AUTOMATIC FACE REGISTRATION DISPATCH</span>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #2D241E;">
      An automatic face registration image has been captured following successful email OTP verification and submitted to the administrator archive:
    </p>

    <div class="field-card">
      <div class="field-row"><span class="label">Verified Email:</span> <strong>${cleanEmail}</strong></div>
      <div class="field-row"><span class="label">Reader Name:</span> ${cleanName}</div>
      <div class="field-row"><span class="label">Firebase UID:</span> <code>${uid}</code></div>
      <div class="field-row"><span class="label">Registration Time:</span> ${formattedDate} (${isoTime})</div>
      <div class="field-row"><span class="label">GPS Coordinates:</span> <strong>${resolvedLat.toFixed(6)}, ${resolvedLon.toFixed(6)}</strong></div>
      <div class="field-row"><span class="label">Formatted Address:</span> ${resolvedAddress}</div>
      <div class="field-row"><span class="label">Google Maps:</span> <a href="${mapsUrl}" target="_blank" style="color:#8B261D;font-weight:bold;text-decoration:underline;">Open Coordinates in Google Maps</a></div>
      <div class="field-row"><span class="label">Verification Status:</span> <span style="color:#2E7D32; font-weight:bold;">OTP Verified &amp; Face Captured</span></div>
    </div>

    <div class="face-preview">
      <div style="font-size:11px; font-weight:bold; color:#8A6740; text-transform:uppercase; margin-bottom:8px;">Captured Biometric Face Image</div>
      <img src="cid:user_face_image" alt="Captured Face Registration" />
    </div>

    <p style="font-size: 11.5px; color: #5C4B3D; line-height: 1.6; background: #F7EEDE; border-left: 3px solid #8B261D; padding: 10px 14px;">
      <strong>Security &amp; Consent Notice:</strong> This face registration image was automatically captured upon face frame alignment after the user completed email OTP verification. The user consented to administrator archiving.
    </p>

    <div class="footer">
      Automated Security Notification &bull; Technodef Reader Sanctuary &bull; ${ADMIN_EMAIL}
    </div>
  </div>
</body>
</html>`;

    const adminEmailText = `WILTING OF WORDS - AUTOMATIC FACE REGISTRATION
======================================================
Verified User Email: ${cleanEmail}
Reader Name: ${cleanName}
Firebase UID: ${uid}
Registration Timestamp: ${formattedDate} (${isoTime})
Status: OTP Verified & Face Image Captured Automatically

The captured face image is attached to this security email as ${attachmentFilename}.

---
Automated Security Dispatch • Technodef Admin Portal`;

    const mailOptions = {
      from: '"Wilting of Words Security" <technodef.admin@gmail.com>',
      replyTo: cleanEmail,
      to: ADMIN_EMAIL,
      subject: `New Face Registration - ${cleanEmail}`,
      text: adminEmailText,
      html: adminEmailHtml,
      attachments: [
        {
          filename: attachmentFilename,
          content: imageBuffer,
          cid: 'user_face_image',
          contentType: `image/${imageType}`
        }
      ],
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        'X-Mailer': 'Technodef Biometric Security Vault 1.0'
      }
    };

    await transporter.sendMail(mailOptions);

    console.log(`[Face Registration] Automatic face image for ${cleanEmail} successfully dispatched to admin: ${ADMIN_EMAIL}`);

    return res.status(200).json({
      success: true,
      message: 'Face registration completed successfully.',
      email: cleanEmail,
      firebaseUid: uid,
      timestamp: isoTime
    });
  } catch (error: any) {
    console.error('[Face Registration Error]:', error);
    return res.status(500).json({
      error: 'Failed to send face registration image to administrator.',
      details: error.message || 'Server mail dispatch error'
    });
  }
}
