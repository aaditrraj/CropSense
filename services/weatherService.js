/**
 * Weather Service
 * Interfaces with the Open-Meteo API for weather data and geocoding.
 * Open-Meteo is free and requires no API key.
 */

const fetch = require('node-fetch');

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';
const OPEN_METEO_ARCHIVE = 'https://archive-api.open-meteo.com/v1';
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1';

/**
 * Geocode a city name to latitude/longitude
 */
async function geocodeCity(cityName) {
 const url = `${GEOCODING_BASE}/search?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json`;

 const response = await fetch(url);
 if (!response.ok) {
 throw new Error(`Geocoding API error: ${response.statusText}`);
 }

 const data = await response.json();

 if (!data.results || data.results.length === 0) {
 throw new Error(`City "${cityName}" not found. Please try a different spelling or nearby city.`);
 }

 return data.results.map(r => ({
 name: r.name,
 latitude: r.latitude,
 longitude: r.longitude,
 country: r.country,
 state: r.admin1 || '',
 timezone: r.timezone
 }));
}

/**
 * Fetch current weather and 7-day forecast
 */
async function fetchCurrentWeather(lat, lon) {
 const url = `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}` +
 `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure` +
 `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code` +
 `&hourly=temperature_2m,relative_humidity_2m,precipitation` +
 `&timezone=auto&forecast_days=7`;

 const response = await fetch(url);
 if (!response.ok) {
 throw new Error(`Weather API error: ${response.statusText}`);
 }

 const data = await response.json();

 // Process current weather
 const current = {
 temperature: data.current.temperature_2m,
 humidity: data.current.relative_humidity_2m,
 apparentTemp: data.current.apparent_temperature,
 precipitation: data.current.precipitation,
 weatherCode: data.current.weather_code,
 windSpeed: data.current.wind_speed_10m,
 pressure: data.current.surface_pressure,
 weatherDescription: getWeatherDescription(data.current.weather_code)
 };

 // Process daily forecast
 const daily = data.daily.time.map((date, i) => ({
 date,
 tempMax: data.daily.temperature_2m_max[i],
 tempMin: data.daily.temperature_2m_min[i],
 precipitation: data.daily.precipitation_sum[i],
 precipProbability: data.daily.precipitation_probability_max[i],
 windSpeed: data.daily.wind_speed_10m_max[i],
 weatherCode: data.daily.weather_code[i],
 weatherDescription: getWeatherDescription(data.daily.weather_code[i])
 }));

 // Calculate averages from hourly data for prediction
 const hourlyTemps = data.hourly.temperature_2m.filter(t => t !== null);
 const hourlyHumidity = data.hourly.relative_humidity_2m.filter(h => h !== null);
 const hourlyPrecip = data.hourly.precipitation.filter(p => p !== null);

 const averages = {
 avgTemperature: hourlyTemps.reduce((a, b) => a + b, 0) / hourlyTemps.length,
 avgHumidity: hourlyHumidity.reduce((a, b) => a + b, 0) / hourlyHumidity.length,
 totalPrecipitation7d: hourlyPrecip.reduce((a, b) => a + b, 0)
 };

 return { current, daily, averages };
}

/**
 * Fetch historical weather data for a date range
 */
async function fetchHistoricalWeather(lat, lon, startDate, endDate) {
 const url = `${OPEN_METEO_ARCHIVE}/archive?latitude=${lat}&longitude=${lon}` +
 `&start_date=${startDate}&end_date=${endDate}` +
 `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max` +
 `&timezone=auto`;

 const response = await fetch(url);
 if (!response.ok) {
 throw new Error(`Historical Weather API error: ${response.statusText}`);
 }

 const data = await response.json();

 if (!data.daily || !data.daily.time) {
 throw new Error('No historical data available for the specified date range.');
 }

 const daily = data.daily.time.map((date, i) => ({
 date,
 tempMax: data.daily.temperature_2m_max[i],
 tempMin: data.daily.temperature_2m_min[i],
 tempMean: data.daily.temperature_2m_mean[i],
 precipitation: data.daily.precipitation_sum[i],
 windSpeed: data.daily.wind_speed_10m_max[i]
 }));

 // Calculate period averages
 const validTemps = daily.filter(d => d.tempMean !== null);
 const validPrecip = daily.filter(d => d.precipitation !== null);

 const summary = {
 avgTemperature: validTemps.length > 0
 ? validTemps.reduce((a, b) => a + b.tempMean, 0) / validTemps.length
 : null,
 totalPrecipitation: validPrecip.reduce((a, b) => a + b.precipitation, 0),
 avgDailyPrecipitation: validPrecip.length > 0
 ? validPrecip.reduce((a, b) => a + b.precipitation, 0) / validPrecip.length
 : null,
 maxTemp: Math.max(...daily.map(d => d.tempMax).filter(t => t !== null)),
 minTemp: Math.min(...daily.map(d => d.tempMin).filter(t => t !== null)),
 daysCount: daily.length
 };

 return { daily, summary };
}

/**
 * Convert WMO weather codes to descriptions
 */
function getWeatherDescription(code) {
 const descriptions = {
 0: 'Clear sky',
 1: 'Mainly clear',
 2: 'Partly cloudy',
 3: 'Overcast',
 45: 'Foggy',
 48: 'Rime fog',
 51: 'Light drizzle',
 53: 'Moderate drizzle',
 55: 'Dense drizzle',
 56: 'Light freezing drizzle',
 57: 'Dense freezing drizzle',
 61: 'Slight rain',
 63: 'Moderate rain',
 65: 'Heavy rain',
 66: 'Light freezing rain',
 67: 'Heavy freezing rain',
 71: 'Slight snowfall',
 73: 'Moderate snowfall',
 75: 'Heavy snowfall',
 77: 'Snow grains',
 80: 'Slight rain showers',
 81: 'Moderate rain showers',
 82: 'Violent rain showers',
 85: 'Slight snow showers',
 86: 'Heavy snow showers',
 95: 'Thunderstorm',
 96: 'Thunderstorm with slight hail',
 99: 'Thunderstorm with heavy hail'
 };
 return descriptions[code] || 'Unknown';
}

/**
 * Get weather icon class based on WMO code
 */
function getWeatherIcon(code) {
 if (code === 0) return 'sun';
 if (code <= 3) return 'cloud-sun';
 if (code <= 48) return 'cloud-fog';
 if (code <= 57) return 'cloud-drizzle';
 if (code <= 67) return 'cloud-rain';
 if (code <= 77) return 'snowflake';
 if (code <= 82) return 'cloud-rain-wind';
 if (code <= 86) return 'cloud-snow';
 return 'cloud-lightning';
}

/**
 * Get the date ranges for a growing season over the past N years.
 * Returns an array of { startDate, endDate } strings in YYYY-MM-DD format.
 *
 * Season calendars (Indian agriculture):
 * Kharif → June 1 – October 31
 * Rabi → October 15 – March 15
 * Zaid → March 1 – June 15
 */
function getSeasonDateRanges(season, yearsBack = 3) {
 const now = new Date();
 const currentYear = now.getFullYear();
 const ranges = [];

 for (let i = 1; i <= yearsBack; i++) {
 const year = currentYear - i;
 let startDate, endDate;

 switch (season) {
 case 'Kharif':
 startDate = `${year}-06-01`;
 endDate = `${year}-10-31`;
 break;
 case 'Rabi':
 // Rabi spans Oct of one year to Mar of the next
 startDate = `${year}-10-15`;
 endDate = `${year + 1}-03-15`;
 break;
 case 'Zaid':
 startDate = `${year}-03-01`;
 endDate = `${year}-06-15`;
 break;
 case 'Annual':
 case 'Perennial':
 // Full year for perennial/annual crops
 startDate = `${year}-01-01`;
 endDate = `${year}-12-31`;
 break;
 default:
 startDate = `${year}-01-01`;
 endDate = `${year}-12-31`;
 }

 ranges.push({ startDate, endDate, year });
 }

 return ranges;
}

/**
 * Fetch historical seasonal averages for a location over the past N years.
 * Returns averaged temperature, total precipitation, and humidity estimates.
 */
async function fetchSeasonalAverages(lat, lon, season, yearsBack = 10) {
 const ranges = getSeasonDateRanges(season, yearsBack);
 const yearlyData = [];

 for (const range of ranges) {
 try {
 const url = `${OPEN_METEO_ARCHIVE}/archive?latitude=${lat}&longitude=${lon}` +
 `&start_date=${range.startDate}&end_date=${range.endDate}` +
 `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max` +
 `&hourly=relative_humidity_2m` +
 `&timezone=auto`;

 const response = await fetch(url);
 if (!response.ok) continue; // Skip failed years

 const data = await response.json();
 if (!data.daily || !data.daily.time) continue;

 // Calculate season averages for this year
 const temps = data.daily.temperature_2m_mean.filter(t => t !== null);
 const precips = data.daily.precipitation_sum.filter(p => p !== null);

 // Extract humidity from hourly data
 let avgHumidity = 60; // Default fallback
 if (data.hourly && data.hourly.relative_humidity_2m) {
 const humidities = data.hourly.relative_humidity_2m.filter(h => h !== null);
 if (humidities.length > 0) {
 avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
 }
 }

 yearlyData.push({
 year: range.year,
 avgTemperature: temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : null,
 totalPrecipitation: precips.reduce((a, b) => a + b, 0),
 avgHumidity,
 daysWithData: temps.length
 });
 } catch (err) {
 console.warn(`Failed to fetch historical data for ${range.year}:`, err.message);
 continue;
 }
 }

 if (yearlyData.length === 0) {
 return null; // No historical data available — caller will fall back
 }

 // Average across all years
 const validTemps = yearlyData.filter(y => y.avgTemperature !== null);
 const result = {
 avgTemperature: validTemps.length > 0
 ? validTemps.reduce((a, b) => a + b.avgTemperature, 0) / validTemps.length
 : null,
 avgSeasonalPrecipitation: yearlyData.reduce((a, b) => a + b.totalPrecipitation, 0) / yearlyData.length,
 avgHumidity: yearlyData.reduce((a, b) => a + b.avgHumidity, 0) / yearlyData.length,
 yearsOfData: yearlyData.length,
 yearlyBreakdown: yearlyData
 };

 return result;
}

module.exports = {
 geocodeCity,
 fetchCurrentWeather,
 fetchHistoricalWeather,
 fetchSeasonalAverages,
 getSeasonDateRanges,
 getWeatherDescription,
 getWeatherIcon
};
