/**
 * Crop & Price Routes
 * GET /api/crops  — All crops with metadata
 * GET /api/prices — Market prices
 */

const express = require('express');
const router = express.Router();
const { crops, soilTypes, seasons } = require('../../data/crops');
const { cropPrices } = require('../../data/prices');
const { fetchLiveMarketPrice } = require('../../services/marketPriceService');

router.get('/crops', (req, res) => {
  res.json({
    success: true,
    data: {
      crops: crops.map(c => ({
        id: c.id, name: c.name, emoji: c.emoji, baseYield: c.baseYield,
        optimalTempMin: c.optimalTempMin, optimalTempMax: c.optimalTempMax,
        waterNeedMin: c.waterNeedMin, waterNeedMax: c.waterNeedMax,
        preferredSeasons: c.preferredSeasons, compatibleSoils: c.compatibleSoils,
        growthDuration: c.growthDuration, description: c.description,
        cropCoefficient: c.cropCoefficient, irrigationMethod: c.irrigationMethod,
        diseases: c.diseases
      })),
      soilTypes,
      seasons
    }
  });
});

router.get('/prices', (req, res) => {
  res.json({ success: true, data: cropPrices });
});

router.get('/prices/live', async (req, res) => {
  try {
    const { cropId, state, market } = req.query;
    if (!cropId) {
      return res.status(400).json({ success: false, error: 'cropId is required.' });
    }

    const price = await fetchLiveMarketPrice({ cropId, state, market });
    res.json({ success: true, data: price });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch market price.' });
  }
});

module.exports = router;
