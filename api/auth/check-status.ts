import { Request, Response } from 'express';
import { loadUsers } from '../_lib/shared';
import { getAppSettings } from '../_lib/firestoreServer';

export default async function checkStatusHandler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-email');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const email = ((req.query.email as string) || req.headers['x-user-email'] || '').toString().toLowerCase().trim();
    const settings = await getAppSettings();

    // Check if entire app is suspended/maintenance
    if (settings.maintenanceMode) {
      return res.status(200).json({
        appSuspended: true,
        announcement: settings.announcement || '',
        contactEmail: 'electroplus.zebron@gmail.com'
      });
    }

    if (!email) {
      return res.status(200).json({
        appSuspended: false,
        blocked: false,
        announcement: settings.announcement || ''
      });
    }

    const users = loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email);

    if (user && user.status === 'blocked') {
      return res.status(200).json({
        appSuspended: false,
        blocked: true,
        reason: 'Your account has been suspended by the administrator. Please contact electroplus.zebron@gmail.com.',
        announcement: settings.announcement || ''
      });
    }

    return res.status(200).json({
      appSuspended: false,
      blocked: false,
      bypassVerification: user?.bypassVerification || false,
      aiEnabled: user?.aiEnabled !== false && settings.aiEnabled !== false,
      announcement: settings.announcement || ''
    });
  } catch (err: any) {
    console.error('[Check Status API] Error:', err);
    return res.status(500).json({ error: 'Failed to verify account status' });
  }
}
