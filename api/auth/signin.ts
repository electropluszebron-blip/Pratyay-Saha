import { Request, Response } from 'express';
import { loadUsers, saveUsers, parseRequestBody, StoredUser } from '../_lib/shared';
import { getUserRecord, upsertFirestoreUserRecord } from '../_lib/firestoreServer';
import { enforcePreciseLocationEndpoint } from '../_lib/preciseLocationGuard';

function sanitizeEmailKey(email: string): string {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

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
    const { email, password } = body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!password) {
      return res.status(400).json({ error: 'Passphrase is required.' });
    }

    let users = loadUsers();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    // If not found in local store, query Firestore database directly
    if (!user) {
      try {
        const firestoreRecord = await getUserRecord(sanitizeEmailKey(cleanEmail));
        if (firestoreRecord) {
          const rawHash = (firestoreRecord as any).passwordHash || '';
          const rawPass = (firestoreRecord as any).rawPassword || '';
          const storedName = firestoreRecord.name || (cleanEmail === 'electroplus.zebron@gmail.com' ? 'Pratyay Saha' : cleanEmail.split('@')[0]);
          
          user = {
            id: firestoreRecord.userId || 'usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
            name: storedName,
            email: cleanEmail,
            passwordHash: rawHash,
            rawPassword: rawPass,
            status: firestoreRecord.status === 'blocked' ? 'blocked' : 'active',
            aiEnabled: firestoreRecord.aiDailyLimit !== 0,
            bypassVerification: (firestoreRecord as any).bypassVerification || (cleanEmail === 'electroplus.zebron@gmail.com'),
            createdAt: firestoreRecord.createdAt || new Date().toISOString()
          };

          // Cache and persist to local storage
          users.push(user);
          saveUsers(users);
        }
      } catch (fbErr) {
        console.warn('[Signin] Error querying Firestore:', fbErr);
      }
    }

    if (!user) {
      return res.status(404).json({ 
        error: `No account found for "${cleanEmail}". Your account does not exist or has been deleted by the administrator. Please click "Sign Up" below to create an account.`, 
        notFound: true 
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ 
        error: 'Your account is blocked by the administrator. Please contact electroplus.zebron@gmail.com for assistance.',
        blocked: true
      });
    }

    const inputHash = Buffer.from(password).toString('base64');
    const isMatch = user.passwordHash === inputHash || 
                    user.passwordHash === password || 
                    user.rawPassword === password ||
                    user.passwordHash?.trim() === password.trim() ||
                    (user.rawPassword && user.rawPassword.trim() === password.trim());

    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Incorrect secret passphrase. Please check your credentials or click "Forgot Password?" to reset.',
        notFound: false 
      });
    }

    // Update last login
    const nowIso = new Date().toISOString();
    user.updatedAt = nowIso;
    saveUsers(users);

    try {
      await upsertFirestoreUserRecord({
        userId: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        rawPassword: user.rawPassword,
        status: user.status,
        updatedAt: nowIso
      });
    } catch {}

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bypassVerification: user.bypassVerification || false,
        aiEnabled: user.aiEnabled !== false
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error signing in:', error);
    return res.status(500).json({ error: 'Failed to sign in.' });
  }
}
