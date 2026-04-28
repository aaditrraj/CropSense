const fs = require('fs');

let file = fs.readFileSync('services/predictionEngine.js', 'utf8');

const oldRainfall = `/**
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
 return 0.85 + 0.15 * (1 - distFromCenter / maxDist);
 }

 // Too little water — deficit scoring
 if (seasonalPrecip < waterNeedMin) {
 const deficit = waterNeedMin - seasonalPrecip;
 const deficitRatio = deficit / waterNeedMin;
 const steepness = 2.8 - droughtTolerance * 1.5; // 1.3 – 2.8
 const score = 0.82 * Math.exp(-steepness * deficitRatio * deficitRatio);
 // If rainfall is less than 20% of minimum need, crop is infeasible
 if (deficitRatio > 0.8) return clamp(score * 0.2, 0.03, 0.15);
 return clamp(score, 0.05, 1);
 }

 // Too much water — excess scoring
 const excess = seasonalPrecip - waterNeedMax;
 const excessRatio = excess / waterNeedMax;
 const steepness = 2.8 - waterlogTolerance * 2.0; // 0.8 – 2.8
 const score = 0.82 * Math.exp(-steepness * excessRatio * excessRatio);
 if (excessRatio > 1.0) return clamp(score * 0.25, 0.03, 0.18);
 return clamp(score, 0.05, 1);
}`;

const newRainfall = `/**
 * Calculate rainfall/water score (0.0 – 1.0)
 *
 * UPGRADE: Now uses the industry-standard FAO Irrigation and Drainage Paper No. 33
 * formula for Yield Response to Water: (1 - Ya/Ym) = Ky * (1 - ETa/ETc)
 */
function calcRainfallScore(seasonalPrecip, crop, weatherData) {
  // Simplified Blaney-Criddle ET0 (Reference Evapotranspiration) in mm/day
  const p = 0.27; // Mean daily percentage of annual daytime hours
  const et0Daily = p * (0.46 * weatherData.avgTemperature + 8.13); 
  const etcDaily = et0Daily * (crop.cropCoefficient || 0.85); // Crop ET
  const etcSeason = etcDaily * crop.growthDuration; // Total seasonal water need
  
  // Effective rainfall (approx 75% due to runoff and deep percolation)
  const effectiveRain = seasonalPrecip * 0.75;
  const eta = Math.min(effectiveRain, etcSeason); // Actual Evapotranspiration
  
  // Yield response factor (Ky). Maps drought tolerance (0-1) to Ky (0.8 - 1.5)
  // Higher Ky = more sensitive to water stress
  const ky = 1.5 - (crop.droughtTolerance * 0.7); 
  
  // FAO Formula for relative yield (Ya / Ym)
  let waterStressScore = 1 - ky * (1 - (eta / etcSeason));
  
  // If rainfall is excessively high, apply waterlogging penalty
  const excess = seasonalPrecip - (etcSeason * 1.5);
  if (excess > 0) {
    const excessRatio = excess / (etcSeason * 1.5);
    const steepness = 2.8 - crop.waterlogTolerance * 2.0; 
    waterStressScore *= Math.exp(-steepness * excessRatio * excessRatio);
  }
  
  return clamp(waterStressScore, 0.05, 1);
}`;

file = file.replace(oldRainfall, newRainfall);

const oldScores = ` // Calculate individual factor scores
 const scores = {
 temperature: calcTemperatureScore(avgTemperature, crop),
 rainfall: calcRainfallScore(seasonalPrecip, crop),
 humidity: calcHumidityScore(avgHumidity, crop),
 season: calcSeasonScore(season, crop),
 soil: calcSoilScore(soilType, crop)
 };`;

const newScores = ` // Calculate individual factor scores
 const scores = {
 temperature: calcTemperatureScore(avgTemperature, crop),
 rainfall: calcRainfallScore(seasonalPrecip, crop, weatherData), // Uses FAO model
 humidity: calcHumidityScore(avgHumidity, crop),
 season: calcSeasonScore(season, crop),
 soil: calcSoilScore(soilType, crop)
 };

 // UPGRADE: Growing Degree Days (GDD) Thermal Time Calculation
 // Calculates exact heat accumulation required for crop maturity
 const tBase = Math.max(5, crop.optimalTempMin - 8); // Estimated base temperature
 const dailyGDD = Math.max(0, avgTemperature - tBase);
 const accumulatedGDD = dailyGDD * crop.growthDuration;
 
 const optimalDailyGDD = ((crop.optimalTempMax + crop.optimalTempMin) / 2) - tBase;
 const optimalGDD = optimalDailyGDD * crop.growthDuration;
 const gddRatio = accumulatedGDD / optimalGDD;
 
 // Modulate temperature score strictly by GDD accuracy
 let gddModifier = 1.0;
 if (gddRatio < 0.85) gddModifier = clamp(gddRatio / 0.85, 0.4, 1.0);
 else if (gddRatio > 1.15) gddModifier = clamp(1 - (gddRatio - 1.15), 0.4, 1.0);
 
 scores.temperature = scores.temperature * 0.6 + (scores.temperature * gddModifier * 0.4);`;

file = file.replace(oldScores, newScores);

fs.writeFileSync('services/predictionEngine.js', file, 'utf8');
console.log('Successfully upgraded predictionEngine.js to use FAO and GDD models.');
