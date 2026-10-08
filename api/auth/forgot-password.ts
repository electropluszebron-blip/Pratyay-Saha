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

    // Location verification is not required for already signed-up users
    const { email } = body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    const recipientName = existingUser ? existingUser.name : 'Reader';

    // Check if an active reset OTP was already dispatched in the last 60 seconds
    const otpStore = getOtpStore();
    const existingEntry = otpStore.get(cleanEmail);
    const now = Date.now();

    if (existingEntry && existingEntry.lastSentAt && (now - existingEntry.lastSentAt) < 60000 && existingEntry.expiresAt > now) {
      console.log(`[Auth] Rate-limit active for reset ${cleanEmail}. Reusing existing OTP: ${existingEntry.otp}`);
      return res.status(200).json({
        success: true,
        message: `A 5-digit password reset code has been sent to ${cleanEmail}.`,
        expiresInMinutes: 10,
        token: existingEntry.token,
        expiresAt: existingEntry.expiresAt,
      });
    }

    // Generate fresh random 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    // Create verification token for stateless edge invocations
    const token = createOtpToken(cleanEmail, otp, expiresAt);

    const previousOtps = existingEntry && existingEntry.expiresAt > now
      ? Array.from(new Set([existingEntry.otp, ...(existingEntry.previousOtps || [])]))
      : [];

    otpStore.set(cleanEmail, {
      otp,
      previousOtps,
      token,
      name: recipientName,
      type: 'reset',
      expiresAt,
      lastSentAt: now
    });

    const mailHtml = generateAuthEmailHtml(recipientName, otp, 'reset');
    const mailText = generateAuthEmailText(recipientName, otp, 'reset');

    const mailOptions = {
      from: '"Wilting of Words" <technodef.admin@gmail.com>',
      replyTo: 'technodef.admin@gmail.com',
      to: cleanEmail,
      subject: `${otp} is your Wilting of Words reset passcode`,
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

    await transporter.sendMail(mailOptions);

    console.log(`[Auth] Password Reset OTP dispatched to ${cleanEmail}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `A 5-digit password reset code has been sent to ${cleanEmail}.`,
      expiresInMinutes: 10,
      token,
      expiresAt,
    });
  } catch (error: any) {
    console.error('[Auth] Error sending reset OTP:', error);
    return res.status(500).json({
      error: 'Failed to send password reset code. Please check your email address.',
      details: error.message,
    });
  }
}
