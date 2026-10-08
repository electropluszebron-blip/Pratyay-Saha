import { Request, Response } from 'express';
import { 
  getBiometricProfile, 
  saveBiometricProfile, 
  createSessionToken, 
  sendUnlockCodeEmail 
} from '../_lib/biometricService';
import { parseRequestBody } from '../_lib/shared';
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
    const { email, code, action } = body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid reader email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const profile = getBiometricProfile(cleanEmail);

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }

    // Action 1: Resend / Request Unlock Code
    if (action === 'request-code' || !code) {
      const unlockCode = Math.floor(100000 + Math.random() * 900000).toString();
      profile.unlockCode = unlockCode;
      profile.unlockCodeExpiresAt = Date.now() + 15 * 60 * 1000;
      saveBiometricProfile(profile);

      await sendUnlockCodeEmail(cleanEmail, unlockCode, profile.name);

      return res.status(200).json({
        success: true,
        message: 'A 6-digit recovery unlock code has been sent to your email.'
      });
    }

    // Action 2: Verify Unlock Code & Unblock Account
    const cleanCode = code.toString().trim();

    if (!profile.unlockCode || profile.unlockCode !== cleanCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recovery unlock code. Please check your email.'
      });
    }

    if (profile.unlockCodeExpiresAt && Date.now() > profile.unlockCodeExpiresAt) {
      return res.status(400).json({
        success: false,
        error: 'Recovery unlock code has expired. Request a new code.'
      });
    }

    // Code verified: reset lockout state
    profile.isLocked = false;
    profile.failedAttempts = 0;
    profile.unlockCode = undefined;
    profile.unlockCodeExpiresAt = undefined;
    saveBiometricProfile(profile);

    const sessionToken = createSessionToken(cleanEmail, profile.name, profile.firebaseUid);

    return res.status(200).json({
      success: true,
      message: 'Account unlocked successfully.',
      sessionToken,
      user: {
        id: profile.firebaseUid,
        name: profile.name,
        email: cleanEmail
      }
    });

  } catch (error: any) {
    console.error('[Unlock Account Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process account unlock request.'
    });
  }
}
