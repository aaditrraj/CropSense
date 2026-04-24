/**
 * Prediction Engine v3
 * Advanced multi-factor crop yield prediction algorithm.
 *
 * Improvements over v2:
 * - Gaussian scoring curves (bell curve) instead of linear degradation
 * - Asymmetric rainfall scoring (deficit hurts more than excess, crop-specific)
 * - Critical temperature thresholds (absolute limits where yield → 0)
 * - Cross-factor interactions (temp×humidity, rain×soil drainage)
 * - Soil fertility and drainage modifiers
 * - Climate zone awareness via latitude
 * - Crop-specific sensitivity parameters
 * - Better confidence calculation with data quality weighting
 *
 * Factor Weights (base):
 * 1. Temperature suitability (weight: 0.28)
 * 2. Rainfall/water adequacy (weight: 0.28)
 * 3. Humidity suitability (weight: 0.14)
 * 4. Season compatibility (weight: 0.14)
 * 5. Soil compatibility (weight: 0.10)
 * 6. Cross-factor interactions (weight: 0.06)
 *
 * Final Yield = baseYield × compositeScore × soilFertilityMod × area
 */

const { crops, soilDrainageMap, soilFertilityMap } = require('../data/crops');

// ─── Utility: Gaussian function ─────────────────────────────
// Returns 0–1 with peak at center, drops off as a bell curve
function gaussian(value, center, sigma) {
 return Math.exp(-0.5 * Math.pow((value - center) / sigma, 2));
}

// ─── Utility: Clamp ─────────────────────────────────────────
function clamp(val, min, max) {
 return Math.max(min, Math.min(max, val));
}

// ─── Utility: Smooth step (for transitions) ─────────────────
function smoothStep(edge0, edge1, x) {
 const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
 return t * t * (3 - 2 * t);
}

/**
 * Calculate temperature score (0.0 – 1.0)
 *
 * Uses a Gaussian bell curve centered on the optimal midpoint.
 * Additionally applies critical temperature penalties —
 * yield drops sharply near critical min/max limits.
 *
 * v3: Gaussian curve + critical thresholds + crop heat/frost sensitivity
 */
function calcTemperatureScore(avgTemp, crop) {
 const { optimalTempMin, optimalTempMax, criticalTempMin, criticalTempMax } = crop;
 const optimalMid = (optimalTempMin + optimalTempMax) / 2;
 const optimalRange = optimalTempMax - optimalTempMin;

 // Sigma controls how fast the score drops outside the optimal range
 // Wider optimal range = more forgiving crop
 const sigma = optimalRange * 0.65;

 // Base score: Gaussian centered on optimal midpoint
 let score;
 if (avgTemp >= optimalTempMin && avgTemp <= optimalTempMax) {
 // Within optimal range — score between 0.88 and 1.0
 const distFromCenter = Math.abs(avgTemp - optimalMid);
 const maxDist = optimalRange / 2;
 score = 0.88 + 0.12 * (1 - distFromCenter / maxDist);
 } else {
 // Outside optimal range — Gaussian falloff
 const distFromEdge = avgTemp < optimalTempMin
 ? optimalTempMin - avgTemp
 : avgTemp - optimalTempMax;
 score = 0.88 * gaussian(distFromEdge, 0, sigma);
 }

 // Critical temperature penalty — hard limits
 if (criticalTempMin !== undefined && avgTemp <= criticalTempMin) {
 // Below critical minimum → yield collapses
 score *= 0.05; // near zero
 } else if (criticalTempMin !== undefined && avgTemp < optimalTempMin) {
 // Between critical and optimal min — apply frost sensitivity
 const frostZone = optimalTempMin - criticalTempMin;
 const distFromCritical = avgTemp - criticalTempMin;
 const frostPenalty = smoothStep(0, frostZone, distFromCritical);
 score *= (1 - crop.frostSensitivity) + crop.frostSensitivity * frostPenalty;
 }

 if (criticalTempMax !== undefined && avgTemp >= criticalTempMax) {
 // Above critical maximum → yield collapses
 score *= 0.05;
 } else if (criticalTempMax !== undefined && avgTemp > optimalTempMax) {
 // Between optimal and critical max — apply heat sensitivity
 const heatZone = criticalTempMax - optimalTempMax;
 const distFromCritical = criticalTempMax - avgTemp;
 const heatPenalty = smoothStep(0, heatZone, distFromCritical);
 score *= (1 - crop.heatSensitivity) + crop.heatSensitivity * heatPenalty;
 }

 return clamp(score, 0, 1);
}

/**
 * Calculate rainfall/water score (0.0 – 1.0)
 *
 * v3: Asymmetric scoring — water deficit hurts more than excess for
 * drought-sensitive crops, while excess hurts more for waterlog-sensitive crops.
 * Uses smooth sigmoid transitions instead of linear.
 */
function calcRainfallScore(seasonalPrecip, crop) {
 const { waterNeedMin, waterNeedMax, droughtTolerance, waterlogTolerance } = crop;
 const optimalMid = (waterNeedMin + waterNeedMax) / 2;
 const optimalRange = waterNeedMax - waterNeedMin;

 // Within optimal range
 if (seasonalPrecip >= waterNeedMin && seasonalPrecip <= waterNeedMax) {
 const distFromCenter = Math.abs(seasonalPrecip - optimalMid);
 const maxDist = optimalRange / 2;
 return 0.88 + 0.12 * (1 - distFromCenter / maxDist);
 }

 // Too little water — deficit scoring
 if (seasonalPrecip < waterNeedMin) {
 const deficit = waterNeedMin - seasonalPrecip;
 const deficitRatio = deficit / waterNeedMin; // 0 (at min) to 1 (at zero rainfall)

 // Drought tolerance modulates how quickly score drops
 // Low tolerance (0.1) = score drops fast. High tolerance (0.8) = score drops slowly.
 const steepness = 2.5 - droughtTolerance * 1.5; // 1.0 – 2.5

 // Smooth exponential decay
 const score = 0.88 * Math.exp(-steepness * deficitRatio * deficitRatio);
 return clamp(score, 0, 1);
 }

 // Too much water — excess scoring
 const excess = seasonalPrecip - waterNeedMax;
 const excessRatio = excess / waterNeedMax; // relative excess

 // Waterlog tolerance modulates decline
 // Low tolerance (0.1) = score drops fast. High tolerance (0.9) = tolerates flooding.
 const steepness = 3.0 - waterlogTolerance * 2.5; // 0.5 – 3.0

 const score = 0.88 * Math.exp(-steepness * excessRatio * excessRatio);
 return clamp(score, 0, 1);
}

/**
 * Calculate humidity score (0.0 – 1.0)
 *
 * v3: Gaussian curve centered on optimal range.
 * High humidity outside optimal range penalized more for
 * crops susceptible to fungal diseases (e.g., tomato, potato).
 */
function calcHumidityScore(avgHumidity, crop) {
 const { optimalHumidityMin, optimalHumidityMax } = crop;
 const optimalMid = (optimalHumidityMin + optimalHumidityMax) / 2;
 const optimalRange = optimalHumidityMax - optimalHumidityMin;
 const sigma = Math.max(optimalRange * 0.6, 10); // minimum sigma of 10

 if (avgHumidity >= optimalHumidityMin && avgHumidity <= optimalHumidityMax) {
 const distFromCenter = Math.abs(avgHumidity - optimalMid);
 const maxDist = optimalRange / 2;
 return 0.85 + 0.15 * (1 - (maxDist > 0 ? distFromCenter / maxDist : 0));
 }

 // Outside optimal range — Gaussian falloff
 const distFromEdge = avgHumidity < optimalHumidityMin
 ? optimalHumidityMin - avgHumidity
 : avgHumidity - optimalHumidityMax;

 // High humidity excess is worse for disease-prone crops
 let effectiveSigma = sigma;
 if (avgHumidity > optimalHumidityMax) {
 // Tighter sigma (faster drop) for crops with low waterlog tolerance
 // (waterlog tolerance correlates with humidity disease resistance)
 effectiveSigma = sigma * (0.6 + crop.waterlogTolerance * 0.6);
 }

 return clamp(0.85 * gaussian(distFromEdge, 0, effectiveSigma), 0, 1);
}

/**
 * Calculate season compatibility score (0.0 – 1.0)
 *
 * v3: More granular off-season scoring based on how far the season
 * is from the crop's preferred window.
 */
function calcSeasonScore(season, crop) {
 if (crop.preferredSeasons.includes(season)) {
 return 1.0;
 }

 // Annual/Perennial crops grow year-round — they do well in any season
 if (crop.preferredSeasons.includes('Annual') || crop.preferredSeasons.includes('Perennial')) {
 return 0.85;
 }
 // If user selected Annual/Perennial but crop is seasonal, give moderate score
 if (season === 'Annual' || season === 'Perennial') {
 return 0.6;
 }

 // Adjacent season gets a moderate score, opposite season gets lower
 const seasonOrder = ['Rabi', 'Zaid', 'Kharif']; // cycle
 const preferredIdx = seasonOrder.indexOf(crop.preferredSeasons[0]);
 const actualIdx = seasonOrder.indexOf(season);

 if (preferredIdx === -1 || actualIdx === -1) return 0.5;

 const distance = Math.min(
 Math.abs(preferredIdx - actualIdx),
 3 - Math.abs(preferredIdx - actualIdx)
 );

 // Adjacent season = 0.6, opposite = 0.4
 return distance === 1 ? 0.6 : 0.4;
}

/**
 * Calculate soil compatibility score (0.0 – 1.0)
 *
 * v3: Uses soil fertility and drainage data for more nuanced scoring.
 * Primary compatible soil = 1.0, other compatible = 0.85–0.95,
 * incompatible but fertile = 0.5–0.65, poor match = 0.35–0.5.
 */
function calcSoilScore(soilType, crop) {
 const fertility = soilFertilityMap[soilType] || 0.5;
 const compatibleIdx = crop.compatibleSoils.indexOf(soilType);

 if (compatibleIdx === 0) {
 // Primary recommended soil
 return 0.95 + fertility * 0.05; // 0.95–1.0
 }

 if (compatibleIdx > 0) {
 // Other compatible soils — scored by position and fertility
 const positionBonus = Math.max(0, 0.05 - compatibleIdx * 0.015);
 return 0.82 + positionBonus + fertility * 0.08; // ~0.82–0.95
 }

 // Incompatible soil — base score from fertility, penalized
 return 0.3 + fertility * 0.3; // 0.3–0.6
}

/**
 * Calculate cross-factor interaction effects.
 *
 * v3 NEW: Models real agronomic interactions between factors:
 * - Temperature × Humidity → heat stress or disease risk
 * - Rainfall × Soil Drainage → waterlogging or good drainage
 * - Temperature × Rainfall → evapotranspiration balance
 *
 * Returns a modifier score (0.6 – 1.15) that scales the composite.
 */
function calcInteractionScore(weatherData, crop, soilType) {
 const { avgTemperature, avgHumidity } = weatherData;
 const drainage = soilDrainageMap[soilType] || 0.5;
 let interactionScore = 1.0;

 // 1. Heat stress interaction: high temp + low humidity = drought stress
 const { optimalTempMax, optimalHumidityMin } = crop;
 if (avgTemperature > optimalTempMax && avgHumidity < optimalHumidityMin) {
 const heatExcess = (avgTemperature - optimalTempMax) / 10; // normalized
 const humidityDeficit = (optimalHumidityMin - avgHumidity) / 30;
 const stressFactor = heatExcess * humidityDeficit * crop.heatSensitivity;
 interactionScore -= clamp(stressFactor, 0, 0.25);
 }

 // 2. Disease risk: high humidity + moderate warm temp
 if (avgHumidity > crop.optimalHumidityMax && avgTemperature > 20 && avgTemperature < 35) {
 const humidityExcess = (avgHumidity - crop.optimalHumidityMax) / 30;
 // Crops with low waterlog tolerance are more disease-prone
 const diseaseRisk = humidityExcess * (1 - crop.waterlogTolerance) * 0.15;
 interactionScore -= clamp(diseaseRisk, 0, 0.15);
 }

 // 3. Waterlogging: high rainfall + poor soil drainage
 const seasonalPrecip = weatherData.totalSeasonalPrecipitation || 0;
 if (seasonalPrecip > crop.waterNeedMax && drainage < 0.4) {
 const excessRain = (seasonalPrecip - crop.waterNeedMax) / crop.waterNeedMax;
 const waterlogRisk = excessRain * (1 - drainage) * (1 - crop.waterlogTolerance);
 interactionScore -= clamp(waterlogRisk * 0.3, 0, 0.2);
 }

 // 4. Good synergy: optimal temp + optimal rain + good soil = bonus
 const tempInRange = avgTemperature >= crop.optimalTempMin && avgTemperature <= crop.optimalTempMax;
 const humidityInRange = avgHumidity >= crop.optimalHumidityMin && avgHumidity <= crop.optimalHumidityMax;
 if (tempInRange && humidityInRange) {
 interactionScore += 0.06; // synergy bonus
 }

 return clamp(interactionScore, 0.6, 1.15);
}

/**
 * Calculate climate zone adjustment based on latitude.
 *
 * v3 NEW: Adjusts prediction based on latitude (tropical, subtropical,
 * temperate zones). Tropical crops perform best near the equator,
 * while temperate crops prefer higher latitudes.
 */
function calcClimateZoneModifier(lat, crop) {
 const absLat = Math.abs(lat);

 // Tropical zone: 0–23.5° — best for rice, sugarcane, cotton, groundnut
 // Subtropical zone: 23.5–35° — good for most Indian crops
 // Temperate zone: 35–50° — better for wheat, barley, mustard

 const tropicalCrops = ['rice', 'sugarcane', 'cotton', 'groundnut'];
 const temperateCrops = ['wheat', 'barley', 'mustard', 'chickpea'];

 if (tropicalCrops.includes(crop.id)) {
 // Tropical crops: peak at 10–20° latitude, decline above 35°
 if (absLat <= 25) return 1.0;
 if (absLat <= 35) return 0.95 - (absLat - 25) * 0.01;
 return Math.max(0.7, 0.85 - (absLat - 35) * 0.02);
 }

 if (temperateCrops.includes(crop.id)) {
 // Temperate crops: good performance 20–40° latitude
 if (absLat >= 15 && absLat <= 40) return 1.0;
 if (absLat < 15) return 0.9 + absLat * 0.007;
 return Math.max(0.75, 1.0 - (absLat - 40) * 0.015);
 }

 // Other crops — moderate latitude preference
 if (absLat <= 35) return 1.0;
 return Math.max(0.8, 1.0 - (absLat - 35) * 0.01);
}

/**
 * Generate contextual recommendations
 */
function generateRecommendations(scores, crop, weatherData, seasonalPrecip, interactionScore, soilType) {
 const recommendations = [];

 // Temperature recommendations
 if (scores.temperature < 0.6) {
 if (weatherData.avgTemperature < crop.optimalTempMin) {
 recommendations.push({
 type: 'warning',
  icon: 'thermometer',
 title: 'Low Temperature Alert',
 text: `Seasonal average temperature (${weatherData.avgTemperature.toFixed(1)}°C) is below the optimal range of ${crop.optimalTempMin}–${crop.optimalTempMax}°C for ${crop.name}. Consider using mulching or row covers to retain soil warmth.`
 });
 } else {
 recommendations.push({
 type: 'warning',
  icon: 'flame',
 title: 'High Temperature Alert',
 text: `Seasonal average temperature (${weatherData.avgTemperature.toFixed(1)}°C) exceeds the optimal range of ${crop.optimalTempMin}–${crop.optimalTempMax}°C for ${crop.name}. Consider shade nets or increasing irrigation frequency to cool the crop canopy.`
 });
 }
 } else if (scores.temperature >= 0.85) {
 recommendations.push({
 type: 'success',
  icon: 'check-circle',
 title: 'Optimal Temperature',
 text: `Temperature conditions (${weatherData.avgTemperature.toFixed(1)}°C) are excellent for ${crop.name} growth.`
 });
 }

 // Rainfall recommendations
 if (scores.rainfall < 0.6) {
 if (seasonalPrecip < crop.waterNeedMin) {
 recommendations.push({
 type: 'warning',
  icon: 'cloud-rain',
 title: 'Insufficient Rainfall',
 text: `Historical seasonal rainfall (~${seasonalPrecip.toFixed(0)} mm) is below the ${crop.waterNeedMin}–${crop.waterNeedMax} mm needed. Supplemental irrigation is strongly recommended.`
 });
 } else {
 recommendations.push({
 type: 'warning',
  icon: 'cloud-drizzle',
 title: 'Excessive Rainfall Risk',
 text: `Historical seasonal rainfall (~${seasonalPrecip.toFixed(0)} mm) exceeds the optimal range. Ensure proper drainage and consider raised beds to prevent waterlogging.`
 });
 }
 }

 // Humidity recommendations
 if (scores.humidity < 0.6) {
 recommendations.push({
 type: 'info',
  icon: 'wind',
 title: 'Humidity Alert',
 text: `Seasonal humidity levels (${weatherData.avgHumidity.toFixed(0)}%) are outside the optimal ${crop.optimalHumidityMin}–${crop.optimalHumidityMax}% range. Monitor for disease risk or drought stress.`
 });
 }

 // Cross-factor interaction warnings
 if (interactionScore < 0.85) {
 if (weatherData.avgTemperature > crop.optimalTempMax && weatherData.avgHumidity < crop.optimalHumidityMin) {
 recommendations.push({
 type: 'warning',
  icon: 'zap',
 title: 'Heat-Drought Stress Risk',
 text: `The combination of high temperature and low humidity creates severe drought stress. Increase irrigation frequency and consider windbreaks.`
 });
 }
 const drainage = soilDrainageMap[soilType] || 0.5;
 if (seasonalPrecip > crop.waterNeedMax && drainage < 0.4) {
 recommendations.push({
 type: 'warning',
  icon: 'droplets',
 title: 'Waterlogging Risk',
 text: `High rainfall combined with ${soilType} soil (poor drainage) increases waterlogging risk. Consider raised beds, field drains, or ridge planting.`
 });
 }
 }

 // Season recommendations
 if (scores.season < 0.7) {
 recommendations.push({
 type: 'info',
  icon: 'calendar',
 title: 'Off-Season Planting',
 text: `${crop.name} is best suited for the ${crop.preferredSeasons.join(' / ')} season. Consider planting during the preferred season for optimal results.`
 });
 }

 // Soil recommendations
 if (scores.soil < 0.7) {
 recommendations.push({
 type: 'info',
  icon: 'sprout',
 title: 'Soil Compatibility',
 text: `${crop.name} grows best in ${crop.compatibleSoils.join(', ')} soils. Amend your soil with organic matter and fertilizers to improve yields.`
 });
 }

 // General positive recommendation
 if (recommendations.length === 0 || recommendations.every(r => r.type === 'success')) {
 recommendations.push({
 type: 'success',
  icon: 'thumbs-up',
 title: 'Excellent Conditions',
 text: `Weather and growing conditions look favorable for ${crop.name}! Proceed with planting and follow standard best practices for optimal yield.`
 });
 }

 // Add data source note
 if (weatherData.dataSource === 'historical') {
 recommendations.push({
 type: 'info',
  icon: 'database',
 title: 'Data Source',
 text: `This prediction is based on ${weatherData.yearsOfData}-year historical seasonal averages for your region, combined with current weather observations.`
 });
 } else {
 recommendations.push({
 type: 'info',
  icon: 'alert-triangle',
 title: 'Limited Data',
 text: `Historical seasonal data was unavailable. This prediction uses the current 7-day forecast as a proxy. Accuracy may be lower than usual.`
 });
 }

 return recommendations;
}

/**
 * Main prediction function
 *
 * v3 changes:
 * - Gaussian scoring curves for temperature, rainfall, humidity
 * - Asymmetric rainfall scoring with crop drought/waterlog tolerance
 * - Critical temperature thresholds
 * - Cross-factor interactions (6% weight)
 * - Soil fertility modifier on final yield
 * - Climate zone adjustment via latitude
 * - Better confidence with data quality and condition quality
 */
function predictYield({ cropId, season, soilType, area, weatherData, lat }) {
 const crop = crops.find(c => c.id === cropId);
 if (!crop) {
 throw new Error(`Crop "${cropId}" not found in database.`);
 }

 if (!area || area <= 0) {
 throw new Error('Area must be a positive number.');
 }

 const { avgTemperature, avgHumidity, totalSeasonalPrecipitation, totalPrecipitation7d } = weatherData;

 // Determine seasonal precipitation
 let seasonalPrecip;
 if (totalSeasonalPrecipitation !== null && totalSeasonalPrecipitation !== undefined) {
 seasonalPrecip = totalSeasonalPrecipitation;
 } else {
 // Fallback: extrapolate 7-day data with season-awareness
 // Different seasons have different rainfall patterns
 const seasonMultiplier = season === 'Kharif' ? 1.3 : season === 'Zaid' ? 0.7 : 0.5;
 seasonalPrecip = (totalPrecipitation7d / 7) * crop.growthDuration * seasonMultiplier;
 }

 // Calculate individual factor scores
 const scores = {
 temperature: calcTemperatureScore(avgTemperature, crop),
 rainfall: calcRainfallScore(seasonalPrecip, crop),
 humidity: calcHumidityScore(avgHumidity, crop),
 season: calcSeasonScore(season, crop),
 soil: calcSoilScore(soilType, crop)
 };

 // Calculate cross-factor interaction score
 const interactionScore = calcInteractionScore(weatherData, crop, soilType);

 // Weighted composite score (base factors + interaction)
 const weights = {
 temperature: 0.28,
 rainfall: 0.28,
 humidity: 0.14,
 season: 0.14,
 soil: 0.10
 };
 const interactionWeight = 0.06;

 const baseComposite =
 scores.temperature * weights.temperature +
 scores.rainfall * weights.rainfall +
 scores.humidity * weights.humidity +
 scores.season * weights.season +
 scores.soil * weights.soil;

 // Interaction modifier scales the composite
 const normalizedInteraction = (interactionScore - 0.6) / (1.15 - 0.6); // normalize to 0–1
 const compositeScore = baseComposite * (1 - interactionWeight) + baseComposite * interactionWeight * normalizedInteraction;

 // Climate zone modifier
 const parsedLat = lat ? parseFloat(lat) : 25; // default to subtropical India
 const climateModifier = calcClimateZoneModifier(parsedLat, crop);

 // Soil fertility modifier (subtle: 0.9–1.05 range)
 const soilFertility = soilFertilityMap[soilType] || 0.5;
 const fertilityModifier = 0.9 + soilFertility * 0.15; // 0.9 – 1.05

 // Calculate predicted yield
 const adjustedScore = compositeScore * climateModifier * fertilityModifier;
 const yieldPerHectare = crop.baseYield * clamp(adjustedScore, 0, 1.1);
 const totalYield = yieldPerHectare * area;

 // Confidence calculation — reflects both data quality AND condition alignment
 const yearsOfData = weatherData.yearsOfData || 0;

 // Component 1: Data quality confidence (30–50%)
 const dataConfidence = 30 + Math.min(20, yearsOfData * 7);

 // Component 2: Condition confidence — higher if scores are clearly good or bad (not ambiguous)
 const scoreStdDev = calcStdDev(Object.values(scores));
 const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / 5;
 // High average + low variance = high confidence. Low average is also confident (clearly bad).
 const conditionConfidence = 20 + (1 - scoreStdDev) * 10 + (avgScore > 0.7 ? 10 : avgScore < 0.3 ? 8 : 0);

 const confidence = clamp(dataConfidence + conditionConfidence, 35, 95);

 // Generate recommendations
 const recommendations = generateRecommendations(scores, crop, weatherData, seasonalPrecip, interactionScore, soilType);

 // Determine yield rating
 let yieldRating;
 if (adjustedScore >= 0.82) yieldRating = 'Excellent';
 else if (adjustedScore >= 0.65) yieldRating = 'Good';
 else if (adjustedScore >= 0.50) yieldRating = 'Average';
 else if (adjustedScore >= 0.35) yieldRating = 'Below Average';
 else yieldRating = 'Poor';

 return {
 crop: {
 id: crop.id,
 name: crop.name,
 emoji: crop.emoji,
 baseYield: crop.baseYield,
 growthDuration: crop.growthDuration,
  description: crop.description,
  optimalTempMin: crop.optimalTempMin,
  optimalTempMax: crop.optimalTempMax,
  waterNeedMin: crop.waterNeedMin,
  waterNeedMax: crop.waterNeedMax,
  cropCoefficient: crop.cropCoefficient,
  irrigationMethod: crop.irrigationMethod,
  diseases: crop.diseases || []
 },
 prediction: {
 yieldPerHectare: Math.round(yieldPerHectare * 100) / 100,
 totalYield: Math.round(totalYield * 100) / 100,
 area,
 unit: 'tons',
 compositeScore: Math.round(adjustedScore * 1000) / 1000,
 confidence: Math.round(confidence * 10) / 10,
 yieldRating,
 dataSource: weatherData.dataSource || 'forecast'
 },
 scores: {
 temperature: { value: Math.round(scores.temperature * 100) / 100, weight: weights.temperature, label: 'Temperature' },
 rainfall: { value: Math.round(scores.rainfall * 100) / 100, weight: weights.rainfall, label: 'Rainfall' },
 humidity: { value: Math.round(scores.humidity * 100) / 100, weight: weights.humidity, label: 'Humidity' },
 season: { value: Math.round(scores.season * 100) / 100, weight: weights.season, label: 'Season' },
 soil: { value: Math.round(scores.soil * 100) / 100, weight: weights.soil, label: 'Soil Type' }
 },
 input: {
 season,
 soilType,
 avgTemperature: Math.round(avgTemperature * 10) / 10,
 avgHumidity: Math.round(avgHumidity * 10) / 10,
 totalSeasonalPrecipitation: Math.round(seasonalPrecip * 10) / 10,
 totalPrecipitation7d: Math.round((totalPrecipitation7d || 0) * 10) / 10,
 dataSource: weatherData.dataSource || 'forecast'
 },
 recommendations
 };
}

/**
 * Calculate standard deviation of an array of numbers
 */
function calcStdDev(values) {
 const n = values.length;
 if (n === 0) return 0;
 const mean = values.reduce((a, b) => a + b, 0) / n;
 const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
 return Math.sqrt(variance);
}

module.exports = { predictYield };
