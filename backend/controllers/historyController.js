/**
 * History Controller
 * CRUD operations for prediction history.
 */

const { getPrediction } = require('../models/Prediction');

/**
 * GET /api/history
 * Get paginated prediction history for current user
 */
async function getHistory(req, res) {
  try {
    const Prediction = getPrediction();
    const userId = req.user._id || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Prediction.countDocuments({ user: userId });
    const predictions = await Prediction.find({ user: userId })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    // Handle both mongoose query and in-memory array
    const results = predictions.exec ? await predictions.exec() : await predictions;

    res.json({
      success: true,
      data: {
        predictions: results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch prediction history.' });
  }
}

/**
 * POST /api/history
 * Manually save a prediction to history
 */
async function savePrediction(req, res) {
  try {
    const Prediction = getPrediction();
    const userId = req.user._id || req.user.id;

    const {
      cropId, cropName, cropEmoji, location, season, soilType, area,
      yieldPerHectare, totalYield, compositeScore, confidence, yieldRating,
      temperature, humidity, precipitation, fullResult
    } = req.body;

    if (!cropId || !cropName || !yieldPerHectare) {
      return res.status(400).json({ success: false, error: 'Missing required prediction data.' });
    }

    const prediction = await Prediction.create({
      user: userId,
      cropId,
      cropName,
      cropEmoji: cropEmoji || '',
      location: location || {},
      season: season || '',
      soilType: soilType || '',
      area: area || 0,
      yieldPerHectare,
      totalYield: totalYield || 0,
      compositeScore: compositeScore || 0,
      confidence: confidence || 0,
      yieldRating: yieldRating || 'Unknown',
      temperature: temperature || 0,
      humidity: humidity || 0,
      precipitation: precipitation || 0,
      fullResult: fullResult || {}
    });

    res.status(201).json({ success: true, data: prediction });
  } catch (err) {
    console.error('Save prediction error:', err);
    res.status(500).json({ success: false, error: 'Failed to save prediction.' });
  }
}

/**
 * DELETE /api/history/:id
 * Delete a specific prediction
 */
async function deletePrediction(req, res) {
  try {
    const Prediction = getPrediction();
    const userId = req.user._id || req.user.id;

    const result = await Prediction.deleteOne({ _id: req.params.id, user: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Prediction not found.' });
    }

    res.json({ success: true, message: 'Prediction deleted.' });
  } catch (err) {
    console.error('Delete prediction error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete prediction.' });
  }
}

/**
 * PATCH /api/history/:id/actual
 * Store actual harvested yield and calculate measured prediction accuracy.
 */
async function updateActualYield(req, res) {
  try {
    const Prediction = getPrediction();
    const userId = req.user._id || req.user.id;
    const actualTotalYield = Number(req.body.actualTotalYield);

    if (!Number.isFinite(actualTotalYield) || actualTotalYield <= 0) {
      return res.status(400).json({ success: false, error: 'Actual total yield must be a positive number.' });
    }

    const prediction = await Prediction.findOne({ _id: req.params.id, user: userId });
    if (!prediction) {
      return res.status(404).json({ success: false, error: 'Prediction not found.' });
    }

    const predictedTotal = Number(prediction.totalYield) || 0;
    if (predictedTotal <= 0) {
      return res.status(400).json({ success: false, error: 'Prediction has no valid predicted yield.' });
    }

    const area = Number(prediction.area) || 1;
    const errorPercent = Math.abs(actualTotalYield - predictedTotal) / predictedTotal * 100;
    const accuracyPercent = Math.max(0, 100 - errorPercent);

    prediction.actualTotalYield = Math.round(actualTotalYield * 100) / 100;
    prediction.actualYieldPerHectare = Math.round((actualTotalYield / area) * 100) / 100;
    prediction.errorPercent = Math.round(errorPercent * 10) / 10;
    prediction.accuracyPercent = Math.round(accuracyPercent * 10) / 10;
    prediction.actualRecordedAt = new Date();

    if (typeof prediction.save === 'function') {
      await prediction.save();
    }

    res.json({ success: true, data: prediction });
  } catch (err) {
    console.error('Update actual yield error:', err);
    res.status(500).json({ success: false, error: 'Failed to update actual yield.' });
  }
}

/**
 * DELETE /api/history
 * Clear all prediction history for current user
 */
async function clearHistory(req, res) {
  try {
    const Prediction = getPrediction();
    const userId = req.user._id || req.user.id;

    const result = await Prediction.deleteMany({ user: userId });

    res.json({ success: true, message: `Deleted ${result.deletedCount} predictions.` });
  } catch (err) {
    console.error('Clear history error:', err);
    res.status(500).json({ success: false, error: 'Failed to clear history.' });
  }
}

module.exports = { getHistory, savePrediction, deletePrediction, updateActualYield, clearHistory };
