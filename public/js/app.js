/**
 * CropSense - Frontend Application v2
 * Full-featured agricultural intelligence portal.
 *
 * Modules:
 * - Core UI (nav, particles, counters)
 * - City Search & GPS Location
 * - Prediction Form & Results
 * - Weather Dashboard
 * - Crop Comparison Tool
 * - Best-Fit Crop Analyzer
 * - Revenue Estimator
 * - Irrigation Calculator
 * - Disease Risk Predictor
 * - Prediction History (localStorage)
 * - Export (PDF, CSV, JSON)
 * - Toast Notifications
 * - Mobile Menu
 */

// ================================================
const state = {
 selectedLocation: null,
 cropsData: null,
 soilTypes: null,
 seasons: null,
 predictionResult: null,
 dashboardWeather: null,
 dashboardLocation: null,
 prices: null,
 charts: {},
 // Auth
 authToken: localStorage.getItem('cropsense_token') || null,
 currentUser: JSON.parse(localStorage.getItem('cropsense_user') || 'null'),
 googleClientId: null,
 googleAuthReady: false,
 theme: localStorage.getItem('cropsense_theme') || 'dark'
};

// ================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const escapeHTML = (value = '') => String(value)
 .replaceAll('&', '&amp;')
 .replaceAll('<', '&lt;')
 .replaceAll('>', '&gt;')
 .replaceAll('"', '&quot;')
 .replaceAll("'", '&#39;');

const iconFallbacks = {
 'activity': '~',
 'alert-circle': '!',
 'archive': '#',
 'area-chart': '^',
 'bar-chart-3': '#',
 'bot': 'AI',
 'bookmark': '|',
 'braces': '{}',
 'brain': '*',
 'calendar': '[]',
 'calendar-days': '#',
 'check-circle': 'OK',
 'chevron-down': 'v',
 'cloud': '~',
 'cloud-rain': '~',
 'cloud-sun': '*',
 'cpu': '#',
 'download': 'v',
 'droplets': 'o',
 'file-text': '=',
 'gauge': '%',
 'git-compare': '<>',
 'history': '@',
 'inbox': '#',
 'indian-rupee': 'Rs',
 'info': 'i',
 'layout-dashboard': '#',
 'leaf': '*',
 'lightbulb': '!',
 'locate': '+',
 'lock': 'o',
 'log-in': '>',
 'log-out': '<',
 'mail': '@',
 'map-pin': '+',
 'maximize-2': '[]',
 'mountain': '^',
 'pie-chart': 'o',
 'refresh-cw': '@',
 'search': '?',
 'send': '>',
 'shield-alert': '!',
 'sprout': '*',
 'sun': '*',
 'table': '#',
 'target': 'o',
 'thermometer': 'deg',
 'trash-2': 'x',
 'trending-up': '^',
 'trophy': '*',
 'user': 'o',
 'user-plus': '+',
 'wind': '~',
 'x': 'x',
 'zap': '!'
};

function renderIcons() {
 if (window.lucide?.createIcons) {
 window.lucide.createIcons();
 return;
 }

 $$('i[data-lucide]').forEach(icon => {
 if (icon.dataset.fallbackIcon === 'true') return;
 const name = icon.getAttribute('data-lucide');
 icon.textContent = iconFallbacks[name] || '*';
 icon.classList.add('lucide-fallback');
 icon.dataset.fallbackIcon = 'true';
 });
}

const els = {
 navbar: $('#navbar'),
 cityInput: $('#city-input'),
 searchCityBtn: $('#search-city-btn'),
 gpsBtn: $('#gps-btn'),
 cityResults: $('#city-results'),
 selectedLocation: $('#selected-location'),
 cropSelect: $('#crop-select'),
 cropInfo: $('#crop-info'),
 seasonSelect: $('#season-select'),
 soilSelect: $('#soil-select'),
 areaInput: $('#area-input'),
 predictBtn: $('#predict-btn'),
 bestCropBtn: $('#best-crop-btn'),
 predictionForm: $('#prediction-form'),
 loadingOverlay: $('#loading-overlay'),
 loadingText: $('#loading-text'),
 loadingSubtext: $('#loading-subtext'),
 resultsSection: $('#results'),
 navResultsLink: $('#nav-results-link'),
 newPredictionBtn: $('#new-prediction-btn'),
 particles: $('#particles'),
 // Dashboard
 dashCityInput: $('#dashboard-city-input'),
 dashSearchBtn: $('#dashboard-search-btn'),
 dashGpsBtn: $('#dashboard-gps-btn'),
 dashCityResults: $('#dashboard-city-results'),
 dashContent: $('#dashboard-content'),
 dashLocationBar: $('#dashboard-location-bar'),
 // Compare
 compareCropGrid: $('#compare-crop-grid'),
 compareBtn: $('#compare-btn'),
 compareResults: $('#compare-results'),
 compareInfoText: $('#compare-info-text'),
 // Best fit
 bestfitSection: $('#bestfit-section'),
 bestfitGrid: $('#bestfit-grid'),
 bestfitSubtitle: $('#bestfit-subtitle'),
 // History
 historyGrid: $('#history-grid'),
 historyEmpty: $('#history-empty'),
 clearHistoryBtn: $('#clear-history-btn'),
 // Export
 exportPdfBtn: $('#export-pdf-btn'),
 exportCsvBtn: $('#export-csv-btn'),
 exportJsonBtn: $('#export-json-btn'),
 savePredictionBtn: $('#save-prediction-btn'),
 assistantFab: $('#assistant-fab'),
 assistantPanel: $('#assistant-panel'),
 assistantClose: $('#assistant-close'),
 assistantMessages: $('#assistant-messages'),
 assistantForm: $('#assistant-form'),
 assistantInput: $('#assistant-input'),
 // Mobile menu
 hamburgerBtn: $('#hamburger-btn'),
 mobileMenuOverlay: $('#mobile-menu-overlay'),
 themeToggle: $('#theme-toggle'),
 mobileThemeToggle: $('#mobile-theme-toggle'),
 mobileThemeToggleAuth: $('#mobile-theme-toggle-auth'),
 // Auth
 authModalOverlay: $('#auth-modal-overlay'),
 authModalClose: $('#auth-modal-close'),
 authModalTitle: $('#auth-modal-title'),
 authModalSubtitle: $('#auth-modal-subtitle'),
 loginForm: $('#login-form'),
 signupForm: $('#signup-form'),
 authError: $('#auth-error'),
 authErrorText: $('#auth-error-text'),
 navAuthButtons: $('#nav-auth-buttons'),
 navUserMenu: $('#nav-user-menu'),
 userAvatarBtn: $('#user-avatar-btn'),
 userDropdown: $('#user-dropdown'),
 navAnalyticsLink: $('#nav-analytics-link'),
 userDashboardSection: $('#user-dashboard')
};

// ================================================
document.addEventListener('DOMContentLoaded', () => {
 initTheme();
 initParticles();
 initNavScroll();
 initStatCounters();
 loadCropsData();
 loadPrices();
 bindEvents();
 loadHistory();
 initAuth();
 initAssistant();
 renderIcons();
});

// Theme
function initTheme() {
 applyTheme(state.theme);
}

function applyTheme(theme) {
 state.theme = theme === 'light' ? 'light' : 'dark';
 document.documentElement.dataset.theme = state.theme;
 localStorage.setItem('cropsense_theme', state.theme);

 const isLight = state.theme === 'light';
 const label = isLight ? 'Switch to dark mode' : 'Switch to light mode';
 const buttonText = isLight ? 'Light Mode' : 'Dark Mode';
 const icon = isLight ? 'sun' : 'moon';

 [els.themeToggle, els.mobileThemeToggle, els.mobileThemeToggleAuth].forEach(btn => {
 if (!btn) return;
 btn.setAttribute('aria-label', label);
 btn.setAttribute('title', label);
 btn.innerHTML = `<i data-lucide="${icon}"></i>${btn.classList.contains('theme-toggle-mobile') ? `<span>${buttonText}</span>` : ''}`;
 });

 renderIcons();
}

function toggleTheme() {
 applyTheme(state.theme === 'light' ? 'dark' : 'light');
}

// ================================================
function initParticles() {
 const container = els.particles;
 for (let i = 0; i < 30; i++) {
 const particle = document.createElement('div');
 particle.className = 'particle';
 particle.style.left = Math.random() * 100 + '%';
 particle.style.animationDuration = (8 + Math.random() * 12) + 's';
 particle.style.animationDelay = Math.random() * 10 + 's';
 particle.style.width = (2 + Math.random() * 3) + 'px';
 particle.style.height = particle.style.width;
 container.appendChild(particle);
 }
}

// ================================================
function initNavScroll() {
 window.addEventListener('scroll', () => {
 els.navbar.classList.toggle('scrolled', window.scrollY > 50);
 });
}

// ================================================
function initStatCounters() {
 const observer = new IntersectionObserver((entries) => {
 entries.forEach(entry => {
 if (entry.isIntersecting) {
 const counters = entry.target.querySelectorAll('.stat-number');
 counters.forEach(counter => animateCounter(counter));
 observer.unobserve(entry.target);
 }
 });
 }, { threshold: 0.5 });

 const statsContainer = document.querySelector('.hero-stats');
 if (statsContainer) observer.observe(statsContainer);
}

function animateCounter(el) {
 const target = parseInt(el.dataset.count);
 const duration = 1500;
 const start = performance.now();

 function update(now) {
 const elapsed = now - start;
 const progress = Math.min(elapsed / duration, 1);
 const eased = 1 - Math.pow(1 - progress, 3);
 el.textContent = Math.round(target * eased);
 if (progress < 1) requestAnimationFrame(update);
 else el.textContent = target;
 }
 requestAnimationFrame(update);
}

// ================================================
async function loadCropsData() {
 try {
 const res = await fetch('/api/crops');
 const json = await res.json();
 if (!json.success) throw new Error(json.error);

 state.cropsData = json.data.crops;
 state.soilTypes = json.data.soilTypes;
 state.seasons = json.data.seasons;

 // Populate crop select
 state.cropsData.forEach(crop => {
 const option = document.createElement('option');
 option.value = crop.id;
 option.textContent = crop.name;
 els.cropSelect.appendChild(option);
 });

 // Populate season select
 state.seasons.forEach(season => {
 const option = document.createElement('option');
 option.value = season.id;
 option.textContent = season.name;
 els.seasonSelect.appendChild(option);
 });

 // Populate soil select
 state.soilTypes.forEach(soil => {
 const option = document.createElement('option');
 option.value = soil;
 option.textContent = soil;
 els.soilSelect.appendChild(option);
 });

 // Populate comparison crop checkboxes
 populateComparisonGrid();

 } catch (err) {
 console.error('Failed to load crops data:', err);
 showToast('Failed to load crop data. Please refresh.', 'error');
 }
}

async function loadPrices() {
 try {
 const res = await fetch('/api/prices');
 const json = await res.json();
 if (json.success) state.prices = json.data;
 } catch (err) {
 console.warn('Failed to load prices:', err);
 }
}

// ================================================
function bindEvents() {
 // City search
 els.searchCityBtn.addEventListener('click', searchCity);
 els.cityInput.addEventListener('keydown', (e) => {
 if (e.key === 'Enter') { e.preventDefault(); searchCity(); }
 });

 // GPS
 els.gpsBtn.addEventListener('click', () => getGPSLocation('predict'));
 els.dashGpsBtn.addEventListener('click', () => getGPSLocation('dashboard'));

 // Crop select change
 els.cropSelect.addEventListener('change', () => {
 showCropInfo(els.cropSelect.value);
 validateForm();
 });

 // Other form changes
 els.seasonSelect.addEventListener('change', validateForm);
 els.soilSelect.addEventListener('change', validateForm);
 els.areaInput.addEventListener('input', validateForm);

 // Form submit
 els.predictionForm.addEventListener('submit', handlePredict);

 // Best crop
 els.bestCropBtn.addEventListener('click', handleBestCrop);

 // New prediction
 els.newPredictionBtn.addEventListener('click', () => {
 els.resultsSection.classList.add('hidden');
 els.navResultsLink.classList.add('hidden');
 document.querySelector('#predict').scrollIntoView({ behavior: 'smooth' });
 });

 // Dashboard search
 els.dashSearchBtn.addEventListener('click', searchDashboardCity);
 els.dashCityInput.addEventListener('keydown', (e) => {
 if (e.key === 'Enter') { e.preventDefault(); searchDashboardCity(); }
 });

 // Compare
 els.compareBtn.addEventListener('click', handleCompare);

 // Export
 els.exportPdfBtn.addEventListener('click', exportPDF);
 els.exportCsvBtn.addEventListener('click', exportCSV);
 els.exportJsonBtn.addEventListener('click', exportJSON);
 els.savePredictionBtn.addEventListener('click', savePrediction);

 // History
 els.clearHistoryBtn.addEventListener('click', clearHistory);

 // Mobile menu
 els.themeToggle?.addEventListener('click', toggleTheme);
 els.mobileThemeToggle?.addEventListener('click', toggleTheme);
 els.mobileThemeToggleAuth?.addEventListener('click', toggleTheme);
 els.hamburgerBtn.addEventListener('click', toggleMobileMenu);
 els.mobileMenuOverlay.addEventListener('click', (e) => {
 if (e.target === els.mobileMenuOverlay) closeMobileMenu();
 });
 $$('.mobile-nav-link').forEach(link => {
 link.addEventListener('click', closeMobileMenu);
 });

 // Auth events
 $('#nav-login-btn')?.addEventListener('click', () => openAuthModal('login'));
 $('#nav-signup-btn')?.addEventListener('click', () => openAuthModal('signup'));
 $('#mobile-login-btn')?.addEventListener('click', () => { closeMobileMenu(); openAuthModal('login'); });
 $('#mobile-signup-btn')?.addEventListener('click', () => { closeMobileMenu(); openAuthModal('signup'); });
 els.authModalClose?.addEventListener('click', closeAuthModal);
 els.authModalOverlay?.addEventListener('click', (e) => { if (e.target === els.authModalOverlay) closeAuthModal(); });
 $('#switch-to-signup')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthMode('signup'); });
 $('#switch-to-login')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthMode('login'); });
 $('#auth-tab-login')?.addEventListener('click', () => switchAuthMode('login'));
 $('#auth-tab-signup')?.addEventListener('click', () => switchAuthMode('signup'));
 els.loginForm?.addEventListener('submit', handleLogin);
 els.signupForm?.addEventListener('submit', handleSignup);
 els.userAvatarBtn?.addEventListener('click', toggleUserDropdown);
 $('#logout-btn')?.addEventListener('click', handleLogout);
 $('#mobile-logout-btn')?.addEventListener('click', () => { closeMobileMenu(); handleLogout(); });
 $('#dropdown-dashboard-link')?.addEventListener('click', () => { closeUserDropdown(); loadUserDashboard(); });
 $('#dash-export-all-btn')?.addEventListener('click', exportAllHistory);
 // Close dropdown on outside click
 document.addEventListener('click', (e) => {
 if (els.userDropdown && !els.userDropdown.classList.contains('hidden') && !e.target.closest('.nav-user-menu')) {
 closeUserDropdown();
 }
 });
}

// ================================================
// TOAST NOTIFICATIONS
// ================================================
function showToast(message, type = 'info', duration = 4000) {
 const container = $('#toast-container');
 const toast = document.createElement('div');
 toast.className = `toast toast-${type}`;

 const icons = { success: 'OK', error: '!', warning: '!', info: 'i' };
 toast.innerHTML = `
 <span class="toast-icon">${icons[type] || icons.info}</span>
 <span class="toast-message">${escapeHTML(message)}</span>
 <button class="toast-close" onclick="this.parentElement.remove()">x</button>
 `;

 container.appendChild(toast);
 requestAnimationFrame(() => toast.classList.add('toast-show'));

 setTimeout(() => {
 toast.classList.remove('toast-show');
 toast.classList.add('toast-hide');
 setTimeout(() => toast.remove(), 400);
 }, duration);
}

// ================================================
// MOBILE MENU
// ================================================
function toggleMobileMenu() {
 els.hamburgerBtn.classList.toggle('active');
 els.mobileMenuOverlay.classList.toggle('hidden');
 document.body.style.overflow = els.mobileMenuOverlay.classList.contains('hidden') ? '' : 'hidden';
}

function closeMobileMenu() {
 els.hamburgerBtn.classList.remove('active');
 els.mobileMenuOverlay.classList.add('hidden');
 document.body.style.overflow = '';
}

// ================================================
// GPS LOCATION
// ================================================
function getGPSLocation(target) {
 if (!navigator.geolocation) {
 showToast('Geolocation is not supported by your browser.', 'error');
 return;
 }

 const btn = target === 'dashboard' ? els.dashGpsBtn : els.gpsBtn;
 btn.disabled = true;
 btn.classList.add('gps-pulsing');

 navigator.geolocation.getCurrentPosition(
 async (position) => {
 const { latitude, longitude } = position.coords;
 try {
 // Reverse geocode to get city name
 const res = await fetch(`/api/geocode?city=${latitude.toFixed(2)},${longitude.toFixed(2)}`);
 const json = await res.json();

 const location = {
 name: json.success && json.data.length > 0 ? json.data[0].name : 'My Location',
 latitude,
 longitude,
 country: json.success && json.data.length > 0 ? json.data[0].country : '',
 state: json.success && json.data.length > 0 ? json.data[0].state : ''
 };

 if (target === 'dashboard') {
 state.dashboardLocation = location;
 els.dashCityInput.value = location.name;
 loadDashboardWeather(latitude, longitude, location);
 } else {
 selectLocation(location);
 els.cityInput.value = location.name;
 }
 showToast(`Location detected: ${location.name}`, 'success');
 } catch (err) {
 showToast('Could not determine your city name.', 'warning');
 // Still use coordinates
 const location = { name: 'My Location', latitude, longitude, country: '', state: '' };
 if (target === 'dashboard') {
 state.dashboardLocation = location;
 loadDashboardWeather(latitude, longitude, location);
 } else {
 selectLocation(location);
 }
 } finally {
 btn.disabled = false;
 btn.classList.remove('gps-pulsing');
 }
 },
 (error) => {
 btn.disabled = false;
 btn.classList.remove('gps-pulsing');
 const messages = {
 1: 'Location access was denied. Please enable it in your browser settings.',
 2: 'Location information is unavailable.',
 3: 'Location request timed out.'
 };
 showToast(messages[error.code] || 'Could not get your location.', 'error');
 },
 { enableHighAccuracy: true, timeout: 10000 }
 );
}

// ================================================
// CITY SEARCH (PREDICT FORM)
// ================================================
async function searchCity() {
 const city = els.cityInput.value.trim();
 if (!city) return;

 els.searchCityBtn.disabled = true;
 els.searchCityBtn.innerHTML = '<i data-lucide="loader"></i>';
 renderIcons();

 try {
 const res = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
 const json = await res.json();
 if (!json.success) throw new Error(json.error);

 const results = json.data;
 els.cityResults.classList.remove('hidden');
 els.cityResults.innerHTML = results.map((r, i) => `
 <div class="city-result-item" data-index="${i}">
 <i data-lucide="map-pin" style="width:14px;height:14px;color:var(--accent-primary)"></i>
 <span class="city-name">${escapeHTML(r.name)}</span>
 <span class="city-meta">${escapeHTML(r.state ? r.state + ', ' : '')}${escapeHTML(r.country)} (${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)})</span>
 </div>
 `).join('');
 renderIcons();

 els.cityResults.querySelectorAll('.city-result-item').forEach(item => {
 item.addEventListener('click', () => {
 const idx = parseInt(item.dataset.index);
 selectLocation(results[idx]);
 });
 });
 } catch (err) {
 els.cityResults.classList.remove('hidden');
 els.cityResults.innerHTML = `<div class="city-result-item" style="color:var(--red)">${escapeHTML(err.message)}</div>`;
 } finally {
 els.searchCityBtn.disabled = false;
 els.searchCityBtn.innerHTML = '<i data-lucide="search"></i> Search';
 renderIcons();
 }
}

function selectLocation(location) {
 state.selectedLocation = location;
 els.cityResults.classList.add('hidden');
 els.selectedLocation.classList.remove('hidden');
 els.selectedLocation.innerHTML = `
 <i data-lucide="check-circle"></i>
 <span>${location.name}${location.state ? ', ' + location.state : ''}, ${location.country} - (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})</span>
 `;
 renderIcons();
 validateForm();
 updateCompareAvailability();
}

// ================================================
function showCropInfo(cropId) {
 if (!cropId) { els.cropInfo.classList.add('hidden'); return; }
 const crop = state.cropsData.find(c => c.id === cropId);
 if (!crop) return;

 els.cropInfo.classList.remove('hidden');
 els.cropInfo.innerHTML = `
 <div class="crop-info-row"><span class="crop-info-label">Temp Range</span><span class="crop-info-value">${crop.optimalTempMin}°C - ${crop.optimalTempMax}°C</span></div>
 <div class="crop-info-row"><span class="crop-info-label">Water Need</span><span class="crop-info-value">${crop.waterNeedMin} - ${crop.waterNeedMax} mm</span></div>
 <div class="crop-info-row"><span class="crop-info-label">Duration</span><span class="crop-info-value">${crop.growthDuration} days</span></div>
 <div class="crop-info-row"><span class="crop-info-label">Base Yield</span><span class="crop-info-value">${crop.baseYield} tons/ha</span></div>
 <div class="crop-info-row"><span class="crop-info-label">Best Season</span><span class="crop-info-value">${crop.preferredSeasons.join(', ')}</span></div>
 <div class="crop-info-row"><span class="crop-info-label">Irrigation</span><span class="crop-info-value">${crop.irrigationMethod}</span></div>
 `;
}

// ================================================
function validateForm() {
 const isValid = (
 state.selectedLocation &&
 els.cropSelect.value &&
 els.seasonSelect.value &&
 els.soilSelect.value &&
 els.areaInput.value && parseFloat(els.areaInput.value) > 0
 );
 els.predictBtn.disabled = !isValid;

 // Best crop needs location + season + soil + area (no crop needed)
 const bestCropValid = (
 state.selectedLocation &&
 els.seasonSelect.value &&
 els.soilSelect.value &&
 els.areaInput.value && parseFloat(els.areaInput.value) > 0
 );
 els.bestCropBtn.disabled = !bestCropValid;
}

// ================================================
// PREDICTION
// ================================================
async function handlePredict(e) {
 e.preventDefault();
 if (els.predictBtn.disabled) return;

 showLoading();
 try {
 await updateLoadingStep('step-weather', 'Fetching Weather Data...', 'Connecting to Open-Meteo API');
 await delay(500);
 await updateLoadingStep('step-analysis', 'Analyzing Conditions...', 'Running multi-factor prediction algorithm');
 await delay(300);

 const res = await fetch('/api/predict', {
 method: 'POST',
 headers: authHeaders(),
 body: JSON.stringify({
 cropId: els.cropSelect.value,
 lat: state.selectedLocation.latitude,
 lon: state.selectedLocation.longitude,
 season: els.seasonSelect.value,
 soilType: els.soilSelect.value,
 area: parseFloat(els.areaInput.value),
 location: state.selectedLocation
 })
 });

 const json = await res.json();
 if (!json.success) throw new Error(json.error);

 await updateLoadingStep('step-prediction', 'Generating Report...', 'Preparing yield prediction report');
 await delay(400);

 state.predictionResult = json.data;
 renderResults(json.data);
 addAssistantMessage('assistant', buildAssistantAdvice());
 showToast('Prediction completed successfully!', 'success');

 // Auto-save to history and refresh dashboard
 await savePrediction();
 if (state.authToken) {
  loadUserDashboard();
 }
 } catch (err) {
 showToast('Prediction failed: ' + err.message, 'error');
 } finally {
 hideLoading();
 }
}

// ================================================
function showLoading() {
 els.loadingOverlay.classList.remove('hidden');
 document.body.style.overflow = 'hidden';
 $$('.loading-step').forEach(s => { s.classList.remove('active', 'done'); });
}

function hideLoading() {
 els.loadingOverlay.classList.add('hidden');
 document.body.style.overflow = '';
}

async function updateLoadingStep(stepId, text, subtext) {
 const steps = ['step-weather', 'step-analysis', 'step-prediction'];
 const currentIdx = steps.indexOf(stepId);
 steps.forEach((s, i) => {
 const el = $(`#${s}`);
 if (i < currentIdx) { el.classList.remove('active'); el.classList.add('done'); }
 else if (i === currentIdx) { el.classList.add('active'); el.classList.remove('done'); }
 });
 els.loadingText.textContent = text;
 els.loadingSubtext.textContent = subtext;
 renderIcons();
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Assistant
function initAssistant() {
 addAssistantMessage('assistant', 'Tell me your location, season, soil type, and farm area. I will suggest the next useful action as you move through the workflow.');
 els.assistantFab?.addEventListener('click', openAssistant);
 els.assistantClose?.addEventListener('click', closeAssistant);
 els.assistantForm?.addEventListener('submit', (e) => {
 e.preventDefault();
 const message = els.assistantInput.value.trim();
 if (!message) return;
 addAssistantMessage('user', message);
 els.assistantInput.value = '';
 setTimeout(() => addAssistantMessage('assistant', buildAssistantResponse(message)), 180);
 });
 $$('[data-assistant-prompt]').forEach(btn => {
 btn.addEventListener('click', () => {
 const prompt = btn.dataset.assistantPrompt;
 addAssistantMessage('user', prompt);
 addAssistantMessage('assistant', buildAssistantResponse(prompt));
 });
 });
}

function openAssistant() {
 els.assistantPanel?.classList.remove('hidden');
 els.assistantFab?.classList.add('hidden');
 renderIcons();
}

function closeAssistant() {
 els.assistantPanel?.classList.add('hidden');
 els.assistantFab?.classList.remove('hidden');
}

function addAssistantMessage(role, text) {
 if (!els.assistantMessages) return;
 const bubble = document.createElement('div');
 bubble.className = `assistant-message assistant-message-${role}`;
 bubble.innerHTML = escapeHTML(text);
 els.assistantMessages.appendChild(bubble);
 els.assistantMessages.scrollTop = els.assistantMessages.scrollHeight;
}

function buildAssistantResponse(message = '') {
 const text = message.toLowerCase();
 if (state.predictionResult) return buildAssistantAdvice(text);
 if (!state.selectedLocation) return 'Start by entering your farm location or using GPS. Weather quality is the foundation for every recommendation.';
 if (!els.seasonSelect.value) return 'Next, select the growing season. This changes the crop suitability score more than most people expect.';
 if (!els.soilSelect.value) return 'Choose the soil type next. If you are unsure, Loamy is a reasonable starting point for a demo, but real soil testing is better.';
 if (!els.areaInput.value) return 'Add your farm area in hectares. Then choose one crop for prediction or multiple crops for comparison.';
 if (!els.cropSelect.value) return 'You are ready to pick a crop. For exploration, use Find Best Crop first, then run a prediction on the top option.';
 if (text.includes('compare')) return 'Select 2 to 6 crops in the Compare section. I would compare your preferred crop against the best-fit crop and one lower-water alternative.';
 return 'You have enough inputs. Click Predict Yield, then check confidence, water needs, disease risk, and revenue before deciding.';
}

function buildAssistantAdvice(topic = '') {
 const d = state.predictionResult;
 if (!d) return buildAssistantResponse(topic);
 const crop = d.crop.name;
 const rating = d.prediction.yieldRating;
 const confidence = Math.round(d.prediction.confidence);
 const score = Math.round(d.prediction.compositeScore * 100);
 const rec = d.recommendations?.[0]?.text || d.recommendations?.[0] || 'Review irrigation, disease risk, and revenue before committing.';

 if (topic.includes('explain')) {
 return `${crop} is rated ${rating} with ${confidence}% confidence and a ${score}% suitability score. The main thing to review now is whether weather and soil conditions match the crop requirements.`;
 }
 if (topic.includes('yield') || topic.includes('improve')) {
 return `To improve ${crop}, focus on the weakest factor in the score chart, then adjust irrigation and disease prevention. Current first recommendation: ${rec}`;
 }
 return `Next step: treat this as a decision checkpoint. For ${crop}, rating is ${rating} and confidence is ${confidence}%. Compare it against 2 alternatives, then save or export the report if it still looks strong.`;
}

// ================================================
// RENDER RESULTS
// ================================================
function renderResults(data) {
 const { crop, prediction, scores, input, recommendations, weather } = data;

 els.resultsSection.classList.remove('hidden');
 els.navResultsLink.classList.remove('hidden');

 // Subtitle
 $('#results-subtitle').textContent =
 `${crop.name} yield prediction for ${state.selectedLocation.name}, ${state.selectedLocation.country} - ${input.season} season on ${input.soilType} soil`;

 // Hero cards
 $('#result-total-yield').textContent = `${prediction.totalYield.toFixed(1)} tons`;
 $('#result-per-hectare').textContent = `${prediction.yieldPerHectare.toFixed(2)} tons/hectare x ${prediction.area} ha`;
 $('#result-confidence').textContent = `${prediction.confidence.toFixed(0)}%`;
 $('#result-rating').textContent = `Rating: ${prediction.yieldRating}`;
 $('#result-temp').textContent = `${weather.current.temperature}°C`;
 $('#result-weather-desc').textContent = weather.current.weatherDescription;
 $('#result-rain').textContent = `${input.totalSeasonalPrecipitation || input.totalPrecipitation7d} mm${input.dataSource === 'historical' ? ' (seasonal avg)' : ''}`;
 $('#result-humidity').textContent = `Humidity: ${input.avgHumidity}%`;

 // Factor details
 renderFactorDetails(scores);

 // Charts
 renderFactorsChart(scores);
 renderScoresChart(scores);
 renderForecastChart(weather.daily);

 // Revenue
 renderRevenuePanel(crop, prediction);

 // Irrigation
 renderIrrigationPanel(crop, input, weather);

 // Disease Risk
 renderDiseasePanel(crop, input);

 // Recommendations
 renderRecommendations(recommendations);

 // Scroll to results
 renderIcons();
 setTimeout(() => {
 els.resultsSection.scrollIntoView({ behavior: 'smooth' });
 }, 100);
}

// ================================================
function renderFactorDetails(scores) {
 const grid = $('#factor-details-grid');
 grid.innerHTML = '';

 Object.entries(scores).forEach(([key, s], i) => {
 const percent = Math.round(s.value * 100);
 let colorClass = 'score-excellent';
 if (percent < 50) colorClass = 'score-poor';
 else if (percent < 65) colorClass = 'score-average';
 else if (percent < 85) colorClass = 'score-good';

 const card = document.createElement('div');
 card.className = 'factor-detail-card';
 card.style.animationDelay = `${0.1 + i * 0.08}s`;
 card.innerHTML = `
 <div class="factor-score ${colorClass}">${percent}%</div>
 <div class="factor-label">${s.label}</div>
 <div class="factor-bar">
 <div class="factor-bar-fill" style="width: 0%"></div>
 </div>
 `;
 grid.appendChild(card);

 setTimeout(() => {
 card.querySelector('.factor-bar-fill').style.width = percent + '%';
 }, 300 + i * 100);
 });
}

// ================================================
function renderFactorsChart(scores) {
 if (state.charts.factors) state.charts.factors.destroy();
 const ctx = $('#factors-chart').getContext('2d');
 const labels = Object.values(scores).map(s => s.label);
 const values = Object.values(scores).map(s => s.weight * 100);
 const colors = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6'];

 state.charts.factors = new Chart(ctx, {
 type: 'doughnut',
 data: {
 labels,
 datasets: [{ data: values, backgroundColor: colors, borderColor: 'rgba(6, 13, 26, 0.8)', borderWidth: 3, hoverOffset: 8 }]
 },
 options: {
 responsive: true, maintainAspectRatio: false, cutout: '60%',
 plugins: {
 legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 12 } },
 tooltip: { backgroundColor: '#111d33', titleColor: '#e8edf5', bodyColor: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.1)', borderWidth: 1, cornerRadius: 8, callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}% weight` } }
 }
 }
 });
}

function renderScoresChart(scores) {
 if (state.charts.scores) state.charts.scores.destroy();
 const ctx = $('#scores-chart').getContext('2d');
 const labels = Object.values(scores).map(s => s.label);
 const values = Object.values(scores).map(s => Math.round(s.value * 100));
 const colors = values.map(v => { if (v >= 85) return '#10b981'; if (v >= 65) return '#14b8a6'; if (v >= 50) return '#f59e0b'; return '#ef4444'; });

 state.charts.scores = new Chart(ctx, {
 type: 'bar',
 data: { labels, datasets: [{ label: 'Score (%)', data: values, backgroundColor: colors.map(c => c + '30'), borderColor: colors, borderWidth: 2, borderRadius: 8, borderSkipped: false }] },
 options: {
 responsive: true, maintainAspectRatio: false,
 scales: {
 y: { beginAtZero: true, max: 100, ticks: { color: '#64748b', font: { family: 'Inter', size: 11 }, callback: v => v + '%' }, grid: { color: 'rgba(148, 163, 184, 0.06)' } },
 x: { ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }, grid: { display: false } }
 },
 plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111d33', titleColor: '#e8edf5', bodyColor: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.1)', borderWidth: 1, cornerRadius: 8, callbacks: { label: (ctx) => ` Score: ${ctx.raw}%` } } }
 }
 });
}

function renderForecastChart(daily, canvasId = 'forecast-chart') {
 const chartKey = canvasId === 'forecast-chart' ? 'forecast' : 'dashForecast';
 if (state.charts[chartKey]) state.charts[chartKey].destroy();

 const ctx = $(`#${canvasId}`).getContext('2d');
 const labels = daily.map(d => {
 const date = new Date(d.date);
 return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
 });

 state.charts[chartKey] = new Chart(ctx, {
 type: 'line',
 data: {
 labels,
 datasets: [
 { label: 'Max Temp (°C)', data: daily.map(d => d.tempMax), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 2.5, tension: 0.4, fill: false, pointBackgroundColor: '#ef4444', pointRadius: 4, pointHoverRadius: 6, yAxisID: 'y' },
 { label: 'Min Temp (°C)', data: daily.map(d => d.tempMin), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', borderWidth: 2.5, tension: 0.4, fill: false, pointBackgroundColor: '#3b82f6', pointRadius: 4, pointHoverRadius: 6, yAxisID: 'y' },
 { label: 'Precipitation (mm)', data: daily.map(d => d.precipitation), borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.15)', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#06b6d4', pointRadius: 4, pointHoverRadius: 6, yAxisID: 'y1' }
 ]
 },
 options: {
 responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
 scales: {
 y: { type: 'linear', position: 'left', title: { display: true, text: 'Temperature (°C)', color: '#64748b', font: { family: 'Inter', size: 11 } }, ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(148, 163, 184, 0.06)' } },
 y1: { type: 'linear', position: 'right', title: { display: true, text: 'Precipitation (mm)', color: '#64748b', font: { family: 'Inter', size: 11 } }, ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }, grid: { drawOnChartArea: false }, beginAtZero: true },
 x: { ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }, grid: { display: false } }
 },
 plugins: {
 legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyleWidth: 12, padding: 16 } },
 tooltip: { backgroundColor: '#111d33', titleColor: '#e8edf5', bodyColor: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.1)', borderWidth: 1, cornerRadius: 8 }
 }
 }
 });
}

// ================================================
function renderRecommendations(recs) {
 const grid = $('#recommendations-grid');
 grid.innerHTML = recs.map((rec, i) => `
 <div class="rec-card rec-${rec.type}" style="animation-delay: ${0.1 + i * 0.08}s">
 <div class="rec-icon"><i data-lucide="${rec.icon}"></i></div>
 <div class="rec-content">
 <h4>${rec.title}</h4>
 <p>${rec.text}</p>
 </div>
 </div>
 `).join('');
 if (window.lucide?.createIcons) window.lucide.createIcons();
}

// ================================================
// REVENUE ESTIMATOR
// ================================================
function renderRevenuePanel(crop, prediction) {
 const panel = $('#revenue-panel');
 const grid = $('#revenue-grid');

 if (!state.prices || !state.prices[crop.id]) {
 panel.style.display = 'none';
 return;
 }
 panel.style.display = '';

 const price = state.prices[crop.id];
 const yieldQuintals = prediction.totalYield * 10; // tons -> quintals (100 kg)
 const grossMSP = price.msp ? Math.round(yieldQuintals * price.msp) : null;
 const grossMarket = Math.round(yieldQuintals * price.marketAvg);
 const cost = Math.round(price.costPerHa * prediction.area);
 const netMarket = grossMarket - cost;

 const formatINR = (val) => '₹' + val.toLocaleString('en-IN');

 grid.innerHTML = `
 <div class="revenue-card rc-yield">
 <span class="rc-label">Total Yield</span>
 <span class="rc-value">${yieldQuintals.toFixed(1)} quintals</span>
 <span class="rc-sub">${prediction.totalYield.toFixed(1)} tons</span>
 </div>
 ${price.msp ? `
 <div class="revenue-card rc-msp">
 <span class="rc-label">MSP Revenue</span>
 <span class="rc-value">${formatINR(grossMSP)}</span>
 <span class="rc-sub">@ ${formatINR(price.msp)}/quintal</span>
 </div>` : ''}
 <div class="revenue-card rc-market">
 <span class="rc-label">Market Revenue</span>
 <span class="rc-value">${formatINR(grossMarket)}</span>
 <span class="rc-sub">@ ${formatINR(price.marketAvg)}/quintal avg</span>
 </div>
 <div class="revenue-card rc-cost">
 <span class="rc-label">Est. Cultivation Cost</span>
 <span class="rc-value">${formatINR(cost)}</span>
 <span class="rc-sub">@ ${formatINR(price.costPerHa)}/hectare</span>
 </div>
 <div class="revenue-card ${netMarket >= 0 ? 'rc-profit' : 'rc-loss'}">
 <span class="rc-label">Est. Net Profit</span>
 <span class="rc-value">${formatINR(Math.abs(netMarket))}</span>
 <span class="rc-sub">${netMarket >= 0 ? 'Profit' : 'Loss'} at market price</span>
 </div>
 `;
}

// ================================================
// IRRIGATION CALCULATOR
// ================================================
function renderIrrigationPanel(crop, input, weather) {
 const grid = $('#irrigation-grid');
 const kc = crop.cropCoefficient || 0.85;

 // Simplified ET0 using Blaney-Criddle method: ET0 = p x (0.46T + 8.13) mm/day
 // p ~ 0.27 for tropical latitudes
 const avgTemp = input.avgTemperature;
 const p = 0.27;
 const et0 = p * (0.46 * avgTemp + 8.13); // mm/day
 const etc = et0 * kc; // crop water need mm/day
 const totalWaterNeed = etc * crop.growthDuration; // mm over season
 const rainfall = input.totalSeasonalPrecipitation || input.totalPrecipitation7d;
 const deficit = Math.max(0, totalWaterNeed - rainfall);
 const irrigationDays = crop.growthDuration;
 const dailyIrr = deficit > 0 ? (deficit / irrigationDays).toFixed(1) : 0;
 const litersPerHa = deficit * 10000; // 1mm over 1ha = 10,000 liters

 const formatNum = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

 grid.innerHTML = `
 <div class="irr-card">
 <span class="irr-label">Reference ET0</span>
 <span class="irr-value">${et0.toFixed(1)} mm/day</span>
 </div>
 <div class="irr-card">
 <span class="irr-label">Crop ET (Kc=${kc})</span>
 <span class="irr-value">${etc.toFixed(1)} mm/day</span>
 </div>
 <div class="irr-card">
 <span class="irr-label">Season Water Need</span>
 <span class="irr-value">${formatNum(totalWaterNeed)} mm</span>
 </div>
 <div class="irr-card">
 <span class="irr-label">Expected Rainfall</span>
 <span class="irr-value">${formatNum(rainfall)} mm</span>
 </div>
 <div class="irr-card ${deficit > 0 ? 'irr-deficit' : 'irr-surplus'}">
 <span class="irr-label">${deficit > 0 ? 'Water Deficit' : 'Sufficient Water'}</span>
 <span class="irr-value">${deficit > 0 ? formatNum(deficit) + ' mm' :'✓ No deficit'}</span>
 </div>
 <div class="irr-card">
 <span class="irr-label">Daily Irrigation Need</span>
 <span class="irr-value">${dailyIrr} mm/day</span>
 </div>
 <div class="irr-card">
 <span class="irr-label">Total Water Volume</span>
 <span class="irr-value">${formatNum(litersPerHa)} L/ha</span>
 </div>
 <div class="irr-card">
 <span class="irr-label">Recommended Method</span>
 <span class="irr-value">${crop.irrigationMethod}</span>
 </div>
 `;
}

// ================================================
// DISEASE RISK PREDICTOR
// ================================================
function renderDiseasePanel(crop, input) {
 const grid = $('#disease-grid');
 if (!crop.diseases || crop.diseases.length === 0) {
 grid.innerHTML = '<p style="color:var(--text-muted)">No disease data available for this crop.</p>';
 return;
 }

 const avgTemp = input.avgTemperature;
 const avgHumidity = input.avgHumidity;

 grid.innerHTML = crop.diseases.map(disease => {
 // Calculate risk level based on current weather
 const tempInRange = avgTemp >= disease.tempMin && avgTemp <= disease.tempMax;
 const humidityHigh = avgHumidity >= disease.humidityMin;

 let riskLevel = 'low';
 let riskColor = 'risk-low';
 let riskPercent = 20;

 if (tempInRange && humidityHigh) {
 riskLevel = 'high';
 riskColor = 'risk-high';
 riskPercent = 75 + Math.min(25, (avgHumidity - disease.humidityMin) * 1.5);
 } else if (tempInRange || humidityHigh) {
 riskLevel = 'moderate';
 riskColor = 'risk-moderate';
 riskPercent = 40 + Math.random() * 20;
 }

 riskPercent = Math.min(95, Math.round(riskPercent));

 return `
 <div class="disease-card ${riskColor}">
 <div class="disease-header">
 <span class="disease-name">${disease.name}</span>
 <span class="disease-risk-badge ${riskColor}">${riskLevel.toUpperCase()}</span>
 </div>
 <div class="disease-bar">
 <div class="disease-bar-fill" style="width:${riskPercent}%"></div>
 </div>
 <div class="disease-conditions">
 <span>Risk when: Humidity >= ${disease.humidityMin}%, Temp ${disease.tempMin} - ${disease.tempMax}°C</span>
 </div>
 </div>
 `;
 }).join('');
}

// ================================================
// WEATHER DASHBOARD
// ================================================
async function searchDashboardCity() {
 const city = els.dashCityInput.value.trim();
 if (!city) return;

 els.dashSearchBtn.disabled = true;
 try {
 const res = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
 const json = await res.json();
 if (!json.success) throw new Error(json.error);

 const results = json.data;
 els.dashCityResults.classList.remove('hidden');
 els.dashCityResults.innerHTML = results.map((r, i) => `
 <div class="city-result-item" data-index="${i}">
 <i data-lucide="map-pin" style="width:14px;height:14px;color:var(--accent-primary)"></i>
 <span class="city-name">${escapeHTML(r.name)}</span>
 <span class="city-meta">${escapeHTML(r.state ? r.state + ', ' : '')}${escapeHTML(r.country)}</span>
 </div>
 `).join('');
 renderIcons();

 els.dashCityResults.querySelectorAll('.city-result-item').forEach(item => {
 item.addEventListener('click', () => {
 const idx = parseInt(item.dataset.index);
 const loc = results[idx];
 state.dashboardLocation = loc;
 els.dashCityResults.classList.add('hidden');
 els.dashCityInput.value = loc.name;
 loadDashboardWeather(loc.latitude, loc.longitude, loc);
 });
 });
 } catch (err) {
 showToast(err.message, 'error');
 } finally {
 els.dashSearchBtn.disabled = false;
 }
}

async function loadDashboardWeather(lat, lon, location) {
 try {
 const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
 const json = await res.json();
 if (!json.success) throw new Error(json.error);

 state.dashboardWeather = json.data;
 els.dashContent.classList.remove('hidden');

 // Location bar
 els.dashLocationBar.innerHTML = `<i data-lucide="map-pin"></i> <strong>${escapeHTML(location.name)}</strong>${escapeHTML(location.state ? ', ' + location.state : '')}, ${escapeHTML(location.country)} - ${escapeHTML(json.data.current.weatherDescription)}`;

 // Stats
 const c = json.data.current;
 $('#dash-temp').textContent = `${c.temperature}°C`;
 $('#dash-feels').textContent = `${c.apparentTemp}°C`;
 $('#dash-humidity').textContent = `${c.humidity}%`;
 $('#dash-wind').textContent = `${c.windSpeed} km/h`;
 $('#dash-pressure').textContent = `${c.pressure} hPa`;
 $('#dash-precip').textContent = `${c.precipitation} mm`;

 // Forecast cards
 renderForecastCards(json.data.daily);

 // Forecast chart
 renderForecastChart(json.data.daily, 'dashboard-forecast-chart');

 renderIcons();
 showToast(`Weather loaded for ${location.name}`, 'success');
 } catch (err) {
 showToast('Failed to load weather: ' + err.message, 'error');
 }
}

function renderForecastCards(daily) {
 const row = $('#forecast-cards-row');
 row.innerHTML = daily.map(d => {
 const date = new Date(d.date);
 const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
 const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
 return `
 <div class="forecast-day-card">
 <span class="fdc-day">${dayName}</span>
 <span class="fdc-date">${dateStr}</span>
 <span class="fdc-desc">${d.weatherDescription}</span>
 <div class="fdc-temps">
 <span class="fdc-max">${d.tempMax}°</span>
 <span class="fdc-min">${d.tempMin}°</span>
 </div>
 <span class="fdc-rain"><i data-lucide="droplets" style="width:12px;height:12px"></i> ${d.precipitation} mm</span>
 </div>
 `;
 }).join('');
}

// ================================================
// CROP COMPARISON
// ================================================
function populateComparisonGrid() {
 if (!state.cropsData) return;
 els.compareCropGrid.innerHTML = state.cropsData.map(crop => `
 <label class="crop-checkbox-label">
 <input type="checkbox" value="${crop.id}" class="compare-crop-cb">
 <span class="crop-cb-visual">
 <span class="crop-cb-name">${crop.name}</span>
 </span>
 </label>
 `).join('');

 // Bind checkbox events
 $$('.compare-crop-cb').forEach(cb => {
 cb.addEventListener('change', updateCompareAvailability);
 });
}

function updateCompareAvailability() {
 const checked = $$('.compare-crop-cb:checked').length;
 const hasLocation = !!state.selectedLocation;
 const hasSeason = !!els.seasonSelect.value;
 const hasSoil = !!els.soilSelect.value;
 const hasArea = !!els.areaInput.value && parseFloat(els.areaInput.value) > 0;

 els.compareBtn.disabled = !(checked >= 2 && checked <= 6 && hasLocation && hasSeason && hasSoil && hasArea);

 if (hasLocation && hasSeason && hasSoil && hasArea) {
 els.compareInfoText.innerHTML = `<i data-lucide="check-circle"></i> <span>Ready! Select 2 - 6 crops to compare. (${checked} selected)</span>`;
 els.compareInfoText.className = 'compare-info-text info-ready';
 } else {
 els.compareInfoText.innerHTML = `<i data-lucide="info"></i> <span>First set your location, season, soil, and area in the Predict section above.</span>`;
 els.compareInfoText.className = 'compare-info-text';
 }
 renderIcons();
}

async function handleCompare() {
 const cropIds = Array.from($$('.compare-crop-cb:checked')).map(cb => cb.value);
 if (cropIds.length < 2) return;

 showLoading();
 try {
 await updateLoadingStep('step-weather', 'Fetching Weather Data...', 'Loading shared weather data for comparison');
 await delay(400);
 await updateLoadingStep('step-analysis', 'Comparing Crops...', `Analyzing ${cropIds.length} crops simultaneously`);

 const res = await fetch('/api/compare', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 cropIds,
 lat: state.selectedLocation.latitude,
 lon: state.selectedLocation.longitude,
 season: els.seasonSelect.value,
 soilType: els.soilSelect.value,
 area: parseFloat(els.areaInput.value)
 })
 });

 const json = await res.json();
 if (!json.success) throw new Error(json.error);

 await updateLoadingStep('step-prediction', 'Building Report...', 'Generating comparison charts');
 await delay(300);

 renderCompareResults(json.data.results);
 showToast(`Compared ${cropIds.length} crops successfully!`, 'success');
 } catch (err) {
 showToast('Comparison failed: ' + err.message, 'error');
 } finally {
 hideLoading();
 }
}

function renderCompareResults(results) {
 els.compareResults.classList.remove('hidden');

 // Table
 const table = $('#compare-table');
 const validResults = results.filter(r => !r.error);

 table.querySelector('thead').innerHTML = `
 <tr>
 <th>Rank</th>
 <th>Crop</th>
 <th>Yield/ha</th>
 <th>Total Yield</th>
 <th>Score</th>
 <th>Rating</th>
 <th>Confidence</th>
 </tr>
 `;

 table.querySelector('tbody').innerHTML = validResults.map((r, i) => {
 return `
 <tr class="${i === 0 ? 'compare-winner' : ''}">
 <td>${i + 1}</td>
 <td>${r.crop.name}</td>
 <td>${r.prediction.yieldPerHectare.toFixed(2)} t/ha</td>
 <td>${r.prediction.totalYield.toFixed(1)} tons</td>
 <td>${(r.prediction.compositeScore * 100).toFixed(0)}%</td>
 <td><span class="rating-badge rating-${r.prediction.yieldRating.toLowerCase().replace(' ', '-')}">${r.prediction.yieldRating}</span></td>
 <td>${r.prediction.confidence.toFixed(0)}%</td>
 </tr>
 `;
 }).join('');

 // Chart
 renderCompareChart(validResults);

 setTimeout(() => {
 els.compareResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
 }, 100);
}

function renderCompareChart(results) {
 if (state.charts.compare) state.charts.compare.destroy();
 const ctx = $('#compare-chart').getContext('2d');

 const labels = results.map(r => r.crop.name);
 const yields = results.map(r => r.prediction.yieldPerHectare);
 const scores = results.map(r => r.prediction.compositeScore * 100);
 const colors = results.map((_, i) => {
 const hue = 150 + i * 30;
 return `hsl(${hue}, 70%, 55%)`;
 });

 state.charts.compare = new Chart(ctx, {
 type: 'bar',
 data: {
 labels,
 datasets: [
 { label: 'Yield (tons/ha)', data: yields, backgroundColor: colors.map(c => c.replace('55%)', '55%, 0.3)')), borderColor: colors, borderWidth: 2, borderRadius: 8, yAxisID: 'y' },
 { label: 'Score (%)', data: scores, type: 'line', borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 2.5, tension: 0.4, pointBackgroundColor: '#f59e0b', pointRadius: 5, yAxisID: 'y1' }
 ]
 },
 options: {
 responsive: true, maintainAspectRatio: false,
 scales: {
 y: { beginAtZero: true, title: { display: true, text: 'Yield (tons/ha)', color: '#64748b' }, ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.06)' } },
 y1: { position: 'right', beginAtZero: true, max: 100, title: { display: true, text: 'Score (%)', color: '#64748b' }, ticks: { color: '#64748b' }, grid: { drawOnChartArea: false } },
 x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
 },
 plugins: {
 legend: { labels: { color: '#94a3b8', font: { family: 'Inter' }, usePointStyle: true } },
 tooltip: { backgroundColor: '#111d33', titleColor: '#e8edf5', bodyColor: '#94a3b8', cornerRadius: 8 }
 }
 }
 });
}

// ================================================
// BEST-FIT CROP ANALYZER
// ================================================
async function handleBestCrop() {
 if (els.bestCropBtn.disabled) return;
 showLoading();

 try {
 await updateLoadingStep('step-weather', 'Fetching Weather...', 'Loading weather for all crop analysis');
 await delay(400);
 await updateLoadingStep('step-analysis', 'Analyzing All 12 Crops...', 'Finding the best fit for your conditions');

 const res = await fetch('/api/best-crop', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 lat: state.selectedLocation.latitude,
 lon: state.selectedLocation.longitude,
 season: els.seasonSelect.value,
 soilType: els.soilSelect.value,
 area: parseFloat(els.areaInput.value)
 })
 });

 const json = await res.json();
 if (!json.success) throw new Error(json.error);

 await updateLoadingStep('step-prediction', 'Ranking Results...', 'Building crop recommendation report');
 await delay(300);

 renderBestFitResults(json.data.results);
 showToast('Best-fit analysis complete!', 'success');
 } catch (err) {
 showToast('Analysis failed: ' + err.message, 'error');
 } finally {
 hideLoading();
 }
}

function renderBestFitResults(results) {
 els.bestfitSection.classList.remove('hidden');
 els.bestfitSubtitle.textContent = `Ranked predictions for ${state.selectedLocation.name} - ${els.seasonSelect.value} season on ${els.soilSelect.value} soil (${els.areaInput.value} ha)`;

 const validResults = results.filter(r => !r.error);
 const formatINR = (val) => 'Rs ' + val.toLocaleString('en-IN');

 els.bestfitGrid.innerHTML = validResults.map((r, i) => {
 const scorePercent = (r.prediction.compositeScore * 100).toFixed(0);
 const hasRevenue = r.revenue && r.revenue.netProfit;

 return `
 <div class="bestfit-card ${i < 3 ? 'bestfit-top' : ''}" style="animation-delay:${i * 0.06}s">
 <div class="bf-rank">${i + 1}</div>
 <div class="bf-header">
 <div>
 <h4 class="bf-name">${r.crop.name}</h4>
 <span class="bf-rating rating-badge rating-${r.prediction.yieldRating.toLowerCase().replace(' ', '-')}">${r.prediction.yieldRating}</span>
 </div>
 </div>
 <div class="bf-stats">
 <div class="bf-stat">
 <span class="bf-stat-label">Yield</span>
 <span class="bf-stat-value">${r.prediction.yieldPerHectare.toFixed(2)} t/ha</span>
 </div>
 <div class="bf-stat">
 <span class="bf-stat-label">Score</span>
 <span class="bf-stat-value">${scorePercent}%</span>
 </div>
 <div class="bf-stat">
 <span class="bf-stat-label">Total</span>
 <span class="bf-stat-value">${r.prediction.totalYield.toFixed(1)} tons</span>
 </div>
 ${hasRevenue ? `
 <div class="bf-stat">
 <span class="bf-stat-label">Net Profit</span>
 <span class="bf-stat-value ${r.revenue.netProfit >= 0 ? 'profit' : 'loss'}">${formatINR(r.revenue.netProfit)}</span>
 </div>` : ''}
 </div>
 <div class="bf-score-bar">
 <div class="bf-score-fill" style="width:${scorePercent}%"></div>
 </div>
 </div>
 `;
 }).join('');

 renderIcons();
 setTimeout(() => {
 els.bestfitSection.scrollIntoView({ behavior: 'smooth' });
 }, 100);
}

// ================================================
// PREDICTION HISTORY (localStorage)
// ================================================
function getHistory() {
 try {
 return JSON.parse(localStorage.getItem('cropsense_history') || '[]');
 } catch { return []; }
}

function saveHistory(history) {
 localStorage.setItem('cropsense_history', JSON.stringify(history));
}

async function savePrediction() {
 if (!state.predictionResult) return;

 const d = state.predictionResult;
 const entry = {
 id: Date.now(),
 timestamp: new Date().toISOString(),
 location: { ...state.selectedLocation },
 cropId: d.crop.id,
 cropName: d.crop.name,
 cropEmoji: '',
 season: d.input.season,
 soilType: d.input.soilType,
 area: d.prediction.area,
 yieldPerHectare: d.prediction.yieldPerHectare,
 totalYield: d.prediction.totalYield,
 compositeScore: d.prediction.compositeScore,
 confidence: d.prediction.confidence,
 yieldRating: d.prediction.yieldRating
 };

 // Always save to localStorage for immediate access
 const history = getHistory();
 history.unshift(entry);
 if (history.length > 50) history.pop();
 saveHistory(history);
 loadHistory();

 // Also persist to server (MongoDB) if logged in
 if (state.authToken) {
  try {
   await fetch('/api/history', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
     cropId: entry.cropId,
     cropName: entry.cropName,
     cropEmoji: entry.cropEmoji,
     location: entry.location,
     season: entry.season,
     soilType: entry.soilType,
     area: entry.area,
     yieldPerHectare: entry.yieldPerHectare,
     totalYield: entry.totalYield,
     compositeScore: entry.compositeScore,
     confidence: entry.confidence,
     yieldRating: entry.yieldRating,
     temperature: d.weather?.current?.temperature || 0,
     humidity: d.input?.avgHumidity || 0,
     precipitation: d.input?.totalSeasonalPrecipitation || d.input?.totalPrecipitation7d || 0
    })
   });
  } catch (err) {
   console.warn('Server save failed, data is safe in localStorage:', err);
  }
 }

 showToast('Prediction saved!', 'success');
}

function loadHistory() {
 const history = getHistory();

 if (history.length === 0) {
 els.historyEmpty.style.display = '';
 els.historyGrid.innerHTML = '';
 els.clearHistoryBtn.classList.add('hidden');
 return;
 }

 els.historyEmpty.style.display = 'none';
 els.clearHistoryBtn.classList.remove('hidden');

 els.historyGrid.innerHTML = history.map(h => {
 const date = new Date(h.timestamp);
 const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
 const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

 return `
 <div class="history-card">
 <div class="hc-header">
 <span class="hc-crop">${h.cropName}</span>
 <button class="hc-delete" onclick="deleteHistoryItem(${h.id})" title="Delete">x</button>
 </div>
 <div class="hc-location"><i data-lucide="map-pin" style="width:12px;height:12px"></i> ${h.location.name}, ${h.location.country}</div>
 <div class="hc-details">
 <span>${h.season} / ${h.soilType} / ${h.area} ha</span>
 </div>
 <div class="hc-results">
 <div class="hc-stat">
 <span class="hc-stat-value">${h.yieldPerHectare.toFixed(2)} t/ha</span>
 <span class="hc-stat-label">Yield</span>
 </div>
 <div class="hc-stat">
 <span class="hc-stat-value">${h.totalYield.toFixed(1)} tons</span>
 <span class="hc-stat-label">Total</span>
 </div>
 <div class="hc-stat">
 <span class="hc-stat-value rating-badge rating-${h.yieldRating.toLowerCase().replace(' ', '-')}">${h.yieldRating}</span>
 <span class="hc-stat-label">Rating</span>
 </div>
 </div>
 <div class="hc-footer">
 <span class="hc-date">${dateStr} at ${timeStr}</span>
 </div>
 </div>
 `;
 }).join('');

 renderIcons();
}

// Global function for inline onclick
window.deleteHistoryItem = function(id) {
 const history = getHistory().filter(h => h.id !== id);
 saveHistory(history);
 loadHistory();
 showToast('Prediction removed from history.', 'info');
};

function clearHistory() {
 if (!confirm('Delete all prediction history?')) return;
 localStorage.removeItem('cropsense_history');
 loadHistory();
 showToast('History cleared.', 'info');
}

// ================================================
// EXPORT: PDF
// ================================================
function exportPDF() {
 if (!state.predictionResult) return;
 window.print();
 showToast('Print dialog opened. Save as PDF to export.', 'info');
}

// ================================================
// EXPORT: CSV
// ================================================
function exportCSV() {
 if (!state.predictionResult) return;
 const d = state.predictionResult;
 const rows = [
 ['Field', 'Value'],
 ['Crop', d.crop.name],
 ['Location', state.selectedLocation.name],
 ['Season', d.input.season],
 ['Soil Type', d.input.soilType],
 ['Area (ha)', d.prediction.area],
 ['Yield per Hectare (tons)', d.prediction.yieldPerHectare],
 ['Total Yield (tons)', d.prediction.totalYield],
 ['Composite Score', d.prediction.compositeScore],
 ['Confidence (%)', d.prediction.confidence],
 ['Rating', d.prediction.yieldRating],
 ['Avg Temperature (°C)', d.input.avgTemperature],
 ['Avg Humidity (%)', d.input.avgHumidity],
 ['Seasonal Precipitation (mm)', d.input.totalSeasonalPrecipitation],
 ['Data Source', d.input.dataSource],
 ...Object.entries(d.scores).map(([k, v]) => [`Score: ${v.label}`, v.value])
 ];

 const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
 downloadFile(csv, `cropsense_${d.crop.id}_${Date.now()}.csv`, 'text/csv');
 showToast('CSV downloaded!', 'success');
}

// ================================================
// EXPORT: JSON
// ================================================
function exportJSON() {
 if (!state.predictionResult) return;
 const d = state.predictionResult;
 const json = JSON.stringify({
 exportDate: new Date().toISOString(),
 location: state.selectedLocation,
 crop: d.crop,
 prediction: d.prediction,
 scores: d.scores,
 input: d.input,
 recommendations: d.recommendations
 }, null, 2);

 downloadFile(json, `cropsense_${d.crop.id}_${Date.now()}.json`, 'application/json');
 showToast('JSON downloaded!', 'success');
}

function downloadFile(content, filename, mimeType) {
 const blob = new Blob([content], { type: mimeType });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
}

// ================================================
// AUTH SYSTEM
// ================================================

/** Get auth headers for API requests */
function authHeaders() {
 const headers = { 'Content-Type': 'application/json' };
 if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;
 return headers;
}

/** Initialize auth state from localStorage */
function initAuth() {
 if (state.authToken && state.currentUser) {
 updateAuthUI(true);
 // Verify token is still valid
 fetch('/api/auth/me', { headers: authHeaders() })
 .then(r => r.json())
 .then(json => {
 if (!json.success) {
 handleLogout(true);
 } else {
 // Token valid — preload dashboard data
 loadUserDashboard();
 }
 })
 .catch(() => {});
 } else {
 updateAuthUI(false);
 }

 // Fetch Google Client ID from server
 fetch('/api/config')
 .then(r => r.json())
 .then(json => {
 if (json.success && json.data.googleClientId && json.data.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
 state.googleClientId = json.data.googleClientId;
 renderGoogleButtons();
 } else {
 renderGoogleConfigWarning();
 }
 })
 .catch(() => renderGoogleConfigWarning());
}

/** Render a helpful disabled Google state when credentials are missing. */
function renderGoogleConfigWarning() {
 ['#google-login-btn', '#google-signup-btn'].forEach((selector) => {
  const btn = $(selector);
  if (!btn) return;
  btn.style.opacity = '0.6';
  btn.style.cursor = 'not-allowed';
  btn.title = 'Add GOOGLE_CLIENT_ID in .env to enable Google Sign-In';
  btn.addEventListener('click', (e) => {
   e.preventDefault();
   e.stopPropagation();
   showToast('Google Sign-In is not configured yet. Add GOOGLE_CLIENT_ID to your .env file.', 'warning');
  });
 });
}

/** Initialize Google Identity Services and bind to custom buttons. */
function renderGoogleButtons(retries = 0) {
  if (!state.googleClientId) {
    renderGoogleConfigWarning();
    return;
  }

  if (typeof google === 'undefined' || !google.accounts?.id) {
    if (retries < 20) {
      setTimeout(() => renderGoogleButtons(retries + 1), 250);
    } else {
      showToast('Google Sign-In library failed to load. Use email login for now.', 'warning');
    }
    return;
  }

  try {
    if (!state.googleAuthReady) {
      google.accounts.id.initialize({
        client_id: state.googleClientId,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      state.googleAuthReady = true;
    }

    // Bind custom Google buttons to trigger the GIS prompt
    ['#google-login-btn', '#google-signup-btn'].forEach((selector) => {
      const btn = $(selector);
      if (!btn || btn.dataset.gisReady === 'true') return;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.title = 'Sign in with your Google account';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback: render a hidden Google button and auto-click it
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'fixed';
            tempDiv.style.top = '-9999px';
            document.body.appendChild(tempDiv);
            google.accounts.id.renderButton(tempDiv, {
              type: 'standard', theme: 'outline', size: 'large',
              text: 'continue_with', click_listener: () => {}
            });
            const gBtn = tempDiv.querySelector('[role="button"]') || tempDiv.querySelector('div[tabindex]');
            if (gBtn) gBtn.click();
            setTimeout(() => tempDiv.remove(), 5000);
          }
        });
      });
      btn.dataset.gisReady = 'true';
    });
  } catch (err) {
    console.error('Google Sign-In init error:', err);
    showToast('Google Sign-In failed to initialize. Use email login.', 'warning');
  }
}

/** Handle Google credential callback */
async function handleGoogleCredential(response) {
 if (!response.credential) {
 showAuthError('Google Sign-In was cancelled.');
 return;
 }

 try {
 const res = await fetch('/api/auth/google', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ credential: response.credential })
 });
 const json = await res.json();
 if (!json.success) throw new Error(json.error);

 // Save token
 state.authToken = json.data.token;
 state.currentUser = json.data.user;
 localStorage.setItem('cropsense_token', json.data.token);
 localStorage.setItem('cropsense_user', JSON.stringify(json.data.user));

 closeAuthModal();
 updateAuthUI(true);
 showToast(`Welcome, ${json.data.user.name}!`, 'success');
 loadUserDashboard();
 } catch (err) {
 showAuthError(err.message);
 }
}

/** Update all UI elements based on auth state */
function updateAuthUI(loggedIn) {
 const user = state.currentUser;
 if (loggedIn && user) {
 // Show user menu, hide auth buttons
 els.navAuthButtons?.classList.add('hidden');
 els.navUserMenu?.classList.remove('hidden');
 els.navAnalyticsLink?.parentElement?.classList.remove('hidden');
 els.userDashboardSection?.classList.remove('hidden');

 // Set user info
 const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
 $('#user-avatar-initials').textContent = initials;
 $('#user-display-name').textContent = user.name;
 $('#dropdown-user-name').textContent = user.name;
 $('#dropdown-user-email').textContent = user.email;
 $('#dashboard-welcome').textContent = `Welcome back, ${user.name.split(' ')[0]}! Here's your prediction analytics.`;

 // Mobile
 $('#mobile-auth-section')?.classList.add('hidden');
 $('#mobile-user-section')?.classList.remove('hidden');
 $('#mobile-user-avatar').textContent = initials;
 $('#mobile-user-name').textContent = user.name;
 $('#mobile-analytics-link')?.parentElement?.classList.remove('hidden');
 } else {
 // Show auth buttons, hide user menu
 els.navAuthButtons?.classList.remove('hidden');
 els.navUserMenu?.classList.add('hidden');
 els.navAnalyticsLink?.parentElement?.classList.add('hidden');
 els.userDashboardSection?.classList.add('hidden');

 // Mobile
 $('#mobile-auth-section')?.classList.remove('hidden');
 $('#mobile-user-section')?.classList.add('hidden');
 $('#mobile-analytics-link')?.parentElement?.classList.add('hidden');
 }
 renderIcons();
}

/** Open auth modal */
function openAuthModal(mode = 'login') {
 els.authModalOverlay?.classList.remove('hidden');
 document.body.style.overflow = 'hidden';
 switchAuthMode(mode);
 els.authError?.classList.add('hidden');
 renderGoogleButtons();
}

/** Close auth modal */
function closeAuthModal() {
  els.authModalOverlay?.classList.add('hidden');
  document.body.style.overflow = '';
  els.loginForm?.reset();
  els.signupForm?.reset();
  els.authError?.classList.add('hidden');
}

/** Switch between login and signup */
function switchAuthMode(mode) {
  const isSignup = mode === 'signup';
  $('#auth-tab-login')?.classList.toggle('active', !isSignup);
  $('#auth-tab-signup')?.classList.toggle('active', isSignup);
  const tabs = $('.auth-mode-tabs');
  if (tabs) tabs.setAttribute('data-active', isSignup ? 'signup' : 'login');
  if (isSignup) {
    els.loginForm?.classList.add('hidden');
    els.signupForm?.classList.remove('hidden');
    els.authModalTitle.textContent = 'Create Account';
    els.authModalSubtitle.textContent = 'Create your farming dashboard, save predictions, and track crop decisions.';
  } else {
    els.signupForm?.classList.add('hidden');
    els.loginForm?.classList.remove('hidden');
    els.authModalTitle.textContent = 'Welcome Back';
    els.authModalSubtitle.textContent = 'Continue to your saved predictions, analytics, and farm planning tools.';
  }
  els.authError?.classList.add('hidden');
  renderIcons();
}

/** Show auth error */
function showAuthError(msg) {
  els.authError?.classList.remove('hidden');
  els.authErrorText.textContent = msg;
}

/** Handle login form submit */
async function handleLogin(e) {
  e.preventDefault();
  const btn = $('#login-submit-btn');
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Logging in...';
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    state.authToken = json.data.token;
    state.currentUser = json.data.user;
    localStorage.setItem('cropsense_token', json.data.token);
    localStorage.setItem('cropsense_user', JSON.stringify(json.data.user));
    closeAuthModal();
    updateAuthUI(true);
    showToast(`Welcome back, ${json.data.user.name}!`, 'success');
    loadUserDashboard();
  } catch (err) {
    showAuthError(err.message);
  } finally {
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Login';
  }
}

/** Handle signup form submit */
async function handleSignup(e) {
 e.preventDefault();
 const btn = $('#signup-submit-btn');
 const name = $('#signup-name').value.trim();
 const email = $('#signup-email').value.trim();
 const password = $('#signup-password').value;

 btn.disabled = true;
 btn.querySelector('span').textContent = 'Creating Account...';

 try {
 const res = await fetch('/api/auth/signup', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ name, email, password })
 });
 const json = await res.json();
 if (!json.success) throw new Error(json.error);

 // Save token
 state.authToken = json.data.token;
 state.currentUser = json.data.user;
 localStorage.setItem('cropsense_token', json.data.token);
 localStorage.setItem('cropsense_user', JSON.stringify(json.data.user));

 closeAuthModal();
 updateAuthUI(true);
 showToast(`Welcome to CropSense, ${json.data.user.name}!`, 'success');
 loadUserDashboard();
 } catch (err) {
 showAuthError(err.message);
 } finally {
 btn.disabled = false;
 btn.querySelector('span').textContent = 'Create Account';
 }
}

/** Handle logout */
function handleLogout(silent = false) {
 state.authToken = null;
 state.currentUser = null;
 localStorage.removeItem('cropsense_token');
 localStorage.removeItem('cropsense_user');
 updateAuthUI(false);
 closeUserDropdown();
 if (!silent) showToast('Logged out successfully.', 'info');
}

/** Toggle user dropdown */
function toggleUserDropdown() {
 els.userDropdown?.classList.toggle('hidden');
}
function closeUserDropdown() {
 els.userDropdown?.classList.add('hidden');
}

// ================================================
// USER ANALYTICS DASHBOARD
// ================================================

async function loadUserDashboard() {
 if (!state.authToken) return;

 try {
 const [statsRes, chartsRes] = await Promise.all([
 fetch('/api/dashboard/stats', { headers: authHeaders() }),
 fetch('/api/dashboard/charts', { headers: authHeaders() })
 ]);
 const statsJson = await statsRes.json();
 const chartsJson = await chartsRes.json();

 if (statsJson.success) renderDashboardStats(statsJson.data);
 if (chartsJson.success) renderDashboardCharts(chartsJson.data);

 // Load history table
 loadDashboardHistory();
 } catch (err) {
 console.error('Dashboard load error:', err);
 }
}

function renderDashboardStats(data) {
 $('#dash-total-predictions').textContent = data.totalPredictions;
 $('#dash-avg-confidence').textContent = data.avgConfidence ? `${data.avgConfidence}%` : ' - ';
 $('#dash-top-crop').textContent = data.topCrop ? data.topCrop.name : ' - ';
 $('#dash-avg-yield').textContent = data.avgYield || ' - ';
}

function renderDashboardCharts(data) {
 // Rating distribution - doughnut
 if (data.yieldByCrop && data.yieldByCrop.length > 0) {
 renderDashRatingChart(data);
 renderDashYieldChart(data);
 }
 if (data.confidenceOverTime && data.confidenceOverTime.length > 0) {
 renderDashConfidenceChart(data);
 }
}

function renderDashRatingChart(data) {
 if (state.charts.dashRating) state.charts.dashRating.destroy();
 const canvas = $('#dash-rating-chart');
 if (!canvas) return;

 // Count by crop
 const labels = data.yieldByCrop.map(c => c.crop);
 const values = data.yieldByCrop.map(c => c.count);
 const colors = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316'];

 state.charts.dashRating = new Chart(canvas.getContext('2d'), {
 type: 'doughnut',
 data: {
 labels,
 datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderColor: 'rgba(6,13,26,0.8)', borderWidth: 3, hoverOffset: 8 }]
 },
 options: {
 responsive: true, maintainAspectRatio: false, cutout: '60%',
 plugins: {
 legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 14, usePointStyle: true, pointStyleWidth: 12 } },
 tooltip: { backgroundColor: '#111d33', titleColor: '#e8edf5', bodyColor: '#94a3b8', borderColor: 'rgba(148,163,184,0.1)', borderWidth: 1, cornerRadius: 8 }
 }
 }
 });
}

function renderDashYieldChart(data) {
 if (state.charts.dashYield) state.charts.dashYield.destroy();
 const canvas = $('#dash-yield-chart');
 if (!canvas) return;

 const labels = data.yieldByCrop.map(c => c.crop);
 const values = data.yieldByCrop.map(c => c.avgYield);
 const colors = values.map(v => { if (v >= 10) return '#10b981'; if (v >= 3) return '#14b8a6'; return '#3b82f6'; });

 state.charts.dashYield = new Chart(canvas.getContext('2d'), {
 type: 'bar',
 data: {
 labels,
 datasets: [{ label: 'Avg Yield (tons/ha)', data: values, backgroundColor: colors.map(c => c + '30'), borderColor: colors, borderWidth: 2, borderRadius: 8, borderSkipped: false }]
 },
 options: {
 responsive: true, maintainAspectRatio: false, indexAxis: 'y',
 scales: {
 x: { beginAtZero: true, ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(148,163,184,0.06)' } },
 y: { ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }, grid: { display: false } }
 },
 plugins: {
 legend: { display: false },
 tooltip: { backgroundColor: '#111d33', titleColor: '#e8edf5', bodyColor: '#94a3b8', borderColor: 'rgba(148,163,184,0.1)', borderWidth: 1, cornerRadius: 8, callbacks: { label: (ctx) => ` Avg: ${ctx.raw} tons/ha` } }
 }
 }
 });
}

function renderDashConfidenceChart(data) {
 if (state.charts.dashConfidence) state.charts.dashConfidence.destroy();
 const canvas = $('#dash-confidence-chart');
 if (!canvas) return;

 const items = data.confidenceOverTime;
 const labels = items.map((c, i) => `#${i + 1}`);
 const values = items.map(c => c.confidence);

 state.charts.dashConfidence = new Chart(canvas.getContext('2d'), {
 type: 'line',
 data: {
 labels,
 datasets: [{
 label: 'Confidence %',
 data: values,
 borderColor: '#10b981',
 backgroundColor: 'rgba(16,185,129,0.08)',
 borderWidth: 2.5, tension: 0.4, fill: true,
 pointBackgroundColor: '#10b981', pointRadius: 4, pointHoverRadius: 7
 }]
 },
 options: {
 responsive: true, maintainAspectRatio: false,
 scales: {
 y: { beginAtZero: true, max: 100, ticks: { color: '#64748b', font: { family: 'Inter', size: 11 }, callback: v => v + '%' }, grid: { color: 'rgba(148,163,184,0.06)' } },
 x: { ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }, grid: { display: false } }
 },
 plugins: {
 legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } } },
 tooltip: { backgroundColor: '#111d33', titleColor: '#e8edf5', bodyColor: '#94a3b8', borderColor: 'rgba(148,163,184,0.1)', borderWidth: 1, cornerRadius: 8, callbacks: { label: (ctx) => ` ${ctx.raw}%` } }
 }
 }
 });
}

/** Load prediction history into dashboard table */
async function loadDashboardHistory() {
 if (!state.authToken) return;

 try {
 const res = await fetch('/api/history?limit=20', { headers: authHeaders() });
 const json = await res.json();
 if (!json.success) return;

 const { predictions } = json.data;
 const tbody = $('#dash-history-tbody');
 const emptyState = $('#dash-history-empty');
 const tableWrap = $('.dash-history-table-wrap');

 if (!predictions || predictions.length === 0) {
 emptyState?.classList.remove('hidden');
 if (tableWrap) tableWrap.style.display = 'none';
 return;
 }

 emptyState?.classList.add('hidden');
 if (tableWrap) tableWrap.style.display = '';

 tbody.innerHTML = predictions.map(p => {
 const date = new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
 const ratingClass = (p.yieldRating || '').toLowerCase().replace(/\s+/g, '-');
 const predictionId = encodeURIComponent(p._id);
 return `
 <tr>
 <td><div class="crop-cell">${escapeHTML(p.cropName)}</div></td>
 <td>${escapeHTML(p.location?.name || '-')}</td>
 <td>${p.totalYield?.toFixed(1) || '-'} t</td>
 <td>${p.confidence?.toFixed(0) || '-'}%</td>
 <td><span class="rating-badge rating-${escapeHTML(ratingClass)}">${escapeHTML(p.yieldRating || '-')}</span></td>
 <td>${date}</td>
 <td>
 <button class="dash-delete-btn" onclick="deleteDashPrediction('${predictionId}')" title="Delete">
 <i data-lucide="trash-2"></i>
 </button>
 </td>
 </tr>
 `;
 }).join('');

 renderIcons();
 } catch (err) {
 console.error('Load dashboard history error:', err);
 }
}

/** Delete a prediction from dashboard */
async function deleteDashPrediction(id) {
 if (!state.authToken) return;
 try {
 const res = await fetch(`/api/history/${id}`, { method: 'DELETE', headers: authHeaders() });
 const json = await res.json();
 if (json.success) {
 showToast('Prediction deleted.', 'success');
 loadUserDashboard();
 } else {
 showToast(json.error || 'Failed to delete.', 'error');
 }
 } catch (err) {
 showToast('Delete failed.', 'error');
 }
}

/** Export all prediction history as JSON */
async function exportAllHistory() {
 if (!state.authToken) return;
 try {
 const res = await fetch('/api/history?limit=1000', { headers: authHeaders() });
 const json = await res.json();
 if (json.success) {
 const content = JSON.stringify(json.data.predictions, null, 2);
 downloadFile(content, `cropsense_all_predictions_${Date.now()}.json`, 'application/json');
 showToast('All predictions exported!', 'success');
 }
 } catch (err) {
 showToast('Export failed.', 'error');
 }
}


