import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import storeRoutes from './routes/stores.js';
import adminRoutes from './routes/admin.js';
import storeOwnerRoutes from './routes/storeOwner.js';

dotenv.config();

// Initialize Database & Seed
initDb();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/store-owner', storeOwnerRoutes);

const apiWelcomeHandler = (req, res) => {
  res.json({
    status: 'online',
    message: 'VerifiedReviews Backend REST API is running!',
    frontendUrl: 'http://localhost:5175',
    instructions: 'Open http://localhost:5175 in your browser to use the full React Web Application UI.',
    endpoints: {
      health: '/api/health',
      stores: '/api/stores',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me',
        updatePassword: 'PUT /api/auth/update-password'
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard',
        users: 'GET /api/admin/users',
        createStore: 'POST /api/admin/stores',
        createUser: 'POST /api/admin/users'
      },
      storeOwner: {
        dashboard: 'GET /api/store-owner/dashboard'
      }
    }
  });
};

app.get('/', apiWelcomeHandler);
app.get('/api', apiWelcomeHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VerifiedReviews API',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`🚀 VerifiedReviews Backend Server running on http://localhost:${PORT}`);
});
