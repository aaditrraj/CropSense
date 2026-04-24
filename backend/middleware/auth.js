/**
 * JWT Authentication Middleware
 * Verifies Bearer token and attaches user to request.
 */

const jwt = require('jsonwebtoken');
const { getUser } = require('../models/User');

const DEV_JWT_SECRET = 'cropsense_dev_secret_change_me';
let warnedAboutDevSecret = false;

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production.');
  }

  if (!warnedAboutDevSecret) {
    console.warn('   Warning: JWT_SECRET is not set. Using a development-only JWT secret.');
    warnedAboutDevSecret = true;
  }

  return DEV_JWT_SECRET;
}

/**
 * Required auth - returns 401 if no valid token.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());

    const User = getUser();
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token. Please log in again.' });
    }
    if (err.message === 'JWT_SECRET is required in production.') {
      return res.status(500).json({ success: false, error: 'Authentication is not configured.' });
    }
    return res.status(500).json({ success: false, error: 'Authentication error.' });
  }
}

/**
 * Optional auth - attaches user if token is present, continues either way.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());

    const User = getUser();
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

/**
 * Generate JWT token.
 */
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = { requireAuth, optionalAuth, generateToken, getJwtSecret };
