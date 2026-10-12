# Global Freelancing Network 🌐⚡

A high-performance web platform for international freelancers. Features live multi-platform job aggregation, AI matching readiness indicators, a curated 20-tool AI and productivity Tricks catalogue with WhatsApp access requests, and freelance project tracking.

---

## Architecture Overview

```text
global-freelancing-platform/
├── frontend/                     # React 19 + Tailwind CSS + Framer Motion
│   ├── public/
│   │   └── images/              # 3D illustration assets & hero artwork
│   └── src/
│       ├── components/          # Reusable UI widgets & modals
│       │   ├── ui/              # Badges, Buttons, Inputs, Logo, Cards
│       │   └── WhatsAppRequestModal.jsx # WhatsApp access request workflow
│       ├── pages/
│       │   ├── Dashboard.jsx    # Complete SaaS dashboard with purple sidebar
│       │   ├── Login.jsx        # 2-column authentication with 3D branding
│       │   ├── Register.jsx     # Form-validated sign up
│       │   └── sections/
│       │       ├── JobHunter.jsx # Live job aggregation & filtering
│       │       ├── Tricks.jsx    # 20 curated AI & productivity tools
│       │       ├── AITools.jsx   # Curated AI directory
│       │       ├── MyInsights.jsx# Career intelligence & analytics
│       │       └── Profile.jsx   # Freelancer portfolio & skill manager
│       ├── lib/
│       │   ├── api.js           # API client with token refresh
│       │   ├── tricksData.js    # Verified metadata for 20 AI tools
│       │   └── usage.js         # Local usage & telemetry state
│       └── index.css            # Light workspace & luxury purple styling
├── backend/                      # Node.js + Express
│   ├── config/                  # JWT secrets & environment configuration
│   ├── controllers/             # Job aggregation & scraping engines
│   ├── middleware/              # JWT auth and error handling
│   ├── models/                  # MongoDB schemas (User, Job, Application, WhatsAppRequest)
│   ├── routes/                  # API endpoints (jobs, auth, ai, features)
│   ├── services/                # In-memory live job cache & alerts
│   └── server.js                # Express server with resilient offline fallbacks
├── ai-engine/                    # Python / FastAPI resume & skill parser
├── .env.example                  # Documented environment variables
├── package.json                  # Root monorepo orchestration scripts
└── README.md
```

---

## Key Features

1. **Premium Light Workspace & Deep Purple Sidebar**:
   - Modern international SaaS aesthetic: crisp white workspace (`#FFFFFF` / `#F8FAFC`), luxury deep purple sidebar (`#1E1035`), restrained purple accents (`#7C3AED`), dark charcoal typography, and subtle shadows.
2. **Main Dashboard**:
   - Real-time KPI Cards: Available Jobs, Saved Jobs, Applications, Active Projects.
   - Interactive SVG Job Activity area chart with hover tooltips.
   - AI Profile Match circular readiness gauge.
   - Recommended Jobs with live application links and instant bookmarking.
   - Freelance Project milestone tracker with task completion percentages.
   - Live timeline of recent user actions and upcoming task deadlines.
3. **20-Tool Tricks Section & WhatsApp Access Requests**:
   - Curated catalogue of 20 high-impact AI and productivity tools across 8 categories (ChatGPT, Claude, Gemini, Perplexity, DeepSeek, Midjourney, Leonardo AI, Ideogram, Adobe Firefly, Runway, Kling AI, Pika, ElevenLabs, Suno, Canva, Figma, Cursor, GitHub Copilot, n8n, Zapier).
   - "Get Trick" interactive modal with international phone validation and country code selection.
   - Backend E.164 phone normalization, rate limiting, and request recording in MongoDB & in-memory cache.
   - Truthful delivery status tracking (`unconfigured_provider` when provider credentials are not yet set).
4. **Live Job Aggregation Engine**:
   - Ingests jobs from Remotive, RemoteOK, Arbeitnow, Jobicy, WeWorkRemotely, and JSearch (when RAPIDAPI_KEY is configured).
   - Automatic deduplication and hourly live cache warming.
   - Operates gracefully even when external APIs or MongoDB are offline.

---

## Setup & Running the Application

### 1. Prerequisites
- Node.js v18+ (tested on Node.js v24)
- npm v9+

### 2. Install Dependencies
```bash
# Install root, backend, and frontend packages
npm run install:all
```

### 3. Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
PORT=8000
JWT_SECRET=your-32-char-jwt-secret
JWT_REFRESH_SECRET=your-32-char-jwt-refresh-secret
FRONTEND_URL=http://localhost:3000
# Optional MongoDB connection (uses memory fallback if omitted):
MONGO_URI=mongodb://localhost:27017/freelancing
# Optional FastAPI resume service (run separately on port 8001):
AI_ENGINE_URL=http://localhost:8001/analyze-resume
```

### 4. Start the Application
```bash
# Start backend and frontend simultaneously
npm run dev

# Or start individually:
npm run start:backend   # Runs on http://localhost:8000
npm run start:frontend  # Runs on http://localhost:3000

# Optional: enable the full resume-analysis service
cd ai-engine
python -m pip install -r requirements.txt
python -m uvicorn main:app --port 8001
```

### 5. Build for Production
```bash
npm run build:frontend
```

---

## Verification & API Endpoints

- **`GET /api/jobs/stats`**: Returns total active jobs count and platform breakdown.
- **`GET /api/jobs`**: Paginated, searchable, and filtered job catalogue.
- **`POST /api/features/whatsapp-request`**: Registers a WhatsApp access request for any tool trick.
- **`GET /api/features/whatsapp-requests`**: Lists stored access requests.
- **`POST /api/auth/register`**: Registers a new user.
- **`POST /api/auth/login`**: Authenticates user and returns JWT session.
