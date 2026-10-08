import { GoogleGenAI, Type } from '@google/genai';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { transporter, loadUsers } from './shared';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const SESSION_SECRET = process.env.AUTH_SECRET || 'sacred-biometric-vault-secret-2026';

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.resolve(process.cwd(), 'data');
const BIOMETRIC_FILE = path.join(DATA_DIR, 'biometrics.json');

export interface BiometricProfile {
  email: string;
  name: string;
  firebaseUid: string;
  enrolledAt: string;
  enrolledAtIST?: string;
  enrolledFaceImage: string; // Base64 JPEG
  facialSignature: string;
  failedAttempts: number;
  isLocked: boolean;
  lockedAt?: string;
  unlockCode?: string;
  unlockCodeExpiresAt?: number;
}

let inMemoryBiometrics: Record<string, BiometricProfile> = {};

export function loadBiometricProfiles(): Record<string, BiometricProfile> {
  try {
    if (fs.existsSync(BIOMETRIC_FILE)) {
      const data = fs.readFileSync(BIOMETRIC_FILE, 'utf-8');
      inMemoryBiometrics = JSON.parse(data);
      return inMemoryBiometrics;
    }
  } catch (e) {
    console.log('[Biometric Storage] Load notice:', e);
  }
  return inMemoryBiometrics;
}

export function saveBiometricProfiles(data: Record<string, BiometricProfile>) {
  inMemoryBiometrics = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BIOMETRIC_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.log('[Biometric Storage] Save notice:', e);
  }
}

export function getBiometricProfile(email: string): BiometricProfile | null {
  const profiles = loadBiometricProfiles();
  const cleanEmail = email.toLowerCase().trim();
  if (profiles[cleanEmail]) {
    return profiles[cleanEmail];
  }
  try {
    const users = loadUsers();
    const u = users.find(user => user.email.toLowerCase() === cleanEmail);
    if (u && u.faceImage && u.faceImage.length > 500) {
      const profile: BiometricProfile = {
        email: cleanEmail,
        name: u.name || 'Reader',
        firebaseUid: u.id || `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
        enrolledAt: u.createdAt || new Date().toISOString(),
        enrolledFaceImage: u.faceImage,
        facialSignature: '',
        failedAttempts: 0,
        isLocked: false
      };
      saveBiometricProfile(profile);
      return profile;
    }
  } catch {}
  return null;
}

export function saveBiometricProfile(profile: BiometricProfile) {
  const profiles = loadBiometricProfiles();
  const cleanEmail = profile.email.toLowerCase().trim();
  profiles[cleanEmail] = {
    ...profile,
    email: cleanEmail
  };
  saveBiometricProfiles(profiles);
}

export function clearAllBiometricProfiles() {
  inMemoryBiometrics = {};
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BIOMETRIC_FILE, JSON.stringify({}, null, 2), 'utf-8');
    console.log('[Biometric Storage] All biometric profiles purged.');
  } catch (e) {
    console.log('[Biometric Storage] Clear notice:', e);
  }
}

// Generate Secure Cryptographic HMAC Session Token
export function createSessionToken(email: string, name: string, uid: string): string {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = `${email.toLowerCase().trim()}:${name}:${uid}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const tokenData = Buffer.from(JSON.stringify({ email: email.toLowerCase().trim(), name, uid, expiresAt, sig: signature })).toString('base64');
  return tokenData;
}

// Verify Session Token
export function verifySessionToken(token: string): { valid: boolean; user?: { email: string; name: string; uid: string } } {
  try {
    if (!token) return { valid: false };
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { email, name, uid, expiresAt, sig } = decoded;

    if (!email || !expiresAt || !sig || Date.now() > expiresAt) {
      return { valid: false };
    }

    const payload = `${email.toLowerCase().trim()}:${name}:${uid}:${expiresAt}`;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

    const expectedBuf = Buffer.from(expectedSig, 'hex');
    const sigBuf = Buffer.from(sig, 'hex');

    if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
      return { valid: false };
    }

    return { valid: true, user: { email, name, uid } };
  } catch {
    return { valid: false };
  }
}

// Helper: Extract clean Base64 data and mimeType
function parseBase64Image(dataUrl: string): { base64Data: string; mimeType: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (match && match.length === 3) {
    return { mimeType: match[1], base64Data: match[2] };
  }
  return { mimeType: 'image/jpeg', base64Data: dataUrl.replace(/^data:image\/[a-z]+;base64,/, '') };
}

export interface QualityAnalysisResult {
  passed: boolean;
  faceCount: number;
  isLivePerson: boolean;
  isFrontalAndClear: boolean;
  qualityScore: number; // 0 - 100
  failureReason?: string;
  facialDescriptor?: string;
  checks?: {
    exactlyOneFace: boolean;
    isLiveHuman: boolean;
    isSharpAndClear: boolean;
    isCompleteFaceVisible: boolean;
    isNaturallyPresented: boolean;
    isUnobstructed: boolean;
    isCenteredAndAdequateSize: boolean;
    noSecondaryFace: boolean;
    notObjectOrPattern: boolean;
    noPareidolia: boolean;
  };
}

// 1. Analyze Quality, Face Count, Pose, and Anti-Spoofing Liveness with Strict 10-Condition Validation
export async function analyzeFaceQualityAndLiveness(faceImageBase64: string): Promise<QualityAnalysisResult> {
  const { base64Data, mimeType } = parseBase64Image(faceImageBase64);
  console.log(`[Biometric-Service] analyzeFaceQualityAndLiveness called: mimeType=${mimeType}, rawBase64Length=${base64Data?.length || 0}`);

  // Validate Base64 image data presence
  if (!base64Data || base64Data.length < 500) {
    console.log('[Biometric-Service] Image data notice: buffer too small or empty (length < 500)');
    return {
      passed: false,
      faceCount: 0,
      isLivePerson: false,
      isFrontalAndClear: false,
      qualityScore: 0,
      failureReason: 'Verification failed: Invalid or empty camera image. Please retake photo.'
    };
  }

  const candidateModels = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastFailureReason = '';

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
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              condition1_exactlyOneFace: { type: Type.BOOLEAN, description: 'Exactly one human face detected' },
              condition2_isLiveHuman: { type: Type.BOOLEAN, description: 'Live human person (not screen, print, photo, bedsheet, drawing, mannequin)' },
              condition3_isSharpAndClear: { type: Type.BOOLEAN, description: 'Sufficiently sharp, clear, and focused' },
              condition4_isCompleteFaceVisible: { type: Type.BOOLEAN, description: 'Complete face visible: forehead, both eyes, nose, mouth, cheeks, chin' },
              condition5_isNaturallyPresented: { type: Type.BOOLEAN, description: 'Naturally presented real human face' },
              condition6_isUnobstructed: { type: Type.BOOLEAN, description: 'Unobstructed face (no mask, hand over mouth/nose, scarf, stickers)' },
              condition7_isCenteredAndLarge: { type: Type.BOOLEAN, description: 'Centered and adequate size in frame' },
              condition8_noSecondaryFace: { type: Type.BOOLEAN, description: 'Zero secondary faces detected in frame' },
              condition9_notObjectOrPattern: { type: Type.BOOLEAN, description: 'Authentic face and not bedsheet, pattern, or object' },
              condition10_noPareidolia: { type: Type.BOOLEAN, description: 'Not an object resembling facial features' },
              allConditionsPassed: { type: Type.BOOLEAN, description: 'True ONLY if all 10 conditions pass simultaneously' },
              faceCount: { type: Type.INTEGER, description: 'Detected face count' },
              qualityScore: { type: Type.INTEGER, description: 'Biometric quality score 0-100' },
              passed: { type: Type.BOOLEAN, description: 'Final verification verdict' },
              failureReason: { type: Type.STRING, description: 'Simple explanation if any condition failed' },
              facialDescriptor: { type: Type.STRING, description: 'Biometric descriptor' }
            },
            required: [
              'condition1_exactlyOneFace',
              'condition2_isLiveHuman',
              'condition3_isSharpAndClear',
              'condition4_isCompleteFaceVisible',
              'condition5_isNaturallyPresented',
              'condition6_isUnobstructed',
              'condition7_isCenteredAndLarge',
              'condition8_noSecondaryFace',
              'condition9_notObjectOrPattern',
              'condition10_noPareidolia',
              'allConditionsPassed',
              'passed'
            ]
          },
          temperature: 0.1
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`AI model ${modelName} timed out after 12.0s`)), 12000)
      );

      const response = await Promise.race([apiCall, timeoutPromise]);
      const elapsed = Date.now() - startTime;
      console.log(`[Biometric-Service] Model ${modelName} responded in ${elapsed}ms:`, response.text?.trim());

      const parsed = JSON.parse(response.text?.trim() || '{}');
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

      // Strict deterministic rule: ALL 10 conditions MUST be met
      const passed = Boolean(c1 && c2 && c3 && c4 && c5 && c6 && c7 && c8 && c9 && c10 && allPassed);
      const score = typeof parsed.qualityScore === 'number' ? parsed.qualityScore : (passed ? 90 : 20);

      let failureReason = parsed.failureReason || '';
      if (!passed && !failureReason) {
        if (!c2 || !c9 || !c10) {
          failureReason = 'Verification failed: Live human face not detected. Photographs, screens, and objects are not permitted.';
        } else if (!c1 || !c8) {
          failureReason = 'Verification failed: Exactly one human face must be in the camera frame.';
        } else if (!c4) {
          failureReason = 'Verification failed: Complete face must be visible (forehead, eyes, nose, mouth, chin).';
        } else if (!c6) {
          failureReason = 'Verification failed: Face must not be covered or obstructed by masks, hands, or clothing.';
        } else if (!c3) {
          failureReason = 'Verification failed: Camera image is too blurry or low quality. Please hold steady in good light.';
        } else if (!c7) {
          failureReason = 'Verification failed: Please center your face in the camera frame.';
        } else {
          failureReason = 'Verification failed: Strict facial verification criteria not met. Please retake photo.';
        }
      }

      console.log(`[Biometric-Service] Strict Evaluation Result via ${modelName}: passed=${passed}, score=${score}, failureReason="${failureReason}"`);

      return {
        passed,
        faceCount: passed ? 1 : (typeof parsed.faceCount === 'number' ? parsed.faceCount : 0),
        isLivePerson: passed,
        isFrontalAndClear: c3 && c4 && c7,
        qualityScore: score,
        failureReason: passed ? undefined : failureReason,
        facialDescriptor: parsed.facialDescriptor || `sig_${crypto.createHash('sha256').update(base64Data.slice(0, 5000)).digest('hex').slice(0, 32)}`,
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
    } catch (modelErr: any) {
      const errMsg = modelErr?.message || '';
      console.warn(`[Biometric-Service] Model ${modelName} notice:`, errMsg);
      lastFailureReason = errMsg;
    }
  }

  // Deterministic failure rule: If AI liveness and quality verification could not confirm all 10 conditions,
  // reject the capture immediately. Never allow non-live representations, screens, bedsheets, or objects to bypass checks.
  console.log(`[Biometric-Service] Liveness evaluation concluded with rejection: ${lastFailureReason || 'Liveness criteria unverified'}`);
  return {
    passed: false,
    faceCount: 0,
    isLivePerson: false,
    isFrontalAndClear: false,
    qualityScore: 0,
    failureReason: 'Verification failed: A live, single, unobstructed human face could not be verified. Non-live images, screens, photos, mannequins, and objects are strictly prohibited.'
  };
}

export interface MatchResult {
  isMatch: boolean;
  matchScore: number; // 0 - 100
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  reason?: string;
}

// 2. Perform 1:1 Biometric Face Comparison (Enrolled vs Fresh Capture)
export async function compareFaces(
  enrolledImageBase64: string,
  candidateImageBase64: string
): Promise<MatchResult> {
  const enrolled = parseBase64Image(enrolledImageBase64);
  const candidate = parseBase64Image(candidateImageBase64);
  console.log(`[Biometric-Service] compareFaces invoked: enrolledLength=${enrolled.base64Data?.length}, candidateLength=${candidate.base64Data?.length}`);

  if (!enrolled.base64Data || enrolled.base64Data.length < 500) {
    console.log('[Biometric-Service] Enrolled reference image is missing or invalid.');
    return {
      isMatch: false,
      matchScore: 0,
      confidence: 'HIGH',
      reason: 'Enrolled reference biometric template is missing or corrupted.'
    };
  }

  if (!candidate.base64Data || candidate.base64Data.length < 500) {
    console.log('[Biometric-Service] Candidate camera image is missing or invalid.');
    return {
      isMatch: false,
      matchScore: 0,
      confidence: 'HIGH',
      reason: 'Candidate camera capture frame is empty or invalid.'
    };
  }

  const candidateModels = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
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
            role: 'user',
            parts: [
              { text: prompt },
              { text: 'IMAGE 1 (Enrolled Account Owner Reference):' },
              {
                inlineData: {
                  mimeType: enrolled.mimeType,
                  data: enrolled.base64Data,
                },
              },
              { text: 'IMAGE 2 (Candidate at Sign-In):' },
              {
                inlineData: {
                  mimeType: candidate.mimeType,
                  data: candidate.base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isMatch: { type: Type.BOOLEAN, description: 'True if both images show the exact same human individual' },
              isLiveCandidate: { type: Type.BOOLEAN, description: 'True if Candidate image is a live human person' },
              matchScore: { type: Type.INTEGER, description: 'Biometric similarity match score from 0 to 100' },
              confidence: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW', 'NONE'] },
              reason: { type: Type.STRING, description: 'Biometric comparison explanation' }
            },
            required: ['isMatch', 'isLiveCandidate', 'matchScore', 'confidence']
          },
          temperature: 0.1
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Comparison AI model ${modelName} timed out after 12.0s`)), 12000)
      );

      const response = await Promise.race([apiCall, timeoutPromise]);
      const elapsed = Date.now() - startTime;
      console.log(`[Biometric-Service] Model comparison (${modelName}) completed in ${elapsed}ms:`, response.text?.trim());

      const parsed = JSON.parse(response.text?.trim() || '{}');
      const rawScore = Number(parsed.matchScore || 0);
      const isLive = parsed.isLiveCandidate !== false;
      const isMatch = Boolean(parsed.isMatch) === true && isLive && rawScore >= 70;

      console.log(`[Biometric-Service] 1:1 Match Evaluation: isMatch=${isMatch}, score=${rawScore}, isLive=${isLive}`);

      return {
        isMatch,
        matchScore: isMatch ? rawScore : Math.min(rawScore, 40),
        confidence: parsed.confidence || (isMatch ? 'HIGH' : 'LOW'),
        reason: parsed.reason || (isMatch ? 'Facial identity confirmed.' : 'Verification failed: Biometric face does not match the enrolled owner.')
      };
    } catch (modelErr: any) {
      console.warn(`[Biometric-Service] Comparison error on model ${modelName}:`, modelErr?.message);
    }
  }

  // Deterministic comparison check: only exact identical byte template or verified AI match can pass
  try {
    const enrolledBuf = Buffer.from(enrolled.base64Data, 'base64');
    const candBuf = Buffer.from(candidate.base64Data, 'base64');

    if (enrolledBuf.length >= 2500 && candBuf.length >= 2500) {
      const enrolledHash = crypto.createHash('sha256').update(enrolledBuf).digest('hex');
      const candHash = crypto.createHash('sha256').update(candBuf).digest('hex');

      if (enrolledHash === candHash) {
        console.log('[Biometric-Service] Exact biometric hash matched.');
        return {
          isMatch: true,
          matchScore: 100,
          confidence: 'HIGH',
          reason: 'Biometric image hash matches enrolled template.'
        };
      }
    }
  } catch (compErr) {
    console.warn('[Biometric-Service] Local comparison notice:', compErr);
  }

  return {
    isMatch: false,
    matchScore: 0,
    confidence: 'NONE',
    reason: 'Verification failed: Biometric identity could not be verified. Access denied.'
  };
}

// 3. Send Security Recovery Unlock Code Email
export async function sendUnlockCodeEmail(email: string, unlockCode: string, name: string = 'Reader'): Promise<boolean> {
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
    <div style="text-align:center; color:#D4AF37; font-size:20px; margin-bottom: 8px;">❦ &nbsp; ✤ &nbsp; ❦</div>
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
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
      }
    });
    return true;
  } catch (err) {
    console.error('[Unlock Email Error]:', err);
    return false;
  }
}
