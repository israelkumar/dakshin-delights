import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiters scoped by session cookie to prevent API cost abuse
const imageLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  limit: 10,        // 10 image generations per minute
  keyGenerator: (req) => req.cookies?.session_id || req.ip,
  message: { error: 'Too many image generation requests. Please wait a moment.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const videoLimiter = rateLimit({
  windowMs: 60_000,
  limit: 3,         // 3 video animations per minute (they take minutes to complete)
  keyGenerator: (req) => req.cookies?.session_id || req.ip,
  message: { error: 'Too many video generation requests. Please wait a moment.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const liveTokenLimiter = rateLimit({
  windowMs: 60_000,
  limit: 2,         // 2 live session tokens per minute
  keyGenerator: (req) => req.cookies?.session_id || req.ip,
  message: { error: 'Too many voice session requests. Please wait a moment.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// INTERIM FIX: Track active live sessions per session_id
// TODO: Replace with full WebSocket proxy (see Phase 2 implementation)
const activeLiveSessions = new Map<string, { issuedAt: number }>();
const LIVE_SESSION_COOLDOWN_MS = 60_000; // 1 minute between token requests

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenAI({ apiKey });
}

router.post('/generate-image', imageLimiter, async (req: Request, res: Response) => {
  try {
    const { prompt, size = '1K' } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'prompt is required' });
      return;
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: size,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        res.json({ image: `data:image/png;base64,${part.inlineData.data}` });
        return;
      }
    }

    res.status(500).json({ error: 'No image generated' });
  } catch (err: unknown) {
    console.error('Image generation error:', err);
    const message = err instanceof Error ? err.message : 'Image generation failed';
    res.status(500).json({ error: message });
  }
});

router.post('/animate-image', videoLimiter, async (req: Request, res: Response) => {
  try {
    const { imageBase64, prompt, isPortrait = false } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'imageBase64 is required' });
      return;
    }

    const ai = getAiClient();

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Animate this dish in a cinematic slow-motion pan with steam rising',
      image: {
        imageBytes: imageBase64.split(',')[1],
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: isPortrait ? '9:16' : '16:9',
      },
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      res.status(500).json({ error: 'Video generation failed' });
      return;
    }

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.GEMINI_API_KEY}`);
    const buffer = await videoResponse.arrayBuffer();
    res.set('Content-Type', 'video/mp4');
    res.send(Buffer.from(buffer));
  } catch (err: unknown) {
    console.error('Video generation error:', err);
    const message = err instanceof Error ? err.message : 'Video generation failed';
    res.status(500).json({ error: message });
  }
});

// DEPRECATED: This endpoint is kept for backward compatibility but should not be used.
// Use the WebSocket proxy at ws://localhost:3001/api/live-ws instead.
// This endpoint still exposes the API key to clients (security risk).
router.post('/live-token', liveTokenLimiter, (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    return;
  }

  const sessionId = req.cookies.session_id;
  if (!sessionId) {
    res.status(401).json({ error: 'Session required' });
    return;
  }

  // INTERIM FIX: Rate limit per session (in addition to express-rate-limit)
  const existing = activeLiveSessions.get(sessionId);
  if (existing && Date.now() - existing.issuedAt < LIVE_SESSION_COOLDOWN_MS) {
    res.status(429).json({ error: 'Please wait before starting a new voice session' });
    return;
  }

  activeLiveSessions.set(sessionId, { issuedAt: Date.now() });

  // Clean up old entries periodically
  if (activeLiveSessions.size > 1000) {
    const now = Date.now();
    for (const [key, val] of activeLiveSessions) {
      if (now - val.issuedAt > LIVE_SESSION_COOLDOWN_MS * 5) {
        activeLiveSessions.delete(key);
      }
    }
  }

  // SECURITY WARNING: This endpoint still exposes the full API key to the client.
  // This is an INTERIM fix with enhanced rate limiting. For production, implement
  // a WebSocket proxy that keeps the key on the server (see Phase 2).
  res.json({ apiKey });
});

export default router;
