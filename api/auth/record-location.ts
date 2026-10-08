import { Request, Response } from 'express';
import { loadUsers, saveUsers, parseRequestBody } from '../_lib/shared';

export default async function recordLocationHandler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = await parseRequestBody(req);
    const { email, latitude, longitude, ip, city, region, country, address } = body || {};

    if (!email) {
      return res.status(400).json({ error: 'User email is required to associate location.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    // Extract real client IP from headers if not provided
    const forwarded = req.headers['x-forwarded-for'];
    const detectedIp = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress) || ip || 'Unknown IP';

    const locationData = {
      ip: detectedIp,
      latitude: typeof latitude === 'number' ? latitude : undefined,
      longitude: typeof longitude === 'number' ? longitude : undefined,
      address: address || '',
      city: city || 'Unknown City',
      region: region || 'Unknown Region',
      country: country || 'Unknown Country',
      timestamp: new Date().toISOString()
    };

    if (userIndex !== -1) {
      users[userIndex].location = locationData;
      users[userIndex].latitude = locationData.latitude;
      users[userIndex].longitude = locationData.longitude;
      users[userIndex].address = locationData.address;
      users[userIndex].city = locationData.city;
      users[userIndex].region = locationData.region;
      users[userIndex].country = locationData.country;
      users[userIndex].updatedAt = new Date().toISOString();
      saveUsers(users);

      try {
        const { upsertFirestoreUserRecord } = await import('../_lib/firestoreServer');
        await upsertFirestoreUserRecord({
          userId: users[userIndex].id || `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
          email: cleanEmail,
          name: users[userIndex].name || cleanEmail.split('@')[0],
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          location: locationData,
          updatedAt: new Date().toISOString()
        });
      } catch (fbErr) {
        console.warn('[Record Location] Notice syncing location to Firestore:', fbErr);
      }
    } else {
      // Create profile and sync to Firestore
      const newUid = 'usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_');
      const newRec = {
        id: newUid,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        passwordHash: '',
        location: locationData,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address,
        city: locationData.city,
        region: locationData.region,
        country: locationData.country,
        status: 'active' as const,
        aiEnabled: true,
        bypassVerification: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newRec);
      saveUsers(users);

      try {
        const { upsertFirestoreUserRecord } = await import('../_lib/firestoreServer');
        await upsertFirestoreUserRecord({
          userId: newUid,
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          location: locationData,
          status: 'active',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (fbErr) {
        console.warn('[Record Location] Notice creating user in Firestore:', fbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'User location coordinates successfully recorded for admin profile.',
      location: locationData
    });
  } catch (err: any) {
    console.error('[Record Location] Error:', err);
    return res.status(500).json({ error: 'Failed to record user location.' });
  }
}
