const fs = require('fs');

let js = fs.readFileSync('public/js/app.js', 'utf8');

const injection = `
  // Viability Verdict Banner
  const verdictContainer = $('#viability-verdict');
  if (verdictContainer) {
    if (prediction.compositeScore >= 0.58 && prediction.confidence >= 50) {
      verdictContainer.className = 'viability-verdict verdict-good';
      verdictContainer.innerHTML = '<i data-lucide="check-circle" style="color:var(--accent-primary)"></i> <span><strong>Highly Recommended:</strong> Conditions are optimal. It is good to cultivate this crop.</span>';
    } else if (prediction.compositeScore >= 0.40) {
      verdictContainer.className = 'viability-verdict verdict-avg';
      verdictContainer.innerHTML = '<i data-lucide="info" style="color:var(--cyan)"></i> <span><strong>Moderate Viability:</strong> You can cultivate this crop, but expect average yields.</span>';
    } else {
      verdictContainer.className = 'viability-verdict verdict-poor';
      verdictContainer.innerHTML = '<i data-lucide="alert-octagon" style="color:var(--red)"></i> <span><strong>Not Recommended:</strong> Do not cultivate this crop here. The conditions are unsuitable.</span>';
    }
  }

  // Hero cards`;

js = js.replace('  // Hero cards', injection);

fs.writeFileSync('public/js/app.js', js, 'utf8');
console.log('Verdict injected successfully.');
