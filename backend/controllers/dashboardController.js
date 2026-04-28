/**
 * Dashboard Controller
 * Aggregated statistics and chart data for user dashboard.
 */

const { getPrediction } = require('../models/Prediction');
const { isUsingMemory } = require('../config/db');

/**
 * GET /api/dashboard/stats
 * Returns aggregated stats for the current user
 */
async function getStats(req, res) {
  try {
    const Prediction = getPrediction();
    const userId = req.user._id || req.user.id;

    if (isUsingMemory()) {
      // In-memory aggregation
      const { getMemoryStore } = require('../config/db');
      const store = getMemoryStore();
      const userPredictions = store.predictions.filter(p => p.user === userId);

      const total = userPredictions.length;
      if (total === 0) {
        return res.json({
          success: true,
          data: {
            totalPredictions: 0,
            avgConfidence: 0,
            avgAccuracy: null,
            measuredPredictions: 0,
            avgYield: 0,
            topCrop: null,
            topRating: null,
            lastPrediction: null,
            ratingDistribution: {},
            cropDistribution: {}
          }
        });
      }

      const avgConfidence = userPredictions.reduce((s, p) => s + (p.confidence || 0), 0) / total;
      const avgYield = userPredictions.reduce((s, p) => s + (p.yieldPerHectare || 0), 0) / total;
      const measured = userPredictions.filter(p => Number.isFinite(p.accuracyPercent));
      const avgAccuracy = measured.length
        ? measured.reduce((s, p) => s + p.accuracyPercent, 0) / measured.length
        : null;

      // Most common crop
      const cropCounts = {};
      userPredictions.forEach(p => { cropCounts[p.cropName] = (cropCounts[p.cropName] || 0) + 1; });
      const topCrop = Object.entries(cropCounts).sort((a, b) => b[1] - a[1])[0];

      // Rating distribution
      const ratingDist = {};
      userPredictions.forEach(p => { ratingDist[p.yieldRating || 'Unknown'] = (ratingDist[p.yieldRating || 'Unknown'] || 0) + 1; });

      // Last prediction
      const sorted = [...userPredictions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.json({
        success: true,
        data: {
          totalPredictions: total,
          avgConfidence: Math.round(avgConfidence * 10) / 10,
          avgAccuracy: avgAccuracy === null ? null : Math.round(avgAccuracy * 10) / 10,
          measuredPredictions: measured.length,
          avgYield: Math.round(avgYield * 100) / 100,
          topCrop: topCrop ? { name: topCrop[0], count: topCrop[1] } : null,
          topRating: Object.entries(ratingDist).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
          lastPrediction: sorted[0]?.createdAt || null,
          ratingDistribution: ratingDist,
          cropDistribution: cropCounts
        }
      });
    }

    // MongoDB aggregation
    const [stats] = await Prediction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalPredictions: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          avgAccuracy: { $avg: '$accuracyPercent' },
          avgYield: { $avg: '$yieldPerHectare' },
          lastPrediction: { $max: '$createdAt' }
        }
      }
    ]);

    // Top crop
    const topCropAgg = await Prediction.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$cropName', count: { $sum: 1 }, emoji: { $first: '$cropEmoji' } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    // Rating distribution
    const ratingAgg = await Prediction.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$yieldRating', count: { $sum: 1 } } }
    ]);

    // Crop distribution
    const cropAgg = await Prediction.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$cropName', count: { $sum: 1 }, emoji: { $first: '$cropEmoji' } } },
      { $sort: { count: -1 } }
    ]);

    const ratingDist = {};
    ratingAgg.forEach(r => { ratingDist[r._id] = r.count; });

    const cropDist = {};
    cropAgg.forEach(c => { cropDist[c._id] = c.count; });

    res.json({
      success: true,
      data: {
        totalPredictions: stats?.totalPredictions || 0,
        avgConfidence: Math.round((stats?.avgConfidence || 0) * 10) / 10,
        avgAccuracy: stats?.avgAccuracy == null ? null : Math.round(stats.avgAccuracy * 10) / 10,
        measuredPredictions: await Prediction.countDocuments({ user: req.user._id, accuracyPercent: { $exists: true } }),
        avgYield: Math.round((stats?.avgYield || 0) * 100) / 100,
        topCrop: topCropAgg[0] ? { name: topCropAgg[0]._id, count: topCropAgg[0].count, emoji: topCropAgg[0].emoji } : null,
        topRating: Object.entries(ratingDist).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
        lastPrediction: stats?.lastPrediction || null,
        ratingDistribution: ratingDist,
        cropDistribution: cropDist
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to load dashboard stats.' });
  }
}

/**
 * GET /api/dashboard/charts
 * Returns time-series and distribution data for charts
 */
async function getChartData(req, res) {
  try {
    const Prediction = getPrediction();
    const userId = req.user._id || req.user.id;

    if (isUsingMemory()) {
      const { getMemoryStore } = require('../config/db');
      const store = getMemoryStore();
      const userPredictions = store.predictions
        .filter(p => p.user === userId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      // Predictions over time (group by date)
      const timeData = {};
      userPredictions.forEach(p => {
        const date = new Date(p.createdAt).toISOString().split('T')[0];
        timeData[date] = (timeData[date] || 0) + 1;
      });

      // Yield by crop
      const yieldByCrop = {};
      userPredictions.forEach(p => {
        if (!yieldByCrop[p.cropName]) yieldByCrop[p.cropName] = { total: 0, count: 0, emoji: p.cropEmoji };
        yieldByCrop[p.cropName].total += p.yieldPerHectare || 0;
        yieldByCrop[p.cropName].count += 1;
      });

      // Confidence over time
      const confidenceData = userPredictions.map(p => ({
        date: p.createdAt,
        confidence: p.confidence,
        crop: p.cropName
      }));

      return res.json({
        success: true,
        data: {
          predictionsOverTime: Object.entries(timeData).map(([date, count]) => ({ date, count })),
          yieldByCrop: Object.entries(yieldByCrop).map(([name, d]) => ({
            crop: name, emoji: d.emoji, avgYield: Math.round((d.total / d.count) * 100) / 100, count: d.count
          })),
          confidenceOverTime: confidenceData,
          recentPredictions: userPredictions.slice(-10).reverse()
        }
      });
    }

    // MongoDB queries
    const timeAgg = await Prediction.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const yieldAgg = await Prediction.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$cropName', avgYield: { $avg: '$yieldPerHectare' }, count: { $sum: 1 }, emoji: { $first: '$cropEmoji' } } },
      { $sort: { count: -1 } }
    ]);

    const recentPredictions = await Prediction.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(10)
      .lean();

    const confidenceAgg = await Prediction.find({ user: req.user._id })
      .sort('createdAt')
      .select('createdAt confidence cropName')
      .lean();

    res.json({
      success: true,
      data: {
        predictionsOverTime: timeAgg.map(t => ({ date: t._id, count: t.count })),
        yieldByCrop: yieldAgg.map(y => ({
          crop: y._id, emoji: y.emoji, avgYield: Math.round(y.avgYield * 100) / 100, count: y.count
        })),
        confidenceOverTime: confidenceAgg.map(c => ({ date: c.createdAt, confidence: c.confidence, crop: c.cropName })),
        recentPredictions
      }
    });
  } catch (err) {
    console.error('Dashboard charts error:', err);
    res.status(500).json({ success: false, error: 'Failed to load chart data.' });
  }
}

module.exports = { getStats, getChartData };
