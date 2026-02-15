import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import menuRoutes from './routes/menu';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import aiRoutes from './routes/ai';

const app = express();
const PORT = 3001;

// Create HTTP server (needed for WebSocket upgrade)
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Session ID middleware — auto-generate if missing
app.use((req, res, next) => {
  if (!req.cookies.session_id) {
    const sessionId = uuidv4();
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    });
    req.cookies.session_id = sessionId;
  }
  next();
});

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

// WebSocket Server for Gemini Live API Proxy
// This keeps the API key on the server and proxies audio data between client and Gemini
const wss = new WebSocketServer({ server: httpServer, path: '/api/live-ws' });

wss.on('connection', async (clientWs: WebSocket, req) => {
  console.log('Client connected to live WebSocket proxy');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    clientWs.send(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }));
    clientWs.close();
    return;
  }

  try {
    // Create Gemini AI client on server side (API key never leaves server)
    const ai = new GoogleGenAI({ apiKey });

    // Connect to Gemini Live API
    const geminiSession = await ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    });

    // Forward messages from client to Gemini
    clientWs.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        // Forward all messages from client to Gemini
        if (geminiSession) {
          geminiSession.send(message);
        }
      } catch (err) {
        console.error('Error forwarding client message to Gemini:', err);
      }
    });

    // Forward messages from Gemini to client
    geminiSession.on('message', (msg: any) => {
      try {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify(msg));
        }
      } catch (err) {
        console.error('Error forwarding Gemini message to client:', err);
      }
    });

    // Handle errors
    geminiSession.on('error', (err: Error) => {
      console.error('Gemini session error:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: 'Gemini session error' }));
      }
    });

    // Cleanup on client disconnect
    clientWs.on('close', () => {
      console.log('Client disconnected, closing Gemini session');
      try {
        geminiSession.close();
      } catch (err) {
        console.error('Error closing Gemini session:', err);
      }
    });

    // Cleanup on Gemini disconnect
    geminiSession.on('close', () => {
      console.log('Gemini session closed');
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close();
      }
    });

  } catch (err) {
    console.error('Failed to establish Gemini Live connection:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: 'Failed to connect to Gemini Live API' }));
      clientWs.close();
    }
  }
});

httpServer.listen(PORT, () => {
  console.log(`Dakshin Delights API running on http://localhost:${PORT}`);
  console.log(`WebSocket proxy available at ws://localhost:${PORT}/api/live-ws`);
});
