import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/index.js';

import authRoutes from './routes/authRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Krishi Sahayak API Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    db_mode: process.env.DATABASE_URL ? 'PostgreSQL' : 'Embedded High-Performance Engine'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    requested_url: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.',
    timestamp: new Date().toISOString()
  });
});

// Export app for test runner
export default app;

// Start server if not in test or Vercel serverless environment
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  (async () => {
    try {
      console.log('🌱 Initializing Krishi Sahayak Platform database...');
      await initDb();
      app.listen(PORT, () => {
        console.log(`🚀 Krishi Sahayak Server running on http://localhost:${PORT}`);
        console.log(`🌾 Multilingual Agriculture & Village Service Center APIs ready.`);
      });
    } catch (err) {
      console.error('Fatal initialization error:', err);
      process.exit(1);
    }
  })();
}

