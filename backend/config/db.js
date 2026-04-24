/**
 * Database Configuration
 * Connects to MongoDB with graceful fallback to in-memory storage.
 */

// Fix Node.js v24 c-ares DNS issues on certain networks.
// The MongoDB driver's replica-set monitor relies on c-ares DNS
// (dns.resolve4 / dns.resolveSrv), which can fail with ECONNREFUSED.
// We patch those methods to fall back to the OS resolver (dns.lookup).
const dns = require('dns');

const _origResolve4 = dns.resolve4.bind(dns);
dns.resolve4 = function (hostname, options, callback) {
  if (typeof options === 'function') { callback = options; options = {}; }
  _origResolve4(hostname, options, (err, addresses) => {
    if (!err) return callback(null, addresses);
    dns.lookup(hostname, { family: 4, all: true }, (err2, results) => {
      if (err2) return callback(err);
      const mapped = results.map(r =>
        options && options.ttl ? { address: r.address, ttl: 300 } : r.address
      );
      callback(null, mapped);
    });
  });
};

const _origResolve = dns.resolve.bind(dns);
dns.resolve = function (hostname, rrtype, callback) {
  if (typeof rrtype === 'function') { callback = rrtype; rrtype = 'A'; }
  _origResolve(hostname, rrtype, (err, records) => {
    if (!err) return callback(null, records);
    if (rrtype === 'A' || rrtype === 'AAAA') {
      const family = rrtype === 'A' ? 4 : 6;
      dns.lookup(hostname, { family, all: true }, (err2, results) => {
        if (err2) return callback(err);
        callback(null, results.map(r => r.address));
      });
    } else {
      callback(err);
    }
  });
};

const mongoose = require('mongoose');

let isConnected = false;
let useInMemory = false;

// In-memory stores (fallback when MongoDB is unavailable)
const memoryStore = {
  users: [],
  predictions: [],
  _idCounter: 1,
  nextId() { return String(this._idCounter++); }
};

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cropsense';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    isConnected = true;
    console.log('   MongoDB connected successfully');
    return true;
  } catch (err) {
    console.warn('   MongoDB connection failed:', err.message);
    console.warn('   Using in-memory storage (data will not persist across restarts)');
    useInMemory = true;
    return false;
  }
}

function isUsingMemory() {
  return useInMemory;
}

function getMemoryStore() {
  return memoryStore;
}

module.exports = { connectDB, isUsingMemory, getMemoryStore };
