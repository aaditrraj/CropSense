/**
 * Prediction Model
 * Stores prediction results with user reference, inputs, and results.
 */

const mongoose = require('mongoose');
const { isUsingMemory, getMemoryStore } = require('../config/db');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Input data
  cropId: { type: String, required: true },
  cropName: { type: String, required: true },
  cropEmoji: { type: String, default: '' },
  location: {
    name: String,
    lat: Number,
    lon: Number,
    country: String,
    state: String
  },
  season: { type: String, required: true },
  soilType: { type: String, required: true },
  area: { type: Number, required: true },

  // Results
  yieldPerHectare: { type: Number, required: true },
  totalYield: { type: Number, required: true },
  compositeScore: { type: Number },
  confidence: { type: Number },
  yieldRating: { type: String },

  // Harvest feedback for real measured accuracy
  actualYieldPerHectare: { type: Number },
  actualTotalYield: { type: Number },
  errorPercent: { type: Number },
  accuracyPercent: { type: Number },
  actualRecordedAt: { type: Date },

  // Weather snapshot
  temperature: { type: Number },
  humidity: { type: Number },
  precipitation: { type: Number },

  // Full result JSON (for export/replay)
  fullResult: { type: mongoose.Schema.Types.Mixed },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for dashboard aggregation queries
predictionSchema.index({ user: 1, createdAt: -1 });

const PredictionModel = mongoose.model('Prediction', predictionSchema);

// ─── In-Memory Prediction Adapter ──────────────────
class MemoryPrediction {
  static async create(data) {
    const store = getMemoryStore();
    const prediction = {
      _id: store.nextId(),
      ...data,
      createdAt: new Date()
    };
    store.predictions.push(prediction);
    return prediction;
  }

  static async find(query) {
    const store = getMemoryStore();
    let results = store.predictions;

    if (query.user) {
      results = results.filter(p => p.user === query.user);
    }

    // Return a chainable object
    return new MemoryQuery(results);
  }

  static async findById(id) {
    const store = getMemoryStore();
    return store.predictions.find(p => p._id === id) || null;
  }

  static async findOne(query) {
    const store = getMemoryStore();
    let results = store.predictions;
    if (query.user) results = results.filter(p => p.user === query.user);
    if (query._id) results = results.filter(p => p._id === query._id);
    return results[0] || null;
  }

  static async deleteOne(query) {
    const store = getMemoryStore();
    const idx = store.predictions.findIndex(p => {
      if (query._id && query.user) return p._id === query._id && p.user === query.user;
      if (query._id) return p._id === query._id;
      return false;
    });
    if (idx > -1) {
      store.predictions.splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  static async deleteMany(query) {
    const store = getMemoryStore();
    const before = store.predictions.length;
    store.predictions = store.predictions.filter(p => p.user !== query.user);
    return { deletedCount: before - store.predictions.length };
  }

  static async countDocuments(query) {
    const store = getMemoryStore();
    if (query.user) return store.predictions.filter(p => p.user === query.user).length;
    return store.predictions.length;
  }

  static async aggregate(pipeline) {
    // Simplified aggregation for dashboard stats
    const store = getMemoryStore();
    return store.predictions;
  }
}

// Chainable query helper for in-memory
class MemoryQuery {
  constructor(data) { this._data = [...data]; }
  sort(field) {
    if (typeof field === 'string' && field.startsWith('-')) {
      const key = field.substring(1);
      this._data.sort((a, b) => new Date(b[key]) - new Date(a[key]));
    } else if (typeof field === 'object') {
      const key = Object.keys(field)[0];
      const order = field[key];
      this._data.sort((a, b) => order === -1 ? new Date(b[key]) - new Date(a[key]) : new Date(a[key]) - new Date(b[key]));
    }
    return this;
  }
  limit(n) { this._data = this._data.slice(0, n); return this; }
  skip(n) { this._data = this._data.slice(n); return this; }
  select(fields) { return this; }
  lean() { return this; }
  async exec() { return this._data; }
  then(resolve, reject) { resolve(this._data); }
}

function getPrediction() {
  if (isUsingMemory()) return MemoryPrediction;
  return PredictionModel;
}

module.exports = { getPrediction, PredictionModel, MemoryPrediction };
