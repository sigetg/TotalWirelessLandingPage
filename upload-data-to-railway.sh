#!/bin/bash

# Upload data to Railway and run import script
echo "🚀 Uploading data to Railway and running import..."

# Check if we're linked to the backend service
railway status

# Create a temporary directory for the data
echo "📁 Creating temporary data directory..."
mkdir -p temp-data
cp data/*.csv temp-data/

# Upload the data files to Railway
echo "📤 Uploading CSV files to Railway..."
railway up temp-data/ --service backend

# Run the import script on Railway
echo "🔄 Running import script on Railway..."
railway run --service backend "npm run import-data"

# Clean up
echo "🧹 Cleaning up temporary files..."
rm -rf temp-data

echo "✅ Data import completed!" 