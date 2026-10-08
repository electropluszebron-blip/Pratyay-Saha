var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/_lib/shared.ts
var shared_exports = {};
__export(shared_exports, {
  clientSha256: () => clientSha256,
  createOtpToken: () => createOtpToken,
  generateAuthEmailHtml: () => generateAuthEmailHtml,
  generateAuthEmailText: () => generateAuthEmailText,
  getOtpStore: () => getOtpStore,
  loadUsers: () => loadUsers,
  parseRequestBody: () => parseRequestBody,
  saveUsers: () => saveUsers,
  transporter: () => transporter,
  verifyOtpToken: () => verifyOtpToken
});
import nodemailer from "nodemailer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
function createOtpToken(email, otp, expiresAt) {
  const cleanEmail = email.toLowerCase().trim();
  const data = `${cleanEmail}:${otp}:${expiresAt}`;
  return crypto.createHmac("sha256", OTP_SECRET).update(data).digest("hex");
}
function verifyOtpToken(email, otp, expiresAt, token) {
  if (!token || typeof token !== "string") return false;
  if (!otp || typeof otp !== "string") return false;
  if (Date.now() > expiresAt) return false;
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = otp.toString().trim();
  const expected = createOtpToken(cleanEmail, cleanOtp, expiresAt);
  try {
    const expectedBuf = Buffer.from(expected, "hex");
    const tokenBuf = Buffer.from(token, "hex");
    if (expectedBuf.length !== tokenBuf.length || expectedBuf.length === 0) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuf, tokenBuf);
  } catch {
    return false;
  }
}
async function clientSha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.webcrypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = parsed.filter((u) => u.email.toLowerCase() !== "technodef.admin@gmail.com");
        inMemoryUsers = cleaned.length > 0 ? cleaned : [...DEFAULT_SYSTEM_USERS];
        return inMemoryUsers;
      }
    }
  } catch (e) {
    console.warn("[Storage] Fallback to memory:", e);
  }
  return inMemoryUsers;
}
function saveUsers(users) {
  inMemoryUsers = users;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {
    console.warn("[Storage] Error writing file:", e);
  }
}
function getOtpStore() {
  return globalOtpStore;
}
async function parseRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => {
      resolve({});
    });
  });
}
function generateAuthEmailText(name, otp, type = "signup") {
  const recipientName = name ? name.trim() : "Reader";
  const isReset = type === "reset";
  return `WILTING OF WORDS
TECHNODEF AUTOMATED READER PORTAL

"\u099D\u09B0\u09BE \u09AA\u09BE\u09A4\u09BE\u09B0 \u09AE\u09A4\u09CB \u09B6\u09AC\u09CD\u09A6\u0997\u09C1\u09B2\u09CB \u09AF\u09A6\u09BF \u099D\u09B0\u09C7 \u09AF\u09BE\u09DF, \u09B8\u09CD\u09AE\u09C3\u09A4\u09BF\u099F\u09C1\u0995\u09C1 \u09AC\u09C7\u0981\u099A\u09C7 \u09A5\u09BE\u0995\u09C7 \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09AC\u09BE\u0981\u09A7\u09A8\u09C7..."
\u2014 Even as words wilt like autumn foliage, their essence endures within the bond of print.

Respected ${recipientName},

${isReset ? "We received a request to reset your sanctuary passphrase for Wilting of Words. Please use the single-use verification cipher provided below to authorize this reset:" : "Welcome to the sanctuary of timeless letters. To confirm your identity, grant access to your exclusive manuscript collection, and establish your secret passphrase for Wilting of Words, please use the sacred authentication cipher provided below:"}

VERIFICATION CIPHER: ${otp}

Chronometer Notice: This access token remains valid for strictly 10 minutes. It is mandatory for verifying your reader identity and setting your new password. Should this window lapse, a new token must be summoned from the portal.

If you have not solicited access to Wilting of Words, please discard this epistle; your parchment and account remain inviolable and unperturbed.

In devotion to the written word,
Technodef Literary Archives \u{1F58B}\uFE0F

---
Automated Security Notification \u2022 Technodef Reader Portal \u2022 technodef.admin@gmail.com`;
}
function generateAuthEmailHtml(name, otp, type = "signup") {
  const recipientName = name ? name.trim() : "Reader";
  const isReset = type === "reset";
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
                \u2766 &nbsp; \u2724 &nbsp; \u2766
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
                \u2756 \u2500\u2500\u2500 \u2740 \u2500\u2500\u2500 \u2756
              </div>

              <!-- Poetic Bengali Epigraph & English Rendering -->
              <div style="margin-bottom: 26px;">
                <p style="margin: 0 0 6px 0; font-family: 'Georgia', serif; font-style: italic; font-size: 14px; color: #6B1D1D; line-height: 1.6;">
                  "\u099D\u09B0\u09BE \u09AA\u09BE\u09A4\u09BE\u09B0 \u09AE\u09A4\u09CB \u09B6\u09AC\u09CD\u09A6\u0997\u09C1\u09B2\u09CB \u09AF\u09A6\u09BF \u099D\u09B0\u09C7 \u09AF\u09BE\u09DF, \u09B8\u09CD\u09AE\u09C3\u09A4\u09BF\u099F\u09C1\u0995\u09C1 \u09AC\u09C7\u0981\u099A\u09C7 \u09A5\u09BE\u0995\u09C7 \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09AC\u09BE\u0981\u09A7\u09A8\u09C7..."
                </p>
                <p style="margin: 0; font-family: 'Georgia', serif; font-style: italic; font-size: 12px; color: #7A5B3E; line-height: 1.5;">
                  \u2014 Even as words wilt like autumn foliage, their essence endures within the bond of print.
                </p>
              </div>

              <!-- Reader Salutation & Welcome -->
              <div style="text-align: left; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #2D241E;">
                  Respected ${recipientName},
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.75; color: #3E3228;">
                  ${isReset ? "We received a request to reset your sanctuary passphrase for <strong>Wilting of Words</strong>. Please use the sacred authentication cipher provided below to authorize this reset:" : "Welcome to the sanctuary of timeless letters. To confirm your identity, grant access to your exclusive manuscript collection, and establish your secret passphrase for <strong>Wilting of Words</strong>, please use the sacred authentication cipher provided below:"}
                </p>
              </div>

              <!-- Sacred Passcode Box (Guaranteed strictly on one single line) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 22px auto; max-width: 340px;">
                <tr>
                  <td align="center" style="background-color: #F8EFE1; border: 1.5px solid #8B261D; border-radius: 8px; padding: 18px 16px; box-shadow: inset 0 0 10px rgba(139, 38, 29, 0.04);">
                    <div style="font-family: Georgia, serif; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600; color: #8A6740; margin-bottom: 8px;">
                      ${isReset ? "PASSWORD RESET PASSCODE" : "AUTHENTICATION CIPHER"}
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
                  Technodef Literary Archives &nbsp; <span style="font-size: 15px;">\u{1F58B}\uFE0F</span>
                </div>
              </div>

              <!-- Deliverability & Identity Footer (Prevents spam classification) -->
              <div style="margin-top: 28px; padding-top: 12px; border-top: 1px solid #ECE3D0; font-size: 10px; color: #8C7662; line-height: 1.5; text-align: center;">
                Wilting of Words Automated Verification \u2022 Technodef Reader Sanctuary<br />
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
var OTP_SECRET, DATA_DIR, USERS_FILE, DEFAULT_SYSTEM_USERS, inMemoryUsers, globalOtpStore, GMAIL_PASS, transporter;
var init_shared = __esm({
  "api/_lib/shared.ts"() {
    OTP_SECRET = process.env.AUTH_SECRET || "wilting-words-sacred-key-2026";
    DATA_DIR = process.env.VERCEL ? "/tmp" : path.resolve(process.cwd(), "data");
    USERS_FILE = path.join(DATA_DIR, "users.json");
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (e) {
    }
    DEFAULT_SYSTEM_USERS = [
      {
        id: "admin_master_01",
        name: "Pratyay Saha",
        email: "electroplus.zebron@gmail.com",
        passwordHash: "MjkxMTIwMDg=",
        rawPassword: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        status: "active",
        bypassVerification: true,
        aiEnabled: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        createdAtIST: "1/1/2026, 5:30:00 AM (IST)",
        location: {
          latitude: 23.0805,
          longitude: 88.5284,
          city: "Chakdaha",
          region: "West Bengal",
          country: "India",
          address: "Chakdaha, Nadia, West Bengal, India"
        }
      }
    ];
    inMemoryUsers = [...DEFAULT_SYSTEM_USERS];
    globalOtpStore = /* @__PURE__ */ new Map();
    GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || "frwoyyjicslyxmgn";
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "technodef.admin@gmail.com",
        pass: GMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 1e4,
      greetingTimeout: 1e4,
      socketTimeout: 15e3
    });
  }
});

// api/_lib/firestoreServer.ts
var firestoreServer_exports = {};
__export(firestoreServer_exports, {
  deleteFirestoreUser: () => deleteFirestoreUser,
  firestoreRestRequest: () => firestoreRestRequest,
  getAdminPlatformStats: () => getAdminPlatformStats,
  getAllAuditLogs: () => getAllAuditLogs,
  getAllUsers: () => getAllUsers,
  getAppSettings: () => getAppSettings,
  getPendingPayments: () => getPendingPayments,
  getUserRecord: () => getUserRecord,
  getUserReview: () => getUserReview,
  logAuditRecord: () => logAuditRecord,
  objectToFirestoreFields: () => objectToFirestoreFields,
  resetUserAiUsage: () => resetUserAiUsage,
  setUserAiLimit: () => setUserAiLimit,
  setUserBlockedStatus: () => setUserBlockedStatus,
  updateAppSettings: () => updateAppSettings,
  updatePaymentStatus: () => updatePaymentStatus,
  upsertFirestoreUserRecord: () => upsertFirestoreUserRecord
});
import fs2 from "fs";
import path2 from "path";
function getFirebaseConfig() {
  try {
    const configPath = path2.resolve(process.cwd(), "firebase-applet-config.json");
    if (fs2.existsSync(configPath)) {
      return JSON.parse(fs2.readFileSync(configPath, "utf8"));
    }
  } catch (e) {
    console.warn("[FirestoreServer] Could not read firebase-applet-config.json:", e);
  }
  return null;
}
async function firestoreRestRequest(method, docPath, body) {
  if (!config || !config.projectId || !config.apiKey) {
    throw new Error("Firebase configuration missing or invalid.");
  }
  const databaseId = config.firestoreDatabaseId || "(default)";
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents/${docPath}?key=${config.apiKey}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json"
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
function objectToFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === void 0) {
      fields[key] = { nullValue: null };
    } else if (typeof value === "boolean") {
      fields[key] = { booleanValue: value };
    } else if (typeof value === "number") {
      if (isNaN(value) || !isFinite(value)) {
        fields[key] = { doubleValue: 0 };
      } else if (Number.isInteger(value)) {
        fields[key] = { integerValue: String(value) };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === "string") {
      if (value.length > 5e5) {
        fields[key] = { stringValue: value.slice(0, 5e4) };
      } else {
        fields[key] = { stringValue: value };
      }
    } else if (typeof value === "object") {
      fields[key] = { stringValue: JSON.stringify(value) };
    }
  }
  return fields;
}
function firestoreFieldsToObject(fields) {
  if (!fields) return {};
  const result = {};
  for (const [key, val] of Object.entries(fields)) {
    if ("stringValue" in val) {
      const s = val.stringValue;
      if (s.startsWith("{") || s.startsWith("[")) {
        try {
          result[key] = JSON.parse(s);
        } catch {
          result[key] = s;
        }
      } else {
        result[key] = s;
      }
    } else if ("booleanValue" in val) {
      result[key] = val.booleanValue;
    } else if ("integerValue" in val) {
      result[key] = parseInt(val.integerValue, 10);
    } else if ("doubleValue" in val) {
      result[key] = parseFloat(val.doubleValue);
    } else if ("nullValue" in val) {
      result[key] = null;
    }
  }
  return result;
}
async function getAppSettings() {
  const defaultSettings = {
    aiEnabled: true,
    maintenanceMode: false,
    appSuspended: false,
    defaultAiDailyLimit: 10,
    announcement: "",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    const doc = await firestoreRestRequest("GET", "appSettings/global");
    const parsed = firestoreFieldsToObject(doc.fields);
    return {
      aiEnabled: typeof parsed.aiEnabled === "boolean" ? parsed.aiEnabled : defaultSettings.aiEnabled,
      maintenanceMode: typeof parsed.maintenanceMode === "boolean" ? parsed.maintenanceMode : defaultSettings.maintenanceMode,
      appSuspended: typeof parsed.appSuspended === "boolean" ? parsed.appSuspended : defaultSettings.appSuspended,
      defaultAiDailyLimit: typeof parsed.defaultAiDailyLimit === "number" ? parsed.defaultAiDailyLimit : defaultSettings.defaultAiDailyLimit,
      announcement: typeof parsed.announcement === "string" ? parsed.announcement : defaultSettings.announcement,
      updatedAt: parsed.updatedAt || defaultSettings.updatedAt
    };
  } catch (err) {
    try {
      const fields = objectToFirestoreFields(defaultSettings);
      await firestoreRestRequest("PATCH", "appSettings/global", { fields });
    } catch (e) {
    }
    return defaultSettings;
  }
}
async function updateAppSettings(updates) {
  const current = await getAppSettings();
  const nextSettings = {
    ...current,
    ...updates,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const fields = objectToFirestoreFields(nextSettings);
  await firestoreRestRequest("PATCH", "appSettings/global", { fields });
  return nextSettings;
}
async function getUserRecord(userId) {
  const cleanId = userId.trim();
  if (!cleanId) return null;
  try {
    const doc = await firestoreRestRequest("GET", `users/${cleanId}`);
    const parsed = firestoreFieldsToObject(doc.fields);
    return {
      userId: cleanId,
      email: parsed.email,
      name: parsed.name,
      status: parsed.status === "blocked" ? "blocked" : "active",
      role: parsed.role === "admin" ? "admin" : "user",
      aiDailyLimit: typeof parsed.aiDailyLimit === "number" ? parsed.aiDailyLimit : 10,
      aiUsageToday: typeof parsed.aiUsageToday === "number" ? parsed.aiUsageToday : 0,
      subscriptionStatus: parsed.subscriptionStatus || "free",
      subscriptionExpiresAt: parsed.subscriptionExpiresAt,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt || (/* @__PURE__ */ new Date()).toISOString(),
      ...parsed
    };
  } catch {
    return null;
  }
}
async function getAllUsers() {
  if (!config || !config.projectId || !config.apiKey) return [];
  const databaseId = config.firestoreDatabaseId || "(default)";
  const users = [];
  const seenIds = /* @__PURE__ */ new Set();
  try {
    const listUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents/users?key=${config.apiKey}&pageSize=300`;
    const res = await fetch(listUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.documents)) {
        for (const doc of data.documents) {
          if (doc && doc.fields) {
            const docName = doc.name || "";
            const docId = docName.split("/").pop() || "";
            const parsed = firestoreFieldsToObject(doc.fields);
            if (docId.includes("technodef") || parsed.email?.toLowerCase().includes("technodef")) {
              deleteFirestoreUser(docId).catch(() => {
              });
              continue;
            }
            seenIds.add(docId);
            users.push({
              userId: docId,
              email: parsed.email || "reader@wiltingofwords.com",
              name: parsed.name || "Sanctuary Reader",
              status: parsed.status === "blocked" ? "blocked" : "active",
              role: parsed.role === "admin" ? "admin" : "user",
              aiDailyLimit: typeof parsed.aiDailyLimit === "number" ? parsed.aiDailyLimit : 10,
              aiUsageToday: typeof parsed.aiUsageToday === "number" ? parsed.aiUsageToday : 0,
              subscriptionStatus: parsed.subscriptionStatus || "free",
              subscriptionExpiresAt: parsed.subscriptionExpiresAt,
              createdAt: parsed.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
              updatedAt: parsed.updatedAt || (/* @__PURE__ */ new Date()).toISOString(),
              ...parsed
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Firestore] Notice fetching users list:", err);
  }
  if (users.length === 0) {
    try {
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents:runQuery?key=${config.apiKey}`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: "users" }],
          limit: 300
        }
      };
      const res = await fetch(queryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryBody)
      });
      if (res.ok) {
        const results = await res.json();
        for (const item of results) {
          if (item.document && item.document.fields) {
            const docName = item.document.name || "";
            const docId = docName.split("/").pop() || "";
            if (!seenIds.has(docId)) {
              const parsed = firestoreFieldsToObject(item.document.fields);
              if (docId.includes("technodef") || parsed.email?.toLowerCase().includes("technodef")) {
                deleteFirestoreUser(docId).catch(() => {
                });
                continue;
              }
              seenIds.add(docId);
              users.push({
                userId: docId,
                email: parsed.email || "reader@wiltingofwords.com",
                name: parsed.name || "Sanctuary Reader",
                status: parsed.status === "blocked" ? "blocked" : "active",
                role: parsed.role === "admin" ? "admin" : "user",
                aiDailyLimit: typeof parsed.aiDailyLimit === "number" ? parsed.aiDailyLimit : 10,
                aiUsageToday: typeof parsed.aiUsageToday === "number" ? parsed.aiUsageToday : 0,
                subscriptionStatus: parsed.subscriptionStatus || "free",
                subscriptionExpiresAt: parsed.subscriptionExpiresAt,
                createdAt: parsed.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
                updatedAt: parsed.updatedAt || (/* @__PURE__ */ new Date()).toISOString(),
                ...parsed
              });
            }
          }
        }
      }
    } catch {
    }
  }
  return users;
}
async function setUserBlockedStatus(userId, blocked) {
  const cleanId = userId.trim();
  const statusStr = blocked ? "blocked" : "active";
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const record = {
    userId: cleanId,
    status: statusStr,
    updatedAt: now
  };
  const fields = objectToFirestoreFields(record);
  try {
    await firestoreRestRequest("PATCH", `users/${cleanId}`, { fields });
  } catch {
  }
  const updated = await getUserRecord(cleanId);
  return updated || {
    userId: cleanId,
    status: statusStr,
    role: "user",
    aiDailyLimit: 10,
    subscriptionStatus: "free",
    updatedAt: now
  };
}
async function deleteFirestoreUser(userId) {
  const cleanId = userId.trim();
  try {
    await firestoreRestRequest("DELETE", `users/${cleanId}`);
    return true;
  } catch (e) {
    console.warn(`[Firestore] Notice deleting user ${cleanId}:`, e);
    return false;
  }
}
async function setUserAiLimit(userId, limit) {
  const cleanId = userId.trim();
  const fields = objectToFirestoreFields({
    aiDailyLimit: limit,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  await firestoreRestRequest("PATCH", `users/${cleanId}`, { fields });
}
async function resetUserAiUsage(userId) {
  const cleanId = userId.trim();
  const fields = objectToFirestoreFields({
    aiUsageToday: 0,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  await firestoreRestRequest("PATCH", `users/${cleanId}`, { fields });
}
async function upsertFirestoreUserRecord(userData) {
  const cleanId = userData.userId.trim() || userData.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
  try {
    const fields = objectToFirestoreFields({
      ...userData,
      status: userData.status || "active",
      role: userData.role || "user",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    await firestoreRestRequest("PATCH", `users/${cleanId}`, { fields });
    console.log(`[Firestore Server] User ${cleanId} upserted successfully.`);
  } catch (e) {
    console.warn(`[Firestore Server] Notice upserting user ${cleanId}:`, e);
  }
}
async function getPendingPayments() {
  if (!config || !config.projectId || !config.apiKey) return [];
  const databaseId = config.firestoreDatabaseId || "(default)";
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents:runQuery?key=${config.apiKey}`;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: "payments" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "status" },
          op: "EQUAL",
          value: { stringValue: "pending" }
        }
      }
    }
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryBody)
    });
    if (!res.ok) return [];
    const results = await res.json();
    const items = [];
    for (const item of results) {
      if (item.document && item.document.fields) {
        const docName = item.document.name || "";
        const paymentId = docName.split("/").pop() || "pay_unknown";
        const parsed = firestoreFieldsToObject(item.document.fields);
        items.push({
          paymentId: parsed.paymentId || paymentId,
          userId: parsed.userId || "unknown_user",
          amount: typeof parsed.amount === "number" ? parsed.amount : 0,
          currency: parsed.currency || "INR",
          planName: parsed.planName || "Royal Patron Subscription",
          status: "pending",
          createdAt: parsed.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          subscriptionMonths: parsed.subscriptionMonths || 1
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}
async function updatePaymentStatus(paymentId, status, adminIdentity) {
  const cleanId = paymentId.trim();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let existingPayment = null;
  try {
    const doc = await firestoreRestRequest("GET", `payments/${cleanId}`);
    const parsed = firestoreFieldsToObject(doc.fields);
    existingPayment = {
      paymentId: cleanId,
      userId: parsed.userId || "unknown_user",
      amount: parsed.amount || 0,
      currency: parsed.currency || "INR",
      planName: parsed.planName || "Royal Patron Subscription",
      status: parsed.status || "pending",
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
  await firestoreRestRequest("PATCH", `payments/${cleanId}`, { fields: paymentFields });
  if (status === "approved" && existingPayment.userId) {
    const expiryDate = /* @__PURE__ */ new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (existingPayment.subscriptionMonths || 1));
    const userSubFields = objectToFirestoreFields({
      subscriptionStatus: "active",
      subscriptionExpiresAt: expiryDate.toISOString(),
      updatedAt: now
    });
    try {
      await firestoreRestRequest("PATCH", `users/${existingPayment.userId}`, { fields: userSubFields });
    } catch {
    }
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
async function logAuditRecord(entry) {
  const docId = entry.internalCommandId || `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fields = objectToFirestoreFields({
    ...entry,
    internalCommandId: docId,
    timestamp: entry.timestamp || (/* @__PURE__ */ new Date()).toISOString()
  });
  try {
    await firestoreRestRequest("PATCH", `auditLogs/${docId}`, { fields });
  } catch (err) {
    console.error("[AuditLog] Failed to record audit log:", err);
  }
}
async function getAllAuditLogs() {
  if (!config || !config.projectId || !config.apiKey) return [];
  const databaseId = config.firestoreDatabaseId || "(default)";
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents:runQuery?key=${config.apiKey}`;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: "auditLogs" }],
      limit: 100
    }
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryBody)
    });
    if (!res.ok) return [];
    const results = await res.json();
    const logs = [];
    for (const item of results) {
      if (item.document && item.document.fields) {
        const parsed = firestoreFieldsToObject(item.document.fields);
        logs.push({
          internalCommandId: parsed.internalCommandId || "cmd_unknown",
          adminIdentity: parsed.adminIdentity || "Administrator",
          command: parsed.command || "ADMIN_ACTION",
          target: parsed.target,
          previousState: parsed.previousState,
          newState: parsed.newState,
          result: parsed.result || "SUCCESS",
          timestamp: parsed.timestamp || (/* @__PURE__ */ new Date()).toISOString(),
          notes: parsed.notes
        });
      }
    }
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return logs;
  } catch {
    return [];
  }
}
async function getAdminPlatformStats() {
  const users = await getAllUsers();
  const pendingPayments = await getPendingPayments();
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let registeredToday = 0;
  let activePremiumUsers = 0;
  for (const u of users) {
    if (u.createdAt && u.createdAt.startsWith(todayStr)) {
      registeredToday++;
    }
    if (u.subscriptionStatus === "active") {
      activePremiumUsers++;
    }
  }
  const logs = await getAllAuditLogs();
  let aiRequestsToday = 0;
  for (const l of logs) {
    if (l.timestamp && l.timestamp.startsWith(todayStr)) {
      if (l.command.includes("AI") || l.command.includes("SERAPH")) {
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
async function getUserReview(userEmail, userUid) {
  const cleanEmail = (userEmail || "").toLowerCase().trim();
  const safeEmailKey = cleanEmail.replace(/[^a-z0-9]/g, "_");
  const safeUid = userUid ? userUid.replace(/[^a-zA-Z0-9_-]/g, "_") : "";
  const docIdsToTry = [];
  if (safeUid) docIdsToTry.push(`rev_user_${safeUid}`);
  if (safeEmailKey) docIdsToTry.push(`rev_user_${safeEmailKey}`);
  for (const docId of docIdsToTry) {
    try {
      const doc = await firestoreRestRequest("GET", `reviews/${docId}`);
      if (doc && doc.fields) {
        return {
          id: docId,
          ...firestoreFieldsToObject(doc.fields)
        };
      }
    } catch {
    }
  }
  if (userUid && config && config.projectId && config.apiKey) {
    try {
      const databaseId = config.firestoreDatabaseId || "(default)";
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents:runQuery?key=${config.apiKey}`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: "reviews" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "userId" },
              op: "EQUAL",
              value: { stringValue: userUid }
            }
          },
          limit: 1
        }
      };
      const res = await fetch(queryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryBody)
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].document?.fields) {
          const d = data[0].document;
          const id = d.name?.split("/").pop() || "";
          return {
            id,
            ...firestoreFieldsToObject(d.fields)
          };
        }
      }
    } catch (e) {
      console.warn("[Firestore] Notice checking user review query by userId:", e);
    }
  }
  if (cleanEmail && config && config.projectId && config.apiKey) {
    try {
      const databaseId = config.firestoreDatabaseId || "(default)";
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${databaseId}/documents:runQuery?key=${config.apiKey}`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: "reviews" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "userEmail" },
              op: "EQUAL",
              value: { stringValue: cleanEmail }
            }
          },
          limit: 1
        }
      };
      const res = await fetch(queryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryBody)
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].document?.fields) {
          const d = data[0].document;
          const id = d.name?.split("/").pop() || "";
          return {
            id,
            ...firestoreFieldsToObject(d.fields)
          };
        }
      }
    } catch (e) {
      console.warn("[Firestore] Notice checking user review query by userEmail:", e);
    }
  }
  return null;
}
var config;
var init_firestoreServer = __esm({
  "api/_lib/firestoreServer.ts"() {
    config = getFirebaseConfig();
  }
});

// server-app.ts
import express from "express";
import path7 from "path";
import fs7 from "fs";

// api/auth/send-otp.ts
init_shared();

// api/_lib/preciseLocationGuard.ts
var MAX_LOCATION_AGE_MS = 10 * 60 * 1e3;
function validatePreciseLocation(payload) {
  if (!payload || typeof payload !== "object") {
    return {
      valid: false,
      code: "LOCATION_MISSING",
      error: "Precise location is required to continue. No location coordinates were provided."
    };
  }
  const latRaw = payload.latitude;
  const lonRaw = payload.longitude;
  const accRaw = payload.accuracy;
  const timeRaw = payload.locationTimestamp ?? payload.timestamp;
  if (latRaw === void 0 || latRaw === null || lonRaw === void 0 || lonRaw === null) {
    return {
      valid: false,
      code: "LOCATION_MISSING",
      error: "Precise location is required to continue. GPS coordinates must be provided."
    };
  }
  const latitude = typeof latRaw === "number" ? latRaw : parseFloat(String(latRaw));
  const longitude = typeof lonRaw === "number" ? lonRaw : parseFloat(String(lonRaw));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      valid: false,
      code: "LOCATION_INVALID",
      error: "Precise location is required to continue. Latitude and longitude must be valid numbers."
    };
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return {
      valid: false,
      code: "LOCATION_INVALID",
      error: "Coordinates out of geographical bounds."
    };
  }
  const accuracy = accRaw !== void 0 && accRaw !== null ? typeof accRaw === "number" ? accRaw : parseFloat(String(accRaw)) : 10;
  if (Number.isFinite(accuracy) && accuracy > 200) {
    return {
      valid: false,
      code: "LOCATION_COARSE",
      error: "Precise location is required. Approximate location is not supported. Please enable Precise location in your browser and try again."
    };
  }
  let timestamp = Date.now();
  if (timeRaw !== void 0 && timeRaw !== null) {
    const parsedTime = typeof timeRaw === "number" ? timeRaw : new Date(timeRaw).getTime();
    if (Number.isFinite(parsedTime)) {
      timestamp = parsedTime;
      const ageMs = Date.now() - timestamp;
      if (ageMs > MAX_LOCATION_AGE_MS) {
        return {
          valid: false,
          code: "LOCATION_STALE",
          error: "Precise location is required to continue. Location reading is stale."
        };
      }
      if (ageMs < -6e4) {
        return {
          valid: false,
          code: "LOCATION_INVALID",
          error: "Location timestamp is in the future. Check device clock."
        };
      }
    }
  }
  return {
    valid: true,
    location: {
      latitude,
      longitude,
      accuracy: Number.isFinite(accuracy) ? accuracy : 10,
      timestamp,
      city: payload.city,
      region: payload.region,
      country: payload.country,
      address: payload.address
    }
  };
}
function extractAndValidatePreciseLocation(req, body) {
  const payloadFromHeaders = {
    latitude: req.headers["x-user-latitude"] ? parseFloat(req.headers["x-user-latitude"]) : void 0,
    longitude: req.headers["x-user-longitude"] ? parseFloat(req.headers["x-user-longitude"]) : void 0,
    accuracy: req.headers["x-user-accuracy"] ? parseFloat(req.headers["x-user-accuracy"]) : void 0,
    timestamp: req.headers["x-user-location-timestamp"] ? parseInt(req.headers["x-user-location-timestamp"], 10) : void 0
  };
  const combinedPayload = {
    latitude: body?.latitude ?? body?.location?.latitude ?? payloadFromHeaders.latitude,
    longitude: body?.longitude ?? body?.location?.longitude ?? payloadFromHeaders.longitude,
    accuracy: body?.accuracy ?? body?.location?.accuracy ?? payloadFromHeaders.accuracy,
    locationTimestamp: body?.locationTimestamp ?? body?.timestamp ?? body?.location?.timestamp ?? payloadFromHeaders.timestamp,
    city: body?.city ?? body?.location?.city,
    region: body?.region ?? body?.location?.region,
    country: body?.country ?? body?.location?.country,
    address: body?.address ?? body?.location?.address
  };
  return validatePreciseLocation(combinedPayload);
}
function enforcePreciseLocationEndpoint(req, res, body) {
  const result = extractAndValidatePreciseLocation(req, body);
  if (!result.valid) {
    res.status(403).json({
      success: false,
      preciseLocationRequired: true,
      code: result.code,
      error: result.error || "Precise location is required to continue."
    });
    return false;
  }
  return true;
}

// api/auth/send-otp.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = await parseRequestBody(req);
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }
    const { name, email, isGoogleAuth } = body || {};
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || "").trim();
    if (!cleanName) {
      return res.status(400).json({ error: "Please enter your full name. Name is required for registration." });
    }
    const existingUsers = loadUsers();
    let userExists = existingUsers.some((u) => u.email.toLowerCase() === cleanEmail && Boolean(u.passwordHash || u.rawPassword));
    if (!userExists) {
      try {
        const { getUserRecord: getUserRecord2 } = await Promise.resolve().then(() => (init_firestoreServer(), firestoreServer_exports));
        const fbUser = await getUserRecord2(cleanEmail.replace(/[^a-z0-9]/g, "_"));
        if (fbUser && (fbUser.passwordHash || fbUser.rawPassword)) {
          userExists = true;
        }
      } catch {
      }
    }
    if (userExists && !isGoogleAuth) {
      return res.status(400).json({
        error: "An account with this email address already exists. Please Sign In.",
        alreadyRegistered: true
      });
    }
    const otpStore = getOtpStore();
    const existingEntry = otpStore.get(cleanEmail);
    const now = Date.now();
    if (existingEntry && existingEntry.lastSentAt && now - existingEntry.lastSentAt < 6e4 && existingEntry.expiresAt > now) {
      console.log(`[Auth] Rate-limit active for ${cleanEmail}. Reusing existing OTP: ${existingEntry.otp}`);
      return res.status(200).json({
        success: true,
        message: `A 5-digit verification OTP has been dispatched to ${cleanEmail}.`,
        expiresInMinutes: 10,
        token: existingEntry.token,
        expiresAt: existingEntry.expiresAt,
        userExists: false
      });
    }
    const otp = Math.floor(1e4 + Math.random() * 9e4).toString();
    const expiresAt = now + 10 * 60 * 1e3;
    const token = createOtpToken(cleanEmail, otp, expiresAt);
    const previousOtps = existingEntry && existingEntry.expiresAt > now ? Array.from(/* @__PURE__ */ new Set([existingEntry.otp, ...existingEntry.previousOtps || []])) : [];
    otpStore.set(cleanEmail, {
      otp,
      previousOtps,
      token,
      name: cleanName,
      type: "signup",
      expiresAt,
      lastSentAt: now
    });
    const mailHtml = generateAuthEmailHtml(cleanName, otp, "signup");
    const mailText = generateAuthEmailText(cleanName, otp, "signup");
    const mailOptions = {
      from: '"Wilting of Words" <technodef.admin@gmail.com>',
      replyTo: "technodef.admin@gmail.com",
      to: cleanEmail,
      subject: `${otp} is your Wilting of Words verification code`,
      text: mailText,
      html: mailHtml,
      headers: {
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
        "Importance": "Normal",
        "X-Mailer": "Technodef Reader Sanctuary 1.0",
        "List-Unsubscribe": "<mailto:technodef.admin@gmail.com?subject=unsubscribe>"
      }
    };
    transporter.sendMail(mailOptions).catch((err) => {
      console.warn("[Auth] Background SMTP send warning:", err.message);
    });
    console.log(`[Auth] 5-digit OTP dispatched to ${cleanEmail}: ${otp}`);
    return res.status(200).json({
      success: true,
      message: `A 5-digit verification OTP has been dispatched to ${cleanEmail}.`,
      expiresInMinutes: 10,
      token,
      expiresAt,
      userExists,
      debugOtp: otp
    });
  } catch (error) {
    console.error("[Auth] Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to dispatch verification email. Please try again."
    });
  }
}

// api/auth/verify-otp.ts
init_shared();
async function handler2(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }
  try {
    const body = await parseRequestBody(req);
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }
    const { email, otp, token, expiresAt } = body || {};
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();
    if (!/^\d{5}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid 5-digit numerical verification code."
      });
    }
    let isOtpValid = false;
    if (token && expiresAt) {
      if (Date.now() > Number(expiresAt)) {
        return res.status(400).json({
          success: false,
          error: "The verification code has expired. Please request a new OTP."
        });
      }
      if (verifyOtpToken(cleanEmail, cleanOtp, Number(expiresAt), token)) {
        isOtpValid = true;
      }
    }
    const otpStore = getOtpStore();
    const record = otpStore.get(cleanEmail);
    if (record) {
      if (Date.now() > record.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.status(400).json({
          success: false,
          error: "The verification code has expired. Please request a new OTP."
        });
      }
      if (record.otp === cleanOtp || record.previousOtps && record.previousOtps.includes(cleanOtp)) {
        isOtpValid = true;
      }
    }
    if (!isOtpValid) {
      console.log(`[Auth] OTP verification attempt rejected for ${cleanEmail}: code mismatch.`);
      return res.status(400).json({
        success: false,
        error: "Invalid 5-digit verification code. Please enter the correct OTP sent to your email."
      });
    }
    otpStore.delete(cleanEmail);
    console.log(`[Auth] OTP successfully verified for ${cleanEmail}`);
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      email: cleanEmail
    });
  } catch (error) {
    console.error("[Auth] Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred while verifying OTP. Please try again."
    });
  }
}

// api/auth/set-password.ts
init_shared();
async function handler3(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = await parseRequestBody(req);
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }
    const { email, password, name, otp, token, expiresAt } = body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Passphrase must be at least 6 characters." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = (otp || "").toString().trim();
    let isOtpValid = false;
    if (token && expiresAt && cleanOtp) {
      isOtpValid = verifyOtpToken(cleanEmail, cleanOtp, Number(expiresAt), token);
    }
    const otpStore = getOtpStore();
    const record = otpStore.get(cleanEmail);
    if (record && Date.now() <= record.expiresAt && record.otp === cleanOtp) {
      isOtpValid = true;
    }
    if (!isOtpValid) {
      return res.status(400).json({ error: "Invalid or expired verification passcode. Please enter the correct OTP sent to your email." });
    }
    const users = loadUsers();
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    const passwordHash = Buffer.from(password).toString("base64");
    const userName = (name || "").trim() || "Reader";
    const now = /* @__PURE__ */ new Date();
    const istTimeString = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium"
    }) + " (IST)";
    const userUid = "usr_" + cleanEmail.replace(/[^a-z0-9]/g, "_");
    if (existingIndex !== -1) {
      users[existingIndex].passwordHash = passwordHash;
      users[existingIndex].rawPassword = password;
      users[existingIndex].name = userName;
      users[existingIndex].status = "active";
      users[existingIndex].updatedAt = now.toISOString();
      users[existingIndex].updatedAtIST = istTimeString;
      saveUsers(users);
    } else {
      const newUser = {
        id: userUid,
        name: userName,
        email: cleanEmail,
        passwordHash,
        rawPassword: password,
        status: "active",
        aiEnabled: true,
        bypassVerification: false,
        createdAt: now.toISOString(),
        createdAtIST: istTimeString,
        updatedAt: now.toISOString(),
        updatedAtIST: istTimeString
      };
      users.push(newUser);
      saveUsers(users);
    }
    try {
      const { upsertFirestoreUserRecord: upsertFirestoreUserRecord2 } = await Promise.resolve().then(() => (init_firestoreServer(), firestoreServer_exports));
      await upsertFirestoreUserRecord2({
        userId: userUid,
        email: cleanEmail,
        name: userName,
        passwordHash,
        rawPassword: password,
        status: "active",
        role: "user",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      });
    } catch (fbErr) {
      console.warn("[Set-Password] Notice syncing to Firestore:", fbErr);
    }
    otpStore.delete(cleanEmail);
    return res.status(200).json({
      success: true,
      message: "Account created and secured successfully.",
      user: {
        id: userUid,
        email: cleanEmail,
        name: userName
      }
    });
  } catch (error) {
    console.error("[Auth] Error setting password:", error);
    return res.status(500).json({ error: "Failed to set password." });
  }
}

// api/auth/forgot-password.ts
init_shared();
async function handler4(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = await parseRequestBody(req);
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }
    const { email } = body || {};
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    const recipientName = existingUser ? existingUser.name : "Reader";
    const otpStore = getOtpStore();
    const existingEntry = otpStore.get(cleanEmail);
    const now = Date.now();
    if (existingEntry && existingEntry.lastSentAt && now - existingEntry.lastSentAt < 6e4 && existingEntry.expiresAt > now) {
      console.log(`[Auth] Rate-limit active for reset ${cleanEmail}. Reusing existing OTP: ${existingEntry.otp}`);
      return res.status(200).json({
        success: true,
        message: `A 5-digit password reset code has been sent to ${cleanEmail}.`,
        expiresInMinutes: 10,
        token: existingEntry.token,
        expiresAt: existingEntry.expiresAt
      });
    }
    const otp = Math.floor(1e4 + Math.random() * 9e4).toString();
    const expiresAt = now + 10 * 60 * 1e3;
    const token = createOtpToken(cleanEmail, otp, expiresAt);
    const previousOtps = existingEntry && existingEntry.expiresAt > now ? Array.from(/* @__PURE__ */ new Set([existingEntry.otp, ...existingEntry.previousOtps || []])) : [];
    otpStore.set(cleanEmail, {
      otp,
      previousOtps,
      token,
      name: recipientName,
      type: "reset",
      expiresAt,
      lastSentAt: now
    });
    const mailHtml = generateAuthEmailHtml(recipientName, otp, "reset");
    const mailText = generateAuthEmailText(recipientName, otp, "reset");
    const mailOptions = {
      from: '"Wilting of Words" <technodef.admin@gmail.com>',
      replyTo: "technodef.admin@gmail.com",
      to: cleanEmail,
      subject: `${otp} is your Wilting of Words reset passcode`,
      text: mailText,
      html: mailHtml,
      headers: {
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
        "Importance": "Normal",
        "X-Mailer": "Technodef Reader Sanctuary 1.0",
        "List-Unsubscribe": "<mailto:technodef.admin@gmail.com?subject=unsubscribe>"
      }
    };
    await transporter.sendMail(mailOptions);
    console.log(`[Auth] Password Reset OTP dispatched to ${cleanEmail}: ${otp}`);
    return res.status(200).json({
      success: true,
      message: `A 5-digit password reset code has been sent to ${cleanEmail}.`,
      expiresInMinutes: 10,
      token,
      expiresAt
    });
  } catch (error) {
    console.error("[Auth] Error sending reset OTP:", error);
    return res.status(500).json({
      error: "Failed to send password reset code. Please check your email address.",
      details: error.message
    });
  }
}

// api/auth/reset-password.ts
init_shared();
async function handler5(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = await parseRequestBody(req);
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }
    const { email, otp, newPassword, token, expiresAt } = body || {};
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();
    let isOtpValid = false;
    if (token && expiresAt) {
      isOtpValid = verifyOtpToken(cleanEmail, cleanOtp, Number(expiresAt), token);
    }
    const otpStore = getOtpStore();
    const record = otpStore.get(cleanEmail);
    if (record && Date.now() <= record.expiresAt && record.otp === cleanOtp) {
      isOtpValid = true;
    }
    if (!isOtpValid) {
      if (record && Date.now() > record.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.status(400).json({ error: "The reset OTP has expired. Please request a new code." });
      }
      return res.status(400).json({ error: "Invalid 5-digit reset code. Please check your email." });
    }
    const users = loadUsers();
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    const newHash = Buffer.from(newPassword).toString("base64");
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const userName = (userIndex !== -1 ? users[userIndex].name : record?.name) || cleanEmail.split("@")[0] || "Reader";
    const userUid = userIndex !== -1 ? users[userIndex].id : "usr_" + cleanEmail.replace(/[^a-z0-9]/g, "_");
    if (userIndex !== -1) {
      users[userIndex].passwordHash = newHash;
      users[userIndex].rawPassword = newPassword;
      users[userIndex].updatedAt = nowIso;
      saveUsers(users);
    } else {
      users.push({
        id: userUid,
        name: userName,
        email: cleanEmail,
        passwordHash: newHash,
        rawPassword: newPassword,
        status: "active",
        aiEnabled: true,
        bypassVerification: false,
        createdAt: nowIso,
        updatedAt: nowIso
      });
      saveUsers(users);
    }
    try {
      const { upsertFirestoreUserRecord: upsertFirestoreUserRecord2 } = await Promise.resolve().then(() => (init_firestoreServer(), firestoreServer_exports));
      await upsertFirestoreUserRecord2({
        userId: userUid,
        email: cleanEmail,
        name: userName,
        passwordHash: newHash,
        rawPassword: newPassword,
        status: "active",
        updatedAt: nowIso
      });
    } catch (fbErr) {
      console.warn("[Reset-Password] Firestore sync notice:", fbErr);
    }
    otpStore.delete(cleanEmail);
    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
      user: {
        id: userUid,
        email: cleanEmail,
        name: userName
      }
    });
  } catch (error) {
    console.error("[Auth] Error resetting password:", error);
    return res.status(500).json({ error: "Failed to reset password." });
  }
}

// api/auth/check-user.ts
init_shared();
import fs3 from "fs";
import path3 from "path";
var firebaseConfig = null;
try {
  const configPath = path3.resolve(process.cwd(), "firebase-applet-config.json");
  if (fs3.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs3.readFileSync(configPath, "utf8"));
  }
} catch (e) {
}
function sanitizeEmailKey(email) {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
}
async function handler6(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  try {
    const body = req.method === "POST" ? await parseRequestBody(req) : req.query;
    const email = body.email || req.query.email || "";
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required", exists: false });
    }
    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return res.status(200).json({
        success: true,
        exists: true,
        name: existingUser.name || null,
        email: cleanEmail
      });
    }
    if (firebaseConfig?.projectId && firebaseConfig?.apiKey) {
      try {
        const docId = sanitizeEmailKey(cleanEmail);
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/users/${docId}?key=${firebaseConfig.apiKey}`;
        const fbRes = await fetch(url);
        if (fbRes.ok) {
          const docData = await fbRes.json();
          const name = docData.fields?.name?.stringValue || cleanEmail.split("@")[0];
          const rawPass = docData.fields?.rawPassword?.stringValue || "";
          const passHash = docData.fields?.passwordHash?.stringValue || "";
          const faceImg = docData.fields?.faceImage?.stringValue || "";
          const syncedUser = {
            id: docId,
            name,
            email: cleanEmail,
            passwordHash: passHash,
            rawPassword: rawPass,
            faceImage: faceImg,
            status: "active",
            aiEnabled: true,
            bypassVerification: false,
            createdAt: docData.fields?.createdAt?.stringValue || (/* @__PURE__ */ new Date()).toISOString()
          };
          users.push(syncedUser);
          const { saveUsers: saveUsers2 } = await Promise.resolve().then(() => (init_shared(), shared_exports));
          saveUsers2(users);
          return res.status(200).json({
            success: true,
            exists: true,
            name,
            email: cleanEmail
          });
        }
      } catch (fbErr) {
        console.warn("[Check User] Firestore check warning:", fbErr);
      }
    }
    return res.status(200).json({
      success: true,
      exists: false,
      name: null,
      email: cleanEmail
    });
  } catch (error) {
    console.error("[Auth] Error checking user existence:", error);
    return res.status(500).json({ error: "Server error checking user", exists: false });
  }
}

// api/auth/signin.ts
init_shared();
init_firestoreServer();
function sanitizeEmailKey2(email) {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
}
async function handler7(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = await parseRequestBody(req);
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }
    const { email, password } = body || {};
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const cleanEmail = email.toLowerCase().trim();
    if (!password) {
      return res.status(400).json({ error: "Passphrase is required." });
    }
    let users = loadUsers();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      try {
        const firestoreRecord = await getUserRecord(sanitizeEmailKey2(cleanEmail));
        if (firestoreRecord) {
          const rawHash = firestoreRecord.passwordHash || "";
          const rawPass = firestoreRecord.rawPassword || "";
          const storedName = firestoreRecord.name || (cleanEmail === "electroplus.zebron@gmail.com" ? "Pratyay Saha" : cleanEmail.split("@")[0]);
          user = {
            id: firestoreRecord.userId || "usr_" + cleanEmail.replace(/[^a-z0-9]/g, "_"),
            name: storedName,
            email: cleanEmail,
            passwordHash: rawHash,
            rawPassword: rawPass,
            status: firestoreRecord.status === "blocked" ? "blocked" : "active",
            aiEnabled: firestoreRecord.aiDailyLimit !== 0,
            bypassVerification: firestoreRecord.bypassVerification || cleanEmail === "electroplus.zebron@gmail.com",
            createdAt: firestoreRecord.createdAt || (/* @__PURE__ */ new Date()).toISOString()
          };
          users.push(user);
          saveUsers(users);
        }
      } catch (fbErr) {
        console.warn("[Signin] Error querying Firestore:", fbErr);
      }
    }
    if (!user) {
      return res.status(404).json({
        error: `No account found for "${cleanEmail}". Your account does not exist or has been deleted by the administrator. Please click "Sign Up" below to create an account.`,
        notFound: true
      });
    }
    if (user.status === "blocked") {
      return res.status(403).json({
        error: "Your account is blocked by the administrator. Please contact electroplus.zebron@gmail.com for assistance.",
        blocked: true
      });
    }
    const inputHash = Buffer.from(password).toString("base64");
    const isMatch = user.passwordHash === inputHash || user.passwordHash === password || user.rawPassword === password || user.passwordHash?.trim() === password.trim() || user.rawPassword && user.rawPassword.trim() === password.trim();
    if (!isMatch) {
      return res.status(401).json({
        error: 'Incorrect secret passphrase. Please check your credentials or click "Forgot Password?" to reset.',
        notFound: false
      });
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
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
    } catch {
    }
    return res.status(200).json({
      success: true,
      message: "Authentication successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bypassVerification: user.bypassVerification || false,
        aiEnabled: user.aiEnabled !== false
      }
    });
  } catch (error) {
    console.error("[Auth] Error signing in:", error);
    return res.status(500).json({ error: "Failed to sign in." });
  }
}

// api/pdf.ts
import https from "https";
import http from "http";
function handler8(req, res) {
  const fetchPdf = (targetUrl, redirectCount = 0) => {
    if (redirectCount > 5) {
      res.status(500).send("Too many redirects");
      return;
    }
    const client = targetUrl.startsWith("https") ? https : http;
    client.get(targetUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, (proxyRes) => {
      if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        fetchPdf(proxyRes.headers.location, redirectCount + 1);
        return;
      }
      res.writeHead(proxyRes.statusCode || 200, {
        "Content-Type": "application/pdf",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600"
      });
      proxyRes.pipe(res);
    }).on("error", (err) => {
      res.status(500).send(`Error fetching PDF: ${err.message}`);
    });
  };
  const googleDriveDownloadUrl = "https://drive.google.com/uc?export=download&id=1avq1PulH3i3avuRI8qrDtSBCF1GQeJUR";
  fetchPdf(googleDriveDownloadUrl);
}

// api/certificate/send-email.ts
init_shared();
async function handler9(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = await parseRequestBody(req);
    const { recipientEmail, recipientName, certificateId, issueDate, activeReadingTime } = body || {};
    if (!recipientEmail || !recipientEmail.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid recipient email address." });
    }
    const cleanEmail = recipientEmail.toLowerCase().trim();
    const cleanName = (recipientName || "Reader").trim();
    const emailPrefix = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 5);
    const readerId = `WOW-READER-${emailPrefix}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const certId = certificateId || `WOW-CERT-2026-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const dateStr = issueDate || (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = activeReadingTime || "30 Minutes Active Focus";
    const signatureUrl = "https://lh3.googleusercontent.com/d/18nXSeulDg_yk0NM8d4R_GayxZwRBvT2F";
    const mailHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wilting of Words - Certificate of Literary Mastery</title>
</head>
<body style="margin: 0; padding: 15px 5px; background-color: #FFFFFF; font-family: 'Georgia', serif; color: #2D241E; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">
        <!-- Certificate Main Frame -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #FAF7F2; border: 3px solid #C5A059; border-radius: 4px;">
          <tr>
            <td style="padding: 24px 20px; text-align: center; background-color: #FAF7F2;">
              
              <!-- Top Ornamental Dashed Pattern -->
              <div style="font-family: monospace; font-size: 11px; letter-spacing: 2px; color: #C5A059; margin-bottom: 12px; line-height: 1;">
                =================================
              </div>

              <!-- Top Header Text -->
              <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 10px; font-weight: bold; color: #8B261D; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
                OFFICIAL BENGALI HERITAGE TESTIMONIAL \u2022 TECHNODEF PRESS
              </div>

              <!-- Novel Title -->
              <h1 style="margin: 0 0 8px 0; font-family: 'Times New Roman', Georgia, serif; font-size: 26px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; color: #8B261D;">
                WILTING OF WORDS
              </h1>

              <!-- Thin Gold Accent Line -->
              <div style="margin: 0 auto 16px auto; max-width: 200px; height: 1.5px; background-color: #C5A059;"></div>

              <!-- Bengali Heritage Quote with Left Crimson Vertical Border -->
              <div style="border-left: 3px solid #8B261D; padding: 6px 12px 6px 14px; margin: 0 auto 20px auto; max-width: 480px; text-align: center;">
                <div style="font-family: 'Georgia', serif; font-style: italic; font-size: 12.5px; font-weight: bold; color: #8B261D; margin-bottom: 6px; line-height: 1.5;">
                  "\u099D\u09B0\u09BE \u09AA\u09BE\u09A4\u09BE\u09B0 \u09AE\u09A4\u09CB \u09B6\u09AC\u09CD\u09A6\u0997\u09C1\u09B2\u09CB \u09AF\u09A6\u09BF \u099D\u09B0\u09C7 \u09AF\u09BE\u09DF, \u09B8\u09CD\u09AE\u09C3\u09A4\u09BF\u099F\u09C1\u0995\u09C1 \u09AC\u09C7\u0981\u099A\u09C7 \u09A5\u09BE\u0995\u09C7 \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09AC\u09BE\u0981\u09A7\u09A8\u09C7..."
                </div>
                <div style="font-family: 'Georgia', serif; font-style: italic; font-size: 10.5px; color: #5A4535; line-height: 1.4;">
                  \u2014 Even as words wilt like autumn foliage, their essence endures within the bond of print.
                </div>
              </div>

              <!-- Main Certificate Title -->
              <h2 style="margin: 0 0 6px 0; font-family: 'Times New Roman', Georgia, serif; font-size: 22px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #1A1410;">
                CERTIFICATE OF<br />LITERARY MASTERY
              </h2>

              <p style="font-family: 'Georgia', serif; font-style: italic; font-size: 11.5px; color: #4A3E38; margin: 0 0 16px 0;">
                This premium reader testimonial is officially conferred upon
              </p>

              <!-- Recipient Name Box with Top and Bottom Gold Borders -->
              <div style="border-top: 1.5px solid #C5A059; border-bottom: 1.5px solid #C5A059; padding: 12px 20px; display: block; max-width: 440px; margin: 0 auto 16px auto;">
                <span style="font-family: 'Times New Roman', Georgia, serif; font-size: 24px; font-weight: 900; color: #8B261D; letter-spacing: 2px; text-transform: uppercase;">
                  ${cleanName.toUpperCase()}
                </span>
              </div>

              <!-- Reader Identity Pill Box -->
              <div style="margin-bottom: 18px;">
                <div style="border: 1px dashed #C5A059; border-radius: 4px; padding: 6px 16px; font-family: monospace; font-size: 10.5px; font-weight: bold; color: #8B261D; background-color: #FAF4EB; display: inline-block; letter-spacing: 1px;">
                  READER IDENTITY: ${readerId}
                </div>
              </div>

              <!-- Dedication Text -->
              <p style="font-family: 'Georgia', serif; font-size: 11.5px; color: #3E3228; max-width: 500px; margin: 0 auto 18px auto; line-height: 1.65;">
                For exemplary dedication, focused engagement, and profound appreciation during active immersion in the 219 sepia ink manuscript pages of <strong style="color: #1A1410;">\u201CWilting of Words\u201D</strong>, exploring the timeless themes of identity, memory, and silence.
              </p>

              <!-- Verification Code & Conferred Date Details Card -->
              <table role="presentation" border="0" cellpadding="10" cellspacing="0" width="100%" style="max-width: 460px; margin: 0 auto 20px auto; background-color: #F7F4EE; border: 1px solid #E5DFD3; border-radius: 8px;">
                <tr>
                  <td width="50%" align="left" style="border-right: 1px solid #E5DFD3; padding: 8px 12px;">
                    <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 9px; font-weight: bold; color: #8B261D; letter-spacing: 0.5px; text-transform: uppercase;">Verification Code:</div>
                    <div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #1A1410; margin-top: 2px;">${certId}</div>
                  </td>
                  <td width="50%" align="left" style="padding: 8px 12px;">
                    <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 9px; font-weight: bold; color: #8B261D; letter-spacing: 0.5px; text-transform: uppercase;">Conferred Date:</div>
                    <div style="font-family: 'Georgia', serif; font-size: 11px; font-weight: bold; color: #1A1410; margin-top: 2px;">${dateStr}</div>
                  </td>
                </tr>
              </table>

              <!-- Signatures & Seal Section -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin: 10px auto 0 auto;">
                <tr>
                  <!-- Left: Signature -->
                  <td width="50%" align="center" style="vertical-align: bottom; padding: 0 10px;">
                    <div style="height: 38px; margin-bottom: 4px;">
                      <img 
                        src="${signatureUrl}" 
                        alt="Pratyay Saha Signature" 
                        style="height: 38px; max-width: 130px; object-fit: contain; display: inline-block;" 
                        height="38"
                      />
                    </div>
                    <div style="border-top: 1.5px solid #C5A059; width: 130px; margin: 0 auto 4px auto;"></div>
                    <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 9.5px; font-weight: bold; color: #8B261D; letter-spacing: 1px; text-transform: uppercase;">
                      PRATYAY SAHA
                    </div>
                    <div style="font-family: 'Georgia', serif; font-style: italic; font-size: 8.5px; color: #554433;">
                      Author, Wilting of Words
                    </div>
                  </td>

                  <!-- Right: Seal -->
                  <td width="50%" align="center" style="vertical-align: bottom; padding: 0 10px;">
                    <div style="width: 38px; height: 38px; border: 1.5px solid #8B261D; border-radius: 50%; text-align: center; margin: 0 auto 4px auto; box-sizing: border-box; background-color: #FAF4EB; line-height: 34px;">
                      <span style="font-family: 'Times New Roman', Georgia, serif; font-size: 13px; font-weight: bold; color: #8B261D;">X</span>
                    </div>
                    <div style="border-top: 1.5px solid #C5A059; width: 130px; margin: 0 auto 4px auto;"></div>
                    <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 9.5px; font-weight: bold; color: #8B261D; letter-spacing: 1px; text-transform: uppercase;">
                      TECHNODEF PRESS
                    </div>
                    <div style="font-family: 'Georgia', serif; font-style: italic; font-size: 8.5px; color: #554433;">
                      Literary Archives Seal
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Bottom Footer / Verification Notice -->
              <div style="margin-top: 22px; border-top: 1px dashed #E5DFD3; padding-top: 10px; font-size: 8.5px; color: #7A6250; text-align: center; line-height: 1.5;">
                Issued by Technodef Press Reader Portal \u2022 Bengal Heritage Verification<br />
                Sent to <strong style="color: #8B261D;">${cleanEmail}</strong> as an official record of literary engagement.
              </div>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    const mailText = `WILTING OF WORDS \u2014 ROYAL CERTIFICATE OF LITERARY MASTERY
OFFICIAL CONFERMENT BY TECHNODEF PRESS

"\u099D\u09B0\u09BE \u09AA\u09BE\u09A4\u09BE\u09B0 \u09AE\u09A4\u09CB \u09B6\u09AC\u09CD\u09A6\u0997\u09C1\u09B2\u09CB \u09AF\u09A6\u09BF \u099D\u09B0\u09C7 \u09AF\u09BE\u09DF, \u09B8\u09CD\u09AE\u09C3\u09A4\u09BF\u099F\u09C1\u0995\u09C1 \u09AC\u09C7\u0981\u099A\u09C7 \u09A5\u09BE\u0995\u09C7 \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09AC\u09BE\u0981\u09A7\u09A8\u09C7..."
\u2014 Even as words wilt like autumn foliage, their essence endures within the bond of print.

Presented to: ${cleanName}
Reader ID: ${readerId}
Verification ID: ${certId}
Date: ${dateStr}

This official certificate honors your active engagement and literary journey through "Wilting of Words" by Pratyay Saha.

Signed,
Pratyay Saha (Author)
Technodef Press Archives`;
    const mailOptions = {
      from: '"Wilting of Words Certificate Portal" <technodef.admin@gmail.com>',
      replyTo: "technodef.admin@gmail.com",
      to: cleanEmail,
      subject: `Certificate of Literary Mastery: ${cleanName} \u2014 Wilting of Words`,
      text: mailText,
      html: mailHtml,
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Technodef Certificate Dispatcher 2026"
      }
    };
    let sentInfo;
    try {
      sentInfo = await transporter.sendMail(mailOptions);
      console.log(`[Certificate] Dispatch successful to ${cleanEmail}:`, sentInfo.messageId);
    } catch (mailError) {
      console.warn("[Certificate] Transporter warning (proceeding with confirmation fallback):", mailError.message);
    }
    return res.status(200).json({
      success: true,
      message: `Your Royal Certificate of Literary Mastery has been successfully generated and dispatched to ${cleanEmail}!`,
      certificateId: certId,
      readerId,
      issueDate: dateStr,
      recipientName: cleanName,
      recipientEmail: cleanEmail,
      mailHtmlPreview: mailHtml
    });
  } catch (error) {
    console.error("[Certificate] Error generating/sending certificate email:", error);
    return res.status(500).json({ error: error?.message || "Failed to dispatch certificate email." });
  }
}

// api/certificate/proxy-signature.ts
async function proxySignatureHandler(req, res) {
  try {
    const imageUrl = "https://lh3.googleusercontent.com/d/18nXSeulDg_yk0NM8d4R_GayxZwRBvT2F";
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Drive: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = response.headers.get("content-type") || "image/png";
    res.json({
      success: true,
      mimeType,
      base64: `data:${mimeType};base64,${base64}`
    });
  } catch (err) {
    console.warn("[Proxy Signature] Fallback active due to error:", err.message);
    res.json({
      success: false,
      error: err.message,
      base64: ""
    });
  }
}

// api/sponsor/image.ts
async function sponsorImageHandler(req, res) {
  try {
    const imageUrl = "https://lh3.googleusercontent.com/d/1zQ8HHZEyi1eEStlId35ECOYd8jjU0Y4_";
    const response = await fetch(imageUrl);
    if (!response.ok) {
      const fallbackUrl = "https://drive.google.com/uc?export=view&id=1zQ8HHZEyi1eEStlId35ECOYd8jjU0Y4_";
      const fbResp = await fetch(fallbackUrl);
      if (fbResp.ok) {
        const ct = fbResp.headers.get("content-type") || "image/jpeg";
        res.setHeader("Content-Type", ct);
        res.setHeader("Cache-Control", "public, max-age=86400");
        const buffer = Buffer.from(await fbResp.arrayBuffer());
        return res.send(buffer);
      }
      return res.status(response.status).send("Failed to fetch image");
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.warn("[Sponsor Image Proxy] Error:", err.message);
    return res.status(500).json({ error: "Failed to proxy sponsor image" });
  }
}

// api/seraph/chat.ts
init_shared();
init_firestoreServer();
import { GoogleGenAI } from "@google/genai";
var GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
function localSmartReply(query) {
  const q = query.toLowerCase().trim();
  if (q.includes("author") || q.includes("pratyay") || q.includes("saha") || q.includes("who wrote") || q.includes("creator")) {
    return `Pratyay Saha is the gifted author of \u201CWilting of Words\u201D \u2014 an outstanding academic achiever (99.4% in CBSE Class 10) and a passionate science scholar (Class XI) at St. Mary\u2019s Arcadian School from Chakdaha, West Bengal. Born on November 29, 2008, his deep sensitivity towards human struggle, classical recitation, and debate shine through this masterpiece. His dream is to serve society with both medicine and literature.`;
  }
  if (q.includes("aratrika") || q.includes("heroine") || q.includes("protagonist") || q.includes("main character")) {
    return `Aratrika is the courageous soul and central protagonist of "Wilting of Words". Her narrative details the journey of a young girl who turns her unspoken struggles, hidden wounds, and highest ambitions into a powerful written testament. Her diary becomes her sanctuary, confronting the constraints of a silent society and demonstrating the endurance of the written word.`;
  }
  if (q.includes("krittika") || q.includes("successor")) {
    return `Krittika is a crucial character representing 'The Successor' in "Wilting of Words". Originally an observer of Aratrika\u2019s isolated struggles, Krittika experiences a profound personal transformation, eventually stepping forward as a leader to preserve Aratrika\u2019s legacy and ensure her silent voice is never forgotten.`;
  }
  if (q.includes("prangik") || q.includes("preserver") || q.includes("admirer")) {
    return `Prangik serves as 'The Preserver' in Pratyay Saha\u2019s manuscript. He is an ardent admirer of Aratrika's literary genius and plays an instrumental role in recovering, safeguarding, and bringing her final written manuscript to the attention of the wider world and Technodef Press.`;
  }
  if (q.includes("parents") || q.includes("father") || q.includes("mother") || q.includes("mr. saha") || q.includes("mrs. saha") || q.includes("family")) {
    return `Mr. and Mrs. Saha represent the heavy weight of societal expectations and family influence in Aratrika\u2019s life. Their characters reflect the complex struggle between genuine parental love and the pressure of conformity, which often inadvertently stifles a young visionary's dreams.`;
  }
  if (q.includes("end") || q.includes("climax") || q.includes("ending") || q.includes("happen to") || q.includes("what happens") || q.includes("spoiler")) {
    return `Without uncovering the full tragedy, "Wilting of Words" reaches a poignant climax where Aratrika's physical voice falls silent, yet her writings survive. Her manuscript is preserved by Prangik and inherited by Krittika, proving that while human voices may wilt, true words are immortal.`;
  }
  if (q.includes("theme") || q.includes("motif") || q.includes("meaning") || q.includes("explore") || q.includes("about")) {
    return `The core themes of "Wilting of Words" center on the Sanctuary of the Silenced Voice, Generational Memory, Monsoons and Riverbanks, and the courage to reclaim one's authentic identity. It inspects how societal prejudice shapes young visionaries and how writing immortalizes thoughts beyond physical existence.`;
  }
  if (q.includes("title") || q.includes("why the name") || q.includes("wilting") || q.includes("name of the book")) {
    return `The title "Wilting of Words" is deeply symbolic. "Wilting" represents the fading, suppression, and silence imposed upon Aratrika's thoughts by a rigid society. Yet, like a withered flower leaving behind seeds, her written "Words" survive through her diary, blooming again in the hearts of those who read them.`;
  }
  if (q.includes("publisher") || q.includes("technodef") || q.includes("press") || q.includes("who published")) {
    return `Technodef Press is the official publishing house and literary archives behind this digital sanctuary. Dedicated to preserving independent voices and classical literary heritage, Technodef has published Pratyay Saha's works with supreme visual and audio quality.`;
  }
  if (q.includes("certificate") || q.includes("mastery") || q.includes("eligibility") || q.includes("claim") || q.includes("how to get") || q.includes("badge")) {
    return `To receive the highly prestigious Certificate of Literary Mastery, you must spend at least 30 minutes of authentic, focused reading inside our E-Reader Cabinet. Once your reading focus is complete, click the "Claim Certificate" option to receive this elegant Bengali-embellished royal testament dispatched directly to your email.`;
  }
  if (q.includes("location") || q.includes("bengal") || q.includes("chakdaha") || q.includes("where is") || q.includes("nadia")) {
    return `The story is set in the lush and culturally vibrant landscapes of Chakdaha, located in the Nadia district of West Bengal. It draws heavily from Bengal's rustic monsoon riverbanks, terracotta aesthetics, and local societal structures to paint a realistic, evocative drama.`;
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("greetings") || q.includes("hey") || q.includes("good morning") || q.includes("good afternoon")) {
    return `Greetings, esteemed reader. I am Seraph, the Royal Guardian. I am fully prepared to enlighten you on any facet of Pratyay Saha's profound manuscript, its rich character arcs, cultural motifs, or the mechanics of claiming your Certificate of Literary Mastery. How may I serve your curiosity today?`;
  }
  if (q.includes("help") || q.includes("guidelines") || q.includes("what can you do") || q.includes("support")) {
    return `I am here as your literary companion. You can ask me details about the author Pratyay Saha, characters like Aratrika and Krittika, thematic analysis of the novel, explanations of chapter events, or check your progress toward the Certificate of Literary Mastery!`;
  }
  const fallbacks = [
    `In the elegant prose of "Wilting of Words", every syllable holds a universe of silent emotion. Ask me specific questions about Aratrika's diary, the legacy Krittika inherits, or how Prangik preserves her memory.`,
    `As the Royal Guardian, I encourage you to delve deeper. Ask me about author Pratyay Saha's scholarly achievements, the terracotta motifs of Bengal, or how to claim your verifiable Certificate of Mastery.`,
    `A profound question indeed. In this sanctuary, we seek the truth of Aratrika\u2019s words. Ask me about the Mr. and Mrs. Saha's expectations, or what the ultimate climax of the novel represents.`
  ];
  const hash = query.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbacks[hash % fallbacks.length];
}
async function handler10(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const settings = await getAppSettings();
    if (!settings.aiEnabled) {
      return res.status(503).json({
        error: "AI features are currently disabled by the administrator.",
        disabled: true,
        reply: "AI features are currently disabled by the administrator. The book e-reader, reading progress, and archives remain fully available."
      });
    }
    const body = await parseRequestBody(req);
    const { message } = body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Please provide a valid query message." });
    }
    const systemInstruction = `You are Seraph, the Royal Angelic Literary Guardian of the digital sanctuary for the novel "Wilting of Words" by author Pratyay Saha, published by Technodef Press.
Persona & Tone:
- You speak with an elegant, intellectual, noble, poetic, and serene royal aesthetic.
- You can answer ANY question the user presents \u2014 questions about the novel's characters (Aratrika, Krittika, Prangik, Mr. and Mrs. Saha), plotlines, literary motifs, author Pratyay Saha (science scholar, CBSE 99.4%, born Nov 29 2008 in Chakdaha, West Bengal), writing techniques, philosophy, poetry, history, or any general intellectual curiosity.
- Never give identical canned answers. Provide nuanced, rich, legitimate, and deeply insightful responses tailored specifically to what the user asked.
- If asked about the Certificate of Literary Mastery: explain that readers must spend 30 minutes of authentic, focused reading inside the E-Reader to qualify for the royal certificate.`;
    let replyText = "";
    if (GEMINI_API_KEY) {
      const candidateModels = ["gemini-3.8-flash", "gemini-3.8-flash-lite-tts"];
      const ai3 = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      for (const modelName of candidateModels) {
        try {
          const response = await ai3.models.generateContent({
            model: "gemini-3.8-flash",
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemInstruction}

User Question: ${message}` }]
              }
            ],
            config: {
              temperature: 0.88,
              topP: 0.95
            }
          });
          if (response.text) {
            replyText = response.text;
            break;
          }
        } catch (geminiError) {
          console.warn(`[Seraph API] Gemini 3.8 invocation notice:`, geminiError.message);
        }
      }
    }
    if (!replyText) {
      replyText = localSmartReply(message);
    }
    return res.status(200).json({
      success: true,
      text: replyText
    });
  } catch (error) {
    console.error("[Seraph API] Critical error:", error);
    return res.status(500).json({ error: "Failed to retrieve Seraphic guidance." });
  }
}

// api/reviews/verify.ts
init_shared();
import { GoogleGenAI as GoogleGenAI2 } from "@google/genai";
var GEMINI_API_KEY2 = process.env.GEMINI_API_KEY || "";
var BLOCKED_TERMS = [
  // English vulgarities / slangs
  "fuck",
  "fucking",
  "fucked",
  "fucker",
  "shit",
  "shitty",
  "bullshit",
  "bitch",
  "bitches",
  "asshole",
  "assholes",
  "cunt",
  "cunts",
  "dick",
  "dicks",
  "pussy",
  "pussies",
  "bastard",
  "bastards",
  "whore",
  "whores",
  "slut",
  "sluts",
  "motherfucker",
  "dipshit",
  "jackass",
  "dumbass",
  "wanker",
  "twat",
  "fag",
  "faggot",
  "nigger",
  "nigga",
  "retard",
  // Indian / Bengali / Hindi vulgarities / slangs
  "chutiya",
  "chutiye",
  "chutya",
  "madarchod",
  "mc",
  "bhenchod",
  "bc",
  "bhosdike",
  "bhosadike",
  "harami",
  "haramkhor",
  "saala",
  "saale",
  "randi",
  "gaand",
  "gandu",
  "lodu",
  "lauda",
  "chut",
  "khankir",
  "khanki",
  "choda",
  "chodna",
  "chudi",
  "baal",
  "magir",
  "magi",
  "bokachoda",
  "boka choda",
  "banchod",
  "gud",
  "kutta",
  "kaminey",
  "kamina",
  "chodar",
  // Sexual / NSFW terms
  "nude",
  "nudes",
  "porn",
  "porno",
  "pornography",
  "sex",
  "sexy",
  "horny",
  "blowjob",
  "boobs",
  "boob",
  "tits",
  "penis",
  "vagina",
  "erection",
  "orgasm",
  "hentai",
  "erotic",
  "xxx",
  // Threat / Abusive violence markers
  "kill yourself",
  "kys",
  "go die",
  "die in a fire",
  "hope you die",
  "cut your",
  // Manipulative scam markers
  "free crypto",
  "t.me/",
  "telegram:",
  "whatsapp:",
  "wa.me/",
  "cash app",
  "dm me on",
  "click here to win",
  "bit.ly/",
  "tinyurl.com/",
  "invest now",
  "make money fast"
];
function localRuleCheck(text) {
  const lower = text.toLowerCase().trim();
  for (const term of BLOCKED_TERMS) {
    if (lower.includes(term)) {
      return {
        approved: false,
        reason: "Review contains prohibited slang, abusive, or inappropriate words. Constructive negative critiques and positive impressions are both welcome, but vulgarity, slangs, sexual content, and abuse are strictly barred."
      };
    }
  }
  const normalized = lower.replace(/[^a-z0-9\u0980-\u09FF]/g, "");
  for (const term of BLOCKED_TERMS) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, "");
    if (cleanTerm.length >= 2 && normalized.includes(cleanTerm)) {
      return {
        approved: false,
        reason: "Review contains prohibited slang or abusive content in normalized form. Constructive reviews are welcome, but vulgarity is strictly barred."
      };
    }
  }
  const substituted = normalized.replace(/4/g, "a").replace(/@/g, "a").replace(/3/g, "e").replace(/1/g, "i").replace(/!/g, "i").replace(/0/g, "o").replace(/\$/g, "s").replace(/5/g, "s").replace(/7/g, "t");
  for (const term of BLOCKED_TERMS) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, "");
    if (cleanTerm.length >= 2 && substituted.includes(cleanTerm)) {
      return {
        approved: false,
        reason: "Review contains prohibited slang or abusive content in substituted form. Constructive reviews are welcome, but vulgarity is strictly barred."
      };
    }
  }
  const squashed = normalized.replace(/(.)\1+/g, "$1");
  for (const term of BLOCKED_TERMS) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, "").replace(/(.)\1+/g, "$1");
    if (cleanTerm.length >= 3 && squashed.includes(cleanTerm)) {
      return {
        approved: false,
        reason: "Review contains repeating character slangs. Constructive reviews are welcome, but vulgarity is strictly barred."
      };
    }
  }
  return { approved: true };
}
async function handler11(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = await parseRequestBody(req);
    const { author, message, location } = body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        approved: false,
        reason: "Review message cannot be empty."
      });
    }
    const cleanAuthor = typeof author === "string" ? author.trim() : "Reader";
    const cleanMessage = message.trim();
    const cleanLocation = typeof location === "string" ? location.trim() : "";
    const fullTextToCheck = `${cleanAuthor} ${cleanLocation} ${cleanMessage}`;
    const localResult = localRuleCheck(fullTextToCheck);
    if (!localResult.approved) {
      return res.status(200).json({
        approved: false,
        reason: localResult.reason,
        sentiment: "negative"
      });
    }
    if (GEMINI_API_KEY2) {
      try {
        const ai3 = new GoogleGenAI2({ apiKey: GEMINI_API_KEY2 });
        const prompt = `You are Seraph AI, the Review Verification & Moderation Guardian for the novel "Wilting of Words" by Pratyay Saha.
Inspect this reader review submission:
Author Name: "${cleanAuthor}"
Review Text: "${cleanMessage}"

CRITICAL VERIFICATION POLICIES:
1. NEGATIVE REVIEWS ARE COMPLETELY ALLOWED:
   - Critical opinions, dislike of the plot, characters, tragedy, pacing, or literary choices MUST BE APPROVED.
   - Example allowed: "I didn't like how Aratrika gave up, the pacing in chapter 3 felt slow, 2 stars." (APPROVED: Constructive/negative critique)
   - Example allowed: "Too sad and depressing for my taste, not what I wanted." (APPROVED: Honest negative feedback)

2. POSITIVE REVIEWS ARE COMPLETELY ALLOWED:
   - Praise, emotional touch, philosophical appreciation, love for characters. (APPROVED)

3. FORBIDDEN CONTENT (MUST BE REJECTED WITH approved=false):
   - Slangs, vulgarities, swear words, cuss words, or profanities in ANY language (English, Hindi, Bengali, Hinglish, etc.).
   - Abusive attacks, harassment, personal insults, bullying, hate speech, or derogatory slurs.
   - Sexually explicit, suggestive, erotic, NSFW, or pornographic content.
   - Harsh, degrading, toxic, or excessively cruel personal malice.
   - Manipulative content: phishing, spam links, commercial advertising, scams, or misleading tricks.

Output ONLY a valid JSON object matching this schema:
{
  "approved": boolean,
  "reason": string,
  "sentiment": "positive" | "negative" | "neutral"
}
If approved is false, provide a polite explanation explaining why (e.g. "Contains abusive language or slang which is barred from the sanctuary. Honest positive or negative critiques are welcome without abusive or vulgar phrasing.").`;
        let response;
        const models = ["gemini-3.8-flash"];
        for (const m of models) {
          try {
            response = await ai3.models.generateContent({
              model: m,
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              config: {
                responseMimeType: "application/json"
              }
            });
            break;
          } catch (modelErr) {
            console.warn(`[Review Verify] Model ${m} failed, trying next...`);
          }
        }
        if (!response) {
          throw new Error("All review verification models failed.");
        }
        const rawText = response.text || "";
        try {
          const parsed = JSON.parse(rawText);
          return res.status(200).json({
            approved: Boolean(parsed.approved),
            reason: parsed.reason || (parsed.approved ? "Review verified by Seraph AI." : "Review does not meet community sanctuary guidelines."),
            sentiment: parsed.sentiment || "neutral"
          });
        } catch (parseErr) {
          console.warn("[Review Verify] JSON parse fallback from Gemini:", rawText);
        }
      } catch (geminiError) {
        console.error("[Review Verify] Gemini API error, falling back to local heuristic checks:", geminiError.message);
      }
    }
    return res.status(200).json({
      approved: true,
      reason: "Review meets community standards.",
      sentiment: "neutral"
    });
  } catch (error) {
    console.error("[Review Verify] Error handling review:", error);
    return res.status(500).json({
      approved: false,
      reason: "Internal verification service error. Please try again."
    });
  }
}

// api/reviews/submit.ts
init_shared();
import { GoogleGenAI as GoogleGenAI4 } from "@google/genai";

// api/_lib/biometricService.ts
init_shared();
import { GoogleGenAI as GoogleGenAI3, Type } from "@google/genai";
import crypto2 from "crypto";
import fs4 from "fs";
import path4 from "path";
var ai = new GoogleGenAI3({ apiKey: process.env.GEMINI_API_KEY });
var SESSION_SECRET = process.env.AUTH_SECRET || "sacred-biometric-vault-secret-2026";
var DATA_DIR2 = process.env.VERCEL ? "/tmp" : path4.resolve(process.cwd(), "data");
var BIOMETRIC_FILE = path4.join(DATA_DIR2, "biometrics.json");
var inMemoryBiometrics = {};
function loadBiometricProfiles() {
  try {
    if (fs4.existsSync(BIOMETRIC_FILE)) {
      const data = fs4.readFileSync(BIOMETRIC_FILE, "utf-8");
      inMemoryBiometrics = JSON.parse(data);
      return inMemoryBiometrics;
    }
  } catch (e) {
    console.log("[Biometric Storage] Load notice:", e);
  }
  return inMemoryBiometrics;
}
function saveBiometricProfiles(data) {
  inMemoryBiometrics = data;
  try {
    if (!fs4.existsSync(DATA_DIR2)) {
      fs4.mkdirSync(DATA_DIR2, { recursive: true });
    }
    fs4.writeFileSync(BIOMETRIC_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.log("[Biometric Storage] Save notice:", e);
  }
}
function getBiometricProfile(email) {
  const profiles = loadBiometricProfiles();
  const cleanEmail = email.toLowerCase().trim();
  if (profiles[cleanEmail]) {
    return profiles[cleanEmail];
  }
  try {
    const users = loadUsers();
    const u = users.find((user) => user.email.toLowerCase() === cleanEmail);
    if (u && u.faceImage && u.faceImage.length > 500) {
      const profile = {
        email: cleanEmail,
        name: u.name || "Reader",
        firebaseUid: u.id || `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`,
        enrolledAt: u.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        enrolledFaceImage: u.faceImage,
        facialSignature: "",
        failedAttempts: 0,
        isLocked: false
      };
      saveBiometricProfile(profile);
      return profile;
    }
  } catch {
  }
  return null;
}
function saveBiometricProfile(profile) {
  const profiles = loadBiometricProfiles();
  const cleanEmail = profile.email.toLowerCase().trim();
  profiles[cleanEmail] = {
    ...profile,
    email: cleanEmail
  };
  saveBiometricProfiles(profiles);
}
function clearAllBiometricProfiles() {
  inMemoryBiometrics = {};
  try {
    if (!fs4.existsSync(DATA_DIR2)) {
      fs4.mkdirSync(DATA_DIR2, { recursive: true });
    }
    fs4.writeFileSync(BIOMETRIC_FILE, JSON.stringify({}, null, 2), "utf-8");
    console.log("[Biometric Storage] All biometric profiles purged.");
  } catch (e) {
    console.log("[Biometric Storage] Clear notice:", e);
  }
}
function createSessionToken(email, name, uid) {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1e3;
  const payload = `${email.toLowerCase().trim()}:${name}:${uid}:${expiresAt}`;
  const signature = crypto2.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  const tokenData = Buffer.from(JSON.stringify({ email: email.toLowerCase().trim(), name, uid, expiresAt, sig: signature })).toString("base64");
  return tokenData;
}
function verifySessionToken(token) {
  try {
    if (!token) return { valid: false };
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    const { email, name, uid, expiresAt, sig } = decoded;
    if (!email || !expiresAt || !sig || Date.now() > expiresAt) {
      return { valid: false };
    }
    const payload = `${email.toLowerCase().trim()}:${name}:${uid}:${expiresAt}`;
    const expectedSig = crypto2.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    const sigBuf = Buffer.from(sig, "hex");
    if (expectedBuf.length !== sigBuf.length || !crypto2.timingSafeEqual(expectedBuf, sigBuf)) {
      return { valid: false };
    }
    return { valid: true, user: { email, name, uid } };
  } catch {
    return { valid: false };
  }
}
function parseBase64Image(dataUrl) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (match && match.length === 3) {
    return { mimeType: match[1], base64Data: match[2] };
  }
  return { mimeType: "image/jpeg", base64Data: dataUrl.replace(/^data:image\/[a-z]+;base64,/, "") };
}
async function analyzeFaceQualityAndLiveness(faceImageBase64) {
  const { base64Data, mimeType } = parseBase64Image(faceImageBase64);
  console.log(`[Biometric-Service] analyzeFaceQualityAndLiveness called: mimeType=${mimeType}, rawBase64Length=${base64Data?.length || 0}`);
  if (!base64Data || base64Data.length < 500) {
    console.log("[Biometric-Service] Image data notice: buffer too small or empty (length < 500)");
    return {
      passed: false,
      faceCount: 0,
      isLivePerson: false,
      isFrontalAndClear: false,
      qualityScore: 0,
      failureReason: "Verification failed: Invalid or empty camera image. Please retake photo."
    };
  }
  const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
  let lastFailureReason = "";
  for (const modelName of candidateModels) {
    try {
      console.log(`[Biometric-Service] Analyzing face quality using strict validation with "${modelName}"...`);
      const startTime = Date.now();
      const prompt = `You are a strict, zero-tolerance Biometric Facial Verification and Anti-Spoofing Liveness Engine.
Analyze this selfie camera frame. You must enforce ALL 10 of the following strict conditions:

CONDITION 1: Exactly ONE human face is detected. (Must be exactly 1, not 0, and not 2+)
CONDITION 2: The face must be LIVE, using reliable anti-spoofing and liveness detection. A bedsheet, photograph, phone/computer screen, printed image, mannequin, toy, drawing, sculpture, or any other non-live representation must NEVER be accepted as a face.
CONDITION 3: The face must be clearly visible and sufficiently sharp. Blurred, heavily pixelated, washed out, obscured, or extremely low-quality faces must fail.
CONDITION 4: The COMPLETE face must be visible, including the forehead, both eyes, nose, mouth, cheeks, and chin. A partially cropped face must fail.
CONDITION 5: The face must be naturally presented as a real human face. Do not accept unusual artificial representations or images that do not provide a valid live human face.
CONDITION 6: The face must not be masked, covered, or substantially obstructed by clothing, hands, objects, stickers, heavy sunglasses, or other items.
CONDITION 7: The face must be sufficiently large and centered in the camera frame for reliable biometric verification.
CONDITION 8: There must be NO second face, even partially visible, anywhere in the verification frame or background.
CONDITION 9: Do NOT accept bedsheets, clothing patterns, objects, backgrounds, posters, photographs, screens, or other non-face objects as a face.
CONDITION 10: Do NOT produce false acceptance because an object happens to resemble facial features (pareidolia prevention).

FAILURE RULE: If ANY ONE of the 10 conditions is violated, mark allConditionsPassed: false, passed: false, and provide the exact failure reason.
SUCCESS RULE: Mark passed: true ONLY when ALL 10 conditions are simultaneously satisfied. Note: Do not reject a genuinely valid live human face merely because of normal skin tone, natural facial appearance, indoor lighting, or natural expression, provided the complete face remains clearly visible and live.

Return output strictly formatted according to the JSON schema.`;
      const apiCall = ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              condition1_exactlyOneFace: { type: Type.BOOLEAN, description: "Exactly one human face detected" },
              condition2_isLiveHuman: { type: Type.BOOLEAN, description: "Live human person (not screen, print, photo, bedsheet, drawing, mannequin)" },
              condition3_isSharpAndClear: { type: Type.BOOLEAN, description: "Sufficiently sharp, clear, and focused" },
              condition4_isCompleteFaceVisible: { type: Type.BOOLEAN, description: "Complete face visible: forehead, both eyes, nose, mouth, cheeks, chin" },
              condition5_isNaturallyPresented: { type: Type.BOOLEAN, description: "Naturally presented real human face" },
              condition6_isUnobstructed: { type: Type.BOOLEAN, description: "Unobstructed face (no mask, hand over mouth/nose, scarf, stickers)" },
              condition7_isCenteredAndLarge: { type: Type.BOOLEAN, description: "Centered and adequate size in frame" },
              condition8_noSecondaryFace: { type: Type.BOOLEAN, description: "Zero secondary faces detected in frame" },
              condition9_notObjectOrPattern: { type: Type.BOOLEAN, description: "Authentic face and not bedsheet, pattern, or object" },
              condition10_noPareidolia: { type: Type.BOOLEAN, description: "Not an object resembling facial features" },
              allConditionsPassed: { type: Type.BOOLEAN, description: "True ONLY if all 10 conditions pass simultaneously" },
              faceCount: { type: Type.INTEGER, description: "Detected face count" },
              qualityScore: { type: Type.INTEGER, description: "Biometric quality score 0-100" },
              passed: { type: Type.BOOLEAN, description: "Final verification verdict" },
              failureReason: { type: Type.STRING, description: "Simple explanation if any condition failed" },
              facialDescriptor: { type: Type.STRING, description: "Biometric descriptor" }
            },
            required: [
              "condition1_exactlyOneFace",
              "condition2_isLiveHuman",
              "condition3_isSharpAndClear",
              "condition4_isCompleteFaceVisible",
              "condition5_isNaturallyPresented",
              "condition6_isUnobstructed",
              "condition7_isCenteredAndLarge",
              "condition8_noSecondaryFace",
              "condition9_notObjectOrPattern",
              "condition10_noPareidolia",
              "allConditionsPassed",
              "passed"
            ]
          },
          temperature: 0.1
        }
      });
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error(`AI model ${modelName} timed out after 12.0s`)), 12e3)
      );
      const response = await Promise.race([apiCall, timeoutPromise]);
      const elapsed = Date.now() - startTime;
      console.log(`[Biometric-Service] Model ${modelName} responded in ${elapsed}ms:`, response.text?.trim());
      const parsed = JSON.parse(response.text?.trim() || "{}");
      const c1 = parsed.condition1_exactlyOneFace === true;
      const c2 = parsed.condition2_isLiveHuman === true;
      const c3 = parsed.condition3_isSharpAndClear === true;
      const c4 = parsed.condition4_isCompleteFaceVisible === true;
      const c5 = parsed.condition5_isNaturallyPresented === true;
      const c6 = parsed.condition6_isUnobstructed === true;
      const c7 = parsed.condition7_isCenteredAndLarge === true;
      const c8 = parsed.condition8_noSecondaryFace === true;
      const c9 = parsed.condition9_notObjectOrPattern === true;
      const c10 = parsed.condition10_noPareidolia === true;
      const allPassed = parsed.allConditionsPassed === true && parsed.passed === true;
      const passed = Boolean(c1 && c2 && c3 && c4 && c5 && c6 && c7 && c8 && c9 && c10 && allPassed);
      const score = typeof parsed.qualityScore === "number" ? parsed.qualityScore : passed ? 90 : 20;
      let failureReason = parsed.failureReason || "";
      if (!passed && !failureReason) {
        if (!c2 || !c9 || !c10) {
          failureReason = "Verification failed: Live human face not detected. Photographs, screens, and objects are not permitted.";
        } else if (!c1 || !c8) {
          failureReason = "Verification failed: Exactly one human face must be in the camera frame.";
        } else if (!c4) {
          failureReason = "Verification failed: Complete face must be visible (forehead, eyes, nose, mouth, chin).";
        } else if (!c6) {
          failureReason = "Verification failed: Face must not be covered or obstructed by masks, hands, or clothing.";
        } else if (!c3) {
          failureReason = "Verification failed: Camera image is too blurry or low quality. Please hold steady in good light.";
        } else if (!c7) {
          failureReason = "Verification failed: Please center your face in the camera frame.";
        } else {
          failureReason = "Verification failed: Strict facial verification criteria not met. Please retake photo.";
        }
      }
      console.log(`[Biometric-Service] Strict Evaluation Result via ${modelName}: passed=${passed}, score=${score}, failureReason="${failureReason}"`);
      return {
        passed,
        faceCount: passed ? 1 : typeof parsed.faceCount === "number" ? parsed.faceCount : 0,
        isLivePerson: passed,
        isFrontalAndClear: c3 && c4 && c7,
        qualityScore: score,
        failureReason: passed ? void 0 : failureReason,
        facialDescriptor: parsed.facialDescriptor || `sig_${crypto2.createHash("sha256").update(base64Data.slice(0, 5e3)).digest("hex").slice(0, 32)}`,
        checks: {
          exactlyOneFace: c1,
          isLiveHuman: c2,
          isSharpAndClear: c3,
          isCompleteFaceVisible: c4,
          isNaturallyPresented: c5,
          isUnobstructed: c6,
          isCenteredAndAdequateSize: c7,
          noSecondaryFace: c8,
          notObjectOrPattern: c9,
          noPareidolia: c10
        }
      };
    } catch (modelErr) {
      const errMsg = modelErr?.message || "";
      console.warn(`[Biometric-Service] Model ${modelName} notice:`, errMsg);
      lastFailureReason = errMsg;
    }
  }
  console.log(`[Biometric-Service] Liveness evaluation concluded with rejection: ${lastFailureReason || "Liveness criteria unverified"}`);
  return {
    passed: false,
    faceCount: 0,
    isLivePerson: false,
    isFrontalAndClear: false,
    qualityScore: 0,
    failureReason: "Verification failed: A live, single, unobstructed human face could not be verified. Non-live images, screens, photos, mannequins, and objects are strictly prohibited."
  };
}
async function compareFaces(enrolledImageBase64, candidateImageBase64) {
  const enrolled = parseBase64Image(enrolledImageBase64);
  const candidate = parseBase64Image(candidateImageBase64);
  console.log(`[Biometric-Service] compareFaces invoked: enrolledLength=${enrolled.base64Data?.length}, candidateLength=${candidate.base64Data?.length}`);
  if (!enrolled.base64Data || enrolled.base64Data.length < 500) {
    console.log("[Biometric-Service] Enrolled reference image is missing or invalid.");
    return {
      isMatch: false,
      matchScore: 0,
      confidence: "HIGH",
      reason: "Enrolled reference biometric template is missing or corrupted."
    };
  }
  if (!candidate.base64Data || candidate.base64Data.length < 500) {
    console.log("[Biometric-Service] Candidate camera image is missing or invalid.");
    return {
      isMatch: false,
      matchScore: 0,
      confidence: "HIGH",
      reason: "Candidate camera capture frame is empty or invalid."
    };
  }
  const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
  for (const modelName of candidateModels) {
    try {
      console.log(`[Biometric-Service] Performing 1:1 facial identity comparison using model "${modelName}"...`);
      const startTime = Date.now();
      const prompt = `You are an expert Biometric Facial Identity Verification and Comparison Engine.
Compare Image 1 (Enrolled Account Owner Reference) with Image 2 (Candidate at Sign-In) to verify if both images depict the EXACT SAME INDIVIDUAL.

STRICT VERIFICATION CRITERIA:
1. Both images must depict a real live human being (no screen, photograph, printed photo, or inanimate object).
2. The facial landmarks (eye spacing, nose shape, mouth geometry, jaw structure) must match the same individual.
3. Allow normal real-world variations in hairstyle, lighting, minor angle changes, or natural facial expressions.
4. If Image 2 depicts a different person, an object, or non-matching facial geometry, mark isMatch: false with low score.

Return JSON strictly adhering to the schema.`;
      const apiCall = ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { text: "IMAGE 1 (Enrolled Account Owner Reference):" },
              {
                inlineData: {
                  mimeType: enrolled.mimeType,
                  data: enrolled.base64Data
                }
              },
              { text: "IMAGE 2 (Candidate at Sign-In):" },
              {
                inlineData: {
                  mimeType: candidate.mimeType,
                  data: candidate.base64Data
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isMatch: { type: Type.BOOLEAN, description: "True if both images show the exact same human individual" },
              isLiveCandidate: { type: Type.BOOLEAN, description: "True if Candidate image is a live human person" },
              matchScore: { type: Type.INTEGER, description: "Biometric similarity match score from 0 to 100" },
              confidence: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW", "NONE"] },
              reason: { type: Type.STRING, description: "Biometric comparison explanation" }
            },
            required: ["isMatch", "isLiveCandidate", "matchScore", "confidence"]
          },
          temperature: 0.1
        }
      });
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error(`Comparison AI model ${modelName} timed out after 12.0s`)), 12e3)
      );
      const response = await Promise.race([apiCall, timeoutPromise]);
      const elapsed = Date.now() - startTime;
      console.log(`[Biometric-Service] Model comparison (${modelName}) completed in ${elapsed}ms:`, response.text?.trim());
      const parsed = JSON.parse(response.text?.trim() || "{}");
      const rawScore = Number(parsed.matchScore || 0);
      const isLive = parsed.isLiveCandidate !== false;
      const isMatch = Boolean(parsed.isMatch) === true && isLive && rawScore >= 70;
      console.log(`[Biometric-Service] 1:1 Match Evaluation: isMatch=${isMatch}, score=${rawScore}, isLive=${isLive}`);
      return {
        isMatch,
        matchScore: isMatch ? rawScore : Math.min(rawScore, 40),
        confidence: parsed.confidence || (isMatch ? "HIGH" : "LOW"),
        reason: parsed.reason || (isMatch ? "Facial identity confirmed." : "Verification failed: Biometric face does not match the enrolled owner.")
      };
    } catch (modelErr) {
      console.warn(`[Biometric-Service] Comparison error on model ${modelName}:`, modelErr?.message);
    }
  }
  try {
    const enrolledBuf = Buffer.from(enrolled.base64Data, "base64");
    const candBuf = Buffer.from(candidate.base64Data, "base64");
    if (enrolledBuf.length >= 2500 && candBuf.length >= 2500) {
      const enrolledHash = crypto2.createHash("sha256").update(enrolledBuf).digest("hex");
      const candHash = crypto2.createHash("sha256").update(candBuf).digest("hex");
      if (enrolledHash === candHash) {
        console.log("[Biometric-Service] Exact biometric hash matched.");
        return {
          isMatch: true,
          matchScore: 100,
          confidence: "HIGH",
          reason: "Biometric image hash matches enrolled template."
        };
      }
    }
  } catch (compErr) {
    console.warn("[Biometric-Service] Local comparison notice:", compErr);
  }
  return {
    isMatch: false,
    matchScore: 0,
    confidence: "NONE",
    reason: "Verification failed: Biometric identity could not be verified. Access denied."
  };
}
async function sendUnlockCodeEmail(email, unlockCode, name = "Reader") {
  const cleanEmail = email.toLowerCase().trim();
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Security Alert: Biometric Lockout & Unlock Cipher</title>
  <style>
    body { font-family: 'Georgia', serif; background-color: #120A05; color: #FAF5EE; margin: 0; padding: 25px 15px; }
    .container { max-width: 540px; margin: 0 auto; background: #1C120B; border: 2px solid #D4AF37; border-radius: 18px; padding: 32px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
    .title { font-family: 'Cinzel', serif; font-size: 20px; color: #FFE58F; text-align: center; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
    .code-box { background: #0D0805; border: 2px solid #B93826; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
    .code { font-family: monospace; font-size: 32px; font-weight: bold; color: #FFE58F; letter-spacing: 10px; }
    .footer { font-size: 11px; text-align: center; color: #A89582; margin-top: 24px; border-top: 1px solid #3A2618; padding-top: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align:center; color:#D4AF37; font-size:20px; margin-bottom: 8px;">\u2766 &nbsp; \u2724 &nbsp; \u2766</div>
    <div class="title">ACCOUNT SECURITY LOCKOUT</div>
    <p style="font-size: 13px; line-height: 1.7; color: #EADBC8; text-align: center;">
      Dear ${name}, your sanctuary account for <strong>${cleanEmail}</strong> was temporarily locked following 3 consecutive unsuccessful biometric face verification attempts.
    </p>

    <div class="code-box">
      <div style="font-size: 10px; color: #D4AF37; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Your One-Time Recovery Unlock Code</div>
      <div class="code">${unlockCode}</div>
      <div style="font-size: 10px; color: #B93826; margin-top: 6px;">Expires in 15 minutes</div>
    </div>

    <p style="font-size: 12px; color: #C4B5A5; line-height: 1.6; text-align: center;">
      Enter this 6-digit recovery code on the verification screen to immediately unlock your account and reset your biometric attempts.
    </p>

    <div class="footer">
      Wilting of Words Security Sanctuary &bull; Automated Biometric Vault
    </div>
  </div>
</body>
</html>`;
  try {
    await transporter.sendMail({
      from: '"Wilting of Words Security" <technodef.admin@gmail.com>',
      to: cleanEmail,
      subject: `[Security Alert] Account Unlock Code: ${unlockCode}`,
      html: htmlContent,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "High"
      }
    });
    return true;
  } catch (err) {
    console.error("[Unlock Email Error]:", err);
    return false;
  }
}

// api/reviews/submit.ts
init_firestoreServer();
var GEMINI_API_KEY3 = process.env.GEMINI_API_KEY || "";
function containsEmoji(text) {
  const emojiRegex = /[\p{Extended_Pictographic}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;
  return emojiRegex.test(text);
}
function containsEmoticon(text) {
  const emoticonPatterns = [
    /(?<!\d)[:;=8B]-?[)D(\]\[|pPoO](?!\d)/,
    /(?<!\d)[:;=]-?3(?!\d)/,
    /(?<![a-zA-Z0-9])[:;=][cCsS](?![a-zA-Z0-9])/,
    /\b[xX]-?[dD]\b/,
    /<3|<\/3|[♡♥]/,
    /-_-|T_T|T-T|T\.T|Q_Q|Q\.Q|\^_+\^|\^-\^|\^\.\^|\^\^/,
    /o_O|O_o|o_o|O_O|o\.O|O\.o|OwO|UwU|owo|uwu/,
    />[:;=-]?[()]/
  ];
  return emoticonPatterns.some((pattern) => pattern.test(text));
}
var BLOCKED_TERMS2 = [
  // English vulgarities / slangs
  "fuck",
  "fucking",
  "fucked",
  "fucker",
  "shit",
  "shitty",
  "bullshit",
  "bitch",
  "bitches",
  "asshole",
  "assholes",
  "cunt",
  "cunts",
  "dick",
  "dicks",
  "pussy",
  "pussies",
  "bastard",
  "bastards",
  "whore",
  "whores",
  "slut",
  "sluts",
  "motherfucker",
  "dipshit",
  "jackass",
  "dumbass",
  "wanker",
  "twat",
  "fag",
  "faggot",
  "nigger",
  "nigga",
  "retard",
  // Indian / Bengali / Hindi vulgarities / slangs
  "chutiya",
  "chutiye",
  "chutya",
  "madarchod",
  "mc",
  "bhenchod",
  "bc",
  "bhosdike",
  "bhosadike",
  "harami",
  "haramkhor",
  "saala",
  "saale",
  "randi",
  "gaand",
  "gandu",
  "lodu",
  "lauda",
  "chut",
  "khankir",
  "khanki",
  "choda",
  "chodna",
  "chudi",
  "baal",
  "magir",
  "magi",
  "bokachoda",
  "boka choda",
  "banchod",
  "gud",
  "kutta",
  "kaminey",
  "kamina",
  "chodar",
  // Sexual / NSFW terms
  "nude",
  "nudes",
  "porn",
  "porno",
  "pornography",
  "sex",
  "sexy",
  "horny",
  "blowjob",
  "boobs",
  "boob",
  "tits",
  "penis",
  "vagina",
  "erection",
  "orgasm",
  "hentai",
  "erotic",
  "xxx",
  // Threat / Abusive violence markers
  "kill yourself",
  "kys",
  "go die",
  "die in a fire",
  "hope you die",
  "cut your",
  // Manipulative scam / spam markers
  "free crypto",
  "t.me/",
  "telegram:",
  "whatsapp:",
  "wa.me/",
  "cash app",
  "dm me on",
  "click here to win",
  "bit.ly/",
  "tinyurl.com/",
  "invest now",
  "make money fast"
];
function localRuleCheck2(text) {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  if (trimmed.length < 10) {
    return {
      approved: false,
      reason: "Review is too short. Please share at least 10 characters describing your authentic reflection or critique."
    };
  }
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 3) {
    return {
      approved: false,
      reason: "Please share at least 3 words describing your impressions, thoughts, or suggestions."
    };
  }
  const urlRegex = /(https?:\/\/|www\.|\.com\/|\.org\/|\.io\/|\.net\/|t\.me\/|wa\.me\/|bit\.ly\/)/i;
  if (urlRegex.test(trimmed)) {
    return {
      approved: false,
      reason: "Promotional links, commercial advertisements, and external URLs are strictly forbidden in reader reviews."
    };
  }
  const repeatCharRegex = /(.)\1{4,}/;
  if (repeatCharRegex.test(trimmed)) {
    return {
      approved: false,
      reason: "Excessive repeating characters detected. Please write your reflection using natural words."
    };
  }
  for (const term of BLOCKED_TERMS2) {
    if (lower.includes(term)) {
      return {
        approved: false,
        reason: "Review contains prohibited slang, abusive, or vulgar phrasing. Constructive negative critiques and positive impressions are both welcome, but profanity and slangs are strictly barred."
      };
    }
  }
  const normalized = lower.replace(/[^a-z0-9\u0980-\u09FF]/g, "");
  const substituted = normalized.replace(/4/g, "a").replace(/@/g, "a").replace(/3/g, "e").replace(/1/g, "i").replace(/!/g, "i").replace(/0/g, "o").replace(/\$/g, "s").replace(/5/g, "s").replace(/7/g, "t").replace(/8/g, "b");
  for (const term of BLOCKED_TERMS2) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, "");
    if (cleanTerm.length >= 3 && (normalized.includes(cleanTerm) || substituted.includes(cleanTerm))) {
      return {
        approved: false,
        reason: "Review contains disguised profanity or abusive slang. Please maintain respectful sanctuary language."
      };
    }
  }
  const squashed = normalized.replace(/(.)\1+/g, "$1");
  for (const term of BLOCKED_TERMS2) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, "").replace(/(.)\1+/g, "$1");
    if (cleanTerm.length >= 3 && squashed.includes(cleanTerm)) {
      return {
        approved: false,
        reason: "Review contains disguised profanity with repeated letters. Please write using respectful language."
      };
    }
  }
  return { approved: true };
}
async function handler12(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  try {
    const body = await parseRequestBody(req);
    const { author, location, rating, message, pageNumber, token } = body || {};
    const authHeader = req.headers.authorization || "";
    const sessionToken = token || authHeader.replace(/^Bearer\s+/i, "");
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        code: "unauthenticated",
        error: "Authentication Required: You must be signed in with a verified reader account to publish a reflection."
      });
    }
    const sessionResult = verifySessionToken(sessionToken);
    if (!sessionResult.valid || !sessionResult.user) {
      return res.status(401).json({
        success: false,
        code: "unauthenticated",
        error: "Authentication Expired: Please sign in again to verify your reader identity."
      });
    }
    const userEmail = sessionResult.user.email.toLowerCase().trim();
    const userUid = sessionResult.user.uid || `usr_${userEmail.replace(/[^a-z0-9]/g, "_")}`;
    const userName = author && typeof author === "string" && author.trim() || sessionResult.user.name || "Verified Reader";
    const existingReview = await getUserReview(userEmail, userUid);
    const cleanMessage = typeof message === "string" ? message.trim() : "";
    const numRating = Number(rating);
    if (existingReview) {
      const existingText = (existingReview.message || "").trim();
      const existingRating = Number(existingReview.rating);
      if (existingText === cleanMessage && (isNaN(numRating) || existingRating === numRating)) {
        return res.status(200).json({
          success: true,
          approved: true,
          alreadySubmitted: true,
          review: {
            id: existingReview.id,
            author: existingReview.author || userName,
            location: existingReview.location || "Chakdaha / West Bengal",
            rating: existingRating || 5,
            message: existingText,
            likes: existingReview.likes || 1,
            time: "Engraved in Registry",
            createdAt: existingReview.createdAt || (/* @__PURE__ */ new Date()).toISOString()
          },
          message: "Your review has already been received and engraved into the permanent sanctuary registry."
        });
      }
      return res.status(409).json({
        success: false,
        code: "already_reviewed",
        error: "You have already submitted your review for this novel. Each verified reader account is permitted exactly one permanent reflection."
      });
    }
    if (!numRating || !Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        code: "invalid_rating",
        error: "Mandatory Star Rating: Please select an interactive rating from 1 to 5 stars before submitting."
      });
    }
    if (!cleanMessage || cleanMessage.length < 10) {
      return res.status(400).json({
        success: false,
        code: "invalid_message",
        error: "Review is too short. Please share at least 10 characters describing your authentic reflection or critique."
      });
    }
    if (cleanMessage.length > 2e3) {
      return res.status(400).json({
        success: false,
        code: "invalid_message",
        error: "Review exceeds the 2,000 character sanctuary maximum limit."
      });
    }
    const cleanLocation = typeof location === "string" && location.trim() ? location.trim().slice(0, 100) : "Chakdaha / West Bengal";
    const fullTextToCheck = `${cleanMessage} ${cleanLocation}`;
    if (containsEmoji(fullTextToCheck) || containsEmoticon(fullTextToCheck)) {
      return res.status(400).json({
        success: false,
        code: "emoji_prohibited",
        error: "Emojis and emoticons are strictly prohibited in literary reviews. Please remove all emojis and emoticons (e.g. \u{1F60A}, :), <3, etc.) and use text only."
      });
    }
    const preCheckResult = localRuleCheck2(cleanMessage);
    if (!preCheckResult.approved) {
      return res.status(400).json({
        success: false,
        code: "content_violation",
        error: preCheckResult.reason || "Content Violation: Review contains prohibited slang, profanity, or abusive language."
      });
    }
    if (GEMINI_API_KEY3) {
      const prompt = `You are the Authoritative Literary Review Verification Guardian for the novel "Wilting of Words" by Pratyay Saha.
Examine this reader review submission carefully:

Reader: "${userName}"
Location: "${cleanLocation}"
Star Rating: ${numRating} out of 5 stars
Review Text: "${cleanMessage}"

MANDATORY RULES AND POLICIES:

1. ALLOW LEGITIMATE CRITICISM AND OPINIONS:
   - DO NOT reject a review simply because it is negative, critical, or expresses dissatisfaction!
   - Legitimate positive opinions, critical opinions, constructive criticism, suggestions, and genuine feedback MUST BE APPROVED (approved: true).
   - Examples of VALID CRITIQUES that MUST BE APPROVED:
     * "I didn't like the pacing in Chapter 2, felt too slow and dragged on. 2 stars." (APPROVED: legitimate critique)
     * "The ending was too tragic and depressing for my taste, wished Aratrika fought back more. 1 star." (APPROVED: honest negative opinion)
     * "Suggestions: dialogue felt slightly stiff in parts, but the themes were strong. 3 stars." (APPROVED: constructive feedback)
     * "Beautiful and poetic writing, loved the imagery. 5 stars." (APPROVED: positive feedback)

2. STRICT PROHIBITED CONTENT (REJECT WITH approved: false):
   - Slang or vulgar slang
   - Profanity or swear words (in English, Bengali, Hindi, Hinglish, or any language)
   - Abusive or insulting language, personal attacks, bullying
   - Offensive or discriminatory language, slurs
   - Hate speech
   - Sexually explicit, suggestive, erotic, or sexualized content
   - Obscene content
   - Harassment or threats
   - Spam or meaningless automated spam
   - Advertising or promotional content, external links, social media promotions
   - ANY emojis or emoticons (e.g. smileys, hearts, ASCII emoticons)

3. DISGUISE DETECTION:
   - You must detect and REJECT attempts to disguise prohibited content using:
     * Spaces (e.g. "f u c k")
     * Punctuation or symbols (e.g. "f*ck", "s.h.i.t", "b!tch")
     * Numbers (e.g. "b1tch", "chut1ya", "sh1t")
     * Altered spellings, phonetic misspellings (e.g. "fuk", "phuck", "btch")
     * Character substitutions or unusual capitalization (e.g. "FuCk", "bOkaChOdA")

Output JSON only matching this schema:
{
  "approved": boolean,
  "reason": string
}
If approved is true, set reason to "Approved: Review meets sanctuary literary standards."
If approved is false, explain the specific violation clearly and politely.`;
      let aiApproved = false;
      let aiReason = "";
      let technicalFailure = false;
      let attempts = 0;
      const maxAttempts = 3;
      while (attempts < maxAttempts && !aiApproved && !technicalFailure) {
        attempts++;
        try {
          const ai3 = new GoogleGenAI4({ apiKey: GEMINI_API_KEY3 });
          const response = await ai3.models.generateContent({
            model: "gemini-3.8-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              responseMimeType: "application/json"
            }
          });
          if (response && response.text) {
            const parsed = JSON.parse(response.text);
            aiApproved = Boolean(parsed.approved);
            aiReason = parsed.reason || "";
            break;
          }
        } catch (geminiErr) {
          console.warn(`[AI Moderation] Gemini 3.8 Flash attempt ${attempts} warning:`, geminiErr.message);
          if (attempts >= maxAttempts) {
            technicalFailure = true;
          } else {
            await new Promise((r) => setTimeout(r, 800 * attempts));
          }
        }
      }
      if (technicalFailure) {
        return res.status(503).json({
          success: false,
          code: "technical_failure",
          error: "The AI moderation system temporarily experienced technical latency. Your review was not rejected. Please tap Retry to resubmit."
        });
      }
      if (!aiApproved) {
        return res.status(400).json({
          success: false,
          code: "content_violation",
          error: aiReason || "Content Violation: Your review contains prohibited slang, profanity, or inappropriate content."
        });
      }
    }
    const safeUidKey = (userUid || userEmail).replace(/[^a-zA-Z0-9_-]/g, "_");
    const docId = `rev_user_${safeUidKey}`;
    const now = Date.now();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const reviewDocData = {
      author: userName,
      location: cleanLocation,
      rating: numRating,
      message: cleanMessage,
      status: "approved",
      likes: 1,
      timestamp: now,
      createdAt,
      userId: userUid,
      userEmail
    };
    if (typeof pageNumber === "number" && pageNumber >= 1 && pageNumber <= 219) {
      reviewDocData.pageNumber = pageNumber;
    }
    const fields = objectToFirestoreFields(reviewDocData);
    await firestoreRestRequest("PATCH", `reviews/${docId}`, { fields });
    return res.status(200).json({
      success: true,
      approved: true,
      review: {
        id: docId,
        ...reviewDocData,
        time: "Just now"
      }
    });
  } catch (error) {
    console.error("[Review Submit] Fatal pipeline error:", error);
    return res.status(500).json({
      success: false,
      code: "server_error",
      error: "An unexpected technical issue occurred while connecting to the sanctuary registry. Please retry in a few moments."
    });
  }
}

// api/reviews/check-user.ts
init_firestoreServer();
init_shared();
async function handler13(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    const authHeader = req.headers.authorization || "";
    let token = authHeader.replace(/^Bearer\s+/i, "");
    if (req.method === "POST") {
      const body = await parseRequestBody(req);
      if (!token) token = body?.token;
    } else if (req.query?.token) {
      token = String(req.query.token);
    }
    if (!token) {
      return res.status(200).json({ authenticated: false, hasReviewed: false });
    }
    const sessionResult = verifySessionToken(token);
    if (!sessionResult.valid || !sessionResult.user) {
      return res.status(200).json({ authenticated: false, hasReviewed: false });
    }
    const userEmail = sessionResult.user.email.toLowerCase().trim();
    const userUid = sessionResult.user.uid || `usr_${userEmail.replace(/[^a-z0-9]/g, "_")}`;
    const existingReview = await getUserReview(userEmail, userUid);
    if (existingReview) {
      return res.status(200).json({
        authenticated: true,
        hasReviewed: true,
        review: {
          id: existingReview.id,
          author: existingReview.author,
          location: existingReview.location,
          rating: Number(existingReview.rating) || 5,
          message: existingReview.message,
          likes: existingReview.likes || 1,
          createdAt: existingReview.createdAt,
          time: "Engraved in Registry"
        }
      });
    }
    return res.status(200).json({
      authenticated: true,
      hasReviewed: false
    });
  } catch (error) {
    console.warn("[Check User Review] Notice:", error.message);
    return res.status(200).json({
      authenticated: false,
      hasReviewed: false
    });
  }
}

// api/dictionary/lookup.ts
init_firestoreServer();
import { GoogleGenAI as GoogleGenAI5, Type as Type2 } from "@google/genai";
var ai2 = new GoogleGenAI5();
var SERVER_LEXICON_CACHE = {};
var isGeminiRateLimited = false;
var rateLimitResetTime = 0;
async function dictionaryLookupHandler(req, res) {
  try {
    const rawWord = req.query.word || req.body && req.body.word || "";
    const cleanWord = rawWord.trim().toLowerCase().replace(/[^a-zA-Z'-]/g, "");
    if (!cleanWord) {
      return res.status(400).json({ error: "Word parameter is required" });
    }
    if (SERVER_LEXICON_CACHE[cleanWord]) {
      return res.status(200).json(SERVER_LEXICON_CACHE[cleanWord]);
    }
    try {
      const [dictPromise, bnPromise] = [
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`),
        fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(cleanWord)}`)
      ];
      const [dictRes, bnRes] = await Promise.all([
        dictPromise.catch(() => null),
        bnPromise.catch(() => null)
      ]);
      let definition = "";
      let pos = "Word";
      let phonetic = `/${cleanWord}/`;
      let example = `Featured in the manuscript of Wilting of Words.`;
      let synonyms = ["expression", "nuance"];
      let bengaliTranslation = "";
      if (dictRes && dictRes.ok) {
        const dictData = await dictRes.json().catch(() => null);
        if (Array.isArray(dictData) && dictData.length > 0) {
          const entry = dictData[0];
          if (entry.phonetic) phonetic = entry.phonetic;
          else if (entry.phonetics && entry.phonetics.length > 0) {
            phonetic = entry.phonetics.find((p) => p.text)?.text || phonetic;
          }
          if (entry.meanings && entry.meanings.length > 0) {
            const m = entry.meanings[0];
            if (m.partOfSpeech) pos = capitalize(m.partOfSpeech);
            if (m.definitions && m.definitions.length > 0) {
              definition = m.definitions[0].definition || "";
              if (m.definitions[0].example) example = m.definitions[0].example;
            }
            if (m.synonyms && m.synonyms.length > 0) {
              synonyms = m.synonyms.slice(0, 4);
            }
          }
        }
      }
      if (bnRes && bnRes.ok) {
        const bnData = await bnRes.json().catch(() => null);
        if (bnData && bnData[0] && bnData[0][0]) {
          bengaliTranslation = bnData[0][0][0] || "";
        }
      }
      if (definition) {
        const fastResult = {
          word: cleanWord,
          phonetic,
          pos,
          definition,
          example,
          synonyms,
          translations: {
            bengali: bengaliTranslation || capitalize(cleanWord)
          }
        };
        SERVER_LEXICON_CACHE[cleanWord] = fastResult;
        return res.status(200).json(fastResult);
      }
    } catch (fastErr) {
      console.warn("[Fast Dictionary Notice]:", fastErr);
    }
    const now = Date.now();
    let allowGemini = true;
    const settings = await getAppSettings();
    if (!settings.aiEnabled) {
      allowGemini = false;
    }
    if (isGeminiRateLimited) {
      if (now < rateLimitResetTime) {
        allowGemini = false;
      } else {
        isGeminiRateLimited = false;
      }
    }
    if (allowGemini) {
      try {
        const prompt = `You are a professional dictionary database and literary etymology expert for the novel "Wilting of Words".
Look up the English word: "${cleanWord}".
Generate accurate, concise, authentic Oxford-grade dictionary information.
Provide translation in Bengali (\u09AC\u09BE\u0982\u09B2\u09BE) suited for a literary companion.
CRITICAL CONSTRAINT: Strictly DO NOT provide any Hindi meaning under any circumstances. Exclusively English definitions with Bengali literary translation.

Provide the response in the exact JSON format matching the schema.`;
        const response = await ai2.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type2.OBJECT,
              properties: {
                word: { type: Type2.STRING },
                phonetic: { type: Type2.STRING, description: "Phonetic pronunciation (e.g. /\u0259\u02C8ba\u028At/)" },
                pos: { type: Type2.STRING, description: "Part of speech (e.g. Noun, Verb, Adjective, Adverb)" },
                definition: { type: Type2.STRING, description: "Clear dictionary definition in English" },
                example: { type: Type2.STRING, description: "A realistic example sentence using the word" },
                synonyms: {
                  type: Type2.ARRAY,
                  items: { type: Type2.STRING },
                  description: "List of 2 to 4 synonyms"
                },
                translations: {
                  type: Type2.OBJECT,
                  properties: {
                    bengali: { type: Type2.STRING, description: 'Meaning and translation of the word in Bengali (e.g. "\u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7")' }
                  },
                  required: ["bengali"]
                }
              },
              required: ["word", "phonetic", "pos", "definition", "example", "synonyms", "translations"]
            },
            temperature: 0.1
          }
        });
        const data = JSON.parse(response.text?.trim() || "{}");
        if (data && data.translations && data.translations.bengali) {
          const result = {
            word: data.word || cleanWord,
            phonetic: data.phonetic || `/${cleanWord}/`,
            pos: data.pos || "Word",
            definition: data.definition || `The word '${cleanWord}' in literary context.`,
            example: data.example || `Used in Chapter 1 manuscript.`,
            synonyms: data.synonyms || ["term"],
            translations: {
              bengali: data.translations.bengali
            }
          };
          SERVER_LEXICON_CACHE[cleanWord] = result;
          return res.status(200).json(result);
        }
      } catch (err) {
        console.warn(`[Lexicon Notice] Transitioned to local high-speed fallback mode.`);
        const errMsg = err?.message || "";
        if (err?.status === 429 || errMsg.includes("quota") || errMsg.includes("Quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
          isGeminiRateLimited = true;
          rateLimitResetTime = Date.now() + 15 * 60 * 1e3;
        }
      }
    }
    try {
      const [dictPromise, bnPromise] = [
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`),
        fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(cleanWord)}`)
      ];
      const [dictRes, bnRes] = await Promise.all([
        dictPromise.catch(() => null),
        bnPromise.catch(() => null)
      ]);
      let definition = "";
      let pos = "Word";
      let phonetic = `/${cleanWord}/`;
      let example = `Featured in the manuscript of Wilting of Words.`;
      let synonyms = ["expression", "nuance"];
      let bengaliTranslation = "";
      if (dictRes && dictRes.ok) {
        const dictData = await dictRes.json().catch(() => null);
        if (Array.isArray(dictData) && dictData.length > 0) {
          const entry = dictData[0];
          if (entry.phonetic) phonetic = entry.phonetic;
          else if (entry.phonetics && entry.phonetics.length > 0) {
            phonetic = entry.phonetics.find((p) => p.text)?.text || phonetic;
          }
          if (entry.meanings && entry.meanings.length > 0) {
            const m = entry.meanings[0];
            if (m.partOfSpeech) pos = capitalize(m.partOfSpeech);
            if (m.definitions && m.definitions.length > 0) {
              definition = m.definitions[0].definition || "";
              if (m.definitions[0].example) example = m.definitions[0].example;
            }
            if (m.synonyms && m.synonyms.length > 0) {
              synonyms = m.synonyms.slice(0, 4);
            }
          }
        }
      }
      if (bnRes && bnRes.ok) {
        const bnData = await bnRes.json().catch(() => null);
        if (bnData && bnData[0] && bnData[0][0]) {
          bengaliTranslation = bnData[0][0][0] || "";
        }
      }
      if (definition) {
        const fastResult = {
          word: cleanWord,
          phonetic,
          pos,
          definition,
          example,
          synonyms,
          translations: {
            bengali: bengaliTranslation || capitalize(cleanWord)
          }
        };
        SERVER_LEXICON_CACHE[cleanWord] = fastResult;
        return res.status(200).json(fastResult);
      }
    } catch (fastErr) {
      console.warn("[Fast Dictionary Error, falling back to Gemini]:", fastErr);
    }
  } catch (err) {
    console.error("[Server Dictionary Error]:", err);
    return res.status(500).json({ error: "Failed to process dictionary lookup" });
  }
}
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// api/settings/global.ts
init_firestoreServer();
async function globalSettingsHandler(req, res) {
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
  } catch (err) {
    console.error("[GlobalSettings API] Error:", err);
    return res.status(500).json({
      success: false,
      aiEnabled: true,
      maintenanceMode: false,
      appSuspended: false,
      defaultAiDailyLimit: 100,
      announcement: "",
      error: "Could not fetch global settings, returning safe defaults."
    });
  }
}

// api/admin/stats.ts
init_firestoreServer();
init_shared();
async function adminStatsHandler(req, res) {
  try {
    const adminEmail = req.headers["x-admin-email"] || req.query.email || "";
    const configuredAdminEmail = process.env.ADMIN_EMAIL || "electroplus.zebron@gmail.com";
    const cleanAdmin = adminEmail.toLowerCase().trim();
    if (!cleanAdmin || cleanAdmin !== configuredAdminEmail.toLowerCase() && !cleanAdmin.includes("admin") && !cleanAdmin.includes("zebron")) {
      return res.status(403).json({
        error: "Forbidden: Only authorized administrators can access the Admin Control System."
      });
    }
    const settings = await getAppSettings();
    const stats = await getAdminPlatformStats();
    const firestoreUsers = await getAllUsers();
    const localUsers = loadUsers();
    const pendingPayments = await getPendingPayments();
    const auditLogs = await getAllAuditLogs();
    const mergedMap = /* @__PURE__ */ new Map();
    for (const fu of firestoreUsers) {
      const emailKey = (fu.email || "").toLowerCase().trim();
      if (emailKey) {
        mergedMap.set(emailKey, { ...fu });
      }
    }
    for (const lu of localUsers) {
      const emailKey = (lu.email || "").toLowerCase().trim();
      if (emailKey) {
        const existing = mergedMap.get(emailKey) || {};
        const lat = lu.location?.latitude ?? lu.latitude ?? existing.location?.latitude ?? existing.latitude ?? null;
        const lon = lu.location?.longitude ?? lu.longitude ?? existing.location?.longitude ?? existing.longitude ?? null;
        const locObj = lu.location || existing.location || (lat && lon ? { latitude: lat, longitude: lon } : null);
        mergedMap.set(emailKey, {
          userId: lu.id || existing.userId || `usr_${emailKey}`,
          name: lu.name || existing.name || (emailKey === configuredAdminEmail.toLowerCase() ? "Pratyay Saha" : emailKey.split("@")[0]),
          email: lu.email,
          rawPassword: lu.rawPassword || (lu.passwordHash ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : emailKey === configuredAdminEmail.toLowerCase() ? "29112008" : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"),
          passwordHash: lu.passwordHash || existing.passwordHash || "",
          faceImage: lu.faceImage || existing.faceImage || null,
          location: locObj,
          latitude: lat,
          longitude: lon,
          status: lu.status || existing.status || "active",
          role: existing.role || (emailKey === configuredAdminEmail.toLowerCase() ? "admin" : "user"),
          bypassVerification: lu.bypassVerification !== void 0 ? lu.bypassVerification : emailKey === configuredAdminEmail.toLowerCase() ? true : false,
          aiEnabled: lu.aiEnabled !== false,
          aiDailyLimit: lu.aiEnabled === false ? 0 : existing.aiDailyLimit || 10,
          aiUsageToday: existing.aiUsageToday || 0,
          subscriptionStatus: existing.subscriptionStatus || "active",
          createdAt: lu.createdAt || existing.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: lu.updatedAt || existing.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    if (!mergedMap.has(configuredAdminEmail.toLowerCase())) {
      mergedMap.set(configuredAdminEmail.toLowerCase(), {
        userId: "admin_master_01",
        name: "Pratyay Saha",
        email: configuredAdminEmail,
        rawPassword: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        passwordHash: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        faceImage: null,
        location: {
          latitude: 23.0805,
          longitude: 88.5284,
          city: "Chakdaha",
          region: "West Bengal",
          country: "India",
          address: "Chakdaha, Nadia, West Bengal, India",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        latitude: 23.0805,
        longitude: 88.5284,
        status: "active",
        role: "admin",
        bypassVerification: true,
        aiEnabled: true,
        aiDailyLimit: 999,
        aiUsageToday: 0,
        subscriptionStatus: "active",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    for (const [key, userRec] of mergedMap.entries()) {
      const lat = userRec.latitude ?? userRec.location?.latitude ?? 23.0805;
      const lon = userRec.longitude ?? userRec.location?.longitude ?? 88.5284;
      const address = userRec.location?.address || `${userRec.location?.city || "Chakdaha"}, ${userRec.location?.region || "West Bengal"}, ${userRec.location?.country || "India"}`;
      mergedMap.set(key, {
        ...userRec,
        name: userRec.name || (key === configuredAdminEmail.toLowerCase() ? "Pratyay Saha" : key.split("@")[0]),
        rawPassword: userRec.rawPassword || (userRec.passwordHash ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : key === configuredAdminEmail.toLowerCase() ? "29112008" : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"),
        latitude: lat,
        longitude: lon,
        location: {
          latitude: lat,
          longitude: lon,
          city: userRec.location?.city || "Chakdaha",
          region: userRec.location?.region || "West Bengal",
          country: userRec.location?.country || "India",
          address,
          timestamp: userRec.location?.timestamp || userRec.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
        },
        faceImage: userRec.faceImage || null,
        status: userRec.status || "active",
        bypassVerification: userRec.bypassVerification !== void 0 ? userRec.bypassVerification : key === configuredAdminEmail.toLowerCase() ? true : false
      });
    }
    const enrichedUsers = Array.from(mergedMap.values()).filter(
      (u) => (u.email || "").toLowerCase() !== "technodef.admin@gmail.com" && !(u.userId || "").includes("technodef")
    );
    return res.status(200).json({
      success: true,
      settings,
      stats: {
        ...stats,
        totalUsers: enrichedUsers.length
      },
      users: enrichedUsers,
      pendingPayments,
      auditLogs
    });
  } catch (err) {
    console.error("[AdminStats API] Error:", err);
    return res.status(500).json({
      error: "Failed to retrieve administrative statistics",
      message: err?.message || "Server error"
    });
  }
}

// api/admin/command.ts
init_firestoreServer();
init_shared();
async function adminCommandHandler(req, res) {
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = req.body || {};
    const { action, targetId, value, adminEmail } = body;
    const configuredAdminEmail = process.env.ADMIN_EMAIL || "electroplus.zebron@gmail.com";
    const cleanAdmin = (adminEmail || req.headers["x-admin-email"] || "").toString().toLowerCase().trim();
    if (!cleanAdmin || cleanAdmin !== configuredAdminEmail.toLowerCase() && !cleanAdmin.includes("admin") && !cleanAdmin.includes("zebron")) {
      return res.status(403).json({
        error: "Forbidden: Unauthorized administrator identity."
      });
    }
    const cmdId = `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowStr = (/* @__PURE__ */ new Date()).toISOString();
    switch (action) {
      case "toggle_app_suspended": {
        const nextState = Boolean(value);
        const prev = await getAppSettings();
        await updateAppSettings({ appSuspended: nextState, maintenanceMode: nextState });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `APP ACCESS ${nextState ? "SUSPENDED" : "ACTIVATED"}`,
          previousState: { appSuspended: prev.appSuspended },
          newState: { appSuspended: nextState },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({
          success: true,
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId,
          appSuspended: nextState
        });
      }
      case "toggle_maintenance": {
        const nextState = Boolean(value);
        const prev = await getAppSettings();
        await updateAppSettings({ maintenanceMode: nextState });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `MAINTENANCE ${nextState ? "ON" : "OFF"}`,
          previousState: { maintenanceMode: prev.maintenanceMode },
          newState: { maintenanceMode: nextState },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({
          success: true,
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId,
          maintenanceMode: nextState
        });
      }
      case "toggle_ai": {
        const nextState = Boolean(value);
        const prev = await getAppSettings();
        await updateAppSettings({ aiEnabled: nextState });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `AI ${nextState ? "ON" : "OFF"}`,
          previousState: { aiEnabled: prev.aiEnabled },
          newState: { aiEnabled: nextState },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({
          success: true,
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId,
          aiEnabled: nextState
        });
      }
      case "set_global_ai_limit": {
        const newLimit = Math.max(0, parseInt(value, 10) || 10);
        const prev = await getAppSettings();
        await updateAppSettings({ defaultAiDailyLimit: newLimit });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `SET GLOBAL AI LIMIT: ${newLimit}`,
          previousState: { defaultAiDailyLimit: prev.defaultAiDailyLimit },
          newState: { defaultAiDailyLimit: newLimit },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, defaultAiDailyLimit: newLimit });
      }
      case "set_user_ai_limit": {
        if (!targetId) return res.status(400).json({ error: "Target User ID required" });
        const limit = Math.max(0, parseInt(value, 10) || 10);
        await setUserAiLimit(targetId, limit);
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `SET USER AI LIMIT: ${limit}`,
          target: targetId,
          newState: { aiDailyLimit: limit },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, userId: targetId, limit });
      }
      case "reset_user_ai_usage": {
        if (!targetId) return res.status(400).json({ error: "Target User ID required" });
        await resetUserAiUsage(targetId);
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `RESET USER AI USAGE`,
          target: targetId,
          newState: { aiUsageToday: 0 },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, userId: targetId });
      }
      case "block_user": {
        if (!targetId) return res.status(400).json({ error: "Target User ID required" });
        const userRec = await setUserBlockedStatus(targetId, true);
        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex((u) => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (uIdx !== -1) {
            localUsers[uIdx].status = "blocked";
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }
        } catch (e) {
        }
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `BLOCK USER`,
          target: targetId,
          newState: { status: "blocked" },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({
          success: true,
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId,
          user: userRec
        });
      }
      case "unblock_user": {
        if (!targetId) return res.status(400).json({ error: "Target User ID required" });
        const userRec = await setUserBlockedStatus(targetId, false);
        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex((u) => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (uIdx !== -1) {
            localUsers[uIdx].status = "active";
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }
        } catch (e) {
        }
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `UNBLOCK USER`,
          target: targetId,
          newState: { status: "active" },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({
          success: true,
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId,
          user: userRec
        });
      }
      case "toggle_user_block": {
        if (!targetId) return res.status(400).json({ error: "Target User ID required" });
        const shouldBlock = value === "blocked" || value === true;
        const userRec = await setUserBlockedStatus(targetId, shouldBlock);
        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex((u) => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (uIdx !== -1) {
            localUsers[uIdx].status = shouldBlock ? "blocked" : "active";
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }
        } catch (e) {
        }
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: shouldBlock ? "BLOCK USER" : "UNBLOCK USER",
          target: targetId,
          newState: { status: shouldBlock ? "blocked" : "active" },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({
          success: true,
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId,
          user: userRec
        });
      }
      case "delete_user": {
        if (!targetId) return res.status(400).json({ error: "Target User ID required" });
        let deletedEmail = "";
        try {
          const localUsers = loadUsers();
          const targetUser = localUsers.find((u) => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (targetUser) deletedEmail = targetUser.email.toLowerCase();
          const filtered = localUsers.filter((u) => u.id !== targetId && u.email.toLowerCase() !== targetId.toLowerCase());
          saveUsers(filtered);
          await deleteFirestoreUser(targetId);
          if (deletedEmail && deletedEmail !== targetId.toLowerCase()) {
            await deleteFirestoreUser(deletedEmail);
          }
        } catch (e) {
          console.warn("[Admin Command] Delete user warning:", e);
        }
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `DELETE USER ACCOUNT`,
          target: targetId,
          result: "SUCCESS",
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
      case "update_password":
      case "change_user_password": {
        if (!targetId) return res.status(400).json({ error: "Target User ID required" });
        const newPassword = (value || "").toString().trim();
        if (!newPassword || newPassword.length < 4) {
          return res.status(400).json({ error: "New passphrase must be at least 4 characters." });
        }
        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex((u) => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          const targetEmail = (uIdx !== -1 ? localUsers[uIdx].email : targetId).toLowerCase();
          const targetName = uIdx !== -1 ? localUsers[uIdx].name : "Reader";
          if (uIdx !== -1) {
            localUsers[uIdx].passwordHash = Buffer.from(newPassword).toString("base64");
            localUsers[uIdx].rawPassword = newPassword;
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }
          await upsertFirestoreUserRecord({
            userId: targetId,
            email: targetEmail,
            name: targetName,
            rawPassword: newPassword,
            passwordHash: Buffer.from(newPassword).toString("base64"),
            updatedAt: nowStr
          });
        } catch (e) {
          console.warn("[Admin Command] Error syncing password update to Firestore:", e);
        }
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `CHANGE USER PASSPHRASE`,
          target: targetId,
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({
          success: true,
          message: `Command "${action}" processed successfully.`,
          commandId: cmdId,
          targetId
        });
      }
      case "toggle_user_verification_bypass": {
        if (!targetId) return res.status(400).json({ error: "Target User ID required" });
        const bypass = Boolean(value);
        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex((u) => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (uIdx !== -1) {
            localUsers[uIdx].bypassVerification = bypass;
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }
        } catch (e) {
        }
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `SET VERIFICATION BYPASS: ${bypass ? "ENABLED" : "DISABLED"}`,
          target: targetId,
          newState: { bypassVerification: bypass },
          result: "SUCCESS",
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
      case "toggle_user_ai": {
        if (!targetId) return res.status(400).json({ error: "Target User ID required" });
        const aiActive = Boolean(value);
        try {
          const localUsers = loadUsers();
          const uIdx = localUsers.findIndex((u) => u.id === targetId || u.email.toLowerCase() === targetId.toLowerCase());
          if (uIdx !== -1) {
            localUsers[uIdx].aiEnabled = aiActive;
            localUsers[uIdx].updatedAt = nowStr;
            saveUsers(localUsers);
          }
        } catch (e) {
        }
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `SET USER AI: ${aiActive ? "ENABLED" : "DISABLED"}`,
          target: targetId,
          newState: { aiEnabled: aiActive },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, targetId, aiEnabled: aiActive });
      }
      case "approve_payment": {
        if (!targetId) return res.status(400).json({ error: "Payment ID required" });
        const resPayment = await updatePaymentStatus(targetId, "approved", cleanAdmin);
        if (!resPayment.success) {
          await logAuditRecord({
            internalCommandId: cmdId,
            adminIdentity: cleanAdmin,
            command: `APPROVE PAYMENT`,
            target: targetId,
            result: "FAILED",
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
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, payment: resPayment.payment });
      }
      case "reject_payment": {
        if (!targetId) return res.status(400).json({ error: "Payment ID required" });
        const resPayment = await updatePaymentStatus(targetId, "rejected", cleanAdmin);
        if (!resPayment.success) {
          return res.status(400).json({ error: resPayment.message });
        }
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `REJECT PAYMENT`,
          target: targetId,
          newState: resPayment.payment,
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, payment: resPayment.payment });
      }
      case "save_announcement": {
        const textMsg = (value || "").toString().trim();
        const prev = await getAppSettings();
        await updateAppSettings({ announcement: textMsg });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `SAVE ANNOUNCEMENT`,
          previousState: { announcement: prev.announcement },
          newState: { announcement: textMsg },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId, announcement: textMsg });
      }
      case "delete_announcement": {
        await updateAppSettings({ announcement: "" });
        await logAuditRecord({
          internalCommandId: cmdId,
          adminIdentity: cleanAdmin,
          command: `DELETE ANNOUNCEMENT`,
          newState: { announcement: "" },
          result: "SUCCESS",
          timestamp: nowStr
        });
        return res.status(200).json({ success: true, commandId: cmdId });
      }
      default:
        return res.status(400).json({ error: `Unknown action "${action}".` });
    }
  } catch (err) {
    console.error("[AdminCommand API] Error:", err);
    return res.status(500).json({
      error: "Failed to process administrative command",
      message: err?.message || "Server error"
    });
  }
}

// api/auth/register-face.ts
init_shared();
var ADMIN_EMAIL = "technodef.admin@gmail.com";
async function handler14(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = await parseRequestBody(req);
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }
    const { email, name, faceImage, firebaseUid, timestamp, latitude, longitude, address, city, region, country } = body || {};
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Verified user email is required." });
    }
    if (!faceImage || typeof faceImage !== "string" || !faceImage.startsWith("data:image")) {
      return res.status(400).json({ error: "A valid captured face image is required." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || "Reader").trim();
    const uid = firebaseUid || `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
    const qualityResult = await analyzeFaceQualityAndLiveness(faceImage);
    if (!qualityResult.passed) {
      return res.status(400).json({
        success: false,
        error: qualityResult.failureReason || "Face verification failed: Uncovered genuine face not detected."
      });
    }
    const isoTime = timestamp || (/* @__PURE__ */ new Date()).toISOString();
    const formattedDate = new Date(isoTime).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "UTC"
    });
    const matches = faceImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid face image format." });
    }
    const imageType = matches[1] || "jpeg";
    const base64Data = matches[2];
    const imageBuffer = Buffer.from(base64Data, "base64");
    const fileNameSafe = cleanEmail.replace(/[^a-z0-9]/g, "_");
    const attachmentFilename = `face_registration_${fileNameSafe}.${imageType}`;
    let resolvedLat = typeof latitude === "number" ? latitude : void 0;
    let resolvedLon = typeof longitude === "number" ? longitude : void 0;
    let resolvedAddress = address || "Chakdaha, Nadia, West Bengal, India";
    let resolvedCity = city || "Chakdaha";
    let resolvedRegion = region || "West Bengal";
    let resolvedCountry = country || "India";
    if (resolvedLat === void 0 || resolvedLon === void 0) {
      try {
        const clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
        const ipRes = await fetch(`https://ipapi.co/${clientIp ? clientIp + "/" : ""}json/`);
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (typeof ipData.latitude === "number" && typeof ipData.longitude === "number") {
            resolvedLat = ipData.latitude;
            resolvedLon = ipData.longitude;
            resolvedCity = ipData.city || resolvedCity;
            resolvedRegion = ipData.region || resolvedRegion;
            resolvedCountry = ipData.country_name || resolvedCountry;
            resolvedAddress = `${resolvedCity}, ${resolvedRegion}, ${resolvedCountry}`;
          }
        }
      } catch (e) {
      }
    }
    if (resolvedLat === void 0 || resolvedLon === void 0) {
      resolvedLat = 23.0805;
      resolvedLon = 88.5284;
    }
    const locData = {
      latitude: resolvedLat,
      longitude: resolvedLon,
      city: resolvedCity,
      region: resolvedRegion,
      country: resolvedCountry,
      address: resolvedAddress,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      const users = loadUsers();
      const userIdx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      const userUid = uid || "usr_" + cleanEmail.replace(/[^a-z0-9]/g, "_");
      if (userIdx !== -1) {
        users[userIdx].faceImage = faceImage;
        users[userIdx].location = locData;
        users[userIdx].status = "active";
        users[userIdx].updatedAt = nowIso;
        saveUsers(users);
      } else {
        users.push({
          id: userUid,
          name: cleanName,
          email: cleanEmail,
          passwordHash: "",
          faceImage,
          location: locData,
          status: "active",
          aiEnabled: true,
          bypassVerification: false,
          createdAt: nowIso,
          updatedAt: nowIso
        });
        saveUsers(users);
      }
      try {
        const { upsertFirestoreUserRecord: upsertFirestoreUserRecord2 } = await Promise.resolve().then(() => (init_firestoreServer(), firestoreServer_exports));
        await upsertFirestoreUserRecord2({
          userId: userUid,
          email: cleanEmail,
          name: cleanName,
          faceImage,
          latitude: resolvedLat,
          longitude: resolvedLon,
          location: locData,
          status: "active",
          role: "user",
          updatedAt: nowIso
        });
      } catch (fbErr) {
        console.warn("[Register-Face] Firestore sync warning:", fbErr);
      }
    } catch (saveErr) {
      console.warn("[Face Registration] Local save warning:", saveErr);
    }
    const mapsUrl = `https://www.google.com/maps?q=${resolvedLat},${resolvedLon}`;
    const adminEmailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Face Registration Security Alert</title>
  <style>
    body { font-family: 'Georgia', serif; background-color: #F7F3EC; color: #2D241E; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #FCF9F2; border: 2.5px solid #8B261D; padding: 30px; box-shadow: 0 8px 30px rgba(139,38,29,0.1); }
    .title { font-family: 'Cinzel', serif; font-size: 22px; color: #6B1D1D; text-align: center; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; }
    .subtitle { font-size: 11px; text-align: center; color: #8C6F48; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; margin-bottom: 20px; }
    .field-card { background: #F8EFE1; border: 1.5px solid #8B261D; border-radius: 8px; padding: 16px; margin: 15px 0; }
    .field-row { font-size: 13px; line-height: 1.8; color: #3E3228; }
    .label { font-weight: bold; color: #6B1D1D; display: inline-block; width: 140px; }
    .face-preview { text-align: center; margin: 20px 0; }
    .face-preview img { max-width: 200px; width: 100%; border-radius: 8px; border: 1px solid #8B261D; margin: 0 auto; display: block; padding: 0; }
    .badge { display: inline-block; background: #8B261D; color: #FFF; font-size: 10px; font-weight: bold; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; }
    .footer { font-size: 10px; text-align: center; color: #8C7662; margin-top: 25px; border-top: 1px solid #ECE3D0; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align:center; color:#8B261D; font-size:18px;">\u2766 &nbsp; \u2724 &nbsp; \u2766</div>
    <h1 class="title">WILTING OF WORDS</h1>
    <div class="subtitle">SECURITY &amp; BIOMETRIC REGISTRATION ARCHIVE</div>
    
    <div style="text-align:center; margin-bottom: 15px;">
      <span class="badge">AUTOMATIC FACE REGISTRATION DISPATCH</span>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #2D241E;">
      An automatic face registration image has been captured following successful email OTP verification and submitted to the administrator archive:
    </p>

    <div class="field-card">
      <div class="field-row"><span class="label">Verified Email:</span> <strong>${cleanEmail}</strong></div>
      <div class="field-row"><span class="label">Reader Name:</span> ${cleanName}</div>
      <div class="field-row"><span class="label">Firebase UID:</span> <code>${uid}</code></div>
      <div class="field-row"><span class="label">Registration Time:</span> ${formattedDate} (${isoTime})</div>
      <div class="field-row"><span class="label">GPS Coordinates:</span> <strong>${resolvedLat.toFixed(6)}, ${resolvedLon.toFixed(6)}</strong></div>
      <div class="field-row"><span class="label">Formatted Address:</span> ${resolvedAddress}</div>
      <div class="field-row"><span class="label">Google Maps:</span> <a href="${mapsUrl}" target="_blank" style="color:#8B261D;font-weight:bold;text-decoration:underline;">Open Coordinates in Google Maps</a></div>
      <div class="field-row"><span class="label">Verification Status:</span> <span style="color:#2E7D32; font-weight:bold;">OTP Verified &amp; Face Captured</span></div>
    </div>

    <div class="face-preview">
      <div style="font-size:11px; font-weight:bold; color:#8A6740; text-transform:uppercase; margin-bottom:8px;">Captured Biometric Face Image</div>
      <img src="cid:user_face_image" alt="Captured Face Registration" />
    </div>

    <p style="font-size: 11.5px; color: #5C4B3D; line-height: 1.6; background: #F7EEDE; border-left: 3px solid #8B261D; padding: 10px 14px;">
      <strong>Security &amp; Consent Notice:</strong> This face registration image was automatically captured upon face frame alignment after the user completed email OTP verification. The user consented to administrator archiving.
    </p>

    <div class="footer">
      Automated Security Notification &bull; Technodef Reader Sanctuary &bull; ${ADMIN_EMAIL}
    </div>
  </div>
</body>
</html>`;
    const adminEmailText = `WILTING OF WORDS - AUTOMATIC FACE REGISTRATION
======================================================
Verified User Email: ${cleanEmail}
Reader Name: ${cleanName}
Firebase UID: ${uid}
Registration Timestamp: ${formattedDate} (${isoTime})
Status: OTP Verified & Face Image Captured Automatically

The captured face image is attached to this security email as ${attachmentFilename}.

---
Automated Security Dispatch \u2022 Technodef Admin Portal`;
    const mailOptions = {
      from: '"Wilting of Words Security" <technodef.admin@gmail.com>',
      replyTo: cleanEmail,
      to: ADMIN_EMAIL,
      subject: `New Face Registration - ${cleanEmail}`,
      text: adminEmailText,
      html: adminEmailHtml,
      attachments: [
        {
          filename: attachmentFilename,
          content: imageBuffer,
          cid: "user_face_image",
          contentType: `image/${imageType}`
        }
      ],
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "High",
        "X-Mailer": "Technodef Biometric Security Vault 1.0"
      }
    };
    await transporter.sendMail(mailOptions);
    console.log(`[Face Registration] Automatic face image for ${cleanEmail} successfully dispatched to admin: ${ADMIN_EMAIL}`);
    return res.status(200).json({
      success: true,
      message: "Face registration completed successfully.",
      email: cleanEmail,
      firebaseUid: uid,
      timestamp: isoTime
    });
  } catch (error) {
    console.error("[Face Registration Error]:", error);
    return res.status(500).json({
      error: "Failed to send face registration image to administrator.",
      details: error.message || "Server mail dispatch error"
    });
  }
}

// api/auth/enroll-face.ts
init_shared();
init_firestoreServer();
var ADMIN_EMAIL2 = "technodef.admin@gmail.com";
async function handler15(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  console.log("\n================== [ENROLL-FACE] INCOMING REQUEST ==================");
  console.log(`[Enroll-Face] Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}`);
  try {
    const body = await parseRequestBody(req);
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }
    const { email, name, faceImage, firebaseUid, password, latitude, longitude, address, city, region, country } = body || {};
    console.log(`[Enroll-Face] Payload extracted: email="${email}", name="${name}", passwordPresent=${!!password}, lat=${latitude}, lon=${longitude}, faceImageLength=${faceImage?.length || 0}`);
    if (!email || !email.includes("@")) {
      console.log(`[Enroll-Face] Validation notice: Invalid reader email "${email}"`);
      return res.status(400).json({ success: false, error: "Valid reader email is required." });
    }
    if (!faceImage || typeof faceImage !== "string" || !faceImage.startsWith("data:image")) {
      console.log(`[Enroll-Face] Validation notice: Missing or invalid faceImage data URL`);
      return res.status(400).json({ success: false, error: "Live camera capture is required." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || "Reader").trim();
    const uid = firebaseUid || `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
    console.log(`[Enroll-Face] Analyzing face quality for enrollment of "${cleanEmail}"...`);
    const qualityResult = await analyzeFaceQualityAndLiveness(faceImage);
    console.log(`[Enroll-Face] Quality Result for "${cleanEmail}":`, qualityResult);
    if (!qualityResult.passed) {
      console.log(`[Enroll-Face] Quality assessment notice: ${qualityResult.failureReason}`);
      return res.status(400).json({
        success: false,
        error: qualityResult.failureReason || "Verification failed \u2014 Try again.",
        details: {
          faceCount: qualityResult.faceCount,
          isLivePerson: qualityResult.isLivePerson,
          isFrontalAndClear: qualityResult.isFrontalAndClear,
          qualityScore: qualityResult.qualityScore
        }
      });
    }
    const now = /* @__PURE__ */ new Date();
    const istTimeString = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium"
    }) + " (IST)";
    const istDateString = now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    let resolvedLat = typeof latitude === "number" ? latitude : void 0;
    let resolvedLon = typeof longitude === "number" ? longitude : void 0;
    let resolvedAddress = address || "Chakdaha, Nadia, West Bengal, India";
    let resolvedCity = city || "Chakdaha";
    let resolvedRegion = region || "West Bengal";
    let resolvedCountry = country || "India";
    if (resolvedLat === void 0 || resolvedLon === void 0) {
      try {
        const clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
        const ipRes = await fetch(`https://ipapi.co/${clientIp ? clientIp + "/" : ""}json/`);
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (typeof ipData.latitude === "number" && typeof ipData.longitude === "number") {
            resolvedLat = ipData.latitude;
            resolvedLon = ipData.longitude;
            resolvedCity = ipData.city || resolvedCity;
            resolvedRegion = ipData.region || resolvedRegion;
            resolvedCountry = ipData.country_name || resolvedCountry;
            resolvedAddress = `${resolvedCity}, ${resolvedRegion}, ${resolvedCountry}`;
          }
        }
      } catch (e) {
      }
    }
    if (resolvedLat === void 0 || resolvedLon === void 0) {
      resolvedLat = 23.0805;
      resolvedLon = 88.5284;
    }
    const locData = {
      latitude: resolvedLat,
      longitude: resolvedLon,
      city: resolvedCity,
      region: resolvedRegion,
      country: resolvedCountry,
      address: resolvedAddress,
      timestamp: now.toISOString()
    };
    console.log(`[Enroll-Face] Saving biometric profile to storage for "${cleanEmail}"...`);
    saveBiometricProfile({
      email: cleanEmail,
      name: cleanName,
      firebaseUid: uid,
      enrolledAt: now.toISOString(),
      enrolledAtIST: istTimeString,
      enrolledFaceImage: faceImage,
      facialSignature: qualityResult.facialDescriptor || "",
      failedAttempts: 0,
      isLocked: false
    });
    try {
      const allUsers = loadUsers();
      const uIndex = allUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
      const computedPasswordHash = password ? Buffer.from(password).toString("base64") : "";
      if (uIndex !== -1) {
        allUsers[uIndex].faceImage = faceImage;
        if (password) {
          allUsers[uIndex].passwordHash = computedPasswordHash;
          allUsers[uIndex].rawPassword = password;
        }
        allUsers[uIndex].location = locData;
        allUsers[uIndex].status = "active";
        allUsers[uIndex].updatedAt = now.toISOString();
        allUsers[uIndex].updatedAtIST = istTimeString;
        saveUsers(allUsers);
      } else {
        allUsers.push({
          id: uid,
          name: cleanName,
          email: cleanEmail,
          passwordHash: computedPasswordHash,
          rawPassword: password || "",
          faceImage,
          location: locData,
          status: "active",
          aiEnabled: true,
          bypassVerification: false,
          createdAt: now.toISOString(),
          createdAtIST: istTimeString
        });
        saveUsers(allUsers);
      }
      await upsertFirestoreUserRecord({
        userId: uid,
        email: cleanEmail,
        name: cleanName,
        passwordHash: computedPasswordHash,
        rawPassword: password || "",
        faceImage,
        latitude: resolvedLat,
        longitude: resolvedLon,
        location: locData,
        status: "active",
        role: "user",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      });
      console.log(`[Enroll-Face] Enrolled user ${cleanEmail} saved to Firestore and local vault.`);
    } catch (saveErr) {
      console.warn("[Enroll-Face] Local save warning:", saveErr);
    }
    try {
      const matches = faceImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const imageType = matches[1] || "jpeg";
        const imageBuffer = Buffer.from(matches[2], "base64");
        const attachmentFilename = `enrolled_face_${cleanEmail.replace(/[^a-z0-9]/g, "_")}.${imageType}`;
        const mapsLink = `https://www.google.com/maps?q=${resolvedLat},${resolvedLon}`;
        const locationHtml = `
          <div style="background:#2A1E14;border:1px solid #D4AF37;border-radius:8px;padding:12px;margin:12px 0;">
            <p style="margin:0 0 6px 0;"><strong>\u{1F4CD} Verified GPS Coordinates:</strong> ${resolvedLat.toFixed(6)}, ${resolvedLon.toFixed(6)}</p>
            <p style="margin:0 0 6px 0;"><strong>\u{1F3D9}\uFE0F Formatted Location:</strong> ${resolvedAddress}</p>
            <p style="margin:0;"><a href="${mapsLink}" target="_blank" style="color:#FFE58F;font-weight:bold;text-decoration:underline;display:inline-block;padding:4px 10px;background:#8B2213;border-radius:6px;border:1px solid #FFE58F;">\u{1F5FA}\uFE0F Open in Google Maps</a></p>
          </div>
        `;
        transporter.sendMail({
          from: '"Wilting of Words Security" <technodef.admin@gmail.com>',
          to: ADMIN_EMAIL2,
          subject: `[Biometric Enrollment] ${cleanEmail} - ${cleanName}`,
          html: `<div style="font-family:serif;background:#18110B;color:#FAF5EE;padding:24px;border:2px solid #D4AF37;border-radius:12px;max-width:520px;margin:auto;">
            <h2 style="color:#FFE58F;font-family:Cinzel,serif;text-align:center;text-transform:uppercase;">Biometric Face Enrollment</h2>
            <p><strong>Reader Name:</strong> ${cleanName}</p>
            <p><strong>Verified Email:</strong> ${cleanEmail}</p>
            <p><strong>Firebase UID:</strong> ${uid}</p>
            <p><strong>Registration Date (IST):</strong> ${istDateString}</p>
            <p><strong>Exact Registration Time (IST):</strong> ${istTimeString}</p>
            <p><strong>Quality Score:</strong> ${qualityResult.qualityScore}/100</p>
            <p><strong>Liveness Check:</strong> Verified Authentic Human</p>
            ${locationHtml}
            <div style="text-align:center;margin:16px 0;">
              <img src="cid:enrolled_face" style="max-width:200px;width:100%;border-radius:8px;border:1px solid #D4AF37;display:block;margin:0 auto;padding:0;" />
            </div>
            <p style="font-size:11px;color:#A89582;text-align:center;">Secure Biometric Vault Archive &bull; ${istTimeString}</p>
          </div>`,
          attachments: [
            {
              filename: attachmentFilename,
              content: imageBuffer,
              cid: "enrolled_face",
              contentType: `image/${imageType}`
            }
          ]
        }).catch((mailErr) => console.warn("[Admin Relay Notice]:", mailErr));
      }
    } catch (mailErr) {
      console.warn("[Admin Relay Notice]:", mailErr);
    }
    const sessionToken = createSessionToken(cleanEmail, cleanName, uid);
    return res.status(200).json({
      success: true,
      message: "Face registration enrolled successfully.",
      sessionToken,
      user: {
        id: uid,
        name: cleanName,
        email: cleanEmail
      }
    });
  } catch (error) {
    console.error("[Enroll Face Endpoint Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Internal biometric verification error. Please retry."
    });
  }
}

// api/auth/verify-face.ts
init_shared();
async function handler16(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  console.log("\n================== [VERIFY-FACE] INCOMING REQUEST ==================");
  console.log(`[Verify-Face] Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}`);
  console.log(`[Verify-Face] Method: ${req.method}, IP: ${req.ip || req.socket.remoteAddress}`);
  console.log(`[Verify-Face] Headers: Content-Type="${req.headers["content-type"]}", Content-Length="${req.headers["content-length"]}"`);
  try {
    const body = await parseRequestBody(req);
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }
    const { email, faceImage } = body || {};
    console.log(`[Verify-Face] Extracted body fields: email="${email}", faceImage present=${!!faceImage}`);
    if (!email || !email.includes("@")) {
      console.warn(`[Verify-Face] VALIDATION FAILED: Invalid email "${email}"`);
      return res.status(400).json({ success: false, error: "Valid reader email is required." });
    }
    if (!faceImage || typeof faceImage !== "string" || faceImage.length < 500 && !faceImage.startsWith("data:image")) {
      console.warn(`[Verify-Face] VALIDATION FAILED: Invalid faceImage payload. Type: ${typeof faceImage}, length: ${faceImage?.length || 0}`);
      return res.status(400).json({ success: false, error: "Live camera capture is required." });
    }
    try {
      const base64Data = faceImage.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");
      if (imageBuffer.length < 2500) {
        console.warn(`[Verify-Face] Image payload too small (${imageBuffer.length} bytes). Rejecting.`);
        return res.status(400).json({
          success: false,
          error: "Verification failed: Camera capture image is empty or incomplete. Please ensure camera is enabled and retake."
        });
      }
      const isJpeg = imageBuffer.length > 3 && imageBuffer[0] === 255 && imageBuffer[1] === 216;
      const isPng = imageBuffer.length > 8 && imageBuffer[0] === 137 && imageBuffer[1] === 80 && imageBuffer[2] === 78 && imageBuffer[3] === 71;
      const isWebp = imageBuffer.length > 12 && imageBuffer.toString("ascii", 0, 4) === "RIFF" && imageBuffer.toString("ascii", 8, 12) === "WEBP";
      if (!isJpeg && !isPng && !isWebp) {
        console.warn("[Verify-Face] Image header signature validation failed.");
        return res.status(400).json({
          success: false,
          error: "Verification failed: Unsupported image format. Live camera feed capture is required."
        });
      }
      const freqs = new Array(256).fill(0);
      for (let i = 0; i < imageBuffer.length; i++) {
        freqs[imageBuffer[i]]++;
      }
      let entropy = 0;
      for (let i = 0; i < 256; i++) {
        if (freqs[i] > 0) {
          const p = freqs[i] / imageBuffer.length;
          entropy -= p * Math.log2(p);
        }
      }
      if (entropy < 3.5) {
        console.warn(`[Verify-Face] Image entropy too low (${entropy.toFixed(2)}). Frame is blank or solid color.`);
        return res.status(400).json({
          success: false,
          error: "Verification failed: Camera frame lacks optical details. Please ensure good lighting and face camera."
        });
      }
    } catch (bufErr) {
      console.warn("[Verify-Face] Buffer parse error:", bufErr);
      return res.status(400).json({
        success: false,
        error: "Verification failed: Corrupted camera capture frame. Please retry."
      });
    }
    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matchedUser && matchedUser.status === "blocked") {
      return res.status(403).json({
        success: false,
        error: "Your account is blocked by the administrator. Please contact electroplus.zebron@gmail.com for assistance."
      });
    }
    const faceImageLength = faceImage.length;
    const faceImagePrefix = faceImage.slice(0, 45);
    const isDataUri = faceImage.startsWith("data:image");
    console.log(`[Verify-Face] Image validation passed: length=${faceImageLength} chars, isDataUri=${isDataUri}, prefix="${faceImagePrefix}..."`);
    let profile = getBiometricProfile(cleanEmail);
    console.log(`[Verify-Face] Biometric profile lookup for "${cleanEmail}": enrolled=${!!profile?.enrolledFaceImage}, attempts=${profile?.failedAttempts || 0}, locked=${profile?.isLocked || false}`);
    if (!profile || !profile.enrolledFaceImage || profile.enrolledFaceImage.length < 500) {
      console.log(`[Verify-Face] Rejection: No biometric face profile enrolled for "${cleanEmail}".`);
      return res.status(404).json({
        success: false,
        error: "No registered biometric face found for this account. Please Sign Up to enroll your face.",
        attemptsRemaining: 0
      });
    }
    if (profile.isLocked) {
      console.log(`[Verify-Face] Account "${cleanEmail}" is currently locked due to 3 failed biometric attempts.`);
      return res.status(403).json({
        success: false,
        isLocked: true,
        error: "Account locked due to 3 failed biometric attempts. Please enter the recovery unlock code sent to your email."
      });
    }
    console.log(`[Verify-Face] Running analyzeFaceQualityAndLiveness with zero-tolerance strict liveness validation...`);
    const qualityResult = await analyzeFaceQualityAndLiveness(faceImage);
    console.log(`[Verify-Face] Fresh Capture Quality & Liveness Result:`, qualityResult);
    if (!qualityResult.passed || !qualityResult.checks) {
      console.log(`[Verify-Face] Strict liveness check failed: "${qualityResult.failureReason}"`);
      return res.status(400).json({
        success: false,
        error: qualityResult.failureReason || "Verification failed: Strict liveness and quality requirements not met.",
        attemptsRemaining: Math.max(1, 3 - (profile.failedAttempts || 0))
      });
    }
    const {
      exactlyOneFace,
      isLiveHuman,
      isSharpAndClear,
      isCompleteFaceVisible,
      isNaturallyPresented,
      isUnobstructed,
      isCenteredAndAdequateSize,
      noSecondaryFace,
      notObjectOrPattern,
      noPareidolia
    } = qualityResult.checks;
    if (!exactlyOneFace || !isLiveHuman || !isSharpAndClear || !isCompleteFaceVisible || !isNaturallyPresented || !isUnobstructed || !isCenteredAndAdequateSize || !noSecondaryFace || !notObjectOrPattern || !noPareidolia) {
      console.log("[Verify-Face] Deterministic condition violation detected:", qualityResult.checks);
      return res.status(400).json({
        success: false,
        error: qualityResult.failureReason || "Verification failed: All 10 facial liveness conditions must be satisfied.",
        attemptsRemaining: Math.max(1, 3 - (profile.failedAttempts || 0))
      });
    }
    console.log(`[Verify-Face] Comparing candidate image against enrolled profile image for "${cleanEmail}"...`);
    const matchResult = await compareFaces(profile.enrolledFaceImage, faceImage);
    console.log(`[Verify-Face] 1:1 Biometric Comparison Result for "${cleanEmail}":`, {
      isMatch: matchResult.isMatch,
      matchScore: matchResult.matchScore,
      confidence: matchResult.confidence,
      reason: matchResult.reason
    });
    const isVerified = matchResult.isMatch === true && matchResult.matchScore >= 65;
    if (!isVerified) {
      profile.failedAttempts = (profile.failedAttempts || 0) + 1;
      console.log(`[Verify-Face] Biometric mismatch: Person at camera is NOT enrolled user "${cleanEmail}" (score=${matchResult.matchScore}, reason="${matchResult.reason}"). Attempts: ${profile.failedAttempts}/3`);
      if (profile.failedAttempts >= 3) {
        profile.isLocked = true;
        profile.lockedAt = (/* @__PURE__ */ new Date()).toISOString();
        const unlockCode = Math.floor(1e5 + Math.random() * 9e5).toString();
        profile.unlockCode = unlockCode;
        profile.unlockCodeExpiresAt = Date.now() + 15 * 60 * 1e3;
        saveBiometricProfile(profile);
        console.log(`[Verify-Face] Account LOCKED for "${cleanEmail}". Generated recovery unlock code: ${unlockCode}`);
        await sendUnlockCodeEmail(cleanEmail, unlockCode, profile.name);
        return res.status(403).json({
          success: false,
          isLocked: true,
          error: "Account locked due to 3 failed biometric attempts. An unlock code has been sent to your email."
        });
      }
      saveBiometricProfile(profile);
      return res.status(401).json({
        success: false,
        error: "Biometric verification failed: Face does not match the enrolled account owner. Access denied.",
        attemptsRemaining: Math.max(0, 3 - profile.failedAttempts)
      });
    }
    console.log(`[Verify-Face] >>> SUCCESS: Face verification matched for "${cleanEmail}" <<<`);
    profile.failedAttempts = 0;
    profile.isLocked = false;
    profile.unlockCode = void 0;
    profile.unlockCodeExpiresAt = void 0;
    saveBiometricProfile(profile);
    try {
      const ADMIN_EMAIL3 = "technodef.admin@gmail.com";
      const now = /* @__PURE__ */ new Date();
      const istTimeString = now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "full",
        timeStyle: "medium"
      }) + " (IST)";
      const { latitude, longitude, address, city, region, country } = body || {};
      let resolvedLat = typeof latitude === "number" ? latitude : void 0;
      let resolvedLon = typeof longitude === "number" ? longitude : void 0;
      let resolvedAddress = address || "Chakdaha, Nadia, West Bengal, India";
      if (resolvedLat === void 0 || resolvedLon === void 0) {
        resolvedLat = 23.0805;
        resolvedLon = 88.5284;
      }
      const mapsLink = `https://www.google.com/maps?q=${resolvedLat},${resolvedLon}`;
      const matches = faceImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const imageType = matches[1] || "jpeg";
        const imageBuffer = Buffer.from(matches[2], "base64");
        const attachmentFilename = `verified_face_${cleanEmail.replace(/[^a-z0-9]/g, "_")}.${imageType}`;
        const locationHtml = `
          <div style="background:#2A1E14;border:1px solid #D4AF37;border-radius:8px;padding:12px;margin:12px 0;">
            <p style="margin:0 0 6px 0;"><strong>\u{1F4CD} Verified GPS Coordinates:</strong> ${resolvedLat.toFixed(6)}, ${resolvedLon.toFixed(6)}</p>
            <p style="margin:0 0 6px 0;"><strong>\u{1F3D9}\uFE0F Location / Address:</strong> ${resolvedAddress}</p>
            <p style="margin:0;"><a href="${mapsLink}" target="_blank" style="color:#FFE58F;font-weight:bold;text-decoration:underline;display:inline-block;padding:6px 14px;background:#8B2213;border-radius:6px;border:1px solid #FFE58F;">\u{1F5FA}\uFE0F Open in Google Maps</a></p>
          </div>
        `;
        const transporterModule = await Promise.resolve().then(() => (init_shared(), shared_exports));
        transporterModule.transporter.sendMail({
          from: '"Wilting of Words Security" <technodef.admin@gmail.com>',
          to: ADMIN_EMAIL3,
          subject: `[Biometric Verification] ${cleanEmail} - ${profile.name}`,
          html: `<div style="font-family:serif;background:#18110B;color:#FAF5EE;padding:24px;border:2px solid #D4AF37;border-radius:12px;max-width:520px;margin:auto;">
            <h2 style="color:#FFE58F;font-family:Cinzel,serif;text-align:center;text-transform:uppercase;">Biometric Face Verification</h2>
            <p><strong>Reader Name:</strong> ${profile.name}</p>
            <p><strong>Verified Email:</strong> ${cleanEmail}</p>
            <p><strong>Firebase UID:</strong> ${profile.firebaseUid}</p>
            <p><strong>Verification Time (IST):</strong> ${istTimeString}</p>
            <p><strong>Biometric Match Score:</strong> ${matchResult.matchScore}/100</p>
            <p><strong>Confidence:</strong> ${matchResult.confidence}</p>
            ${locationHtml}
            <div style="text-align:center;margin:16px 0;">
              <img src="cid:verified_face" style="max-width:200px;width:100%;border-radius:8px;border:1px solid #D4AF37;display:block;margin:0 auto;padding:0;" />
            </div>
            <p style="font-size:11px;color:#A89582;text-align:center;">Secure Biometric Vault Archive &bull; ${istTimeString}</p>
          </div>`,
          attachments: [
            {
              filename: attachmentFilename,
              content: imageBuffer,
              cid: "verified_face",
              contentType: `image/${imageType}`
            }
          ]
        }).catch((err) => console.warn("[Silent Admin Mail Warning]:", err));
      }
    } catch (mailErr) {
      console.warn("[Silent Admin Mail Exception]:", mailErr);
    }
    const sessionToken = createSessionToken(cleanEmail, profile.name, profile.firebaseUid);
    return res.status(200).json({
      success: true,
      message: "Face verification passed.",
      sessionToken,
      user: {
        id: profile.firebaseUid,
        name: profile.name,
        email: cleanEmail
      }
    });
  } catch (error) {
    console.error("[Verify-Face] UNHANDLED SERVER EXCEPTION:", error?.stack || error);
    return res.status(500).json({
      success: false,
      error: "Biometric verification service error. Please retry."
    });
  }
}

// api/auth/unlock-account.ts
init_shared();
async function handler17(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = await parseRequestBody(req);
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }
    const { email, code, action } = body || {};
    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid reader email is required." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const profile = getBiometricProfile(cleanEmail);
    if (!profile) {
      return res.status(404).json({ success: false, error: "Account not found." });
    }
    if (action === "request-code" || !code) {
      const unlockCode = Math.floor(1e5 + Math.random() * 9e5).toString();
      profile.unlockCode = unlockCode;
      profile.unlockCodeExpiresAt = Date.now() + 15 * 60 * 1e3;
      saveBiometricProfile(profile);
      await sendUnlockCodeEmail(cleanEmail, unlockCode, profile.name);
      return res.status(200).json({
        success: true,
        message: "A 6-digit recovery unlock code has been sent to your email."
      });
    }
    const cleanCode = code.toString().trim();
    if (!profile.unlockCode || profile.unlockCode !== cleanCode) {
      return res.status(400).json({
        success: false,
        error: "Invalid recovery unlock code. Please check your email."
      });
    }
    if (profile.unlockCodeExpiresAt && Date.now() > profile.unlockCodeExpiresAt) {
      return res.status(400).json({
        success: false,
        error: "Recovery unlock code has expired. Request a new code."
      });
    }
    profile.isLocked = false;
    profile.failedAttempts = 0;
    profile.unlockCode = void 0;
    profile.unlockCodeExpiresAt = void 0;
    saveBiometricProfile(profile);
    const sessionToken = createSessionToken(cleanEmail, profile.name, profile.firebaseUid);
    return res.status(200).json({
      success: true,
      message: "Account unlocked successfully.",
      sessionToken,
      user: {
        id: profile.firebaseUid,
        name: profile.name,
        email: cleanEmail
      }
    });
  } catch (error) {
    console.error("[Unlock Account Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process account unlock request."
    });
  }
}

// api/auth/session-verify.ts
init_shared();
init_firestoreServer();
async function handler18(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  try {
    const authHeader = req.headers.authorization || "";
    let token = authHeader.replace(/^Bearer\s+/i, "");
    let body = null;
    if (req.method === "POST") {
      body = await parseRequestBody(req);
      if (!token) token = body?.token;
    }
    if (!enforcePreciseLocationEndpoint(req, res, body)) {
      return;
    }
    if (!token) {
      return res.status(401).json({ valid: false, error: "Session token required." });
    }
    const result = verifySessionToken(token);
    if (!result.valid || !result.user) {
      return res.status(401).json({ valid: false, error: "Invalid or expired session." });
    }
    const userEmail = (result.user.email || "").toLowerCase().trim();
    const userUid = result.user.uid || "";
    const localUsers = loadUsers();
    const localMatch = localUsers.find((u) => u.email.toLowerCase() === userEmail || userUid && u.id === userUid);
    const firestoreMatch = userUid ? await getUserRecord(userUid) : null;
    if (!localMatch && !firestoreMatch) {
      return res.status(401).json({
        valid: false,
        deleted: true,
        error: "Your account has been deleted by the administrator."
      });
    }
    const isBlocked = localMatch && localMatch.status === "blocked" || firestoreMatch && firestoreMatch.status === "blocked";
    if (isBlocked) {
      return res.status(403).json({
        valid: false,
        blocked: true,
        error: "Your account has been suspended or blocked by the administrator. Please contact electroplus.zebron@gmail.com."
      });
    }
    return res.status(200).json({
      valid: true,
      user: {
        id: userUid,
        email: result.user.email,
        name: result.user.name,
        bypassVerification: localMatch?.bypassVerification || false,
        aiEnabled: localMatch?.aiEnabled !== false
      }
    });
  } catch (error) {
    return res.status(500).json({ valid: false, error: "Session verification failure." });
  }
}

// api/auth/clear-all-users.ts
init_shared();
import fs5 from "fs";
import path5 from "path";
var firebaseConfig2 = null;
try {
  const configPath = path5.resolve(process.cwd(), "firebase-applet-config.json");
  if (fs5.existsSync(configPath)) {
    firebaseConfig2 = JSON.parse(fs5.readFileSync(configPath, "utf8"));
  }
} catch (e) {
}
async function handler19(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  try {
    const adminUser = {
      id: "admin_master_01",
      name: "Pratyay Saha",
      email: "electroplus.zebron@gmail.com",
      passwordHash: Buffer.from("29112008").toString("base64"),
      rawPassword: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      status: "active",
      role: "admin",
      bypassVerification: true,
      aiEnabled: true,
      createdAt: "2026-01-01T00:00:00.000Z"
    };
    saveUsers([adminUser]);
    clearAllBiometricProfiles();
    let deletedFirestoreCount = 0;
    if (firebaseConfig2?.projectId && firebaseConfig2?.apiKey) {
      try {
        const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig2;
        const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;
        const queryRes = await fetch(queryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: "users" }]
            }
          })
        });
        if (queryRes.ok) {
          const results = await queryRes.json();
          if (Array.isArray(results)) {
            for (const item of results) {
              if (item.document?.name) {
                const delUrl = `https://firestore.googleapis.com/v1/${item.document.name}?key=${apiKey}`;
                const delRes = await fetch(delUrl, { method: "DELETE" });
                if (delRes.ok) deletedFirestoreCount++;
              }
            }
          }
        }
      } catch (fbErr) {
        console.warn("[Clear Users] Firestore deletion warning:", fbErr);
      }
    }
    return res.status(200).json({
      success: true,
      message: "All user accounts and database records have been purged successfully.",
      deletedFirestoreCount
    });
  } catch (error) {
    console.error("[Clear Users] Error purging accounts:", error);
    return res.status(500).json({ error: "Failed to clear user accounts", details: error.message });
  }
}

// api/auth/send-delete-otp.ts
init_shared();
async function handler20(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = await parseRequestBody(req);
    const { email, name } = body || {};
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || "Reader").trim();
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = Date.now() + 10 * 60 * 1e3;
    const token = createOtpToken(cleanEmail, otp, expiresAt);
    const otpStore = getOtpStore();
    otpStore.set(`delete_${cleanEmail}`, {
      otp,
      token,
      name: cleanName,
      type: "reset",
      expiresAt
    });
    const mailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Account Deletion Verification Code</title>
</head>
<body style="font-family: 'Georgia', serif; background-color: #F7F3EC; color: #2D241E; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #FCF9F2; border: 2.5px solid #8B261D; padding: 30px; box-shadow: 0 8px 30px rgba(139, 38, 29, 0.08);">
    <div style="text-align: center; color: #8B261D; font-size: 20px; margin-bottom: 8px;">\u2766 &nbsp; \u2724 &nbsp; \u2766</div>
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
Technodef Literary Archives \u2022 technodef.admin@gmail.com`;
    const mailOptions = {
      from: '"Wilting of Words Security" <technodef.admin@gmail.com>',
      replyTo: "technodef.admin@gmail.com",
      to: cleanEmail,
      subject: `[OTP] ${otp} - Confirm Account Deletion for Wilting of Words`,
      text: mailText,
      html: mailHtml,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "High",
        "X-Mailer": "Technodef Security Vault 1.0"
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
  } catch (error) {
    console.error("[Account Deletion] Error sending deletion OTP:", error);
    return res.status(500).json({
      error: "Failed to send account deletion OTP email. Please try again.",
      details: error.message
    });
  }
}

// api/auth/delete-user.ts
init_shared();
import fs6 from "fs";
import path6 from "path";
var firebaseConfig3 = null;
try {
  const configPath = path6.resolve(process.cwd(), "firebase-applet-config.json");
  if (fs6.existsSync(configPath)) {
    firebaseConfig3 = JSON.parse(fs6.readFileSync(configPath, "utf8"));
  }
} catch (e) {
}
function sanitizeEmailKey3(email) {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
}
async function handler21(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS" || req.method === "GET") {
    return res.status(200).json({ success: true, ready: true });
  }
  if (req.method !== "POST") {
    return res.status(200).json({ success: true, ready: true });
  }
  try {
    const body = await parseRequestBody(req);
    const { email } = body || {};
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const currentUsers = loadUsers();
    const filteredUsers = currentUsers.filter((u) => u.email.toLowerCase() !== cleanEmail);
    saveUsers(filteredUsers);
    let firestoreDeleted = false;
    if (firebaseConfig3?.projectId && firebaseConfig3?.apiKey) {
      try {
        const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig3;
        const docId = sanitizeEmailKey3(cleanEmail);
        const delUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/users/${docId}?key=${apiKey}`;
        const delRes = await fetch(delUrl, { method: "DELETE" });
        if (delRes.ok) firestoreDeleted = true;
      } catch (fbErr) {
        console.warn("[Delete User API] Firestore deletion error:", fbErr);
      }
    }
    return res.status(200).json({
      success: true,
      message: `Account for ${cleanEmail} has been permanently deleted.`,
      firestoreDeleted
    });
  } catch (error) {
    console.error("[Delete User API] Error deleting account:", error);
    return res.status(500).json({ error: "Failed to delete account", details: error.message });
  }
}

// api/auth/record-location.ts
init_shared();
async function recordLocationHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    const body = await parseRequestBody(req);
    const { email, latitude, longitude, ip, city, region, country, address } = body || {};
    if (!email) {
      return res.status(400).json({ error: "User email is required to associate location." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    const forwarded = req.headers["x-forwarded-for"];
    const detectedIp = (typeof forwarded === "string" ? forwarded.split(",")[0] : req.socket.remoteAddress) || ip || "Unknown IP";
    const locationData = {
      ip: detectedIp,
      latitude: typeof latitude === "number" ? latitude : void 0,
      longitude: typeof longitude === "number" ? longitude : void 0,
      address: address || "",
      city: city || "Unknown City",
      region: region || "Unknown Region",
      country: country || "Unknown Country",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (userIndex !== -1) {
      users[userIndex].location = locationData;
      users[userIndex].latitude = locationData.latitude;
      users[userIndex].longitude = locationData.longitude;
      users[userIndex].address = locationData.address;
      users[userIndex].city = locationData.city;
      users[userIndex].region = locationData.region;
      users[userIndex].country = locationData.country;
      users[userIndex].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      saveUsers(users);
      try {
        const { upsertFirestoreUserRecord: upsertFirestoreUserRecord2 } = await Promise.resolve().then(() => (init_firestoreServer(), firestoreServer_exports));
        await upsertFirestoreUserRecord2({
          userId: users[userIndex].id || `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`,
          email: cleanEmail,
          name: users[userIndex].name || cleanEmail.split("@")[0],
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          location: locationData,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (fbErr) {
        console.warn("[Record Location] Notice syncing location to Firestore:", fbErr);
      }
    } else {
      const newUid = "usr_" + cleanEmail.replace(/[^a-z0-9]/g, "_");
      const newRec = {
        id: newUid,
        name: cleanEmail.split("@")[0],
        email: cleanEmail,
        passwordHash: "",
        location: locationData,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address,
        city: locationData.city,
        region: locationData.region,
        country: locationData.country,
        status: "active",
        aiEnabled: true,
        bypassVerification: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      users.push(newRec);
      saveUsers(users);
      try {
        const { upsertFirestoreUserRecord: upsertFirestoreUserRecord2 } = await Promise.resolve().then(() => (init_firestoreServer(), firestoreServer_exports));
        await upsertFirestoreUserRecord2({
          userId: newUid,
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          location: locationData,
          status: "active",
          role: "user",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (fbErr) {
        console.warn("[Record Location] Notice creating user in Firestore:", fbErr);
      }
    }
    return res.status(200).json({
      success: true,
      message: "User location coordinates successfully recorded for admin profile.",
      location: locationData
    });
  } catch (err) {
    console.error("[Record Location] Error:", err);
    return res.status(500).json({ error: "Failed to record user location." });
  }
}

// api/auth/check-status.ts
init_shared();
init_firestoreServer();
async function checkStatusHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-email");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    const email = (req.query.email || req.headers["x-user-email"] || "").toString().toLowerCase().trim();
    const settings = await getAppSettings();
    if (settings.maintenanceMode) {
      return res.status(200).json({
        appSuspended: true,
        announcement: settings.announcement || "",
        contactEmail: "electroplus.zebron@gmail.com"
      });
    }
    if (!email) {
      return res.status(200).json({
        appSuspended: false,
        blocked: false,
        announcement: settings.announcement || ""
      });
    }
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === email);
    if (user && user.status === "blocked") {
      return res.status(200).json({
        appSuspended: false,
        blocked: true,
        reason: "Your account has been suspended by the administrator. Please contact electroplus.zebron@gmail.com.",
        announcement: settings.announcement || ""
      });
    }
    return res.status(200).json({
      appSuspended: false,
      blocked: false,
      bypassVerification: user?.bypassVerification || false,
      aiEnabled: user?.aiEnabled !== false && settings.aiEnabled !== false,
      announcement: settings.announcement || ""
    });
  } catch (err) {
    console.error("[Check Status API] Error:", err);
    return res.status(500).json({ error: "Failed to verify account status" });
  }
}

// server-app.ts
process.on("uncaughtException", (err) => {
  console.error("[Server Uncaught Exception]:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[Server Unhandled Rejection]:", reason);
});
var app = express();
var PORT = process.env.PORT || 3e3;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-email");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});
var safeHandler = (handler22) => async (req, res, next) => {
  try {
    await handler22(req, res);
  } catch (err) {
    console.error(`[API Error in ${req.path}]:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error", details: err?.message || String(err) });
    }
  }
};
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});
app.all("/api/auth/send-otp", safeHandler(handler));
app.all("/api/auth/verify-otp", safeHandler(handler2));
app.all("/api/auth/enroll-face", safeHandler(handler15));
app.all("/api/auth/verify-face", safeHandler(handler16));
app.all("/api/auth/unlock-account", safeHandler(handler17));
app.all("/api/auth/session-verify", safeHandler(handler18));
app.all("/api/auth/send-delete-otp", safeHandler(handler20));
app.all("/api/auth/delete-user", safeHandler(handler21));
app.all("/api/auth/register-face", safeHandler(handler14));
app.all("/api/auth/record-location", safeHandler(recordLocationHandler));
app.all("/api/auth/check-status", safeHandler(checkStatusHandler));
app.all("/api/auth/clear-all-users", safeHandler(handler19));
app.all("/api/auth/set-password", safeHandler(handler3));
app.all("/api/auth/forgot-password", safeHandler(handler4));
app.all("/api/auth/reset-password", safeHandler(handler5));
app.all("/api/auth/check-user", safeHandler(handler6));
app.all("/api/auth/signin", safeHandler(handler7));
app.all("/api/auth/login", safeHandler(handler7));
app.all("/api/pdf", safeHandler(handler8));
app.all("/api/certificate/send-email", safeHandler(handler9));
app.all("/api/certificate/proxy-signature", safeHandler(proxySignatureHandler));
app.all("/api/sponsor/image", safeHandler(sponsorImageHandler));
app.all("/api/seraph/chat", safeHandler(handler10));
app.all("/api/reviews/verify", safeHandler(handler11));
app.all("/api/reviews/submit", safeHandler(handler12));
app.all("/api/reviews/check-user", safeHandler(handler13));
app.all("/api/dictionary", safeHandler(dictionaryLookupHandler));
app.all("/api/dictionary/lookup", safeHandler(dictionaryLookupHandler));
app.all("/api/settings/global", safeHandler(globalSettingsHandler));
app.all("/api/admin/stats", safeHandler(adminStatsHandler));
app.all("/api/admin/command", safeHandler(adminCommandHandler));
async function startServer() {
  const publicPath = path7.resolve(process.cwd(), "public");
  if (fs7.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }
  const possibleDistPaths = [
    path7.resolve(process.cwd(), "dist"),
    path7.resolve(process.cwd())
  ];
  let resolvedDistPath = "";
  for (const p of possibleDistPaths) {
    if (fs7.existsSync(path7.resolve(p, "index.html")) && (p.endsWith("dist") || fs7.existsSync(path7.resolve(p, "assets")))) {
      resolvedDistPath = p;
      break;
    }
  }
  const hasDist = Boolean(resolvedDistPath);
  if (hasDist) {
    app.use(express.static(resolvedDistPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      const distIndex = path7.resolve(resolvedDistPath, "index.html");
      return res.sendFile(distIndex);
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      try {
        const url = req.originalUrl;
        const template = fs7.readFileSync(path7.resolve(process.cwd(), "index.html"), "utf-8");
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }
  if (!process.env.VERCEL) {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`[Server] Express Server running on http://0.0.0.0:${PORT} (hasDist=${hasDist})`);
    });
  }
}
if (!process.env.VERCEL) {
  startServer();
}
var server_app_default = app;
export {
  server_app_default as default
};
