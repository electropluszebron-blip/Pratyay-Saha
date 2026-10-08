import { Request, Response } from 'express';
import { 
  getOtpStore, 
  loadUsers, 
  saveUsers, 
  verifyOtpToken,
  parseRequestBody 
} from '../_lib/shared';
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

  try {
    const body = await parseRequestBody(req);

    // Strict Precise Location Gate
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }

    const { email, password, name, otp, token, expiresAt } = body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Passphrase must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = (otp || '').toString().trim();

    // Verify token or store strictly
    let isOtpValid = false;
    if (token && expiresAt && cleanOtp) {
      isOtpValid = verifyOtpToken(cleanEmail, cleanOtp, Number(expiresAt), token);
    }
    const otpStore = getOtpStore();
    const record = otpStore.get(cleanEmail);
    if (record && Date.now() <= record.expiresAt && record.otp === cleanOtp) {
      isOtpValid = true;
    }

    if (!isOtpValid) {
      return res.status(400).json({ error: 'Invalid or expired verification passcode. Please enter the correct OTP sent to your email.' });
    }

    const users = loadUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    const passwordHash = Buffer.from(password).toString('base64');
    const userName = (name || '').trim() || 'Reader';
    const now = new Date();
    const istTimeString = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    }) + ' (IST)';

    const userUid = 'usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_');

    if (existingIndex !== -1) {
      users[existingIndex].passwordHash = passwordHash;
      users[existingIndex].rawPassword = password;
      users[existingIndex].name = userName;
      users[existingIndex].status = 'active';
      users[existingIndex].updatedAt = now.toISOString();
      users[existingIndex].updatedAtIST = istTimeString;
      saveUsers(users);
    } else {
      const newUser = {
        id: userUid,
        name: userName,
        email: cleanEmail,
        passwordHash: passwordHash,
        rawPassword: password,
        status: 'active' as const,
        aiEnabled: true,
        bypassVerification: false,
        createdAt: now.toISOString(),
        createdAtIST: istTimeString,
        updatedAt: now.toISOString(),
        updatedAtIST: istTimeString
      };
      users.push(newUser);
      saveUsers(users);
    }

    // Immediately sync permanently to Firestore Database
    try {
      const { upsertFirestoreUserRecord } = await import('../_lib/firestoreServer');
      await upsertFirestoreUserRecord({
        userId: userUid,
        email: cleanEmail,
        name: userName,
        passwordHash: passwordHash,
        rawPassword: password,
        status: 'active',
        role: 'user',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      });
    } catch (fbErr) {
      console.warn('[Set-Password] Notice syncing to Firestore:', fbErr);
    }

    otpStore.delete(cleanEmail);

    return res.status(200).json({
      success: true,
      message: 'Account created and secured successfully.',
      user: {
        id: userUid,
        email: cleanEmail,
        name: userName,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error setting password:', error);
    return res.status(500).json({ error: 'Failed to set password.' });
  }
}
