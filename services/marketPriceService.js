const fetch = require('node-fetch');
const { cropPrices } = require('../data/prices');

const DATA_GOV_RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070';
const DATA_GOV_BASE = `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE}`;

const commodityMap = {
  wheat: 'Wheat',
  rice: 'Paddy(Dhan)(Common)',
  maize: 'Maize',
  sugarcane: 'Sugarcane',
  cotton: 'Cotton',
  soybean: 'Soyabean',
  barley: 'Barley (Jau)',
  potato: 'Potato',
  tomato: 'Tomato',
  groundnut: 'Groundnut',
  mustard: 'Mustard',
  chickpea: 'Bengal Gram(Gram)(Whole)',
  onion: 'Onion',
  bajra: 'Bajra(Pearl Millet/Cumbu)',
  ragi: 'Ragi (Finger Millet)',
  jute: 'Jute',
  sunflower: 'Sunflower',
  lentil: 'Lentil (Masur)(Whole)',
  banana: 'Banana',
  mango: 'Mango'
};

function getStoredPrice(cropId) {
  const price = cropPrices[cropId];
  if (!price) return null;
  return {
    cropId,
    source: 'stored_market_average',
    commodity: commodityMap[cropId] || cropId,
    currency: price.currency || 'INR',
    unit: price.unit || 'quintal',
    msp: price.msp,
    marketAvg: price.marketAvg,
    marketHigh: price.marketHigh,
    costPerHa: price.costPerHa,
    fetchedAt: new Date().toISOString()
  };
}

function getRecordNumber(record, keys) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== '') {
      const parsed = Number(String(value).replace(/,/g, ''));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function buildUrl({ cropId, state, market }) {
  const key = process.env.DATA_GOV_API_KEY;
  if (!key) return null;

  const params = new URLSearchParams({
    'api-key': key,
    format: 'json',
    limit: '50'
  });

  const commodity = commodityMap[cropId];
  if (commodity) params.set('filters[commodity]', commodity);
  if (state) params.set('filters[state]', state);
  if (market) params.set('filters[market]', market);

  return `${DATA_GOV_BASE}?${params.toString()}`;
}

async function fetchLiveMarketPrice({ cropId, state, market } = {}) {
  const fallback = getStoredPrice(cropId);
  const url = buildUrl({ cropId, state, market });
  if (!url) return { ...fallback, live: false, note: 'DATA_GOV_API_KEY is not configured.' };

  try {
    const response = await fetch(url, { timeout: 7000 });
    if (!response.ok) throw new Error(`data.gov.in returned ${response.status}`);

    const data = await response.json();
    const records = Array.isArray(data.records) ? data.records : [];
    const pricedRecords = records
      .map(record => ({
        record,
        modalPrice: getRecordNumber(record, ['modal_price', 'Modal Price', 'modal price']),
        minPrice: getRecordNumber(record, ['min_price', 'Min Price', 'min price']),
        maxPrice: getRecordNumber(record, ['max_price', 'Max Price', 'max price'])
      }))
      .filter(item => item.modalPrice !== null);

    if (pricedRecords.length === 0) {
      return { ...fallback, live: false, note: 'No live mandi price matched this crop/location.' };
    }

    const averageModal = pricedRecords.reduce((sum, item) => sum + item.modalPrice, 0) / pricedRecords.length;
    const averageMax = pricedRecords
      .filter(item => item.maxPrice !== null)
      .reduce((sum, item, _, arr) => sum + item.maxPrice / arr.length, 0);
    const latest = pricedRecords[0].record;

    return {
      ...fallback,
      source: 'data_gov_in_agmarknet',
      live: true,
      commodity: latest.commodity || commodityMap[cropId] || cropId,
      market: latest.market || market || null,
      district: latest.district || null,
      state: latest.state || state || null,
      arrivalDate: latest.arrival_date || latest.Arrival_Date || null,
      marketAvg: Math.round(averageModal),
      marketHigh: averageMax ? Math.round(averageMax) : fallback?.marketHigh || Math.round(averageModal),
      recordsUsed: pricedRecords.length,
      fetchedAt: new Date().toISOString()
    };
  } catch (err) {
    return { ...fallback, live: false, note: `Live market price unavailable: ${err.message}` };
  }
}

module.exports = { fetchLiveMarketPrice, getStoredPrice };
