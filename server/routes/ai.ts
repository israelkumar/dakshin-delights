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
  } catch (err: any) {
    console.error('Image generation error:', err);
    res.status(500).json({ error: err.message || 'Image generation failed' });
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
  } catch (err: any) {
    console.error('Video generation error:', err);
    res.status(500).json({ error: err.message || 'Video generation failed' });
  }
});

router.post('/live-token', liveTokenLimiter, (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    return;
  }
  // Return the key for WebSocket-based Live API usage (server-side proxy for WS is complex)
  // In production, use a short-lived token or session-based proxy
  res.json({ apiKey });
});

export default router;
