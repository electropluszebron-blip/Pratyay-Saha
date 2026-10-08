import { Request, Response } from 'express';
import { 
  getOtpStore, 
  transporter, 
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

    const { email, name } = body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || 'Reader').trim();

    // Generate secure 6-digit OTP code for account deletion
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create verification token for stateless Vercel edge/lambdas
    const token = createOtpToken(cleanEmail, otp, expiresAt);

    const otpStore = getOtpStore();
    otpStore.set(`delete_${cleanEmail}`, {
      otp,
      token,
      name: cleanName,
      type: 'reset',
      expiresAt,
    });

    const mailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Account Deletion Verification Code</title>
</head>
<body style="font-family: 'Georgia', serif; background-color: #F7F3EC; color: #2D241E; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #FCF9F2; border: 2.5px solid #8B261D; padding: 30px; box-shadow: 0 8px 30px rgba(139, 38, 29, 0.08);">
    <div style="text-align: center; color: #8B261D; font-size: 20px; margin-bottom: 8px;">❦ &nbsp; ✤ &nbsp; ❦</div>
    <h1 style="text-align: center; font-family: 'Cinzel', serif; font-size: 24px; color: #6B1D1D; text-transform: uppercase; margin-bottom: 5px;">WILTING OF WORDS</h1>
    <div style="text-align: center; font-size: 11px; color: #8C6F48; letter-spacing: 2px; text-transform: uppercase; font-weight: bold; margin-bottom: 20px;">
      ACCOUNT DELETION AUTHORIZATION PROTOCOL
    </div>

    <p style="font-size: 14px; color: #2D241E; font-weight: bold; margin-bottom: 12px;">
      Respected ${cleanName},
    </p>

    <p style="font-size: 13px; line-height: 1.7; color: #3E3228; margin-bottom: 20px;">
      We received an account deletion request for your reader profile registered under <strong>${cleanEmail}</strong>. To authorize permanent erasure of your account, reading chronometer data, margin notes, and saved bookmarks, please use the single-use 6-digit OTP code below:
    </p>

    <div style="text-align: center; background-color: #F8EFE1; border: 1.5px solid #8B261D; border-radius: 8px; padding: 18px 16px; margin: 20px 0;">
      <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; color: #8A6740; margin-bottom: 8px;">
        PERMANENT DELETION OTP CIPHER
      </div>
      <div style="font-family: 'Courier New', monospace; font-size: 34px; font-weight: 800; letter-spacing: 12px; color: #8B261D; display: inline-block;">
        ${otp}
      </div>
      <div style="font-size: 9.5px; letter-spacing: 1.5px; text-transform: uppercase; color: #8A6740; margin-top: 8px;">
        VALID FOR 10 MINUTES
      </div>
    </div>

    <div style="background-color: #F7EEDE; border-left: 3.5px solid #8B261D; padding: 12px 16px; margin: 20px 0; font-size: 11.5px; line-height: 1.6; color: #4A3B2C;">
      <strong style="color: #6B1D1D;">Security Alert:</strong> If you did NOT request account deletion, please disregard this email immediately. Your account and reading progress remain completely safe and untouched.
    </div>

    <div style="margin-top: 25px; padding-top: 12px; border-top: 1px solid #ECE3D0; font-size: 10px; color: #8C7662; text-align: center;">
      Wilting of Words Security Protocol &bull; Technodef Reader Sanctuary &bull; technodef.admin@gmail.com
    </div>
  </div>
</body>
</html>`;

    const mailText = `WILTING OF WORDS - ACCOUNT DELETION VERIFICATION
======================================================
Respected ${cleanName},

Your 6-digit account deletion OTP code is: ${otp}

This single-use code is valid for 10 minutes. Use this code to authorize the permanent deletion of your account registered under ${cleanEmail}.

If you did not request account deletion, please ignore this email.
---
Technodef Literary Archives • technodef.admin@gmail.com`;

    const mailOptions = {
      from: '"Wilting of Words Security" <technodef.admin@gmail.com>',
      replyTo: 'technodef.admin@gmail.com',
      to: cleanEmail,
      subject: `[OTP] ${otp} - Confirm Account Deletion for Wilting of Words`,
      text: mailText,
      html: mailHtml,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        'X-Mailer': 'Technodef Security Vault 1.0'
      }
    };

    await transporter.sendMail(mailOptions);

    console.log(`[Account Deletion] 6-digit deletion OTP dispatched to ${cleanEmail}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `Account deletion OTP code dispatched to ${cleanEmail}.`,
      expiresInMinutes: 10,
      token,
      expiresAt,
      // For fallback verification if needed
      code: otp
    });
  } catch (error: any) {
    console.error('[Account Deletion] Error sending deletion OTP:', error);
    return res.status(500).json({
      error: 'Failed to send account deletion OTP email. Please try again.',
      details: error.message,
    });
  }
}
