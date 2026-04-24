/**
 * Weather Routes
 * GET /api/geocode             — Geocode city name
 * GET /api/weather             — Current weather + 7-day forecast
 * GET /api/weather/historical  — Historical weather data
 */

const express = require('express');
const router = express.Router();
const { geocodeCity, fetchCurrentWeather, fetchHistoricalWeather } = require('../../services/weatherService');

router.get('/geocode', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ success: false, error: 'City name is required.' });
    }
    const results = await geocodeCity(city);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'Latitude and longitude are required.' });
    }
    const weather = await fetchCurrentWeather(parseFloat(lat), parseFloat(lon));
    res.json({ success: true, data: weather });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/weather/historical', async (req, res) => {
  try {
    const { lat, lon, start, end } = req.query;
    if (!lat || !lon || !start || !end) {
      return res.status(400).json({
        success: false,
        error: 'Latitude, longitude, start date, and end date are required.'
      });
    }
    const historical = await fetchHistoricalWeather(parseFloat(lat), parseFloat(lon), start, end);
    res.json({ success: true, data: historical });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
