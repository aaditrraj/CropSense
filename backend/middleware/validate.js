/**
 * Request Validation Middleware
 * Uses express-validator for API input validation.
 */

const { body, validationResult } = require('express-validator');

const validCoordinate = {
  lat: { min: -90, max: 90 },
  lon: { min: -180, max: 180 }
};

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(400).json({
      success: false,
      error: messages.join('. '),
      errors: errors.array()
    });
  }
  next();
}

const nameRule = body('name')
  .trim()
  .notEmpty().withMessage('Name is required')
  .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters');

const emailRule = body('email')
  .trim()
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Please provide a valid email')
  .normalizeEmail();

const passwordRule = body('password')
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters');

const latRule = body('lat')
  .exists().withMessage('Latitude is required')
  .isFloat(validCoordinate.lat).withMessage('Invalid latitude')
  .toFloat();

const lonRule = body('lon')
  .exists().withMessage('Longitude is required')
  .isFloat(validCoordinate.lon).withMessage('Invalid longitude')
  .toFloat();

const seasonRule = body('season')
  .trim()
  .notEmpty().withMessage('Season is required')
  .isLength({ max: 40 }).withMessage('Season is too long');

const soilRule = body('soilType')
  .trim()
  .notEmpty().withMessage('Soil type is required')
  .isLength({ max: 60 }).withMessage('Soil type is too long');

const areaRule = body('area')
  .exists().withMessage('Area is required')
  .isFloat({ min: 0.1, max: 100000 }).withMessage('Area must be between 0.1 and 100000 hectares')
  .toFloat();

const cropIdRule = body('cropId')
  .trim()
  .notEmpty().withMessage('Crop selection is required')
  .isLength({ max: 60 }).withMessage('Crop id is too long');

const locationRule = body('location')
  .optional()
  .isObject().withMessage('Location must be an object');

const signupRules = [nameRule, emailRule, passwordRule];

const loginRules = [
  emailRule,
  body('password').notEmpty().withMessage('Password is required')
];

const googleAuthRules = [
  body('credential')
    .trim()
    .notEmpty().withMessage('Google credential is required')
    .isLength({ max: 5000 }).withMessage('Google credential is too large')
];

const predictRules = [
  cropIdRule,
  latRule,
  lonRule,
  seasonRule,
  soilRule,
  areaRule,
  locationRule
];

const compareRules = [
  body('cropIds')
    .isArray({ min: 2, max: 6 }).withMessage('Select 2-6 crops for comparison'),
  body('cropIds.*')
    .trim()
    .notEmpty().withMessage('Crop ids cannot be empty')
    .isLength({ max: 60 }).withMessage('Crop id is too long'),
  latRule,
  lonRule,
  seasonRule,
  soilRule,
  areaRule
];

const bestCropRules = [
  latRule,
  lonRule,
  seasonRule,
  soilRule,
  areaRule
];

module.exports = {
  handleValidationErrors,
  signupRules,
  loginRules,
  googleAuthRules,
  predictRules,
  compareRules,
  bestCropRules
};
