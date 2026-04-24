/**
 * Dashboard Routes
 * GET /api/dashboard/stats  — Aggregated stats
 * GET /api/dashboard/charts — Chart data
 */

const express = require('express');
const router = express.Router();
const { getStats, getChartData } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

router.get('/stats', requireAuth, getStats);
router.get('/charts', requireAuth, getChartData);

module.exports = router;
