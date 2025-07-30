# Deployment Guide

This guide will help you deploy the Event Finder application to production.

## Prerequisites

- Google Maps API key with the following APIs enabled:
  - Geocoding API
  - Distance Matrix API
- PostgreSQL database (local or cloud)
- Node.js hosting platform

## Step 1: Set Up PostgreSQL Database

### Option A: Railway (Recommended)

1. Go to [Railway](https://railway.app/)
2. Create a new project
3. Add a PostgreSQL database
4. Note down the connection details

### Option B: Supabase

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings > Database
4. Note down the connection details

### Option C: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database named `event_finder`
3. Run the schema: `psql -d event_finder -f backend/src/database/schema.sql`

## Step 2: Deploy Backend

### Option A: Railway (Recommended)

1. Connect your GitHub repository to Railway
2. Add the backend directory as a service
3. Set environment variables:
   ```
   DB_HOST=your_railway_db_host
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=your_railway_db_password
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NODE_ENV=production
   ```

### Option B: Render

1. Go to [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `cd backend && npm install && npm run build`
5. Set start command: `cd backend && npm start`
6. Configure environment variables

### Option C: Heroku

1. Install Heroku CLI
2. Create a new Heroku app
3. Add PostgreSQL addon
4. Deploy using Git:
   ```bash
   heroku create your-app-name
   heroku addons:create heroku-postgresql:hobby-dev
   git push heroku main
   ```

## Step 3: Deploy Frontend

### Option A: Vercel (Recommended)

1. Go to [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Set the root directory to `frontend`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

### Option B: Netlify

1. Go to [Netlify](https://netlify.com/)
2. Connect your GitHub repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/build`
5. Add environment variable for API URL

## Step 4: Import Data

After deploying the backend, you need to import your CSV data:

1. SSH into your backend server or use the hosting platform's console
2. Run the import script:
   ```bash
   npm run import-data
   ```

## Step 5: Configure Domain (Optional)

1. Add a custom domain to your frontend deployment
2. Update your backend CORS settings if needed
3. Update the frontend API URL to use your custom domain

## Environment Variables Reference

### Backend (.env)
```env
# Database
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Server
PORT=3001
NODE_ENV=production
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your backend CORS settings include your frontend domain
2. **Database Connection**: Verify your database connection string and credentials
3. **Google Maps API**: Ensure your API key has the correct permissions and billing is set up
4. **Import Failures**: Check that your CSV files are in the correct format and location

### Debugging

1. Check your hosting platform's logs
2. Verify environment variables are set correctly
3. Test your API endpoints using a tool like Postman
4. Check browser console for frontend errors

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Database**: Use strong passwords and consider connection pooling
3. **CORS**: Only allow necessary origins
4. **Rate Limiting**: Consider adding rate limiting to your API
5. **HTTPS**: Always use HTTPS in production

## Monitoring

1. Set up logging for your backend
2. Monitor database performance
3. Track API usage and errors
4. Set up alerts for downtime

## Scaling Considerations

1. **Database**: Consider read replicas for high traffic
2. **Caching**: Add Redis for caching frequently accessed data
3. **CDN**: Use a CDN for static assets
4. **Load Balancing**: Consider multiple backend instances 