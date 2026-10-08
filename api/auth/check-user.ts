import { Request, Response } from 'express';
import { loadUsers, parseRequestBody } from '../_lib/shared';
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

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const body = req.method === 'POST' ? await parseRequestBody(req) : req.query;
    const email = (body.email || req.query.email || '') as string;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required', exists: false });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (existingUser) {
      return res.status(200).json({
        success: true,
        exists: true,
        name: existingUser.name || null,
        email: cleanEmail,
      });
    }

    // Check Firestore REST API and sync locally if found
    if (firebaseConfig?.projectId && firebaseConfig?.apiKey) {
      try {
        const docId = sanitizeEmailKey(cleanEmail);
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/users/${docId}?key=${firebaseConfig.apiKey}`;
        const fbRes = await fetch(url);
        if (fbRes.ok) {
          const docData = await fbRes.json();
          const name = docData.fields?.name?.stringValue || cleanEmail.split('@')[0];
          const rawPass = docData.fields?.rawPassword?.stringValue || '';
          const passHash = docData.fields?.passwordHash?.stringValue || '';
          const faceImg = docData.fields?.faceImage?.stringValue || '';
          
          const syncedUser = {
            id: docId,
            name,
            email: cleanEmail,
            passwordHash: passHash,
            rawPassword: rawPass,
            faceImage: faceImg,
            status: 'active' as const,
            aiEnabled: true,
            bypassVerification: false,
            createdAt: docData.fields?.createdAt?.stringValue || new Date().toISOString()
          };
          users.push(syncedUser);
          const { saveUsers } = await import('../_lib/shared');
          saveUsers(users);

          return res.status(200).json({
            success: true,
            exists: true,
            name,
            email: cleanEmail,
          });
        }
      } catch (fbErr) {
        console.warn('[Check User] Firestore check warning:', fbErr);
      }
    }

    return res.status(200).json({
      success: true,
      exists: false,
      name: null,
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error('[Auth] Error checking user existence:', error);
    return res.status(500).json({ error: 'Server error checking user', exists: false });
  }
}
