import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import menuRoutes from './routes/menu';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import aiRoutes from './routes/ai';

const app = express();
const PORT = 3001;

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

app.listen(PORT, () => {
  console.log(`Dakshin Delights API running on http://localhost:${PORT}`);
});
