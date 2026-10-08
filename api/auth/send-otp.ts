import { Request, Response } from 'express';
import { 
  getOtpStore, 
  loadUsers, 
  transporter, 
  generateAuthEmailHtml,
  generateAuthEmailText,
  createOtpToken,
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

    const { name, email, isGoogleAuth } = body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || '').trim();

    if (!cleanName) {
      return res.status(400).json({ error: 'Please enter your full name. Name is required for registration.' });
    }

    // Check if user already registered in server store or Firestore with password
    const existingUsers = loadUsers();
    let userExists = existingUsers.some(u => u.email.toLowerCase() === cleanEmail && Boolean(u.passwordHash || u.rawPassword));

    if (!userExists) {
      try {
        const { getUserRecord } = await import('../_lib/firestoreServer');
        const fbUser = await getUserRecord(cleanEmail.replace(/[^a-z0-9]/g, '_'));
        if (fbUser && ((fbUser as any).passwordHash || (fbUser as any).rawPassword)) {
          userExists = true;
        }
      } catch {}
    }

    if (userExists && !isGoogleAuth) {
      return res.status(400).json({
        error: 'An account with this email address already exists. Please Sign In.',
        alreadyRegistered: true,
      });
    }

    // Check if an active OTP was already dispatched in the last 60 seconds to prevent multiple emails
    const otpStore = getOtpStore();
    const existingEntry = otpStore.get(cleanEmail);
    const now = Date.now();

    if (existingEntry && existingEntry.lastSentAt && (now - existingEntry.lastSentAt) < 60000 && existingEntry.expiresAt > now) {
      console.log(`[Auth] Rate-limit active for ${cleanEmail}. Reusing existing OTP: ${existingEntry.otp}`);
      return res.status(200).json({
        success: true,
        message: `A 5-digit verification OTP has been dispatched to ${cleanEmail}.`,
        expiresInMinutes: 10,
        token: existingEntry.token,
        expiresAt: existingEntry.expiresAt,
        userExists: false
      });
    }

    // Generate fresh random 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    // Create verification token
    const token = createOtpToken(cleanEmail, otp, expiresAt);

    const previousOtps = existingEntry && existingEntry.expiresAt > now
      ? Array.from(new Set([existingEntry.otp, ...(existingEntry.previousOtps || [])]))
      : [];

    otpStore.set(cleanEmail, {
      otp,
      previousOtps,
      token,
      name: cleanName,
      type: 'signup',
      expiresAt,
      lastSentAt: now
    });

    const mailHtml = generateAuthEmailHtml(cleanName, otp, 'signup');
    const mailText = generateAuthEmailText(cleanName, otp, 'signup');

    const mailOptions = {
      from: '"Wilting of Words" <technodef.admin@gmail.com>',
      replyTo: 'technodef.admin@gmail.com',
      to: cleanEmail,
      subject: `${otp} is your Wilting of Words verification code`,
      text: mailText,
      html: mailHtml,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'X-Mailer': 'Technodef Reader Sanctuary 1.0',
        'List-Unsubscribe': '<mailto:technodef.admin@gmail.com?subject=unsubscribe>'
      }
    };

    // Send email asynchronously in the background so response returns instantly in < 100ms
    transporter.sendMail(mailOptions).catch((err) => {
      console.warn('[Auth] Background SMTP send warning:', err.message);
    });

    console.log(`[Auth] 5-digit OTP dispatched to ${cleanEmail}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `A 5-digit verification OTP has been dispatched to ${cleanEmail}.`,
      expiresInMinutes: 10,
      token,
      expiresAt,
      userExists,
      debugOtp: otp
    });
  } catch (error: any) {
    console.error('[Auth] Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to dispatch verification email. Please try again.'
    });
  }
}
