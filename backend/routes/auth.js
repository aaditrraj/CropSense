/**
 * Auth Routes
 * POST /api/auth/signup  - Register
 * POST /api/auth/login   - Login
 * POST /api/auth/google  - Google Sign-In
 * GET  /api/auth/me      - Get profile (protected)
 */

const express = require('express');
const router = express.Router();
const { signup, login, googleAuth, getProfile } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const {
  signupRules,
  loginRules,
  googleAuthRules,
  handleValidationErrors
} = require('../middleware/validate');

const authWindowMs = 15 * 60 * 1000;
const authMaxRequests = Number(process.env.AUTH_RATE_LIMIT || 20);
const authAttempts = new Map();

function authRateLimit(req, res, next) {
  const key = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const record = authAttempts.get(key) || { count: 0, resetAt: now + authWindowMs };

  if (record.resetAt <= now) {
    record.count = 0;
    record.resetAt = now + authWindowMs;
  }

  record.count += 1;
  authAttempts.set(key, record);

  if (record.count > authMaxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Too many auth attempts. Please wait a few minutes and try again.'
    });
  }

  next();
}

router.post('/signup', authRateLimit, signupRules, handleValidationErrors, signup);
router.post('/login', authRateLimit, loginRules, handleValidationErrors, login);
router.post('/google', authRateLimit, googleAuthRules, handleValidationErrors, googleAuth);
router.get('/me', requireAuth, getProfile);

module.exports = router;
