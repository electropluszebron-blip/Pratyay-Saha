import { Request, Response } from 'express';
import https from 'https';
import http from 'http';

export default function handler(req: Request, res: Response) {
  const fetchPdf = (targetUrl: string, redirectCount = 0) => {
    if (redirectCount > 5) {
      res.status(500).send('Too many redirects');
      return;
    }

    const client = targetUrl.startsWith('https') ? https : http;
    client.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (proxyRes) => {
      if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        fetchPdf(proxyRes.headers.location, redirectCount + 1);
        return;
      }

      res.writeHead(proxyRes.statusCode || 200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      });
      proxyRes.pipe(res);
    }).on('error', (err) => {
      res.status(500).send(`Error fetching PDF: ${err.message}`);
    });
  };

  const googleDriveDownloadUrl = 'https://drive.google.com/uc?export=download&id=1avq1PulH3i3avuRI8qrDtSBCF1GQeJUR';
  fetchPdf(googleDriveDownloadUrl);
}
