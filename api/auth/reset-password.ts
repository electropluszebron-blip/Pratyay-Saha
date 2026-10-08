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

    // Location verification is not required for already signed-up users
    const { email, otp, newPassword, token, expiresAt } = body || {};

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Strictly verify OTP token or store
    let isOtpValid = false;
    if (token && expiresAt) {
      isOtpValid = verifyOtpToken(cleanEmail, cleanOtp, Number(expiresAt), token);
    }
    const otpStore = getOtpStore();
    const record = otpStore.get(cleanEmail);
    if (record && Date.now() <= record.expiresAt && record.otp === cleanOtp) {
      isOtpValid = true;
    }

    if (!isOtpValid) {
      if (record && Date.now() > record.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.status(400).json({ error: 'The reset OTP has expired. Please request a new code.' });
      }
      return res.status(400).json({ error: 'Invalid 5-digit reset code. Please check your email.' });
    }

    // Update in local users store
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    const newHash = Buffer.from(newPassword).toString('base64');
    const nowIso = new Date().toISOString();
    const userName = (userIndex !== -1 ? users[userIndex].name : record?.name) || cleanEmail.split('@')[0] || 'Reader';
    const userUid = userIndex !== -1 ? users[userIndex].id : 'usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_');

    if (userIndex !== -1) {
      users[userIndex].passwordHash = newHash;
      users[userIndex].rawPassword = newPassword;
      users[userIndex].updatedAt = nowIso;
      saveUsers(users);
    } else {
      users.push({
        id: userUid,
        name: userName,
        email: cleanEmail,
        passwordHash: newHash,
        rawPassword: newPassword,
        status: 'active',
        aiEnabled: true,
        bypassVerification: false,
        createdAt: nowIso,
        updatedAt: nowIso
      });
      saveUsers(users);
    }

    try {
      const { upsertFirestoreUserRecord } = await import('../_lib/firestoreServer');
      await upsertFirestoreUserRecord({
        userId: userUid,
        email: cleanEmail,
        name: userName,
        passwordHash: newHash,
        rawPassword: newPassword,
        status: 'active',
        updatedAt: nowIso
      });
    } catch (fbErr) {
      console.warn('[Reset-Password] Firestore sync notice:', fbErr);
    }

    otpStore.delete(cleanEmail);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
      user: {
        id: userUid,
        email: cleanEmail,
        name: userName,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error resetting password:', error);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
}
