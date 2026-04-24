/**
 * Auth Controller
 * Handles user signup, login, verified Google Sign-In, and profile retrieval.
 */

const fetch = require('node-fetch');
const { getUser } = require('../models/User');
const { generateToken } = require('../middleware/auth');

const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

function safeUser(user, fallback = {}) {
  return {
    id: user._id || user.id,
    name: user.name || fallback.name,
    email: user.email || fallback.email,
    avatar: user.avatar || fallback.avatar || null,
    authProvider: user.authProvider || fallback.authProvider || 'local',
    createdAt: user.createdAt,
    lastLogin: user.lastLogin || null
  };
}

async function verifyGoogleCredential(credential) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    const err = new Error('Google Sign-In is not configured. Add GOOGLE_CLIENT_ID to your .env file.');
    err.statusCode = 500;
    throw err;
  }

  const params = new URLSearchParams({ id_token: credential });
  const response = await fetch(`${GOOGLE_TOKENINFO_URL}?${params.toString()}`);
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload) {
    const err = new Error('Google could not verify this sign-in. Please try again.');
    err.statusCode = 401;
    throw err;
  }

  if (payload.aud !== googleClientId) {
    const err = new Error('Google credential was issued for a different app.');
    err.statusCode = 401;
    throw err;
  }

  if (payload.email_verified !== 'true' && payload.email_verified !== true) {
    const err = new Error('Please use a verified Google account email.');
    err.statusCode = 401;
    throw err;
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture
  };
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    const User = getUser();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, authProvider: 'local' });
    const token = generateToken(user._id || user.id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: safeUser(user, { name, email: email.toLowerCase(), authProvider: 'local' })
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: 'Failed to create account. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const User = getUser();

    let user;
    try {
      const query = User.findOne({ email: email.toLowerCase() });
      user = query.select ? await query.select('+password') : await query;
    } catch (e) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({
        success: false,
        error: 'This account uses Google Sign-In. Please use the Continue with Google button.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const userId = user._id || user.id;
    try {
      if (User.findByIdAndUpdate) {
        const updated = await User.findByIdAndUpdate(userId, { lastLogin: new Date() }, { new: true });
        if (updated) user = updated;
      }
    } catch (e) {
      user.lastLogin = new Date();
    }

    const token = generateToken(userId);

    res.json({
      success: true,
      data: {
        token,
        user: safeUser(user)
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
}

async function googleAuth(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, error: 'Google credential is required.' });
    }

    const { googleId, email, name, picture } = await verifyGoogleCredential(credential);

    if (!email || !googleId) {
      return res.status(400).json({ success: false, error: 'Invalid Google account data.' });
    }

    const User = getUser();
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        const userId = user._id || user.id;
        if (User.findByIdAndUpdate) {
          user = await User.findByIdAndUpdate(userId, {
            googleId,
            avatar: picture || user.avatar,
            authProvider: user.authProvider === 'local' ? 'local' : 'google',
            lastLogin: new Date()
          }, { new: true });
        }
      } else {
        user = await User.create({
          name: name || 'Google User',
          email: email.toLowerCase(),
          googleId,
          avatar: picture || null,
          authProvider: 'google'
        });
      }
    } else {
      const userId = user._id || user.id;
      try {
        if (User.findByIdAndUpdate) {
          const updated = await User.findByIdAndUpdate(userId, {
            lastLogin: new Date(),
            avatar: picture || user.avatar
          }, { new: true });
          if (updated) user = updated;
        }
      } catch (e) {
        user.lastLogin = new Date();
      }
    }

    const token = generateToken(user._id || user.id);

    res.json({
      success: true,
      data: {
        token,
        user: safeUser(user, { name, email, avatar: picture, authProvider: 'google' })
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || 'Google authentication failed. Please try again.'
    });
  }
}

async function getProfile(req, res) {
  try {
    res.json({
      success: true,
      data: {
        user: safeUser(req.user)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile.' });
  }
}

module.exports = { signup, login, googleAuth, getProfile };
