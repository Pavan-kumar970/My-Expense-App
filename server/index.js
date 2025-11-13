import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import billRoutes from './routes/billRoutes.js';

const app = express();

// CORS: allow Angular dev (http://localhost:4200) and permissive in development
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [undefined, null, 'http://localhost:4200'];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    // Allow any origin in dev
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/bills', billRoutes);

export default app;

// Only start server if run directly, not when imported by tests
if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  const PORT = process.env.PORT || 5000;
  (async () => {
    try {
      await connectDB();
      app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
    } catch (err) {
      console.error('Failed to start server', err);
      process.exit(1);
    }
  })();
}
