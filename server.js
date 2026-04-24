/**
 * CropSense - Agricultural Intelligence Portal
 * Express backend with MVC architecture, JWT auth, and MongoDB.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./backend/config/db');

// Route imports
const authRoutes = require('./backend/routes/auth');
const predictRoutes = require('./backend/routes/predict');
const historyRoutes = require('./backend/routes/history');
const dashboardRoutes = require('./backend/routes/dashboard');
const cropRoutes = require('./backend/routes/crops');
const weatherRoutes = require('./backend/routes/weather');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Basic security headers without adding extra dependencies.
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self)');
  next();
});

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', predictRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', cropRoutes);
app.use('/api', weatherRoutes);

// Config endpoint (serves Google Client ID to frontend)
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    data: {
      googleClientId: process.env.GOOGLE_CLIENT_ID || null
    }
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found.' });
});

app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, error: 'Origin is not allowed.' });
  }
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// Catch-all: Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function start() {
  // Connect to database (falls back to in-memory if MongoDB unavailable)
  await connectDB();

  app.listen(PORT, () => {
    console.log('\nCropSense - Agricultural Intelligence Portal');
    console.log(`   Server running at http://localhost:${PORT}`);
    console.log('\n   API Endpoints:');
    console.log('     Auth:');
    console.log('       POST /api/auth/signup');
    console.log('       POST /api/auth/login');
    console.log('       GET  /api/auth/me');
    console.log('     Prediction:');
    console.log('       POST /api/predict');
    console.log('       POST /api/compare');
    console.log('       POST /api/best-crop');
    console.log('     History:');
    console.log('       GET    /api/history');
    console.log('       POST   /api/history');
    console.log('       DELETE /api/history/:id');
    console.log('       DELETE /api/history/all');
    console.log('     Dashboard:');
    console.log('       GET /api/dashboard/stats');
    console.log('       GET /api/dashboard/charts');
    console.log('     Data:');
    console.log('       GET /api/crops');
    console.log('       GET /api/prices');
    console.log('       GET /api/geocode?city=...');
    console.log('       GET /api/weather?lat=...&lon=...');
    console.log('\n   Ready to predict.\n');
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
