/**
 * History Routes
 * GET    /api/history     — Get prediction history (paginated)
 * POST   /api/history     — Save a prediction
 * DELETE /api/history/:id — Delete one prediction
 * DELETE /api/history     — Clear all history
 */

const express = require('express');
const router = express.Router();
const { getHistory, savePrediction, deletePrediction, clearHistory } = require('../controllers/historyController');
const { requireAuth } = require('../middleware/auth');

// All history routes require authentication
router.get('/', requireAuth, getHistory);
router.post('/', requireAuth, savePrediction);
router.delete('/all', requireAuth, clearHistory);
router.delete('/:id', requireAuth, deletePrediction);

module.exports = router;
