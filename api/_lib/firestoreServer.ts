import fs from 'fs';
import path from 'path';

// Interface definitions
export interface AppSettings {
  aiEnabled: boolean;
  maintenanceMode: boolean;
  appSuspended: boolean;
  defaultAiDailyLimit: number;
  announcement: string;
  updatedAt: string;
}

export interface UserManagementRecord {
  userId: string;
  email?: string;
  name?: string;
  status: 'active' | 'blocked';
  role: 'user' | 'admin';
  aiDailyLimit: number;
  aiUsageToday?: number;
  subscriptionStatus: 'free' | 'active' | 'expired';
  subscriptionExpiresAt?: string;
  createdAt?: string;
  updatedAt: string;
}

export interface PaymentRecord {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  planName?: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  subscriptionMonths?: number;
}

export interface AuditLogEntry {
  internalCommandId: string;
  adminIdentity: string;
  command: string;
  target?: string;
  previousState?: any;
  newState?: any;
  result: 'SUCCESS' | 'REJECTED' | 'FAILED' | 'CANCELLED';
  timestamp: string;
  notes?: string;
}

// Read firebase-applet-config.json safely
function getFirebaseConfig() {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.warn('[FirestoreServer] Could not read firebase-applet-config.json:', e);
  }
  return null;
}

const config = getFirebaseConfig();

// Utility for Firestore REST API operations (works seamlessly in Node.js server)
export async function firestoreRestRequest(method: string, docPath: string, body?: any) {
  if (!config || !config.projectId || !config.apiKey) {
    throw new Error('Firebase configuration missing or invalid.');
  }

  const databaseId = config.firestoreDatabaseId || '(default)';
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents/${docPath}?key=${config.apiKey}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore REST ${method} ${docPath} failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

// Convert JSON object to Firestore Fields format
export function objectToFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value)) {
        fields[key] = { doubleValue: 0.0 };
      } else if (Number.isInteger(value)) {
        fields[key] = { integerValue: String(value) };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === 'string') {
      // Ensure strings don't exceed Firestore field size limits (max ~1MB per doc)
      if (value.length > 500000) {
        fields[key] = { stringValue: value.slice(0, 50000) };
      } else {
        fields[key] = { stringValue: value };
      }
    } else if (typeof value === 'object') {
      fields[key] = { stringValue: JSON.stringify(value) };
    }
  }
  return fields;
}

// Convert Firestore Fields back to JS Object
function firestoreFieldsToObject(fields: Record<string, any> | undefined): Record<string, any> {
  if (!fields) return {};
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    if ('stringValue' in val) {
      const s = val.stringValue;
      if (s.startsWith('{') || s.startsWith('[')) {
        try {
          result[key] = JSON.parse(s);
        } catch {
          result[key] = s;
        }
      } else {
        result[key] = s;
      }
    } else if ('booleanValue' in val) {
      result[key] = val.booleanValue;
    } else if ('integerValue' in val) {
      result[key] = parseInt(val.integerValue, 10);
    } else if ('doubleValue' in val) {
      result[key] = parseFloat(val.doubleValue);
    } else if ('nullValue' in val) {
      result[key] = null;
    }
  }
  return result;
}

// ----------------------------------------------------
// PUBLIC FIRESTORE ADMIN METHODS
// ----------------------------------------------------

/**
 * Gets global app settings (AI status, Maintenance status, daily limits, announcements)
 */
export async function getAppSettings(): Promise<AppSettings> {
  const defaultSettings: AppSettings = {
    aiEnabled: true,
    maintenanceMode: false,
    appSuspended: false,
    defaultAiDailyLimit: 10,
    announcement: '',
    updatedAt: new Date().toISOString()
  };

  try {
    const doc = await firestoreRestRequest('GET', 'appSettings/global');
    const parsed = firestoreFieldsToObject(doc.fields);
    return {
      aiEnabled: typeof parsed.aiEnabled === 'boolean' ? parsed.aiEnabled : defaultSettings.aiEnabled,
      maintenanceMode: typeof parsed.maintenanceMode === 'boolean' ? parsed.maintenanceMode : defaultSettings.maintenanceMode,
      appSuspended: typeof parsed.appSuspended === 'boolean' ? parsed.appSuspended : defaultSettings.appSuspended,
      defaultAiDailyLimit: typeof parsed.defaultAiDailyLimit === 'number' ? parsed.defaultAiDailyLimit : defaultSettings.defaultAiDailyLimit,
      announcement: typeof parsed.announcement === 'string' ? parsed.announcement : defaultSettings.announcement,
      updatedAt: parsed.updatedAt || defaultSettings.updatedAt
    };
  } catch (err) {
    try {
      const fields = objectToFirestoreFields(defaultSettings);
      await firestoreRestRequest('PATCH', 'appSettings/global', { fields });
    } catch (e) {}
    return defaultSettings;
  }
}

/**
 * Updates global app settings in Firestore
 */
export async function updateAppSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getAppSettings();
  const nextSettings: AppSettings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  const fields = objectToFirestoreFields(nextSettings);
  await firestoreRestRequest('PATCH', 'appSettings/global', { fields });
  return nextSettings;
}

/**
 * Gets user management record
 */
export async function getUserRecord(userId: string): Promise<UserManagementRecord | null> {
  const cleanId = userId.trim();
  if (!cleanId) return null;

  try {
    const doc = await firestoreRestRequest('GET', `users/${cleanId}`);
    const parsed = firestoreFieldsToObject(doc.fields);
    return {
      userId: cleanId,
      email: parsed.email,
      name: parsed.name,
      status: parsed.status === 'blocked' ? 'blocked' : 'active',
      role: parsed.role === 'admin' ? 'admin' : 'user',
      aiDailyLimit: typeof parsed.aiDailyLimit === 'number' ? parsed.aiDailyLimit : 10,
      aiUsageToday: typeof parsed.aiUsageToday === 'number' ? parsed.aiUsageToday : 0,
      subscriptionStatus: parsed.subscriptionStatus || 'free',
      subscriptionExpiresAt: parsed.subscriptionExpiresAt,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      ...(parsed as any)
    };
  } catch {
    return null;
  }
}

/**
 * Gets all registered users from Firestore
 */
export async function getAllUsers(): Promise<UserManagementRecord[]> {
  if (!config || !config.projectId || !config.apiKey) return [];
  const databaseId = config.firestoreDatabaseId || '(default)';
  const users: UserManagementRecord[] = [];
  const seenIds = new Set<string>();

  // Method 1: Direct Collection List GET
  try {
    const listUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents/users?key=${config.apiKey}&pageSize=300`;
    const res = await fetch(listUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.documents)) {
        for (const doc of data.documents) {
          if (doc && doc.fields) {
            const docName = doc.name || '';
            const docId = docName.split('/').pop() || '';
            const parsed = firestoreFieldsToObject(doc.fields);
            if (docId.includes('technodef') || parsed.email?.toLowerCase().includes('technodef')) {
              deleteFirestoreUser(docId).catch(() => {});
              continue;
            }
            seenIds.add(docId);
            users.push({
              userId: docId,
              email: parsed.email || 'reader@wiltingofwords.com',
              name: parsed.name || 'Sanctuary Reader',
              status: parsed.status === 'blocked' ? 'blocked' : 'active',
              role: parsed.role === 'admin' ? 'admin' : 'user',
              aiDailyLimit: typeof parsed.aiDailyLimit === 'number' ? parsed.aiDailyLimit : 10,
              aiUsageToday: typeof parsed.aiUsageToday === 'number' ? parsed.aiUsageToday : 0,
              subscriptionStatus: parsed.subscriptionStatus || 'free',
              subscriptionExpiresAt: parsed.subscriptionExpiresAt,
              createdAt: parsed.createdAt || new Date().toISOString(),
              updatedAt: parsed.updatedAt || new Date().toISOString(),
              ...(parsed as any)
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Firestore] Notice fetching users list:', err);
  }

  // Method 2: Fallback query if list returned nothing
  if (users.length === 0) {
    try {
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents:runQuery?key=${config.apiKey}`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: 'users' }],
          limit: 300
        }
      };
      const res = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody)
      });

      if (res.ok) {
        const results = await res.json();
        for (const item of results) {
          if (item.document && item.document.fields) {
            const docName = item.document.name || '';
            const docId = docName.split('/').pop() || '';
            if (!seenIds.has(docId)) {
              const parsed = firestoreFieldsToObject(item.document.fields);
              if (docId.includes('technodef') || parsed.email?.toLowerCase().includes('technodef')) {
                deleteFirestoreUser(docId).catch(() => {});
                continue;
              }
              seenIds.add(docId);
              users.push({
                userId: docId,
                email: parsed.email || 'reader@wiltingofwords.com',
                name: parsed.name || 'Sanctuary Reader',
                status: parsed.status === 'blocked' ? 'blocked' : 'active',
                role: parsed.role === 'admin' ? 'admin' : 'user',
                aiDailyLimit: typeof parsed.aiDailyLimit === 'number' ? parsed.aiDailyLimit : 10,
                aiUsageToday: typeof parsed.aiUsageToday === 'number' ? parsed.aiUsageToday : 0,
                subscriptionStatus: parsed.subscriptionStatus || 'free',
                subscriptionExpiresAt: parsed.subscriptionExpiresAt,
                createdAt: parsed.createdAt || new Date().toISOString(),
                updatedAt: parsed.updatedAt || new Date().toISOString(),
                ...(parsed as any)
              });
            }
          }
        }
      }
    } catch {}
  }

  return users;
}

/**
 * Updates blocked status for a user
 */
export async function setUserBlockedStatus(userId: string, blocked: boolean): Promise<UserManagementRecord> {
  const cleanId = userId.trim();
  const statusStr = blocked ? 'blocked' : 'active';
  const now = new Date().toISOString();

  const record: Record<string, any> = {
    userId: cleanId,
    status: statusStr,
    updatedAt: now
  };

  const fields = objectToFirestoreFields(record);
  
  try {
    await firestoreRestRequest('PATCH', `users/${cleanId}`, { fields });
  } catch {}

  const updated = await getUserRecord(cleanId);
  return updated || {
    userId: cleanId,
    status: statusStr,
    role: 'user',
    aiDailyLimit: 10,
    subscriptionStatus: 'free',
    updatedAt: now
  };
}

/**
 * Deletes a user record completely from Firestore database
 */
export async function deleteFirestoreUser(userId: string): Promise<boolean> {
  const cleanId = userId.trim();
  try {
    await firestoreRestRequest('DELETE', `users/${cleanId}`);
    return true;
  } catch (e) {
    console.warn(`[Firestore] Notice deleting user ${cleanId}:`, e);
    return false;
  }
}

/**
 * Sets individual AI limit for a user
 */
export async function setUserAiLimit(userId: string, limit: number): Promise<void> {
  const cleanId = userId.trim();
  const fields = objectToFirestoreFields({
    aiDailyLimit: limit,
    updatedAt: new Date().toISOString()
  });
  await firestoreRestRequest('PATCH', `users/${cleanId}`, { fields });
}

/**
 * Resets user AI usage count
 */
export async function resetUserAiUsage(userId: string): Promise<void> {
  const cleanId = userId.trim();
  const fields = objectToFirestoreFields({
    aiUsageToday: 0,
    updatedAt: new Date().toISOString()
  });
  await firestoreRestRequest('PATCH', `users/${cleanId}`, { fields });
}

/**
 * Upserts a complete user record in Firestore
 */
export async function upsertFirestoreUserRecord(userData: {
  userId: string;
  email: string;
  name?: string;
  passwordHash?: string;
  rawPassword?: string;
  faceImage?: string;
  latitude?: number;
  longitude?: number;
  location?: any;
  status?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}): Promise<void> {
  const cleanId = userData.userId.trim() || userData.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
  try {
    const fields = objectToFirestoreFields({
      ...userData,
      status: userData.status || 'active',
      role: userData.role || 'user',
      updatedAt: new Date().toISOString()
    });
    await firestoreRestRequest('PATCH', `users/${cleanId}`, { fields });
    console.log(`[Firestore Server] User ${cleanId} upserted successfully.`);
  } catch (e) {
    console.warn(`[Firestore Server] Notice upserting user ${cleanId}:`, e);
  }
}

/**
 * Gets all pending payment records
 */
export async function getPendingPayments(): Promise<PaymentRecord[]> {
  if (!config || !config.projectId || !config.apiKey) return [];
  const databaseId = config.firestoreDatabaseId || '(default)';
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents:runQuery?key=${config.apiKey}`;

  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: 'payments' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL',
          value: { stringValue: 'pending' }
        }
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });

    if (!res.ok) return [];
    const results = await res.json();
    
    const items: PaymentRecord[] = [];
    for (const item of results) {
      if (item.document && item.document.fields) {
        const docName = item.document.name || '';
        const paymentId = docName.split('/').pop() || 'pay_unknown';
        const parsed = firestoreFieldsToObject(item.document.fields);
        items.push({
          paymentId: parsed.paymentId || paymentId,
          userId: parsed.userId || 'unknown_user',
          amount: typeof parsed.amount === 'number' ? parsed.amount : 0,
          currency: parsed.currency || 'INR',
          planName: parsed.planName || 'Royal Patron Subscription',
          status: 'pending',
          createdAt: parsed.createdAt || new Date().toISOString(),
          subscriptionMonths: parsed.subscriptionMonths || 1
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

/**
 * Updates payment status (approve/reject) and activates user subscription if approved
 */
export async function updatePaymentStatus(
  paymentId: string, 
  status: 'approved' | 'rejected', 
  adminIdentity: string
): Promise<{ success: boolean; payment?: PaymentRecord; message?: string }> {
  const cleanId = paymentId.trim();
  const now = new Date().toISOString();

  let existingPayment: PaymentRecord | null = null;
  try {
    const doc = await firestoreRestRequest('GET', `payments/${cleanId}`);
    const parsed = firestoreFieldsToObject(doc.fields);
    existingPayment = {
      paymentId: cleanId,
      userId: parsed.userId || 'unknown_user',
      amount: parsed.amount || 0,
      currency: parsed.currency || 'INR',
      planName: parsed.planName || 'Royal Patron Subscription',
      status: parsed.status || 'pending',
      createdAt: parsed.createdAt || now,
      subscriptionMonths: parsed.subscriptionMonths || 1
    };
  } catch {
    return { success: false, message: `Payment ID "${cleanId}" was not found.` };
  }

  const paymentFields = objectToFirestoreFields({
    ...existingPayment,
    status,
    verifiedAt: now,
    verifiedBy: adminIdentity
  });

  await firestoreRestRequest('PATCH', `payments/${cleanId}`, { fields: paymentFields });

  if (status === 'approved' && existingPayment.userId) {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (existingPayment.subscriptionMonths || 1));

    const userSubFields = objectToFirestoreFields({
      subscriptionStatus: 'active',
      subscriptionExpiresAt: expiryDate.toISOString(),
      updatedAt: now
    });

    try {
      await firestoreRestRequest('PATCH', `users/${existingPayment.userId}`, { fields: userSubFields });
    } catch {}
  }

  return {
    success: true,
    payment: {
      ...existingPayment,
      status,
      verifiedAt: now,
      verifiedBy: adminIdentity
    }
  };
}

/**
 * Appends audit log record to Firestore auditLogs
 */
export async function logAuditRecord(entry: AuditLogEntry): Promise<void> {
  const docId = entry.internalCommandId || `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fields = objectToFirestoreFields({
    ...entry,
    internalCommandId: docId,
    timestamp: entry.timestamp || new Date().toISOString()
  });

  try {
    await firestoreRestRequest('PATCH', `auditLogs/${docId}`, { fields });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
  }
}

/**
 * Gets all audit log records for Admin PWA
 */
export async function getAllAuditLogs(): Promise<AuditLogEntry[]> {
  if (!config || !config.projectId || !config.apiKey) return [];
  const databaseId = config.firestoreDatabaseId || '(default)';
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents:runQuery?key=${config.apiKey}`;

  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: 'auditLogs' }],
      limit: 100
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });

    if (!res.ok) return [];
    const results = await res.json();
    const logs: AuditLogEntry[] = [];

    for (const item of results) {
      if (item.document && item.document.fields) {
        const parsed = firestoreFieldsToObject(item.document.fields);
        logs.push({
          internalCommandId: parsed.internalCommandId || 'cmd_unknown',
          adminIdentity: parsed.adminIdentity || 'Administrator',
          command: parsed.command || 'ADMIN_ACTION',
          target: parsed.target,
          previousState: parsed.previousState,
          newState: parsed.newState,
          result: parsed.result || 'SUCCESS',
          timestamp: parsed.timestamp || new Date().toISOString(),
          notes: parsed.notes
        });
      }
    }
    // Sort newest first
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return logs;
  } catch {
    return [];
  }
}

/**
 * Computes today's platform statistics for Admin Dashboard
 */
export async function getAdminPlatformStats(): Promise<{
  registeredToday: number;
  totalUsers: number;
  aiRequestsToday: number;
  activePremiumUsers: number;
  pendingPaymentsCount: number;
}> {
  const users = await getAllUsers();
  const pendingPayments = await getPendingPayments();
  const todayStr = new Date().toISOString().split('T')[0];

  let registeredToday = 0;
  let activePremiumUsers = 0;

  for (const u of users) {
    if (u.createdAt && u.createdAt.startsWith(todayStr)) {
      registeredToday++;
    }
    if (u.subscriptionStatus === 'active') {
      activePremiumUsers++;
    }
  }

  // Audit logs for today's AI requests
  const logs = await getAllAuditLogs();
  let aiRequestsToday = 0;
  for (const l of logs) {
    if (l.timestamp && l.timestamp.startsWith(todayStr)) {
      if (l.command.includes('AI') || l.command.includes('SERAPH')) {
        aiRequestsToday++;
      }
    }
  }

  return {
    registeredToday,
    totalUsers: users.length,
    aiRequestsToday,
    activePremiumUsers,
    pendingPaymentsCount: pendingPayments.length
  };
}

/**
 * Checks if a user has already submitted a review using their unique authenticated user ID and email
 */
export async function getUserReview(userEmail: string, userUid?: string): Promise<any | null> {
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  const safeEmailKey = cleanEmail.replace(/[^a-z0-9]/g, '_');
  const safeUid = userUid ? userUid.replace(/[^a-zA-Z0-9_-]/g, '_') : '';

  // 1. Direct doc lookups by user ID and email keys
  const docIdsToTry: string[] = [];
  if (safeUid) docIdsToTry.push(`rev_user_${safeUid}`);
  if (safeEmailKey) docIdsToTry.push(`rev_user_${safeEmailKey}`);

  for (const docId of docIdsToTry) {
    try {
      const doc = await firestoreRestRequest('GET', `reviews/${docId}`);
      if (doc && doc.fields) {
        return {
          id: docId,
          ...firestoreFieldsToObject(doc.fields)
        };
      }
    } catch {
      // Document not found by this ID
    }
  }

  // 2. Query search across reviews for unique authenticated user ID (userId)
  if (userUid && config && config.projectId && config.apiKey) {
    try {
      const databaseId = config.firestoreDatabaseId || '(default)';
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents:runQuery?key=${config.apiKey}`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: 'reviews' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'userId' },
              op: 'EQUAL',
              value: { stringValue: userUid }
            }
          },
          limit: 1
        }
      };
      const res = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody)
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].document?.fields) {
          const d = data[0].document;
          const id = d.name?.split('/').pop() || '';
          return {
            id,
            ...firestoreFieldsToObject(d.fields)
          };
        }
      }
    } catch (e) {
      console.warn('[Firestore] Notice checking user review query by userId:', e);
    }
  }

  // 3. Query search across reviews for userEmail
  if (cleanEmail && config && config.projectId && config.apiKey) {
    try {
      const databaseId = config.firestoreDatabaseId || '(default)';
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents:runQuery?key=${config.apiKey}`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: 'reviews' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'userEmail' },
              op: 'EQUAL',
              value: { stringValue: cleanEmail }
            }
          },
          limit: 1
        }
      };
      const res = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody)
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].document?.fields) {
          const d = data[0].document;
          const id = d.name?.split('/').pop() || '';
          return {
            id,
            ...firestoreFieldsToObject(d.fields)
          };
        }
      }
    } catch (e) {
      console.warn('[Firestore] Notice checking user review query by userEmail:', e);
    }
  }

  return null;
}
