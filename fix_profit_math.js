const fs = require('fs');

let file = fs.readFileSync('public/js/app.js', 'utf8');

const oldCode = `  // Risk-adjusted revenue: scale by confidence percentage
  const confidenceFactor = prediction.confidence / 100;
  const riskAdjustedRevenue = Math.round(grossMarket * confidenceFactor);
  const riskAdjustedProfit = riskAdjustedRevenue - cost;`;

const newCode = `  // Expected profit: Yield is already adjusted by the prediction engine
  // so we don't multiply by confidence again, which caused a confusing double-penalty.
  const netProfit = grossMarket - cost;`;

file = file.replace(oldCode, newCode);

// Also replace the HTML variables
file = file.replace(/\$\{riskAdjustedProfit >= 0 \? 'rc-profit' : 'rc-loss'\}/g, "${netProfit >= 0 ? 'rc-profit' : 'rc-loss'}");
file = file.replace(/\$\{riskAdjustedProfit >= 0 \? 'trending-up' : 'trending-down'\}/g, "${netProfit >= 0 ? 'trending-up' : 'trending-down'}");
file = file.replace(/\$\{riskAdjustedProfit >= 0 \? 'var\(--accent-primary\)' : 'var\(--red\)'\}/g, "${netProfit >= 0 ? 'var(--accent-primary)' : 'var(--red)'}");
file = file.replace(/<span class="rc-label">Risk-Adjusted Profit<\/span>/g, '<span class="rc-label">Expected Net Profit</span>');
file = file.replace(/\$\{riskAdjustedProfit >= 0 \? '' : '-'\}\$\{formatINR\(riskAdjustedProfit\)\}/g, "${netProfit >= 0 ? '' : '-'}${formatINR(netProfit)}");
file = file.replace(/\$\{riskAdjustedProfit >= 0 \? 'Expected profit' : 'Expected loss'\}/g, "${netProfit >= 0 ? 'Expected profit' : 'Expected loss'}");

fs.writeFileSync('public/js/app.js', file, 'utf8');
console.log('Fixed double-penalty math in app.js');
