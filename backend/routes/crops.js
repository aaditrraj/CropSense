/**
 * Crop & Price Routes
 * GET /api/crops  — All crops with metadata
 * GET /api/prices — Market prices
 */

const express = require('express');
const router = express.Router();
const { crops, soilTypes, seasons } = require('../../data/crops');
const { cropPrices } = require('../../data/prices');

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

module.exports = router;
