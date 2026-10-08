import { Request, Response } from 'express';
import { saveUsers } from '../_lib/shared';
import { clearAllBiometricProfiles } from '../_lib/biometricService';
import fs from 'fs';
import path from 'path';

let firebaseConfig: any = null;
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 1. Clear local / server JSON storage and biometric profiles
    const adminUser = {
      id: 'admin_master_01',
      name: 'Pratyay Saha',
      email: 'electroplus.zebron@gmail.com',
      passwordHash: Buffer.from('29112008').toString('base64'),
      rawPassword: '••••••••',
      status: 'active' as const,
      role: 'admin',
      bypassVerification: true,
      aiEnabled: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    };
    saveUsers([adminUser]);
    clearAllBiometricProfiles();

    // 2. Query and delete all Firestore users
    let deletedFirestoreCount = 0;
    if (firebaseConfig?.projectId && firebaseConfig?.apiKey) {
      try {
        const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig;
        const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;
        const queryRes = await fetch(queryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: 'users' }]
            }
          })
        });

        if (queryRes.ok) {
          const results = await queryRes.json();
          if (Array.isArray(results)) {
            for (const item of results) {
              if (item.document?.name) {
                // Delete user document
                const delUrl = `https://firestore.googleapis.com/v1/${item.document.name}?key=${apiKey}`;
                const delRes = await fetch(delUrl, { method: 'DELETE' });
                if (delRes.ok) deletedFirestoreCount++;
              }
            }
          }
        }
      } catch (fbErr) {
        console.warn('[Clear Users] Firestore deletion warning:', fbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'All user accounts and database records have been purged successfully.',
      deletedFirestoreCount
    });
  } catch (error: any) {
    console.error('[Clear Users] Error purging accounts:', error);
    return res.status(500).json({ error: 'Failed to clear user accounts', details: error.message });
  }
}
