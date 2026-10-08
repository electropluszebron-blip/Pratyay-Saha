import { Request, Response } from 'express';
import { loadUsers, saveUsers, parseRequestBody } from '../_lib/shared';
import { enforcePreciseLocationEndpoint } from '../_lib/preciseLocationGuard';
import fs from 'fs';
import path from 'path';

let firebaseConfig: any = null;
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {}

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

    const { email } = body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Remove user from local JSON storage
    const currentUsers = loadUsers();
    const filteredUsers = currentUsers.filter(u => u.email.toLowerCase() !== cleanEmail);
    saveUsers(filteredUsers);

    // 2. Remove user document from Firestore database
    let firestoreDeleted = false;
    if (firebaseConfig?.projectId && firebaseConfig?.apiKey) {
      try {
        const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig;
        const docId = sanitizeEmailKey(cleanEmail);
        const delUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/users/${docId}?key=${apiKey}`;
        const delRes = await fetch(delUrl, { method: 'DELETE' });
        if (delRes.ok) firestoreDeleted = true;
      } catch (fbErr) {
        console.warn('[Delete User API] Firestore deletion error:', fbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Account for ${cleanEmail} has been permanently deleted.`,
      firestoreDeleted
    });
  } catch (error: any) {
    console.error('[Delete User API] Error deleting account:', error);
    return res.status(500).json({ error: 'Failed to delete account', details: error.message });
  }
}
