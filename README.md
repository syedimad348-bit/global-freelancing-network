# Global Freelancing Network

## Overview

A comprehensive job portal and freelance platform featuring 19+ automated job sources, intelligent filtering, and real-time health monitoring for reliable job matching.

## Features

### Job Discovery
- **19+ Active Sources**: Real-time job aggregation from diverse platforms
- **Intelligent Filtering**: Remote/Onsite, Country, Type, Source, and Custom Filters
- **Freshness Labels**: Real-time job aging indicators (New, Recent, Older)
- **Export & Search**: Complete job management with advanced search capabilities

### Monitoring & Reliability
- **Source Health Dashboard**: Real-time status tracking for all job sources
- **Circuit Breakers**: Automatic recovery from source failures
- **Exponential Backoff**: Intelligent retry policies with progressive delays
- **48h Job Expiry**: Automatic cleanup of stale job listings

### Premium Experience
- **AI-Powered Insights**: Intelligent job recommendations and analytics
- **Premium Charts**: Advanced data visualizations (Charts, Heatmaps, Radars)
- **Green Theme**: Modern, accessible UI with emerald color palette

## Technology Stack

### Backend
- Node.js v20 + Express
- MongoDB with advanced indexing
- Live Cache Service with failure recovery
- Cron jobs for automation

### Frontend
- React 19 with CRA
- Tailwind CSS + framer-motion
- Lucide Icons
- Premium chart components

## Setup

```bash
# Clone the repository
<repo-url>

# Navigate to backend
cd backend
npm install

# Navigate to frontend
<backend-root>/frontend
cd frontend
npm install

# Environment variables
# Copy backend/.env.example to backend/.env
# Copy frontend/.env.example to frontend/.env

# Start backend
source backend/.env
node backend/server.js

# Start frontend
<backend-root>/frontend
npm start
```

## Environment Variables

### Backend (.env)
- `MONGO_URL`: MongoDB connection string
- `ADZUNA_APP_ID`: Adzuna API App ID
- `ADZUNA_APP_KEY`: Adzuna API Key
- `RAPIDAPI_KEY`: RapidAPI Key
- `PORT`: Backend server port (default: 8000)
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: JWT refresh secret
- `FRONTEND_URL`: Frontend URL for CORS

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL

## API Endpoints

### Jobs API
- `GET /api/jobs`: Get paginated filtered jobs
- `GET /api/jobs/filters`: Get filter options (countries, types, remoteTypes, sources, folders)

### Health & Monitoring
- `GET /api/health`: System health check
- `GET /api/sources/status`: Source health status

### Authentication
- `POST /api/auth/register`: User registration
- `POST /api/auth/login`: User login
- `POST /api/auth/google`: Google OAuth

## Deployment

### GitHub Actions
The project includes GitHub Actions workflow for automatic deployment to Vercel:

1. Create a GitHub repository from this project
2. Add these secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Vercel authentication token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID
   - `VERCEL_SCOPE`: Your Vercel scope

### Vercel Setup
1. Create a new project in Vercel
2. Import this repository
3. Set environment variables in Vercel Dashboard
4. Configure the domains (optional)

## Running Tests

```bash
# Run backend tests
npm test

# Run frontend tests (if available)
cd frontend
npm test
```

## Project Structure

```
backend/
  ├── routes/          # API routes
  ├── models/         # Database schemas
  ├── controllers/    # Business logic
  ├── services/       # Services
  └── server.js       # Express server

frontend/
  ├── src/            # React source code
  │   ├── pages/     # Page components
  │   ├── lib/       # Utility libraries
  │   └── components/ # UI components
  ├── build/         # Built application
  └── public/        # Static assets

.github/workflows/   # CI/CD pipelines
```

## Development

### Adding New Job Sources

1. Create a new fetcher function in `backend/controllers/fetchJobs.js`
2. Add the source configuration to `backend/services/liveJobCache.js`
3. Test the source with the development environment
4. Verify the source appears in the filters API

### Running Local Development

```bash
# Start MongoDB locally
# Then run backend and frontend as described above
```

## Troubleshooting

### MongoDB Connection Issues
Ensure MongoDB is running and the connection string in `.env` is correct.

### API Key Issues
Double-check API keys in `.env` and verify they have the correct permissions.

### Frontend Build Errors
Ensure all Node.js dependencies are installed correctly. The project requires Node.js 20 or higher.

## Support

For support or questions, please check the documentation or contact the development team.

## License

This project is part of the Global Freelancing Network initiative.
