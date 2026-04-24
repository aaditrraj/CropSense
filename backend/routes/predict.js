/**
 * Predict Routes
 * POST /api/predict    - Single crop prediction
 * POST /api/compare    - Multi-crop comparison
 * POST /api/best-crop  - Best-fit crop finder
 */

const express = require('express');
const router = express.Router();
const { predict, compare, bestCrop } = require('../controllers/predictController');
const { optionalAuth } = require('../middleware/auth');
const {
  predictRules,
  compareRules,
  bestCropRules,
  handleValidationErrors
} = require('../middleware/validate');

// Prediction routes use optional auth, so guests can try the app and logged-in
// users can have predictions saved automatically.
router.post('/predict', predictRules, handleValidationErrors, optionalAuth, predict);
router.post('/compare', compareRules, handleValidationErrors, optionalAuth, compare);
router.post('/best-crop', bestCropRules, handleValidationErrors, optionalAuth, bestCrop);

module.exports = router;
