# GitHub-Vercel Deployment Setup Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `global-freelancing-network` (or your preferred name)
3. Description: "Global Freelancing Network - Job portal with 19+ sources, filtering, and health monitoring"
4. Choose Public or Private as desired
5. Do NOT initialize with README, .gitignore, or License (we already have these)
6. Click "Create repository"

## Step 2: Push Local Repository to GitHub

In your project directory (`D:\global freelancing platform`):

```bash
# Add the remote origin (replace USERNAME with your GitHub username)
git remote add origin https://github.com/syedimad348/global-freelancing-network.git

# Push to main branch
git branch -M main
git push -u origin main
```

## Step 3: Create Vercel Project

1. Go to https://vercel.com and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework: Create React App
   - Root Directory: `frontend` (important!)
   - Build Command: `npm run build`
   - Output Directory: `frontend/build`
   - Install Command: `npm ci`
5. Click "Deploy"

## Step 4: Configure Vercel Environment Variables

In your Vercel project dashboard:

1. Go to Settings → Environment Variables
2. Set `REACT_APP_API_URL` to empty (uses relative URLs with Vercel rewrites)
3. Add `FRONTEND_URL` with your Vercel project URL (e.g., `https://your-project.vercel.app`)

## Step 5: Configure GitHub Actions for Job Fetching

The job-fetching worker runs automatically twice daily via GitHub Actions:
- **11:00 AM Pakistan Time (06:00 UTC)**
- **6:00 PM Pakistan Time (13:00 UTC)**

### Add Required Secrets to GitHub

1. Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret
2. Add each secret with its name and value:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `MONGO_URL` | MongoDB Atlas connection string | Yes |
| `RAPIDAPI_KEY` | RapidAPI key for JSearch | Yes |
| `ADZUNA_APP_ID` | Adzuna App ID | Yes |
| `ADZUNA_APP_KEY` | Adzuna App Key | Yes |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh secret | Yes |
| `FRONTEND_URL` | Your Vercel frontend URL | Yes |
| `PORT` | Server port (default: 8000) | No |

Optional secrets (only add if configured):
| Secret Name | Description |
|-------------|-------------|
| `WHATSAPP_PROVIDER` | WhatsApp provider (e.g., "twilio") |
| `WHATSAPP_API_KEY` | WhatsApp API key |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID |
| `SMTP_HOST` | SMTP server for email alerts |
| `SMTP_PORT` | SMTP port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | Sender email address |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_PRICE_PRO` | Stripe Pro plan price ID |
| `STRIPE_PRICE_PREMIUM` | Stripe Premium plan price ID |
| `PAYPAL_CLIENT_ID` | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret |
| `PAYPAL_ENV` | PayPal environment (sandbox/production) |
| `USAJOBS_API_KEY` | USAJOBS API key |
| `CAREERJET_TERMS` | Careerjet terms |
| `JOOBLE_API_KEY` | Jooble API key |
| `FINDWORK_TOKEN` | Findwork token |
| `AI_ENGINE_URL` | AI engine URL (optional) |

### Initial Workflow Run

After adding secrets:

1. Go to Actions tab in your GitHub repository
2. Find **Job Fetching Worker (Twice Daily - Pakistan Time)** workflow
3. Click "Run workflow" → "Deploy with inputs"
4. Click "Run workflow" button
5. Wait 1-3 minutes, then check the workflow results

## Step 6: Verify Deployment

1. **Check Vercel frontend**: Visit your Vercel project URL
2. **Verify API health**: Visit `https://your-vercel-project.vercel.app/api/health` 
3. **Check job count**: Jobs should appear in the frontend
4. **Monitor Actions**: Go to GitHub → Actions to see scheduled runs

## Backend API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check (database status, job counts) |
| `GET /api/jobs` | Get jobs (supports filtering) |
| `GET /api/jobs/sources/status` | Source health monitoring |
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | User registration |
| `POST /api/ai/resume-analyze` | AI resume analysis |

## Frontend Routing

The frontend uses relative APIs (`API_BASE_URL = ""`) which work with Vercel's rewrite rules:
- `/api/*` → Backend service
- `/(.*)` → Frontend service

## Job Fetching Details

- **Schedule**: Every 6 hours (11 AM and 6 PM Pakistan time)
- **Sources**: 19+ job aggregators (Remotive, RemoteOK, JSearch, etc.)
- **Expiry**: Jobs older than 48 hours are automatically removed
- **Health Monitoring**: Real-time source status via `/api/jobs/sources/status`
- **Rate Limiting**: Respects provider quotas; includes exponential backoff

## Troubleshooting

### Job Fetch Workflow Fails

1. Check Actions tab for error messages
2. Verify all required secrets are set correctly
3. Check MongoDB connection string - ensure it's accessible from GitHub Actions
4. Verify RAPIDAPI_KEY has sufficient quota

### Empty Job Results

1. Run job fetch manually via Actions → "Run workflow"
2. Test using the API: `curl https://your-vercel-project.vercel.app/api/jobs?limit=5`
3. Check source health: `curl https://your-vercel-project.vercel.app/api/jobs/sources/status`
4. Verify API keys have not expired or hit rate limits

### CORS Errors

Ensure `FRONTEND_URL` is set correctly in both:
- Vercel Environment Variables
- GitHub Actions secrets

## Final Notes

Your Global Freelancing Network platform is now set up for:
- ✅ **Frontend on Vercel Hobby** - Free hosting, no infrastructure costs
- ✅ **Job fetching via GitHub Actions** - Runs twice daily automatically (every 6 hours)
- ✅ **MongoDB integration** - Connects to MongoDB Atlas
- ✅ **19+ job sources** - Full aggregator coverage
- ✅ **Source health monitoring** - Real-time status reporting
- ✅ **48-hour job expiry** - Automatic cleanup
- ✅ **Complete API suite** - Auth, AI tools, filters, etc.

The system runs fully automatically:
1. Frontend served by Vercel Hobby (free)
2. Jobs fetched twice daily via GitHub Actions (free for public repos, 2000 mins/month for private)
3. No VPS or local PC required

Next steps:
1. Implement source health dashboard in frontend (optional)
2. Configure email alerts (optional - requires SMTP setup)
3. Add additional API keys for remaining sources if needed
4. Add premium charts to dashboard (already built in)

Happy coding!