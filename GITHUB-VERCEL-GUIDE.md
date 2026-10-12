# GitHub-Verel Deployment Setup Guide

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

## Step 4: Configure Environment Variables in Vercel

In your Vercel project dashboard:

1. Go to Settings → Environment Variables
2. Add these variables (Production and Preview):
   - `REACT_APP_API_URL`: Your backend API URL (we'll set this after deploying backend)
   - (Add any other frontend-specific variables as needed)

## Step 5: Deploy Backend

For the backend, you have several options:

### Option A: Deploy to Vercel Serverless
1. Create another Vercel project for the backend
2. Import the same repository
3. Configure:
   - Framework: Node.js
   - Root Directory: `backend`
   - Build Command: `npm ci` (or skip if no build needed)
   - Output Directory: (leave blank)
   - Install Command: `npm ci`
   - Development Command: `node server.js`

### Option B: Deploy to Other Hosting
You can deploy the backend to:
- Render.com
- Railway.app
- Fly.io
- AWS EC2
- DigitalOcean
- Or your own VPS

### Option C: Keep Local Development Backend
For development/testing, you can keep the backend running locally and point the frontend to it:
- `REACT_APP_API_URL=http://localhost:8000/api`

## Step 6: Configure Production API URL

Once your backend is deployed:

1. Get your backend URL (e.g., `https://your-backend.vercel.app` or `https://your-backend.onrender.com`)
2. In your frontend Vercel project:
   - Settings → Environment Variables
   - Set `REACT_APP_API_URL` to `https://your-backend-domain.com/api`
3. Redeploy the frontend

## Step 7: Test End-to-End

1. Visit your frontend URL
2. Check that jobs are loading from your deployed backend
3. Test all filters (remote, country, type, source, folder)
4. Verify source health monitoring is working
5. Test premium charts on the dashboard

## Environment Variables Summary

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api  # Development
REACT_APP_API_URL=https://your-backend.com/api  # Production
```

### Backend (.env)
```
MONGO_URL=mongodb+srv://syedimad348_db_user:imad2005@cluster0.kutnn5h.mongodb.net/?appName=Cluster0
ADZUNA_APP_ID=3f6446b2
ADZUNA_APP_KEY=b15781c411fe27dcc32b2112a95f8acb
RAPIDAPI_KEY=8de63d2e38mshfff23dd6037d498p1e2a51jsnae949ab05548
PORT=8000
JWT_SECRET=dailyradar_super_secret_key_2024
JWT_REFRESH_SECRET=dailyradar_super_secret_refresh_key_2024
FRONTEND_URL=http://localhost:3000  # Development
FRONTEND_URL=https://your-frontend.com  # Production
```

## Next Steps for Development

### 1. JSearch API Key Rotation
The JSearch API key is currently exhausted (185/185 monthly requests). You need to:
- Get a new RapidAPI key or rotate the existing one
- Update `RAPIDAPI_KEY` in backend/.env
- Restart the backend

### 2. Add API Keys for Remaining Sources
Four sources require API keys:
- USAJOBS: Add `USAJOBS_API_KEY` to backend/.env
- Careerjet: Add `CAREERJET_TERMS` to backend/.env
- Jooble: Add `JOOBLE_API_KEY` to backend/.env
- Findwork: Add `FINDWORK_TOKEN` to backend/.env

### 3. Implement Frontend Source Health Dashboard
Create a new page or section to display:
- Source health status from `/api/sources/status`
- Circuit breaker states
- Failure counts and recovery status
- Last successful fetch times

### 4. Test All Features
- Verify job counts consistency across dashboard and Job Hunter
- Test all filter combinations
- Verify 48h job expiry is working
- Test source failure recovery mechanisms
- Check premium charts render correctly

## Useful Commands

### Backend
```bash
# Start backend
cd backend
node server.js

# Run full job fetch
node -e "require('./controllers/fetchJobs').fetchAllJobs().then(console.log).catch(console.error)"

# Check health endpoint
curl http://localhost:8000/api/health

# Check jobs count
curl http://localhost:8000/api/jobs?limit=1 | jq '.total'

# Check source status
curl http://localhost:8000/api/sources/status | jq .
```

### Frontend
```bash
# Start development
cd frontend
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Troubleshooting

### Common Issues

#### "Cannot find module" errors
- Run `npm install` in both backend and frontend directories
- Delete node_modules and package-lock.json, then reinstall

#### Port already in use
- Kill existing processes: `taskkill /F /IM node.exe` (Windows) or `pkill -f node` (Mac/Linux)
- Or change the PORT in backend/.env

#### CORS errors
- Ensure FRONTEND_URL is set correctly in backend/.env
- Check that the backend is running and accessible
- Verify API URL in frontend matches backend URL

#### Empty job results
- Check if sources are working via `/api/sources/status`
- Verify API keys are valid
- Check backend logs for fetch errors
- Ensure cron jobs are running (for live cache updates)

## Final Notes

Your Global Freelancing Network platform is now set up for:
- ✅ Local development with full functionality
- ✅ GitHub version control
- ✅ Automated deployment to Vercel via GitHub Actions
- ✅ Scalable architecture with 19+ job sources
- ✅ Reliable job data with health monitoring and failure recovery
- ✅ Premium user experience with charts and analytics

The system is ready for you to:
1. Add remaining API keys for full source coverage
2. Implement the frontend source health dashboard
3. Scale to production usage
4. Add additional features as needed

Happy coding!