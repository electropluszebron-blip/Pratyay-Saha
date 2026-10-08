import { Request, Response } from 'express';

export default async function proxySignatureHandler(req: Request, res: Response) {
  try {
    const imageUrl = "https://lh3.googleusercontent.com/d/18nXSeulDg_yk0NM8d4R_GayxZwRBvT2F";
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Drive: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/png';
    
    res.json({
      success: true,
      mimeType,
      base64: `data:${mimeType};base64,${base64}`
    });
  } catch (err: any) {
    console.warn('[Proxy Signature] Fallback active due to error:', err.message);
    // Silent fallback to avoid breaking flow
    res.json({
      success: false,
      error: err.message,
      base64: ''
    });
  }
}
