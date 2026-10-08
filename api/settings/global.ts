import { Request, Response } from 'express';
import { getAppSettings } from '../_lib/firestoreServer';

export default async function globalSettingsHandler(req: Request, res: Response) {
  try {
    const settings = await getAppSettings();
    return res.status(200).json({
      success: true,
      aiEnabled: settings.aiEnabled,
      maintenanceMode: settings.maintenanceMode,
      appSuspended: Boolean(settings.appSuspended || settings.maintenanceMode),
      defaultAiDailyLimit: settings.defaultAiDailyLimit,
      announcement: settings.announcement,
      updatedAt: settings.updatedAt
    });
  } catch (err: any) {
    console.error('[GlobalSettings API] Error:', err);
    return res.status(500).json({
      success: false,
      aiEnabled: true,
      maintenanceMode: false,
      appSuspended: false,
      defaultAiDailyLimit: 100,
      announcement: '',
      error: 'Could not fetch global settings, returning safe defaults.'
    });
  }
}
