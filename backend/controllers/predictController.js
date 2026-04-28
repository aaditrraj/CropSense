/**
 * Predict Controller
 * Handles crop yield prediction, comparison, and best-fit analysis.
 * Moved from server.js for clean MVC architecture.
 */

const { fetchCurrentWeather, fetchSeasonalAverages } = require('../../services/weatherService');
const { predictYield } = require('../../services/predictionEngine');
const { crops } = require('../../data/crops');
const { fetchLiveMarketPrice, getStoredPrice } = require('../../services/marketPriceService');
const { getPrediction } = require('../models/Prediction');

async function buildRevenueEstimate(cropId, prediction, area, location = {}) {
  const price = await fetchLiveMarketPrice({ cropId, state: location.state }).catch(() => getStoredPrice(cropId));
  if (!price) return null;
  if (!Number.isFinite(Number(price.marketAvg)) || !Number.isFinite(Number(price.costPerHa))) return null;

  const yieldQuintals = prediction.totalYield * 10;
  const grossMSP = price.msp ? Math.round(yieldQuintals * price.msp) : null;
  const grossMarket = Math.round(yieldQuintals * price.marketAvg);
  const costOfCultivation = Math.round(price.costPerHa * area);
  const netProfit = grossMarket - costOfCultivation;

  return {
    livePrice: price.live === true,
    priceSource: price.source,
    priceNote: price.note || null,
    priceFetchedAt: price.fetchedAt,
    market: price.market || null,
    district: price.district || null,
    state: price.state || location.state || null,
    arrivalDate: price.arrivalDate || null,
    recordsUsed: price.recordsUsed || 0,
    currency: price.currency || 'INR',
    unit: price.unit || 'quintal',
    yieldQuintals: Math.round(yieldQuintals * 10) / 10,
    msp: price.msp,
    marketAvg: price.marketAvg,
    marketHigh: price.marketHigh,
    grossMSP,
    grossMarket,
    grossRevenue: grossMarket,
    costOfCultivation,
    netProfit,
    profitable: netProfit >= 0
  };
}

/**
 * POST /api/predict
 */
async function predict(req, res) {
  try {
    const { cropId, lat, lon, season, soilType, area } = req.body;

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    // Fetch current weather and historical seasonal averages in parallel
    const [weather, seasonalData] = await Promise.all([
      fetchCurrentWeather(parsedLat, parsedLon),
      fetchSeasonalAverages(parsedLat, parsedLon, season, 5).catch(err => {
        console.warn('Historical data fetch failed, falling back to current weather:', err.message);
        return null;
      })
    ]);

    // Build weather data for the prediction engine
    const predictionWeather = {
      avgTemperature: seasonalData?.avgTemperature ?? weather.averages.avgTemperature,
      avgHumidity: seasonalData?.avgHumidity ?? weather.averages.avgHumidity,
      totalSeasonalPrecipitation: seasonalData?.avgSeasonalPrecipitation ?? null,
      totalPrecipitation7d: weather.averages.totalPrecipitation7d,
      yearsOfData: seasonalData?.yearsOfData ?? 0,
      dataSource: seasonalData ? 'historical' : 'forecast'
    };

    // Run prediction
    const result = predictYield({
      cropId,
      season,
      soilType,
      area: parseFloat(area),
      weatherData: predictionWeather,
      lat: parsedLat
    });
    const revenue = await buildRevenueEstimate(cropId, result.prediction, parseFloat(area), req.body.location || {});

    // Auto-save if user is authenticated
    if (req.user) {
      try {
        const Prediction = getPrediction();
        await Prediction.create({
          user: req.user._id || req.user.id,
          cropId,
          cropName: result.crop.name,
          cropEmoji: result.crop.emoji,
          location: req.body.location || { name: 'Unknown', lat: parsedLat, lon: parsedLon },
          season,
          soilType,
          area: parseFloat(area),
          yieldPerHectare: result.prediction.yieldPerHectare,
          totalYield: result.prediction.totalYield,
          compositeScore: result.prediction.compositeScore,
          confidence: result.prediction.confidence,
          yieldRating: result.prediction.yieldRating,
          temperature: predictionWeather.avgTemperature,
          humidity: predictionWeather.avgHumidity,
          precipitation: predictionWeather.totalSeasonalPrecipitation || predictionWeather.totalPrecipitation7d,
          fullResult: { ...result, revenue, weather: { current: weather.current, daily: weather.daily } }
        });
      } catch (saveErr) {
        console.warn('Auto-save prediction failed:', saveErr.message);
      }
    }

    res.json({
      success: true,
      data: {
        ...result,
        revenue,
        weather: {
          current: weather.current,
          daily: weather.daily
        },
        historicalData: seasonalData ? {
          yearsAnalyzed: seasonalData.yearsOfData,
          yearlyBreakdown: seasonalData.yearlyBreakdown
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/compare
 */
async function compare(req, res) {
  try {
    const { cropIds, lat, lon, season, soilType, area } = req.body;

    if (!cropIds || !Array.isArray(cropIds) || cropIds.length < 2) {
      return res.status(400).json({ success: false, error: 'At least 2 cropIds are required for comparison.' });
    }

    if (!lat || !lon || !season || !soilType || !area) {
      return res.status(400).json({ success: false, error: 'All fields are required: cropIds, lat, lon, season, soilType, area.' });
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    const [weather, seasonalData] = await Promise.all([
      fetchCurrentWeather(parsedLat, parsedLon),
      fetchSeasonalAverages(parsedLat, parsedLon, season, 5).catch(() => null)
    ]);

    const predictionWeather = {
      avgTemperature: seasonalData?.avgTemperature ?? weather.averages.avgTemperature,
      avgHumidity: seasonalData?.avgHumidity ?? weather.averages.avgHumidity,
      totalSeasonalPrecipitation: seasonalData?.avgSeasonalPrecipitation ?? null,
      totalPrecipitation7d: weather.averages.totalPrecipitation7d,
      yearsOfData: seasonalData?.yearsOfData ?? 0,
      dataSource: seasonalData ? 'historical' : 'forecast'
    };

    const results = await Promise.all(cropIds.map(async cropId => {
      try {
        const result = predictYield({ cropId, season, soilType, area: parseFloat(area), weatherData: predictionWeather, lat: parsedLat });
        result.revenue = await buildRevenueEstimate(cropId, result.prediction, parseFloat(area), req.body.location || {});
        return result;
      } catch (err) {
        return { cropId, error: err.message };
      }
    }));

    results.sort((a, b) => {
      if (a.error) return 1;
      if (b.error) return -1;
      return b.prediction.yieldPerHectare - a.prediction.yieldPerHectare;
    });

    res.json({ success: true, data: { results, weather: { current: weather.current } } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/best-crop
 */
async function bestCrop(req, res) {
  try {
    const { lat, lon, season, soilType, area } = req.body;

    if (!lat || !lon || !season || !soilType || !area) {
      return res.status(400).json({ success: false, error: 'All fields are required: lat, lon, season, soilType, area.' });
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    const [weather, seasonalData] = await Promise.all([
      fetchCurrentWeather(parsedLat, parsedLon),
      fetchSeasonalAverages(parsedLat, parsedLon, season, 5).catch(() => null)
    ]);

    const predictionWeather = {
      avgTemperature: seasonalData?.avgTemperature ?? weather.averages.avgTemperature,
      avgHumidity: seasonalData?.avgHumidity ?? weather.averages.avgHumidity,
      totalSeasonalPrecipitation: seasonalData?.avgSeasonalPrecipitation ?? null,
      totalPrecipitation7d: weather.averages.totalPrecipitation7d,
      yearsOfData: seasonalData?.yearsOfData ?? 0,
      dataSource: seasonalData ? 'historical' : 'forecast'
    };

    const allCropIds = crops.map(c => c.id);
    const results = await Promise.all(allCropIds.map(async cropId => {
      try {
        const result = predictYield({ cropId, season, soilType, area: parseFloat(area), weatherData: predictionWeather, lat: parsedLat });
        result.revenue = await buildRevenueEstimate(cropId, result.prediction, parseFloat(area), req.body.location || {});
        return result;
      } catch (err) {
        return { crop: { id: cropId }, error: err.message };
      }
    }));

    results.sort((a, b) => {
      if (a.error) return 1;
      if (b.error) return -1;
      return b.prediction.compositeScore - a.prediction.compositeScore;
    });

    res.json({
      success: true,
      data: { results, weather: { current: weather.current }, location: { lat: parsedLat, lon: parsedLon } }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { predict, compare, bestCrop };
