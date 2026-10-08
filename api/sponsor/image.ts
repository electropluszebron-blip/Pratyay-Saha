import { Request, Response } from 'express';

export default async function sponsorImageHandler(req: Request, res: Response) {
  try {
    const imageUrl = 'https://lh3.googleusercontent.com/d/1zQ8HHZEyi1eEStlId35ECOYd8jjU0Y4_';
    const response = await fetch(imageUrl);

    if (!response.ok) {
      const fallbackUrl = 'https://drive.google.com/uc?export=view&id=1zQ8HHZEyi1eEStlId35ECOYd8jjU0Y4_';
      const fbResp = await fetch(fallbackUrl);
      if (fbResp.ok) {
        const ct = fbResp.headers.get('content-type') || 'image/jpeg';
        res.setHeader('Content-Type', ct);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        const buffer = Buffer.from(await fbResp.arrayBuffer());
        return res.send(buffer);
      }
      return res.status(response.status).send('Failed to fetch image');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.warn('[Sponsor Image Proxy] Error:', err.message);
    return res.status(500).json({ error: 'Failed to proxy sponsor image' });
  }
}
