/**
 * Crop Market Prices v2
 * Sources: Government of India MSP 2024-25, AGMARKNET, NAFED
 * Prices in INR per quintal (100 kg)
 */

const cropPrices = {
 wheat: { msp: 2275, marketAvg: 2400, marketHigh: 2800, costPerHa: 35000, unit: 'quintal', currency: 'INR' },
 rice: { msp: 2203, marketAvg: 2500, marketHigh: 3200, costPerHa: 42000, unit: 'quintal', currency: 'INR' },
 maize: { msp: 2090, marketAvg: 2200, marketHigh: 2600, costPerHa: 30000, unit: 'quintal', currency: 'INR' },
 sugarcane: { msp: 315, marketAvg: 350, marketHigh: 400, costPerHa: 85000, unit: 'quintal', currency: 'INR' },
 cotton: { msp: 7121, marketAvg: 7500, marketHigh: 9000, costPerHa: 45000, unit: 'quintal', currency: 'INR' },
 soybean: { msp: 4600, marketAvg: 4800, marketHigh: 5500, costPerHa: 32000, unit: 'quintal', currency: 'INR' },
 barley: { msp: 1850, marketAvg: 2000, marketHigh: 2400, costPerHa: 28000, unit: 'quintal', currency: 'INR' },
 potato: { msp: null, marketAvg: 1200, marketHigh: 2500, costPerHa: 95000, unit: 'quintal', currency: 'INR' },
 tomato: { msp: null, marketAvg: 2000, marketHigh: 8000, costPerHa: 120000, unit: 'quintal', currency: 'INR' },
 groundnut: { msp: 6377, marketAvg: 6500, marketHigh: 7500, costPerHa: 38000, unit: 'quintal', currency: 'INR' },
 mustard: { msp: 5650, marketAvg: 5800, marketHigh: 7000, costPerHa: 30000, unit: 'quintal', currency: 'INR' },
 chickpea: { msp: 5440, marketAvg: 5600, marketHigh: 7200, costPerHa: 28000, unit: 'quintal', currency: 'INR' },
 onion: { msp: null, marketAvg: 1500, marketHigh: 4000, costPerHa: 80000, unit: 'quintal', currency: 'INR' },
 bajra: { msp: 2500, marketAvg: 2600, marketHigh: 3000, costPerHa: 22000, unit: 'quintal', currency: 'INR' },
 ragi: { msp: 3846, marketAvg: 4000, marketHigh: 5000, costPerHa: 25000, unit: 'quintal', currency: 'INR' },
 jute: { msp: 5050, marketAvg: 5200, marketHigh: 6500, costPerHa: 35000, unit: 'quintal', currency: 'INR' },
 sunflower: { msp: 6760, marketAvg: 7000, marketHigh: 8500, costPerHa: 32000, unit: 'quintal', currency: 'INR' },
 lentil: { msp: 6425, marketAvg: 6600, marketHigh: 8000, costPerHa: 26000, unit: 'quintal', currency: 'INR' },
 banana: { msp: null, marketAvg: 800, marketHigh: 2000, costPerHa: 150000, unit: 'quintal', currency: 'INR' },
 mango: { msp: null, marketAvg: 3000, marketHigh: 8000, costPerHa: 60000, unit: 'quintal', currency: 'INR' }
};

module.exports = { cropPrices };
