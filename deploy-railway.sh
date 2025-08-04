#!/bin/bash

# Railway Deployment Script for Total Wireless Landing Page
# This script helps automate the deployment process

set -e

echo "🚀 Railway Deployment Script"
echo "=============================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo "Please install it first: npm install -g @railway/cli"
    echo "Then run: railway login"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway."
    echo "Please run: railway login"
    exit 1
fi

echo "✅ Railway CLI is ready"

# Function to create environment variables file
create_env_file() {
    local service=$1
    local env_file=".env.${service}.railway"
    
    echo "Creating environment variables for $service..."
    
    if [ "$service" = "backend" ]; then
        cat > "$env_file" << EOF
# Backend Environment Variables for Railway
NODE_ENV=production
PORT=3001
DB_USER=postgres
DB_HOST=\${{Postgres.DATABASE_HOST}}
DB_NAME=\${{Postgres.DATABASE_NAME}}
DB_PASSWORD=\${{Postgres.DATABASE_PASSWORD}}
DB_PORT=5432
EOF
    elif [ "$service" = "frontend" ]; then
        cat > "$env_file" << EOF
# Frontend Environment Variables for Railway
REACT_APP_API_URL=https://your-backend.railway.app/api
NODE_ENV=production
EOF
    fi
    
    echo "✅ Created $env_file"
    echo "⚠️  Remember to update the API URL in frontend env file after backend deployment"
}

# Function to deploy service
deploy_service() {
    local service=$1
    local directory=$2
    
    echo "📦 Deploying $service..."
    
    # Change to service directory
    cd "$directory"
    
    # Deploy to Railway
    railway up --service "$service"
    
    # Get the deployment URL
    local url=$(railway status --service "$service" --json | jq -r '.deployment.url')
    
    echo "✅ $service deployed successfully!"
    echo "🌐 URL: $url"
    
    # Go back to root
    cd ..
    
    return $url
}

# Main deployment process
echo ""
echo "1. Setting up environment variables..."
create_env_file "backend"
create_env_file "frontend"

echo ""
echo "2. Deploying backend..."
backend_url=$(deploy_service "backend" "backend")

echo ""
echo "3. Updating frontend environment with backend URL..."
# Update the frontend env file with the actual backend URL
sed -i.bak "s|https://your-backend.railway.app/api|$backend_url/api|g" .env.frontend.railway

echo ""
echo "4. Deploying frontend..."
frontend_url=$(deploy_service "frontend" "frontend")

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "Backend URL: $backend_url"
echo "Frontend URL: $frontend_url"
echo ""
echo "Next steps:"
echo "1. Set up your database schema: psql \$DATABASE_URL -f backend/src/database/schema.sql"
echo "2. Import your data: npm run import-data (in backend directory)"
echo "3. Test your application"
echo "4. Configure custom domains if needed"
echo ""
echo "For more information, see DEPLOYMENT.md" 