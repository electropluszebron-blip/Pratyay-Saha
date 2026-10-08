import { Request, Response } from 'express';
import { verifySessionToken } from '../_lib/biometricService';
import { parseRequestBody, loadUsers } from '../_lib/shared';
import { getUserRecord } from '../_lib/firestoreServer';
import { enforcePreciseLocationEndpoint } from '../_lib/preciseLocationGuard';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const authHeader = req.headers.authorization || '';
    let token = authHeader.replace(/^Bearer\s+/i, '');

    let body: any = null;
    if (req.method === 'POST') {
      body = await parseRequestBody(req);
      if (!token) token = body?.token;
    }

    // Location verification is not required for already signed-up users
    if (!token) {
      return res.status(401).json({ valid: false, error: 'Session token required.' });
    }

    const result = verifySessionToken(token);
    if (!result.valid || !result.user) {
      return res.status(401).json({ valid: false, error: 'Invalid or expired session.' });
    }

    // Check if account has been blocked or deleted by administrator in real-time
    const userEmail = (result.user.email || '').toLowerCase().trim();
    const userUid = result.user.uid || '';
    const localUsers = loadUsers();
    const localMatch = localUsers.find(u => u.email.toLowerCase() === userEmail || (userUid && u.id === userUid));
    const firestoreMatch = userUid ? await getUserRecord(userUid) : null;

    if (!localMatch && !firestoreMatch) {
      return res.status(401).json({
        valid: false,
        deleted: true,
        error: 'Your account has been deleted by the administrator.'
      });
    }

    const isBlocked = (localMatch && localMatch.status === 'blocked') || (firestoreMatch && firestoreMatch.status === 'blocked');
    if (isBlocked) {
      return res.status(403).json({
        valid: false,
        blocked: true,
        error: 'Your account has been suspended or blocked by the administrator. Please contact electroplus.zebron@gmail.com.'
      });
    }

    return res.status(200).json({
      valid: true,
      user: {
        id: userUid,
        email: result.user.email,
        name: result.user.name,
        bypassVerification: localMatch?.bypassVerification || false,
        aiEnabled: localMatch?.aiEnabled !== false
      }
    });

  } catch (error: any) {
    return res.status(500).json({ valid: false, error: 'Session verification failure.' });
  }
}
