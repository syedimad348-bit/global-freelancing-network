Global Freelancing Network Frontend

## Overview

The frontend is a React-based job portal with a green emerald theme, featuring:

- Job search and filtering
- Premium chart components for analytics
- Source health monitoring
- AI-powered features
- Responsive design

## Key Features

### Job Discovery
- **Advanced Filters**: Remote/Onsite, Country, Type, Source, Folder
- **Smart Sorting**: By newest, oldest, or company name
- **Freshness Labels**: Real-time job aging indicators

### Premium Components
- **TrendLineChart**: Time series data visualization
- **DonutChart**: Percentage-based data display
- **BarChartComp**: Comparative data analysis
- **HeatmapGrid**: Multi-dimensional data visualization
- **HorizontalBarChart**: Horizontal bar charts
- **RadarChart**: Multi-axis comparison

### Health Monitoring
- **Source Status**: Real-time source health indicators
- **Failure Tracking**: Circuit breaker status
- **Circuit Breaker Recovery**: Automatic service restoration

### Premium Insights
- **Advanced Analytics**: Premium chart components
- **Job Insights**: Intelligent job matching
- **Performance Metrics**: System performance tracking

## Technology Stack

- React 19 with Create React App
- Tailwind CSS with custom configuration
- framer-motion for animations
- Lucide React for icons
- Chart.js for data visualization

## Project Structure

```
src/
├── App.js                    # Main application component
├── index.js                  # Application entry point
├── components/               # UI components
│   ├── Button.jsx            # Button component
│   ├── Card.jsx              # Card component
│   └── Logo.jsx              # Logo component
├── lib/                      # Utility libraries
│   ├── api.js                 # API utilities
│   ├── admin.js               # Admin utilities
│   ├── aiTools.js             # AI tools utilities
│   └── ...                   # Other utility libraries
└── pages/                    # Page components
    ├── Dashboard.jsx          # Dashboard page
    ├── Login.jsx              # Login page
    ├── Register.jsx           # Registration page
    ├── sections/               # Section pages
    │   ├── JobHunter.jsx       # Job search page
    │   └── ...                 # Other sections
    └── ...                    # Other pages
```

## Running the Frontend

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

## Environment Variables

### Development (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api
```

### Production

Set these environment variables in your hosting environment (Vercel, etc.):

- `REACT_APP_API_URL`: Your backend API URL
- `PUBLIC_URL`: Base URL for production (if needed)

## Scripts

### Available Scripts

- `npm start`: Start development server
- `npm test`: Run tests
- `npm run lint`: Lint code
- `npm run build`: Build for production

## Key Components

### Premium Chart Components

All premium charts are defined in `frontend/src/pages/Dashboard.jsx`:

- **PremiumChartCard**: Wrapper component for all charts
- **TrendLineChart**: Line chart for time series data
- **DonutChart**: Pie chart for percentage data
- **BarChartComp**: Bar chart for comparative data
- **HeatmapGrid**: Heatmap for multi-dimensional data
- **HorizontalBarChart**: Horizontal bar chart
- **RadarChart**: Radar chart for multi-axis comparison

### Health Monitoring Components

- **SourceStatusCard**: Displays source health information
- **CircuitBreakerIndicator**: Shows circuit breaker status
- **FailureRecoveryIndicator**: Shows failure recovery status

## Styling

### Color Scheme

The project uses a green emerald theme:

- Primary: Emerald green (#10b981)
- Secondary: Gray shades (#6b7280, #4b5563)
- Accent: Blue shades (#3b82f6, #1d4ed8)

### Typography

- Font family: Inter (sans-serif)
- Font sizes: Responsive using Tailwind

### Layout

- Container max-width: 1280px
- Spacing: 4px grid units
- Border radius: 8px

## API Integration

### Backend Endpoints

The frontend integrates with the following backend endpoints:

- `GET /api/jobs`: Get paginated jobs
- `GET /api/jobs/filters`: Get filter options
- `GET /api/health`: System health check
- `GET /api/sources/status`: Source health status

### API Service

All API calls are handled by `frontend/src/lib/api.js`:

```javascript
import api from './lib/api';

// Get jobs
const jobs = await api.get('/api/jobs');

// Get filters
const filters = await api.get('/api/jobs/filters');
```

## Development Tips

### Adding New Pages

1. Create a new file in `src/pages/`
2. Follow the existing page structure
3. Use existing components when possible
4. Test your changes in development

### Adding New Components

1. Create a new file in `src/components/`
2. Follow the existing component structure
3. Use Tailwind classes for styling
4. Add TypeScript if needed

### Working with Charts

All charts are defined in `Dashboard.jsx`. To add a new chart:

1. Import Chart.js components
2. Define the chart data structure
3. Add the chart component to the PremiumCharts section
4. Test the chart in the dashboard

## Testing

### Frontend Tests

Run tests using:

```bash
cd frontend
npm test
```

The project includes tests for:

- Component rendering
- API integration
- User interactions

## Deployment

### Vercel Deployment

For automatic deployment to Vercel:

1. Push to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel Dashboard
4. Deploy!

### Local Production Build

```bash
cd frontend
npm run build
```

## Troubleshooting

### Common Issues

#### "Failed to compile"
Ensure all dependencies are installed and there are no syntax errors.

#### API Connection Issues
Check that the backend server is running and the API URL is correct.

#### CSS Issues
Ensure Tailwind is properly configured and there are no CSS conflicts.

## Additional Resources

### Dependencies

This project depends on:

- React 19
- Node.js 18+
- MongoDB

### Configuration

- Tailwind CSS configured in `frontend/tailwind.config.js`
- Environment variables in `frontend/.env.example`
- Build configuration in `frontend/package.json`

## Related Projects

This project is part of the Global Freelancing Network platform, which includes:

- Backend API server
- Admin dashboard
- Mobile applications
- Various integrations

For more information, visit the main README.md file.
