import nodemailer from 'nodemailer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// Secret for OTP verification tokens (stateless across Vercel serverless lambdas)
const OTP_SECRET = process.env.AUTH_SECRET || 'wilting-words-sacred-key-2026';

export function createOtpToken(email: string, otp: string, expiresAt: number): string {
  const cleanEmail = email.toLowerCase().trim();
  const data = `${cleanEmail}:${otp}:${expiresAt}`;
  return crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');
}

export function verifyOtpToken(email: string, otp: string, expiresAt: number, token?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  if (!otp || typeof otp !== 'string') return false;
  if (Date.now() > expiresAt) return false;
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = otp.toString().trim();
  const expected = createOtpToken(cleanEmail, cleanOtp, expiresAt);
  try {
    const expectedBuf = Buffer.from(expected, 'hex');
    const tokenBuf = Buffer.from(token, 'hex');
    if (expectedBuf.length !== tokenBuf.length || expectedBuf.length === 0) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuf, tokenBuf);
  } catch {
    return false;
  }
}

// Client-safe hash verification for fallback
export async function clientSha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.webcrypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Storage directory
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // read-only env
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  rawPassword?: string;
  faceImage?: string;
  location?: {
    ip?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
    timestamp?: string;
  };
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  bypassVerification?: boolean;
  status?: 'active' | 'blocked';
  aiEnabled?: boolean;
  createdAt: string;
  createdAtIST?: string;
  updatedAt?: string;
  updatedAtIST?: string;
}

const DEFAULT_SYSTEM_USERS: StoredUser[] = [
  {
    id: 'admin_master_01',
    name: 'Pratyay Saha',
    email: 'electroplus.zebron@gmail.com',
    passwordHash: 'MjkxMTIwMDg=',
    rawPassword: '••••••••',
    status: 'active',
    bypassVerification: true,
    aiEnabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    createdAtIST: '1/1/2026, 5:30:00 AM (IST)',
    location: {
      latitude: 23.0805,
      longitude: 88.5284,
      city: 'Chakdaha',
      region: 'West Bengal',
      country: 'India',
      address: 'Chakdaha, Nadia, West Bengal, India'
    }
  }
];

let inMemoryUsers: StoredUser[] = [...DEFAULT_SYSTEM_USERS];

export function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out any stale dummy accounts
        const cleaned = parsed.filter(u => u.email.toLowerCase() !== 'technodef.admin@gmail.com');
        inMemoryUsers = cleaned.length > 0 ? cleaned : [...DEFAULT_SYSTEM_USERS];
        return inMemoryUsers;
      }
    }
  } catch (e) {
    console.warn('[Storage] Fallback to memory:', e);
  }
  return inMemoryUsers;
}

export function saveUsers(users: StoredUser[]) {
  inMemoryUsers = users;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Storage] Error writing file:', e);
  }
}

export interface OtpEntry {
  otp: string;
  previousOtps?: string[];
  token?: string;
  name?: string;
  type?: 'signup' | 'reset';
  expiresAt: number;
  lastSentAt?: number;
}

// Global in-memory OTP store across warm invocations
const globalOtpStore = new Map<string, OtpEntry>();

export function getOtpStore(): Map<string, OtpEntry> {
  return globalOtpStore;
}

// Helper to safely parse JSON body across Express, Vercel Serverless, and standard IncomingMessage
export async function parseRequestBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

// Gmail App Password
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || 'frwoyyjicslyxmgn';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'technodef.admin@gmail.com',
    pass: GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

export function generateAuthEmailText(name: string, otp: string, type: 'signup' | 'reset' = 'signup'): string {
  const recipientName = name ? name.trim() : 'Reader';
  const isReset = type === 'reset';

  return `WILTING OF WORDS
TECHNODEF AUTOMATED READER PORTAL

"ঝরা পাতার মতো শব্দগুলো যদি ঝরে যায়, স্মৃতিটুকু বেঁচে থাকে অক্ষরের বাঁধনে..."
— Even as words wilt like autumn foliage, their essence endures within the bond of print.

Respected ${recipientName},

${
  isReset
    ? 'We received a request to reset your sanctuary passphrase for Wilting of Words. Please use the single-use verification cipher provided below to authorize this reset:'
    : 'Welcome to the sanctuary of timeless letters. To confirm your identity, grant access to your exclusive manuscript collection, and establish your secret passphrase for Wilting of Words, please use the sacred authentication cipher provided below:'
}

VERIFICATION CIPHER: ${otp}

Chronometer Notice: This access token remains valid for strictly 10 minutes. It is mandatory for verifying your reader identity and setting your new password. Should this window lapse, a new token must be summoned from the portal.

If you have not solicited access to Wilting of Words, please discard this epistle; your parchment and account remain inviolable and unperturbed.

In devotion to the written word,
Technodef Literary Archives 🖋️

---
Automated Security Notification • Technodef Reader Portal • technodef.admin@gmail.com`;
}

export function generateAuthEmailHtml(name: string, otp: string, type: 'signup' | 'reset' = 'signup'): string {
  const recipientName = name ? name.trim() : 'Reader';
  const isReset = type === 'reset';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wilting of Words - Reader Authentication</title>
  <style type="text/css">
    @media only screen and (max-width: 480px) {
      .mail-container { width: 100% !important; padding: 18px 14px !important; }
      .otp-cipher { font-size: 28px !important; letter-spacing: 8px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #F7F3EC; font-family: 'Georgia', serif; -webkit-font-smoothing: antialiased; color: #2D241E;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F3EC; margin: 0; padding: 0;">
    <tr>
      <td align="center" style="padding: 10px 0;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="mail-container" style="max-width: 560px; margin: 0 auto; background-color: #FCF9F2; border: 2.5px solid #8B261D; box-shadow: 0 8px 30px rgba(139, 38, 29, 0.08);">
          <tr>
            <td style="padding: 34px 28px; text-align: center;">
              
              <!-- Alpona Floral Motif -->
              <div style="font-size: 20px; line-height: 1; color: #8B261D; margin-bottom: 8px;">
                ❦ &nbsp; ✤ &nbsp; ❦
              </div>

              <!-- Master Title -->
              <h1 style="margin: 4px 0 6px 0; font-family: 'Cinzel', 'Times New Roman', Georgia, serif; font-size: 25px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #6B1D1D; line-height: 1.2;">
                WILTING OF WORDS
              </h1>

              <!-- Portal Subtitle -->
              <div style="font-family: 'Cinzel', 'Times New Roman', Georgia, serif; font-size: 10.5px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700; color: #8C6F48; margin-bottom: 14px;">
                TECHNODEF AUTOMATED READER PORTAL
              </div>

              <!-- Decorative Floral Divider -->
              <div style="color: #C89B4C; font-size: 13px; letter-spacing: 0.2em; margin-bottom: 22px;">
                ❖ ─── ❀ ─── ❖
              </div>

              <!-- Poetic Bengali Epigraph & English Rendering -->
              <div style="margin-bottom: 26px;">
                <p style="margin: 0 0 6px 0; font-family: 'Georgia', serif; font-style: italic; font-size: 14px; color: #6B1D1D; line-height: 1.6;">
                  "ঝরা পাতার মতো শব্দগুলো যদি ঝরে যায়, স্মৃতিটুকু বেঁচে থাকে অক্ষরের বাঁধনে..."
                </p>
                <p style="margin: 0; font-family: 'Georgia', serif; font-style: italic; font-size: 12px; color: #7A5B3E; line-height: 1.5;">
                  — Even as words wilt like autumn foliage, their essence endures within the bond of print.
                </p>
              </div>

              <!-- Reader Salutation & Welcome -->
              <div style="text-align: left; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #2D241E;">
                  Respected ${recipientName},
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.75; color: #3E3228;">
                  ${
                    isReset
                      ? 'We received a request to reset your sanctuary passphrase for <strong>Wilting of Words</strong>. Please use the sacred authentication cipher provided below to authorize this reset:'
                      : 'Welcome to the sanctuary of timeless letters. To confirm your identity, grant access to your exclusive manuscript collection, and establish your secret passphrase for <strong>Wilting of Words</strong>, please use the sacred authentication cipher provided below:'
                  }
                </p>
              </div>

              <!-- Sacred Passcode Box (Guaranteed strictly on one single line) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 22px auto; max-width: 340px;">
                <tr>
                  <td align="center" style="background-color: #F8EFE1; border: 1.5px solid #8B261D; border-radius: 8px; padding: 18px 16px; box-shadow: inset 0 0 10px rgba(139, 38, 29, 0.04);">
                    <div style="font-family: Georgia, serif; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600; color: #8A6740; margin-bottom: 8px;">
                      ${isReset ? 'PASSWORD RESET PASSCODE' : 'AUTHENTICATION CIPHER'}
                    </div>
                    <!-- Single-line locked OTP display -->
                    <div class="otp-cipher" style="font-family: 'Courier New', Courier, monospace, Georgia; font-size: 34px; font-weight: 800; letter-spacing: 12px; color: #6B1D1D; line-height: 1.1; padding: 4px 0; white-space: nowrap !important; word-break: keep-all; text-indent: 12px; display: inline-block;">
                      ${otp}
                    </div>
                    <div style="font-family: Georgia, serif; font-size: 9.5px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A6740; margin-top: 8px;">
                      SINGLE-USE VERIFICATION CODE
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Chronometer Notice Box (Matches screenshot text exactly) -->
              <div style="background-color: #F7EEDE; border-left: 3.5px solid #8B261D; padding: 12px 16px; margin: 24px 0; text-align: left; font-size: 11.5px; line-height: 1.6; color: #4A3B2C;">
                <strong style="color: #6B1D1D;">Chronometer Notice:</strong> This access token remains valid for strictly <strong>10 minutes</strong>. It is mandatory for verifying your reader identity and setting your new password. Should this window lapse, a new token must be summoned from the portal.
              </div>

              <!-- Security Disclaimer -->
              <p style="text-align: left; font-size: 12.5px; line-height: 1.65; color: #5C4B3D; margin: 0 0 24px 0;">
                If you have not solicited access to <em>Wilting of Words</em>, please discard this epistle; your parchment and account remain inviolable and unperturbed.
              </p>

              <!-- Technodef Formal Sign-off -->
              <div style="text-align: left; font-size: 13px; line-height: 1.5; padding-top: 12px; border-top: 1px dashed #D6C2A5;">
                <div style="font-style: italic; color: #7A5B3E; margin-bottom: 4px;">
                  In devotion to the written word,
                </div>
                <div style="font-weight: 700; color: #6B1D1D; font-size: 13.5px;">
                  Technodef Literary Archives &nbsp; <span style="font-size: 15px;">🖋️</span>
                </div>
              </div>

              <!-- Deliverability & Identity Footer (Prevents spam classification) -->
              <div style="margin-top: 28px; padding-top: 12px; border-top: 1px solid #ECE3D0; font-size: 10px; color: #8C7662; line-height: 1.5; text-align: center;">
                Wilting of Words Automated Verification • Technodef Reader Sanctuary<br />
                Sent to authenticate reader access from technodef.admin@gmail.com
              </div>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
