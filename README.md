# 🌾 CropSense — AI-Powered Crop Yield Prediction Portal

<p align="center">
  <strong>Predict crop yield with real-time weather intelligence, multi-factor analysis, and smart farming recommendations.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Chart.js-4.x-FF6384?logo=chartdotjs&logoColor=white" alt="Chart.js" />
  <img src="https://img.shields.io/badge/License-ISC-blue" alt="License" />
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Team](#-team)
- [License](#-license)

---

## 📖 About

**CropSense** is a full-stack agricultural intelligence platform that helps farmers and agronomists make data-driven decisions. It combines real-time weather data from Open-Meteo with a multi-factor scoring algorithm to predict crop yields, estimate revenue, assess disease risks, and recommend optimal crops for specific conditions.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌡️ **Real-Time Weather Dashboard** | Live weather data and 7-day forecasts for any location worldwide |
| 📊 **Yield Prediction Engine** | Multi-factor analysis considering temperature, rainfall, humidity, season, and soil type |
| ⚖️ **Crop Comparison Tool** | Compare 2–6 crops side-by-side on yield, revenue, and suitability |
| 🏆 **Best-Fit Analyzer** | Auto-discover the best crop for your specific location and conditions |
| 💰 **Revenue Estimator** | Estimated income from MSP and market prices with profit projections |
| 🦠 **Disease Risk Alerts** | Weather-based pest and disease risk predictions with preventive tips |
| 💧 **Irrigation Calculator** | Water requirement calculations based on weather and crop type |
| 📜 **Prediction History** | Save, review, and track past predictions with persistent cloud storage |
| 📤 **Export Reports** | Download results as PDF, CSV, or JSON |
| 🔐 **User Authentication** | Secure login/signup with JWT and Google OAuth integration |
| 🤖 **AI Chat Assistant** | Built-in chatbot for farming-related queries |
| 📱 **Responsive Design** | Works seamlessly on desktop, tablet, and mobile devices |
| 🌙 **Dark / Light Mode** | Toggle between themes for comfortable viewing |

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT + Google OAuth 2.0
- **Validation:** express-validator
- **Password Hashing:** bcryptjs

### Frontend
- **Markup:** HTML5 (Semantic)
- **Styling:** Vanilla CSS (Glassmorphism, dark mode, responsive)
- **JavaScript:** Vanilla JS (ES6+)
- **Charts:** Chart.js 4.x
- **Icons:** Lucide Icons
- **Fonts:** Google Fonts (Inter)

### External APIs
- **Weather:** [Open-Meteo](https://open-meteo.com/) (free, no API key required)
- **Geocoding:** [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)

---

## 📁 Project Structure

```
CropSense/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection with fallback
│   ├── controllers/
│   │   ├── authController.js      # Signup, login, Google auth logic
│   │   ├── dashboardController.js # User analytics & stats
│   │   ├── historyController.js   # Prediction history CRUD
│   │   └── predictController.js   # Yield prediction logic
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & token generation
│   │   └── validate.js            # Request validation rules
│   ├── models/
│   │   ├── User.js                # User schema (local + Google auth)
│   │   └── Prediction.js          # Prediction history schema
│   └── routes/
│       ├── auth.js                # Auth routes with rate limiting
│       ├── crops.js               # Crop data & prices routes
│       ├── dashboard.js           # Dashboard stats routes
│       ├── history.js             # History CRUD routes
│       ├── predict.js             # Prediction & comparison routes
│       └── weather.js             # Weather & geocoding proxy routes
├── data/
│   ├── crops.js                   # Crop database (20+ crops with agronomic data)
│   └── prices.js                  # MSP and market price data
├── public/
│   ├── css/
│   │   ├── styles.css             # Main stylesheet (responsive, dark/light)
│   │   └── auth-chatbot-v2.css    # Auth modal & chatbot styles
│   ├── js/
│   │   ├── app.js                 # Main frontend application logic
│   │   └── auth-chatbot-v2.js     # Auth UI & chatbot widget
│   └── index.html                 # Single-page application
├── services/
│   ├── predictionEngine.js        # Multi-factor yield prediction algorithm
│   └── weatherService.js          # Weather data fetching & processing
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies & scripts
├── server.js                      # Express server entry point
└── README.md                      # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **MongoDB Atlas** account — [Sign up](https://www.mongodb.com/cloud/atlas) (free tier works)
- **Git** — [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cropsense.git
   cd cropsense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your values (see [Environment Variables](#-environment-variables)).

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT token signing (use a long random string) |
| `JWT_EXPIRES_IN` | ❌ | Token expiry duration (default: `7d`) |
| `PORT` | ❌ | Server port (default: `3000`) |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth Client ID for "Continue with Google" |
| `CORS_ORIGIN` | ❌ | Comma-separated allowed origins (empty = allow same-origin) |

**Example `.env`:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cropsense?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_random_key_here
JWT_EXPIRES_IN=7d
PORT=3000
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login with email & password |
| `POST` | `/api/auth/google` | Google OAuth sign-in |
| `GET` | `/api/auth/me` | Get current user profile (🔒 protected) |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Predict yield for a single crop |
| `POST` | `/api/compare` | Compare yields across multiple crops |
| `POST` | `/api/best-crop` | Find the best crop for given conditions |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/history` | Get user's prediction history (🔒) |
| `POST` | `/api/history` | Save a prediction to history (🔒) |
| `DELETE` | `/api/history/:id` | Delete a specific prediction (🔒) |
| `DELETE` | `/api/history/all` | Clear all history (🔒) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Get user's analytics stats (🔒) |
| `GET` | `/api/dashboard/charts` | Get chart data for dashboard (🔒) |

### Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/crops` | Get all supported crops |
| `GET` | `/api/prices` | Get crop price data (MSP & market) |
| `GET` | `/api/geocode?city=...` | Geocode a city name |
| `GET` | `/api/weather?lat=...&lon=...` | Get weather for coordinates |

### Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/config` | Frontend configuration |

> 🔒 = Requires `Authorization: Bearer <token>` header

---

## 🌐 Deployment

### Deploy on Render (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables in the Render dashboard:
   - `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GOOGLE_CLIENT_ID`
6. Deploy!

### Deploy on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Add environment variables in the Railway dashboard
3. Railway auto-detects Node.js and deploys

### Post-Deployment Checklist

- [ ] Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] Add your deployed URL to Google Cloud Console → Authorized JavaScript Origins
- [ ] Test signup, login, and prediction workflows
- [ ] Verify data persists in MongoDB Atlas (Database → Browse Collections)

---

## 📸 Screenshots

> _Add screenshots of your application here after deployment._

---

## 👥 Team

| Name | Role |
|------|------|
| Aadit Raj Thakur | Full Stack Developer |

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Made with 💚 for smarter farming
</p>
