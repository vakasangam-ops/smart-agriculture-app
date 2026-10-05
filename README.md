# Krishi Sahayak (కృషి సహాయక్ / कृषि सहायक)

Smart Agriculture and Village Service Center Platform for Indian Farmers.

## Quick Start

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Start backend (Terminal 1)
cd server && npm run dev
# Server: http://localhost:5000

# 3. Start frontend (Terminal 2)
cd client && npm run dev
# App: http://localhost:5173

# 4. Run tests
cd server && npm test
```

No PostgreSQL required. The platform auto-uses an embedded JSON database on first run.

## Demo Accounts

| Role | Phone | Password |
|------|-------|----------|
| Farmer | 9876543210 | Krishi@123 |
| Service Center Staff | 9876543220 | Krishi@123 |
| KVK Agri Scientist | 9876543230 | Krishi@123 |
| Admin | 9876543240 | Krishi@123 |

Or use the **Demo Role Switcher** in the top navbar for instant role simulation.

## Features

- Multi-role: Farmer, Service Center Staff, Agri Expert, Admin
- Multilingual: Telugu, Hindi, English with full UI translation
- Voice Guidance: Web Speech API in regional languages (tap-to-listen)
- Farm and Crop Management: Plots, soil type, crop lifecycle tracking
- Crop Disease Diagnostics: Report issues, AI preliminary screening with mandatory disclaimers, verified expert prescriptions
- Village Service Center: Equipment booking (Tractor, Drone, Harvester), subsidy calculations, Soil Health Cards
- Government Schemes: PM-KISAN, Rythu Bharosa, PMFBY, SMAM - eligibility calculator, online applications, RBK verification
- Mandi Market Prices: APMC daily prices with trend indicators, voice readout
- Weather and Spray Advisory: Live Open-Meteo integration, 7-day forecast, spray suitability index
- Farm Finances: Income/expense ledger, P&L calculator, category breakdown
- Admin Dashboard: KPIs, user directory, pest/weather broadcast alerts

## Architecture

```
server/           Node.js + Express REST API
  src/db/         PostgreSQL OR embedded JSON (auto-fallback)
  src/middleware/ JWT + RBAC auth
  src/routes/     9 route modules (farms, issues, services, schemes, market, weather, finance, admin, auth)
  tests/          7 integration tests

client/           React 18 + Vite
  src/context/    AuthContext + LanguageContext
  src/components/ 11 view components
  src/services/   api.js (REST client) + voice.js (Speech API)
  src/translations/ Complete TE/HI/EN string dictionaries
```

## PostgreSQL (Optional - Production)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/krishi_sahayak
JWT_SECRET=your-64-char-random-secret
```

Schema auto-creates on first boot. Seeds 11 tables with realistic Indian agricultural data.

## Disclaimers

**AI Disease Screening:** Preliminary symptom pattern matching is for early screening ONLY and does NOT guarantee diagnosis. All chemical prescriptions must be validated by a certified KVK Agricultural Scientist.

**Market Prices:** Sourced from e-NAM and State APMC feeds, clearly labelled. Represents auction yard arrivals and may vary from spot prices.

**Weather:** Powered by Open-Meteo (free, open-source). Falls back to calibrated offline model if network unavailable.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, CSS Custom Properties |
| Backend | Node.js 22, Express 4 |
| Database | PostgreSQL OR Embedded JSON |
| Auth | JWT + bcryptjs |
| Weather | Open-Meteo API (no key needed) |
| Speech | Web Speech API |
| Icons | Lucide React |
| Tests | node:test + supertest |

## Production Deployment

```bash
# Build frontend
cd client && npm run build
# Serve dist/ with Nginx

# Backend Nginx proxy
# location /api { proxy_pass http://localhost:5000; }
# location / { try_files $uri /index.html; }
```

Built for Indian farmers. Open for state agriculture departments and NGOs to extend.
