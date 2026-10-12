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

## Step 5: Deploy Backend to VPS (Virtual Private Server)

For production deployment with job fetching every 6 hours, deploy the backend to a VPS (DigitalOcean, Linode, AWS EC2, etc.):

### Option A: Using Systemd Service (Recommended for 24/7 operation)

1. **Copy backend files to VPS**
   ```bash
   # On your local machine
   scp -r backend/ your-vps-user@your-vps-ip:/tmp/
   
   # On VPS
   sudo mkdir -p /opt/global-freelancing-platform
   sudo mv /tmp/backend /opt/global-freelancing-platform/
   sudo chown -R $USER:$USER /opt/global-freelancing-platform/backend
   ```

2. **Install Node.js dependencies on VPS**
   ```bash
   cd /opt/global-freelancing-platform/backend
   npm ci
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your actual values
   ```
   Required variables:
   - `MONGO_URL` (your MongoDB Atlas connection string)
   - `RAPIDAPI_KEY` (your RapidAPI key for JSearch)
   - `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` (for Adzuna)
   - `JWT_SECRET` and `JWT_REFRESH_SECRET` (32+ character random strings)
   - `FRONTEND_URL` (your Vercel frontend URL, e.g., `https://your-project.vercel.app`)

4. **Install and start the systemd service**
   ```bash
   # Copy the service file
   sudo cp vps-worker.service /etc/systemd/system/global-freelancing-worker.service
   
   # Update the WorkingDirectory and User in the service file if needed
   sudo nano /etc/systemd/system/global-freelancing-worker.service
   
   # Reload systemd and start the service
   sudo systemctl daemon-reload
   sudo systemctl enable global-freelancing-worker.service
   sudo systemctl start global-freelancing-worker.service
   
   # Check status
   sudo systemctl status global-freelancing-worker.service
   
   # View logs
   sudo journalctl -u global-freelancing-worker.service -f
   ```

### Option B: Using PM2 (Alternative)

```bash
# Install PM2 globally
npm install -g pm2

# Start the worker
pm2 start worker.js --name "gfn-worker" --watch

# Save and set up startup
pm2 save
pm2 startup
```

### Option C: Simple nohup (for testing)

```bash
nohup node worker.js --watch > worker.log 2>&1 &
```

## Step 6: Keep Frontend on Vercel Hobby

The frontend remains deployed on Vercel Hobby tier:
- No changes needed to frontend deployment
- The frontend uses relative URLs (`API_BASE_URL = ""`) which work with Vercel's rewrite rules
- All API calls go to `/api/*` which Vercel rewrites to your VPS backend

## Environment Variables Summary

### Frontend (.env.vercel - Vercel Environment Variables)
```
REACT_APP_API_URL=  # Leave empty for relative URLs (works with Vercel rewrites)
```

### Backend (.env - on VPS)
```
MONGO_URL=mongodb+srv://your-user:your-password@cluster0.example.mongodb.net/freelancing_db?retryWrites=true&w=majority
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
RAPIDAPI_KEY=your_rapidapi_key_here
PORT=8000
JWT_SECRET=your-32-character-jwt-access-secret-here
JWT_REFRESH_SECRET=your-32-character-jwt-refresh-secret-here
FRONTEND_URL=https://your-project.vercel.app  # Your Vercel frontend URL
```

## Verification

1. **Check VPS worker logs**: `sudo journalctl -u global-freelancing-worker.service -f`
2. **Test API endpoints**: `curl https://your-vps-domain.com/api/health`
3. **Verify job fetching**: Check that jobs appear in the frontend after worker runs
4. **Monitor resource usage**: The worker is lightweight and uses minimal resources

## Notes

- The worker runs every 6 hours (configurable in `worker.js`)
- Uses the same job fetching logic as before - no changes to APIs or sources
- Includes automatic job expiry (48 hours) and saved job cleanup
- Processes email alerts as configured
- Runs in cache-only mode if MongoDB is unavailable
- Secure systemd service with restricted privileges

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
RAPIDAPI_KEY=f2ea5188e5msh134673dfca5e4c0p1cc16ajsn2b3f40be1f7c
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

# Start worker mode (VPS job fetching, runs every 6 hours)
cd backend
node worker.js --watch

# Run single job fetch cycle
cd backend
node worker.js

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

### VPS Deployment
```bash
# On VPS - install dependencies
cd /opt/global-freelancing-platform/backend
npm ci

# On VPS - start the worker as systemd service
sudo systemctl start global-freelancing-worker.service
sudo systemctl status global-freelancing-worker.service

# On VPS - view logs
sudo journalctl -u global-freelancing-worker.service -f
```

### Git Workflow
```bash
# On local machine
git branch -M main
git push -u origin main
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