# Railway Deployment Guide

This guide will walk you through deploying both the frontend and backend of your Total Wireless Landing Page to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Ensure your code is pushed to a GitHub repository
3. **PostgreSQL Database**: You'll need a PostgreSQL database (Railway provides this)

## Step 1: Database Setup

### 1.1 Create PostgreSQL Database on Railway

1. Go to your Railway dashboard
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Note down the database credentials (you'll need these for environment variables)

### 1.2 Database Environment Variables

You'll need these environment variables for your backend:
```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

## Step 2: Backend Deployment

### 2.1 Create Railway Configuration for Backend

Create a `railway.json` file in the `backend/` directory:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2.2 Update Backend Package.json

Ensure your `backend/package.json` has the correct build and start scripts:

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "postinstall": "npm run build"
  }
}
```

### 2.3 Deploy Backend to Railway

1. In Railway dashboard, click "New Service"
2. Select "GitHub Repo"
3. Connect your GitHub repository
4. Set the root directory to `backend/`
5. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=3001`
   - Database variables from Step 1.2
6. Deploy the service

### 2.4 Get Backend URL

After deployment, note the generated URL (e.g., `https://your-backend.railway.app`)

## Step 3: Frontend Deployment

### 3.1 Create Railway Configuration for Frontend

Create a `railway.json` file in the `frontend/` directory:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3.2 Update Frontend Environment Variables

Create a `.env.production` file in the `frontend/` directory:

```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### 3.3 Deploy Frontend to Railway

1. In Railway dashboard, click "New Service"
2. Select "GitHub Repo"
3. Connect your GitHub repository
4. Set the root directory to `frontend/`
5. Add environment variables:
   - `REACT_APP_API_URL=https://your-backend.railway.app/api`
   - `NODE_ENV=production`
6. Deploy the service

## Step 4: Database Migration

### 4.1 Run Database Schema

After your backend is deployed, you need to set up the database schema:

1. Go to your backend service in Railway
2. Click on "Variables" tab
3. Add a temporary script to run the schema:

```bash
# In Railway terminal or via SSH
psql $DATABASE_URL -f src/database/schema.sql
```

### 4.2 Import Data (Optional)

If you want to import your CSV data:

```bash
# Set up your data import script
npm run import-data
```

## Step 5: Domain Configuration

### 5.1 Custom Domain (Optional)

1. In Railway dashboard, go to your frontend service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## Step 6: Environment Variables Summary

### Backend Environment Variables
```
NODE_ENV=production
PORT=3001
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
```

### Frontend Environment Variables
```
REACT_APP_API_URL=https://your-backend.railway.app/api
NODE_ENV=production
```

## Step 7: Monitoring and Maintenance

### 7.1 Health Checks

Both services have health check endpoints:
- Backend: `https://your-backend.railway.app/health`
- Frontend: `https://your-frontend.railway.app/`

### 7.2 Logs

Monitor your application logs in the Railway dashboard:
1. Go to your service
2. Click "Deployments"
3. View logs for debugging

### 7.3 Scaling

Railway automatically scales based on traffic, but you can:
1. Go to service settings
2. Adjust scaling parameters
3. Set resource limits

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation works locally
   - Verify Node.js version compatibility

2. **Database Connection Issues**
   - Verify environment variables are correct
   - Check database is accessible from Railway
   - Ensure SSL configuration is correct

3. **CORS Issues**
   - Verify frontend URL is allowed in backend CORS settings
   - Check API URL configuration

4. **Environment Variables**
   - Ensure all variables are set in Railway dashboard
   - Check variable names match your code
   - Verify no typos in values

### Debugging Commands

```bash
# Check backend logs
railway logs --service backend

# Check frontend logs
railway logs --service frontend

# Connect to database
railway connect --service database

# SSH into service
railway shell --service backend
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **Database**: Use strong passwords and limit access
3. **CORS**: Configure properly for production domains
4. **HTTPS**: Railway provides SSL certificates automatically

## Cost Optimization

1. **Free Tier**: Railway offers a free tier with limitations
2. **Resource Limits**: Set appropriate limits for your needs
3. **Auto-scaling**: Configure based on actual usage
4. **Monitoring**: Use Railway's built-in monitoring tools

## Next Steps

1. Set up CI/CD pipeline with GitHub Actions
2. Configure monitoring and alerting
3. Set up backup strategies for database
4. Implement proper logging and error tracking
5. Consider using Railway's preview deployments for testing

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- GitHub Issues: For code-specific issues 