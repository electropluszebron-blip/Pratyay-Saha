import { Request, Response } from 'express';
import { getOtpStore, verifyOtpToken, parseRequestBody } from '../_lib/shared';
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
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body = await parseRequestBody(req);

    // Strict Precise Location Gate
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }

    const { email, otp, token, expiresAt } = body || {};

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    if (!/^\d{5}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 5-digit numerical verification code.'
      });
    }

    let isOtpValid = false;

    // 1. Verify against stateless cryptographic token if provided
    if (token && expiresAt) {
      if (Date.now() > Number(expiresAt)) {
        return res.status(400).json({
          success: false,
          error: 'The verification code has expired. Please request a new OTP.'
        });
      }
      if (verifyOtpToken(cleanEmail, cleanOtp, Number(expiresAt), token)) {
        isOtpValid = true;
      }
    }

    // 2. Verify against in-memory store
    const otpStore = getOtpStore();
    const record = otpStore.get(cleanEmail);

    if (record) {
      if (Date.now() > record.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.status(400).json({
          success: false,
          error: 'The verification code has expired. Please request a new OTP.'
        });
      }

      if (record.otp === cleanOtp || (record.previousOtps && record.previousOtps.includes(cleanOtp))) {
        isOtpValid = true;
      }
    }

    if (!isOtpValid) {
      console.log(`[Auth] OTP verification attempt rejected for ${cleanEmail}: code mismatch.`);
      return res.status(400).json({
        success: false,
        error: 'Invalid 5-digit verification code. Please enter the correct OTP sent to your email.'
      });
    }

    // Invalidate OTP after successful verification to prevent replay
    otpStore.delete(cleanEmail);

    console.log(`[Auth] OTP successfully verified for ${cleanEmail}`);
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error('[Auth] Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while verifying OTP. Please try again.',
    });
  }
}
