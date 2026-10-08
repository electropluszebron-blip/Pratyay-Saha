import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

import sendOtpHandler from './api/auth/send-otp';
import verifyOtpHandler from './api/auth/verify-otp';
import setPasswordHandler from './api/auth/set-password';
import forgotPasswordHandler from './api/auth/forgot-password';
import resetPasswordHandler from './api/auth/reset-password';
import checkUserHandler from './api/auth/check-user';
import signinHandler from './api/auth/signin';
import pdfHandler from './api/pdf';
import sendCertificateEmailHandler from './api/certificate/send-email';
import proxySignatureHandler from './api/certificate/proxy-signature';
import sponsorImageHandler from './api/sponsor/image';
import seraphChatHandler from './api/seraph/chat';
import verifyReviewHandler from './api/reviews/verify';
import submitReviewHandler from './api/reviews/submit';
import checkUserReviewHandler from './api/reviews/check-user';
import dictionaryLookupHandler from './api/dictionary/lookup';
import globalSettingsHandler from './api/settings/global';
import adminStatsHandler from './api/admin/stats';
import adminCommandHandler from './api/admin/command';

import registerFaceHandler from './api/auth/register-face';
import enrollFaceHandler from './api/auth/enroll-face';
import verifyFaceHandler from './api/auth/verify-face';
import unlockAccountHandler from './api/auth/unlock-account';
import sessionVerifyHandler from './api/auth/session-verify';
import clearAllUsersHandler from './api/auth/clear-all-users';
import sendDeleteOtpHandler from './api/auth/send-delete-otp';
import deleteUserHandler from './api/auth/delete-user';
import recordLocationHandler from './api/auth/record-location';
import checkStatusHandler from './api/auth/check-status';

// Process-level crash resilience to ensure the server never dies unexpectedly
process.on('uncaughtException', (err) => {
  console.error('[Server Uncaught Exception]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Server Unhandled Rejection]:', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS and handle preflight OPTIONS requests uniformly
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-email');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Safe async handler wrapper to prevent unhandled promise rejections from crashing the server
const safeHandler = (handler: any) => async (req: Request, res: Response, next: any) => {
  try {
    await handler(req, res);
  } catch (err: any) {
    console.error(`[API Error in ${req.path}]:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: err?.message || String(err) });
    }
  }
};

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// API Routes mapped directly to serverless handlers with safe execution
app.all('/api/auth/send-otp', safeHandler(sendOtpHandler));
app.all('/api/auth/verify-otp', safeHandler(verifyOtpHandler));
app.all('/api/auth/enroll-face', safeHandler(enrollFaceHandler));
app.all('/api/auth/verify-face', safeHandler(verifyFaceHandler));
app.all('/api/auth/unlock-account', safeHandler(unlockAccountHandler));
app.all('/api/auth/session-verify', safeHandler(sessionVerifyHandler));
app.all('/api/auth/send-delete-otp', safeHandler(sendDeleteOtpHandler));
app.all('/api/auth/delete-user', safeHandler(deleteUserHandler));
app.all('/api/auth/register-face', safeHandler(registerFaceHandler));
app.all('/api/auth/record-location', safeHandler(recordLocationHandler));
app.all('/api/auth/check-status', safeHandler(checkStatusHandler));
app.all('/api/auth/clear-all-users', safeHandler(clearAllUsersHandler));
app.all('/api/auth/set-password', safeHandler(setPasswordHandler));
app.all('/api/auth/forgot-password', safeHandler(forgotPasswordHandler));
app.all('/api/auth/reset-password', safeHandler(resetPasswordHandler));
app.all('/api/auth/check-user', safeHandler(checkUserHandler));
app.all('/api/auth/signin', safeHandler(signinHandler));
app.all('/api/auth/login', safeHandler(signinHandler));
app.all('/api/pdf', safeHandler(pdfHandler));
app.all('/api/certificate/send-email', safeHandler(sendCertificateEmailHandler));
app.all('/api/certificate/proxy-signature', safeHandler(proxySignatureHandler));
app.all('/api/sponsor/image', safeHandler(sponsorImageHandler));
app.all('/api/seraph/chat', safeHandler(seraphChatHandler));
app.all('/api/reviews/verify', safeHandler(verifyReviewHandler));
app.all('/api/reviews/submit', safeHandler(submitReviewHandler));
app.all('/api/reviews/check-user', safeHandler(checkUserReviewHandler));
app.all('/api/dictionary', safeHandler(dictionaryLookupHandler));
app.all('/api/dictionary/lookup', safeHandler(dictionaryLookupHandler));
app.all('/api/settings/global', safeHandler(globalSettingsHandler));
app.all('/api/admin/stats', safeHandler(adminStatsHandler));
app.all('/api/admin/command', safeHandler(adminCommandHandler));

async function startServer() {
  const publicPath = path.resolve(process.cwd(), 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }

  const possibleDistPaths = [
    path.resolve(process.cwd(), 'dist'),
    path.resolve(process.cwd()),
  ];

  let resolvedDistPath = '';
  for (const p of possibleDistPaths) {
    if (fs.existsSync(path.resolve(p, 'index.html')) && (p.endsWith('dist') || fs.existsSync(path.resolve(p, 'assets')))) {
      resolvedDistPath = p;
      break;
    }
  }

  const hasDist = Boolean(resolvedDistPath);

  if (hasDist) {
    app.use(express.static(resolvedDistPath));

    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }

      const distIndex = path.resolve(resolvedDistPath, 'index.html');
      return res.sendFile(distIndex);
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }

      try {
        const url = req.originalUrl;
        const template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  if (!process.env.VERCEL) {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`[Server] Express Server running on http://0.0.0.0:${PORT} (hasDist=${hasDist})`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
