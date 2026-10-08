import { Request, Response } from 'express';
import {
  getAppSettings,
  updateAppSettings,
  setUserBlockedStatus,
  setUserAiLimit,
  resetUserAiUsage,
  updatePaymentStatus,
  logAuditRecord,
  deleteFirestoreUser,
  upsertFirestoreUserRecord
} from '../_lib/firestoreServer';
import { loadUsers, saveUsers } from '../_lib/shared';

export default async function adminCommandHandler(req: Request, res: Response) {
  if (req.method === 'OPTIONS' || req.method === 'GET') {
    return res.status(200).json({ success: true, ready: true });
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ success: true, ready: true });
  }

  try {
    const body = req.body || {};
    const { action, targetId, value, adminEmail } = body;

    const configuredAdminEmail = process.env.ADMIN_EMAIL || 'electroplus.zebron@gmail.com';
    const cleanAdmin = (adminEmail || req.headers['x-admin-email'] || '').toString().toLowerCase().trim();

    // Server-side authorization check
    if (!cleanAdmin || (cleanAdmin !== configuredAdminEmail.toLowerCase() && !cleanAdmin.includes('admin') && !cleanAdmin.includes('zebron'))) {
      return res.status(403).json({
        error: 'Forbidden: Unauthorized administrator identity.'
      });
    }

    const cmdId = `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowStr = new Date().toISOString();

    switch (action) {
      case 'toggle_app_suspended': {
        const nextState = Boolean(value);
        const prev = await getAppSettings();
        await updateAppSettings({ appSuspended: nextState, maintenanceMode: nextState });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `APP ACCESS ${nextState ? 'SUSPENDED' : 'ACTIVATED'}`,
          previousState: { appSuspended: prev.appSuspended },
          newState: { appSuspended: nextState },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ 
          success: true, 
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId, 
          appSuspended: nextState 
        });
      }

      case 'toggle_maintenance': {
        const nextState = Boolean(value);
        const prev = await getAppSettings();
        await updateAppSettings({ maintenanceMode: nextState });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `MAINTENANCE ${nextState ? 'ON' : 'OFF'}`,
          previousState: { maintenanceMode: prev.maintenanceMode },
          newState: { maintenanceMode: nextState },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ 
          success: true, 
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId, 
          maintenanceMode: nextState 
        });
      }

      case 'toggle_ai': {
        const nextState = Boolean(value);
        const prev = await getAppSettings();
        await updateAppSettings({ aiEnabled: nextState });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `AI ${nextState ? 'ON' : 'OFF'}`,
          previousState: { aiEnabled: prev.aiEnabled },
          newState: { aiEnabled: nextState },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ 
          success: true, 
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId, 
          aiEnabled: nextState 
        });
      }

      case 'set_global_ai_limit': {
        const newLimit = Math.max(0, parseInt(value, 10) || 10);
        const prev = await getAppSettings();
        await updateAppSettings({ defaultAiDailyLimit: newLimit });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `SET GLOBAL AI LIMIT: ${newLimit}`,
          previousState: { defaultAiDailyLimit: prev.defaultAiDailyLimit },
          newState: { defaultAiDailyLimit: newLimit },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, defaultAiDailyLimit: newLimit });
      }

      case 'set_user_ai_limit': {
        if (!targetId) return res.status(400).json({ error: 'Target User ID required' });
        const limit = Math.max(0, parseInt(value, 10) || 10);
        await setUserAiLimit(targetId, limit);
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `SET USER AI LIMIT: ${limit}`,
          target: targetId,
          newState: { aiDailyLimit: limit },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, userId: targetId, limit });
      }

      case 'reset_user_ai_usage': {
        if (!targetId) return res.status(400).json({ error: 'Target User ID required' });
        await resetUserAiUsage(targetId);
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `RESET USER AI USAGE`,
          target: targetId,
          newState: { aiUsageToday: 0 },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, userId: targetId });
      }

      case 'block_user': {
        if (!targetId) return res.status(400).json({ error: 'Target User ID required' });
        const userRec = await setUserBlockedStatus(targetId, true);
        
        // Also sync local users.json
        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex(u => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (uIdx !== -1) {
            localUsers[uIdx].status = 'blocked';
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }
        } catch (e) {}

        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `BLOCK USER`,
          target: targetId,
          newState: { status: 'blocked' },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ 
          success: true, 
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId, 
          user: userRec 
        });
      }

      case 'unblock_user': {
        if (!targetId) return res.status(400).json({ error: 'Target User ID required' });
        const userRec = await setUserBlockedStatus(targetId, false);

        // Also sync local users.json
        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex(u => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (uIdx !== -1) {
            localUsers[uIdx].status = 'active';
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }
        } catch (e) {}

        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `UNBLOCK USER`,
          target: targetId,
          newState: { status: 'active' },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ 
          success: true, 
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId, 
          user: userRec 
        });
      }

      case 'toggle_user_block': {
        if (!targetId) return res.status(400).json({ error: 'Target User ID required' });
        const shouldBlock = value === 'blocked' || value === true;
        const userRec = await setUserBlockedStatus(targetId, shouldBlock);

        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex(u => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (uIdx !== -1) {
            localUsers[uIdx].status = shouldBlock ? 'blocked' : 'active';
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }
        } catch (e) {}

        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: shouldBlock ? 'BLOCK USER' : 'UNBLOCK USER',
          target: targetId,
          newState: { status: shouldBlock ? 'blocked' : 'active' },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ 
          success: true, 
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId, 
          user: userRec 
        });
      }

      case 'delete_user': {
        if (!targetId) return res.status(400).json({ error: 'Target User ID required' });
        
        let deletedEmail = '';
        try {
          const localUsers = loadUsers();
          const targetUser = localUsers.find(u => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (targetUser) deletedEmail = targetUser.email.toLowerCase();

          const filtered = localUsers.filter(u => u.id !== targetId && u.email.toLowerCase() !== targetId.toLowerCase());
          saveUsers(filtered);

          // Delete from Firestore
          await deleteFirestoreUser(targetId);
          if (deletedEmail && deletedEmail !== targetId.toLowerCase()) {
            await deleteFirestoreUser(deletedEmail);
          }
        } catch (e) {
          console.warn('[Admin Command] Delete user warning:', e);
        }

        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `DELETE USER ACCOUNT`,
          target: targetId,
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ 
          success: true, 
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId, 
          targetId, 
          deletedEmail 
        });
      }

      case 'update_password':
      case 'change_user_password': {
        if (!targetId) return res.status(400).json({ error: 'Target User ID required' });
        const newPassword = (value || '').toString().trim();
        if (!newPassword || newPassword.length < 4) {
          return res.status(400).json({ error: 'New passphrase must be at least 4 characters.' });
        }

        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex(u => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          const targetEmail = (uIdx !== -1 ? localUsers[uIdx].email : targetId).toLowerCase();
          const targetName = uIdx !== -1 ? localUsers[uIdx].name : 'Reader';

          if (uIdx !== -1) {
            localUsers[uIdx].passwordHash = Buffer.from(newPassword).toString('base64');
            localUsers[uIdx].rawPassword = newPassword;
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }

          await upsertFirestoreUserRecord({
            userId: targetId,
            email: targetEmail,
            name: targetName,
            rawPassword: newPassword,
            passwordHash: Buffer.from(newPassword).toString('base64'),
            updatedAt: nowStr
          });
        } catch (e) {
          console.warn('[Admin Command] Error syncing password update to Firestore:', e);
        }

        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `CHANGE USER PASSPHRASE`,
          target: targetId,
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ 
          success: true, 
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId, 
          targetId 
        });
      }

      case 'toggle_user_verification_bypass': {
        if (!targetId) return res.status(400).json({ error: 'Target User ID required' });
        const bypass = Boolean(value);

        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex(u => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (uIdx !== -1) {
            localUsers[uIdx].bypassVerification = bypass;
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }
        } catch (e) {}

        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `SET VERIFICATION BYPASS: ${bypass ? 'ENABLED' : 'DISABLED'}`,
          target: targetId,
          newState: { bypassVerification: bypass },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ 
          success: true, 
          message: `Command "toggle_user_verification_bypass" processed successfully.`,
          commandId: cmdId, 
          targetId, 
          bypassVerification: bypass 
        });
      }

      case 'toggle_user_ai': {
        if (!targetId) return res.status(400).json({ error: 'Target User ID required' });
        const aiActive = Boolean(value);

        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex(u => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (uIdx !== -1) {
            localUsers[uIdx].aiEnabled = aiActive;
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }
        } catch (e) {}

        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `SET USER AI: ${aiActive ? 'ENABLED' : 'DISABLED'}`,
          target: targetId,
          newState: { aiEnabled: aiActive },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, targetId, aiEnabled: aiActive });
      }

      case 'approve_payment': {
        if (!targetId) return res.status(400).json({ error: 'Payment ID required' });
        const resPayment = await updatePaymentStatus(targetId, 'approved', cleanAdmin);
        if (!resPayment.success) {
          await logAuditRecord({
            internalCommandId: cmdId,
            adminIdentity: cleanAdmin,
            command: `APPROVE PAYMENT`,
            target: targetId,
            result: 'FAILED',
            timestamp: nowStr,
            notes: resPayment.message
          });
          return res.status(400).json({ error: resPayment.message });
        }
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `APPROVE PAYMENT`,
          target: targetId,
          newState: resPayment.payment,
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, payment: resPayment.payment });
      }

      case 'reject_payment': {
        if (!targetId) return res.status(400).json({ error: 'Payment ID required' });
        const resPayment = await updatePaymentStatus(targetId, 'rejected', cleanAdmin);
        if (!resPayment.success) {
          return res.status(400).json({ error: resPayment.message });
        }
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `REJECT PAYMENT`,
          target: targetId,
          newState: resPayment.payment,
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, payment: resPayment.payment });
      }

      case 'save_announcement': {
        const textMsg = (value || '').toString().trim();
        const prev = await getAppSettings();
        await updateAppSettings({ announcement: textMsg });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `SAVE ANNOUNCEMENT`,
          previousState: { announcement: prev.announcement },
          newState: { announcement: textMsg },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, announcement: textMsg });
      }

      case 'delete_announcement': {
        await updateAppSettings({ announcement: '' });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `DELETE ANNOUNCEMENT`,
          newState: { announcement: '' },
          result: 'SUCCESS',
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId });
      }

      default:
        return res.status(400).json({ error: `Unknown action "${action}".` });
    }
  } catch (err: any) {
    console.error('[AdminCommand API] Error:', err);
    return res.status(500).json({
      error: 'Failed to process administrative command',
      message: err?.message || 'Server error'
    });
  }
}
