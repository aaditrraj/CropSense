const fs = require('fs');

let js = fs.readFileSync('services/predictionEngine.js', 'utf8');

const targetStr = `  // Effective rainfall (approx 75% due to runoff and deep percolation)
  const effectiveRain = seasonalPrecip * 0.75;
  const eta = Math.min(effectiveRain, etcSeason); // Actual Evapotranspiration`;

const replacement = `  // Effective rainfall (approx 75% due to runoff and deep percolation)
  const effectiveRain = seasonalPrecip * 0.75;
  
  // REAL WORLD FIX: Farmers don't let crops die if it doesn't rain. They irrigate.
  // We assume a standard irrigation capacity that meets at least 65-85% of the deficit
  // depending on the crop's drought tolerance (more tolerant = less irrigation applied)
  const deficit = Math.max(0, etcSeason - effectiveRain);
  const assumedIrrigation = deficit * (0.65 + (crop.droughtTolerance * 0.2)); 
  const totalWaterAvailable = effectiveRain + assumedIrrigation;
  
  const eta = Math.min(totalWaterAvailable, etcSeason); // Actual Evapotranspiration`;

js = js.replace(targetStr, replacement);
fs.writeFileSync('services/predictionEngine.js', js, 'utf8');
console.log('Real world irrigation assumption added to predictionEngine.js');
