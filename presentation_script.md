# CropSense — Presentation Script (Verified Against Live Website)
## Crop Yield Prediction Portal Using Weather Data
### Total Duration: ~8 minutes | 3 Members

---
---

# ============================================
# MEMBER 3 — Speaks First
# Introduction & Problem Statement (~1.5 min)
# ============================================

Good morning respected faculty and fellow students.

Our team is presenting **CropSense — a Crop Yield Prediction Portal Using Weather Data**.

Agriculture is the backbone of India's economy, contributing nearly 18 percent of our GDP. But even today, most farmers face a critical problem — they cannot accurately predict how much yield they will get from their crops. They depend on outdated methods, word of mouth, and guesswork.

The reason is simple — predicting crop yields is often inaccurate because farmers do not have access to reliable, real-time weather data. Unpredictable weather, poor planning, and no access to analytical tools lead to massive financial losses every year.

So our team built CropSense — a full-stack web portal that takes real-time weather data and combines it with a multi-factor scoring algorithm to give farmers accurate yield predictions, revenue estimates, crop comparisons, and smart farming recommendations.

The website is fully deployed and live on the internet. Let me hand over to my teammate who will walk you through the website and its features.

---
---

# ============================================
# MEMBER 2 — Speaks Second
# Website Walkthrough & All Features (~3 min)
# ============================================

Thank you. I will now open our live website and show you each and every feature.

*(Open browser — go to cropsense-6c81.onrender.com)*


## HERO SECTION (Landing Page)

This is our home page. At the very top, you can see the navigation bar with the CropSense logo on the left. The nav links are — HOME, FEATURES, DASHBOARD, PREDICT, COMPARE, and HISTORY. On the right side, there is a dark mode toggle button, a Login button, and a green Sign Up button.

The hero section has a badge at the top that says "AI-Powered Agriculture". The main heading says "Predict Your Crop Yield With Weather Intelligence" — the second line has a green gradient effect.

Below that is the description — "Analyze real-time weather conditions, compare crops, estimate revenue, and get smart farming recommendations — all powered by multi-factor analysis."

There are two buttons — "Start Prediction" in green which takes the user to the prediction form, and "Weather Dashboard" which takes them to the weather section.

At the bottom of the hero, there are three animated statistics — 20 Crops Supported, 6 Analysis Factors, and 10 Years Historical Data. These numbers count up with animation when the page loads.

There is also a small scroll-down arrow at the very bottom.


## LOGIN & SIGN UP

*(Click the Login button in the navbar)*

When you click Login, this premium modal opens. It has two panels — on the left side, there is the CropSense branding with the tagline "Smarter Farming Starts Here" and a description — "AI-powered crop yield predictions with real-time weather intelligence and multi-factor analysis." Below that, it lists four key features — Yield Predictions, Weather Dashboard, Save & Track History, and Best-Fit Analyzer.

On the right side is the login form. At the top, it says "CROPSENSE ACCOUNT" in green, then "Welcome Back" as the heading, and below that — "Continue to your saved predictions, analytics, and farm planning tools."

There are two tabs — Login and Sign Up. In the Login tab, the form has Email field with placeholder "you@example.com" and Password field with placeholder "Enter your password". There is an eye icon to show or hide the password. Below the fields, there is a "Remember me" checkbox on the left and "Forgot password?" link in green on the right.

Then there is a big green Login button. Below that it says "OR CONTINUE WITH" and a "Continue with Google" button with the Google logo — this is for Google OAuth login.

At the bottom it says "Don't have an account? Sign Up" and "By continuing, you agree to CropSense's Terms and Privacy Policy."

*(Click the Sign Up tab)*

Switching to Sign Up — the heading changes to "Create Account" with subtitle "Create your farming dashboard, save predictions, and track crop decisions." The form now has three fields — Full Name with placeholder "John Doe", Email with placeholder "you@example.com", and Password with label "PASSWORD (min 6 characters)" and placeholder "Create a strong password". There is a password strength indicator bar below the password field. The submit button says "Create Account". Google OAuth is also available here.

At the bottom it says "Already have an account? Login".

*(Close the modal)*


## FEATURES SECTION

*(Scroll down to Features)*

This section has a green tag at the top that says "WHY CROPSENSE?" and the heading is "Intelligent Farming Starts Here". The description says — "Our multi-factor analysis engine combines real-time weather data with agronomic science to deliver reliable yield predictions."

Below that is a grid of 9 feature cards. Each card has an icon, a title, and a short description. Let me go through each one:

1. **Real-Time Weather** — "Live weather data and 7-day forecasts powered by Open-Meteo. No API keys required."
2. **Smart Prediction** — "Multi-factor scoring algorithm analyzing temperature, rainfall, humidity, season & soil."
3. **Crop Comparison** — "Compare multiple crops side-by-side to find the most profitable option for your farm."
4. **Best-Fit Analyzer** — "Auto-discover which crop performs best for your specific location, soil, and season."
5. **Revenue Estimator** — "Estimated income from MSP and market prices, minus cultivation costs for profit projection."
6. **Disease Risk Alerts** — "Weather-based pest and disease risk predictions with preventive recommendations."
7. **Irrigation Calculator** — "Calculate water needs and irrigation schedules based on weather and crop type."
8. **Prediction History** — "Save, review, and compare your past predictions to track conditions over time."
9. **Export Reports** — "Download prediction results as PDF reports or export raw data as CSV/JSON."

Each card has a hover animation — it lifts up when you move your mouse over it.


## WEATHER DASHBOARD

*(Scroll to Dashboard section)*

This section has a green tag "LIVE WEATHER" and the heading "Weather Dashboard". The description says "Get real-time weather data for any location worldwide."

There is a search bar with placeholder text "Enter city name for weather data..." — next to it is a GPS location button and a green "Search" button.

When you search for a city, it shows six weather stat cards — Temperature, Feels Like, Humidity, Wind Speed, Pressure, and Precipitation. Below that it shows 7-Day Forecast cards for each day. And at the bottom, there is a Temperature & Precipitation Trend chart made with Chart.js.


## PREDICTION FORM

*(Scroll to Predict section)*

This section has a green tag "PREDICT NOW" and heading "Enter Your Farming Details". The description says "Fill in the details below and we'll analyze weather conditions to predict your expected crop yield."

The form has 5 input fields:
1. **Location** — text input with placeholder "Enter city name (e.g., New Delhi, Mumbai, Lucknow)" — with a GPS button and a Search button
2. **Select Crop** — dropdown with "Choose a crop..." — has 20 crops like Rice, Wheat, Maize, Sugarcane, Cotton, etc.
3. **Growing Season** — dropdown with "Choose season..." — options are Kharif, Rabi, and Zaid
4. **Soil Type** — dropdown with "Choose soil type..." — options include Alluvial, Black, Red, Laterite, Sandy, Clay, and Loamy
5. **Farm Area (hectares)** — number input with placeholder "e.g., 5"

Below the form, there are two action buttons:
- **Predict Yield** — green glowing button that runs the prediction
- **Find Best Crop** — outline button that automatically finds the best crop for your conditions


## CROP COMPARISON TOOL

*(Scroll to Compare section)*

This section has a green tag "COMPARE" and heading "Crop Comparison Tool". The description says "Select multiple crops to compare their predicted yields, revenues, and suitability side-by-side."

There is a checkbox grid where you can select 2 to 6 crops. An info message says "First set your location, season, soil, and area in the Predict section above, then select crops to compare." There is a "Compare Crops" button that runs the comparison and shows a results table and a yield comparison bar chart.


## PREDICTION HISTORY

*(Scroll to History section)*

This section has a green tag "HISTORY" and heading "Prediction History". The description says "Your saved predictions are stored locally in your browser."

When there are no saved predictions, it shows a message — "No saved predictions yet. Run a prediction and click 'Save to History' to keep it here." There is also a "Clear All History" button.


## CROPSENSE AI CHATBOT

*(Click the green floating button in the bottom-right corner)*

This opens the CropSense AI assistant panel. The header shows "CROPSENSE AI" with "Farm Advisor" below it and a green "ONLINE" status indicator with a close button.

The chatbot sends a welcome message — "Tell me your location, season, soil type, and farm area. I will suggest the next useful action as you move through the workflow."

Below the chat, there are four quick-action buttons — "Next step", "Improve yield", "Explain result", and "Compare crops".

At the bottom, there is a text input with placeholder "Ask anything about your farm..." and a green send button.

*(Close the chatbot)*


## FOOTER

At the bottom of the page is the footer. On the left, it shows the CropSense logo with the text "Intelligent crop yield prediction powered by real-time weather data and multi-factor analysis."

In the middle, under QUICK LINKS — Home, Features, Predict, Compare, History.

On the right, under TECHNOLOGY — Open-Meteo API, Chart.js, Express.js.

At the very bottom — "© 2026 CropSense — Crop Yield Prediction Portal. Built for smarter farming."

That covers all the frontend features. Now I will hand over to our lead developer who will show a live prediction demo, explain the results, the backend architecture, database, and deployment.

---
---

# ============================================
# MEMBER 1 (YOU) — Speaks Third
# Live Demo, All Results, Backend, DB, Deploy (~3.5 min)
# ============================================

Thank you. I will now demonstrate a live prediction, walk you through every result feature, show you the database, and explain how we deployed this.

I developed the complete backend of this project. Let me first explain the technology stack we used.


## TECHNOLOGY STACK

- **Backend** — Node.js with Express.js framework
- **Database** — MongoDB hosted on MongoDB Atlas cloud
- **Authentication** — JWT tokens with bcrypt password hashing
- **Weather API** — Open-Meteo API, which is free and needs no API key
- **Input Validation** — Express Validator middleware for security
- **Frontend** — HTML, CSS, JavaScript with Chart.js for graphs and Lucide Icons

The backend follows MVC architecture — Model, View, Controller — with separate folders for Models, Controllers, Routes, Middleware, and Config. All protected routes go through JWT authentication middleware.


## LIVE PREDICTION DEMO

*(Go to the Predict section on the website)*

Let me run a live prediction now. I will enter:
- Location — Lucknow
- Crop — Rice
- Season — Kharif
- Soil Type — Alluvial
- Farm Area — 5 hectares

*(Click Predict Yield)*

When I click Predict Yield, you can see a loading overlay with three animated steps — "Weather Data", "Analysis", and "Prediction". The system is fetching live weather data from Open-Meteo and running the multi-factor scoring algorithm on the server.


## RESULTS SECTION — Yield Prediction Report

*(Results appear — scroll through them)*

The results section has the tag "RESULTS" and heading "Yield Prediction Report".

At the top of the results, there is an export bar with four buttons — Export PDF, Export CSV, Export JSON, and Save to History. I will explain these in a moment.

Below that, there are four hero cards:
- **Predicted Total Yield** — shows the yield in quintals with per-hectare breakdown
- **Confidence Score** — a percentage showing prediction reliability with a rating like Excellent, Good, or Moderate
- **Current Temperature** — live temperature from the weather API
- **Seasonal Rainfall** — with humidity percentage


## REVENUE ESTIMATOR

Next is the Revenue Estimator panel. It shows:
- MSP price per quintal — the Minimum Support Price set by the government
- Market price per quintal — the current market rate
- Estimated revenue at both MSP and market price
- Cultivation cost estimate
- Net profit — revenue minus cost

This gives farmers a clear picture of how much money they can expect to earn.


## CHARTS & FACTOR ANALYSIS

Below that are two charts:
- **Factor Breakdown** — a pie chart showing how much each factor contributed to the prediction — temperature, rainfall, humidity, season match, and soil suitability
- **Factor Scores** — a bar chart showing the individual score of each analysis factor

Then there is a full-width **7-Day Weather Forecast chart** — a line graph showing temperature and precipitation trends for the next week.

Below the charts are the **Factor Detail cards** — each factor gets its own card showing the exact score and a color-coded rating.


## IRRIGATION CALCULATOR

Next is the Irrigation Calculator panel. It calculates:
- Total water requirement for the crop
- Current rainfall coverage
- Additional irrigation needed
- Recommended irrigation frequency and method


## DISEASE RISK ASSESSMENT

Then comes the Disease Risk Assessment panel. Based on current weather conditions, it shows:
- Possible diseases for the selected crop
- Risk level — Low, Medium, or High
- Preventive recommendations for each disease


## SMART RECOMMENDATIONS

At the bottom of results, there is the Smart Recommendations section with personalized farming tips — advice on irrigation, fertilizer, pest management, and harvest timing.


## EXPORT & SAVE FEATURES

*(Point to the export bar)*

Now let me explain the export options:
- **Export PDF** — downloads the full prediction report as a PDF document
- **Export CSV** — downloads the data as a spreadsheet file
- **Export JSON** — downloads raw data in JSON format
- **Save to History** — saves this prediction to the user's account so they can access it later


## BEST-FIT ANALYZER

*(Go back to Predict section, click Find Best Crop)*

Let me also show the Best-Fit Analyzer. When I click "Find Best Crop", the system analyzes all 20 supported crops for the given location, soil, and season. It ranks them and shows the top crops in a grid with their predicted yield and suitability score. The best crop is highlighted with a gold badge.


## MY ANALYTICS DASHBOARD

*(Click user avatar → My Dashboard — or explain this section)*

When a user is logged in, they get a personal analytics dashboard. It shows four stat cards — Total Predictions, Average Confidence, Most Predicted Crop, and Average Yield.

Below that are three charts:
- **Yield Rating Distribution** — pie chart showing how many predictions were Excellent, Good, or Moderate
- **Average Yield by Crop** — bar chart showing performance for each crop
- **Confidence Trend** — line chart showing how prediction confidence changes over time

At the bottom, there is a Recent Predictions table with columns — Crop, Location, Yield, Confidence, Rating, Date, and Actions. There is also an Export All button.


## MONGODB ATLAS DATABASE

*(Switch browser tab to MongoDB Atlas)*

Now let me show you the database. This is MongoDB Atlas — our cloud-hosted database.

Here you can see the **users collection**. Every registered user is stored here with their name, email, and hashed password. Notice the passwords are fully encrypted using bcrypt — we never store plain text passwords. This is a proper security implementation.

Here is the **predictions collection**. Every time a user runs a yield prediction, it gets saved here with the crop name, location, coordinates, yield value, confidence score, weather data, revenue details, and timestamp. Each prediction is linked to the user's account ID, so they can access their history from any device.

I designed the complete database schema, set up the MongoDB Atlas cluster, configured the connection string, and managed all environment variables.


## DEPLOYMENT ON RENDER

For deployment, I deployed the complete application on **Render** — a cloud hosting platform. The website is live right now at **cropsense-6c81.onrender.com**. I connected it to our GitHub repository for automatic deployment, configured the production environment variables — including the MongoDB connection string, JWT secret, and Node.js runtime settings.

To summarize my contribution — I handled the full backend development, database design, MongoDB Atlas setup, API integration, JWT authentication system, and the complete cloud deployment on Render.

---
---

# ============================================
# MEMBER 3 — Speaks Last
# Conclusion & Future Scope (~30 seconds)
# ============================================

To conclude, CropSense is a complete, production-ready solution to a real-world agricultural problem. It gives farmers data-driven yield predictions using real-time weather data. It helps them compare crops, estimate revenue, detect disease risks, calculate irrigation needs, and get smart farming recommendations — all from a single web portal.

The portal is fully functional, secured with JWT authentication, backed by a cloud database on MongoDB Atlas, and deployed live on the internet.

For future scope, we plan to integrate satellite imagery for soil analysis, add support for regional languages like Hindi and Marathi, and build a mobile application version.

Thank you for your time. We are happy to answer any questions.

---
---

# ============================================
# FEATURE CHECKLIST — Everything Covered
# ============================================

| # | Feature | Shown By |
|---|---------|----------|
| 1 | Navigation bar (HOME, FEATURES, DASHBOARD, PREDICT, COMPARE, HISTORY) | Member 2 |
| 2 | Dark/Light mode toggle button | Member 2 |
| 3 | Login & Sign Up buttons in navbar | Member 2 |
| 4 | Hero section — "AI-Powered Agriculture" badge | Member 2 |
| 5 | Hero heading — "Predict Your Crop Yield With Weather Intelligence" | Member 2 |
| 6 | Hero subtitle description | Member 2 |
| 7 | "Start Prediction" and "Weather Dashboard" CTA buttons | Member 2 |
| 8 | Animated stats — 20 Crops, 6 Factors, 10 Years | Member 2 |
| 9 | Scroll-down arrow animation | Member 2 |
| 10 | Login modal — two-panel glassmorphism design | Member 2 |
| 11 | Login form — Email, Password, eye toggle, Remember me, Forgot password | Member 2 |
| 12 | Google OAuth — "Continue with Google" button | Member 2 |
| 13 | Sign Up form — Full Name, Email, Password with strength indicator | Member 2 |
| 14 | Login/Sign Up tab switching | Member 2 |
| 15 | Terms and Privacy Policy links | Member 2 |
| 16 | Left panel branding — Smarter Farming Starts Here + 4 feature items | Member 2 |
| 17 | Features section — "WHY CROPSENSE?" tag + "Intelligent Farming Starts Here" | Member 2 |
| 18 | Feature card 1: Real-Time Weather | Member 2 |
| 19 | Feature card 2: Smart Prediction | Member 2 |
| 20 | Feature card 3: Crop Comparison | Member 2 |
| 21 | Feature card 4: Best-Fit Analyzer | Member 2 |
| 22 | Feature card 5: Revenue Estimator | Member 2 |
| 23 | Feature card 6: Disease Risk Alerts | Member 2 |
| 24 | Feature card 7: Irrigation Calculator | Member 2 |
| 25 | Feature card 8: Prediction History | Member 2 |
| 26 | Feature card 9: Export Reports | Member 2 |
| 27 | Feature card hover animations | Member 2 |
| 28 | Weather Dashboard — "LIVE WEATHER" tag | Member 2 |
| 29 | Weather search bar + GPS button + Search button | Member 2 |
| 30 | 6 weather stat cards (Temp, Feels Like, Humidity, Wind, Pressure, Precipitation) | Member 2 |
| 31 | 7-Day Forecast day cards | Member 2 |
| 32 | Temperature & Precipitation Trend chart (Chart.js) | Member 2 |
| 33 | Prediction form — "PREDICT NOW" tag | Member 2 |
| 34 | Location input with GPS auto-detect | Member 2 |
| 35 | Crop dropdown (20 crops) | Member 2 |
| 36 | Season dropdown (Kharif, Rabi, Zaid) | Member 2 |
| 37 | Soil Type dropdown (Alluvial, Black, Red, Laterite, Sandy, Clay, Loamy) | Member 2 |
| 38 | Farm Area input (hectares) | Member 2 |
| 39 | "Predict Yield" glowing button | Member 2 |
| 40 | "Find Best Crop" button | Member 2 |
| 41 | Crop Comparison section — "COMPARE" tag | Member 2 |
| 42 | Crop checkbox grid (select 2-6 crops) | Member 2 |
| 43 | "Compare Crops" button | Member 2 |
| 44 | Prediction History section — "HISTORY" tag | Member 2 |
| 45 | History empty state message | Member 2 |
| 46 | "Clear All History" button | Member 2 |
| 47 | CropSense AI Chatbot — "Farm Advisor" header | Member 2 |
| 48 | Chatbot welcome message | Member 2 |
| 49 | Quick-action buttons: Next step, Improve yield, Explain result, Compare crops | Member 2 |
| 50 | Chatbot text input — "Ask anything about your farm..." | Member 2 |
| 51 | Online status indicator (green dot) | Member 2 |
| 52 | Footer — CropSense brand + description | Member 2 |
| 53 | Footer — Quick Links (Home, Features, Predict, Compare, History) | Member 2 |
| 54 | Footer — Technology (Open-Meteo API, Chart.js, Express.js) | Member 2 |
| 55 | Footer — © 2026 copyright | Member 2 |
| 56 | Loading animation (Weather Data → Analysis → Prediction steps) | **Member 1** |
| 57 | Results — "RESULTS" tag + "Yield Prediction Report" heading | **Member 1** |
| 58 | Export PDF button | **Member 1** |
| 59 | Export CSV button | **Member 1** |
| 60 | Export JSON button | **Member 1** |
| 61 | Save to History button | **Member 1** |
| 62 | Result card: Predicted Total Yield (quintals + per hectare) | **Member 1** |
| 63 | Result card: Confidence Score (percentage + rating) | **Member 1** |
| 64 | Result card: Current Temperature | **Member 1** |
| 65 | Result card: Seasonal Rainfall + Humidity | **Member 1** |
| 66 | Revenue Estimator panel (MSP, Market, Cost, Profit) | **Member 1** |
| 67 | Factor Breakdown pie chart | **Member 1** |
| 68 | Factor Scores bar chart | **Member 1** |
| 69 | 7-Day Weather Forecast chart in results | **Member 1** |
| 70 | Factor Detail cards (Temp, Rain, Humidity, Season, Soil scores) | **Member 1** |
| 71 | Irrigation Calculator panel | **Member 1** |
| 72 | Disease Risk Assessment panel | **Member 1** |
| 73 | Smart Recommendations section | **Member 1** |
| 74 | "New Prediction" button in results | **Member 1** |
| 75 | Best-Fit Analyzer results grid with gold badge | **Member 1** |
| 76 | Crop Comparison results table | **Member 1** |
| 77 | Yield Comparison bar chart | **Member 1** |
| 78 | My Analytics Dashboard — 4 stat cards | **Member 1** |
| 79 | Yield Rating Distribution pie chart | **Member 1** |
| 80 | Average Yield by Crop bar chart | **Member 1** |
| 81 | Confidence Trend line chart | **Member 1** |
| 82 | Recent Predictions table | **Member 1** |
| 83 | Export All button | **Member 1** |
| 84 | User avatar dropdown menu (My Dashboard, Prediction History, Logout) | **Member 1** |
| 85 | MongoDB Atlas — Users collection (hashed passwords) | **Member 1** |
| 86 | MongoDB Atlas — Predictions collection | **Member 1** |
| 87 | Render cloud deployment | **Member 1** |
| 88 | GitHub repository integration | **Member 1** |
| 89 | Tech Stack explanation (Node.js, Express, MongoDB, JWT, bcrypt, Open-Meteo) | **Member 1** |
| 90 | MVC architecture explanation | **Member 1** |

---

# TIMING BREAKDOWN

| Member | Duration | Role |
|--------|----------|------|
| Member 3 (Intro + Conclusion) | ~2 min | Supporting |
| Member 2 (Website walkthrough + All features) | ~3 min | Contributing |
| **Member 1 (You)** | **~3.5 min** | **Lead Developer** |
| **TOTAL** | **~8.5 min** | |

---

# PREPARATION CHECKLIST

- [ ] Open cropsense-6c81.onrender.com at least 5 minutes before (Render free tier takes 30-60 seconds to wake up)
- [ ] Log in to MongoDB Atlas in a separate browser tab
- [ ] Have a test account ready (email + password) for the live login demo
- [ ] Remember the demo values: Lucknow, Rice, Kharif, Alluvial, 5 hectares
- [ ] Test the prediction once before the presentation to make sure it works
- [ ] Keep backup screenshots of prediction results in case of internet issues
- [ ] Close the chatbot panel before starting (it blocks feature cards on the right side)
- [ ] Practice speaking 2-3 times — speak naturally, do not read word for word
- [ ] Each member should stand when it is their turn to speak
- [ ] Keep water nearby — 8 minutes of continuous speaking
