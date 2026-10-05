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

// Enhanced CORS configuration for localhost, vercel deployments, and custom domains
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all requests (including mobile apps, localhost, vercel preview & prod domains)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
const healthHandler = (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Krishi Sahayak API Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    db_mode: process.env.DATABASE_URL ? 'PostgreSQL' : 'Embedded High-Performance Engine'
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Route mappings mounted with both /api and root prefixes for compatibility with all Vercel proxy rewrite modes
const routes = [
  ['/auth', authRoutes],
  ['/farms', farmRoutes],
  ['/issues', issueRoutes],
  ['/services', serviceRoutes],
  ['/schemes', schemeRoutes],
  ['/market', marketRoutes],
  ['/weather', weatherRoutes],
  ['/finances', financeRoutes],
  ['/admin', adminRoutes]
];

routes.forEach(([pathPrefix, router]) => {
  app.use(`/api${pathPrefix}`, router);
  app.use(pathPrefix, router);
});


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

// Start server only when executed directly and not in test or Vercel serverless environment
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('index'));
if (isDirectRun && process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
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


