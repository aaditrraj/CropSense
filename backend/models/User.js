/**
 * User Model
 * Stores user accounts with hashed passwords and Google OAuth support.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isUsingMemory, getMemoryStore } = require('../config/db');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  googleId: {
    type: String,
    default: null,
    sparse: true
  },
  avatar: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model('User', userSchema);

// ─── In-Memory User Adapter ────────────────────────
class MemoryUser {
  static async create(data) {
    const store = getMemoryStore();
    const existing = store.users.find(u => u.email === data.email.toLowerCase());
    if (existing) {
      const err = new Error('Duplicate email');
      err.code = 11000;
      throw err;
    }
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 12) : null;
    const user = {
      _id: store.nextId(),
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      googleId: data.googleId || null,
      avatar: data.avatar || null,
      authProvider: data.authProvider || 'local',
      createdAt: new Date(),
      lastLogin: null
    };
    store.users.push(user);
    // Return without password
    const { password, ...safe } = user;
    return safe;
  }

  static async findOne(query) {
    const store = getMemoryStore();
    let user = null;
    if (query.email) {
      user = store.users.find(u => u.email === query.email.toLowerCase());
    } else if (query._id) {
      user = store.users.find(u => u._id === query._id);
    } else if (query.googleId) {
      user = store.users.find(u => u.googleId === query.googleId);
    }
    // Simulate mongoose select behavior
    return user ? { ...user, comparePassword: async (p) => p && user.password ? bcrypt.compare(p, user.password) : false } : null;
  }

  static async findById(id) {
    const store = getMemoryStore();
    const user = store.users.find(u => u._id === id);
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  }

  static async findByIdAndUpdate(id, update) {
    const store = getMemoryStore();
    const user = store.users.find(u => u._id === id);
    if (!user) return null;
    Object.assign(user, update);
    const { password, ...safe } = user;
    return safe;
  }
}

// Export the right model based on DB status
function getUser() {
  if (isUsingMemory()) return MemoryUser;
  return UserModel;
}

module.exports = { getUser, UserModel, MemoryUser };
