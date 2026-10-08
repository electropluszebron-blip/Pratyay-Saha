import { Request, Response } from 'express';
import { verifySessionToken } from '../_lib/biometricService';
import { getUserReview } from '../_lib/firestoreServer';
import { parseRequestBody } from '../_lib/shared';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const authHeader = req.headers.authorization || '';
    let token = authHeader.replace(/^Bearer\s+/i, '');

    if (req.method === 'POST') {
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
    const userUid = sessionResult.user.uid || `usr_${userEmail.replace(/[^a-z0-9]/g, '_')}`;

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
          time: 'Engraved in Registry'
        }
      });
    }

    return res.status(200).json({
      authenticated: true,
      hasReviewed: false
    });

  } catch (error: any) {
    console.warn('[Check User Review] Notice:', error.message);
    return res.status(200).json({
      authenticated: false,
      hasReviewed: false
    });
  }
}
