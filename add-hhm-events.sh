#!/bin/bash

# Add HHM Events NYC data to existing Railway database
echo "🚀 Adding HHM Events NYC data to Railway database..."

# Check Railway connection
echo "📋 Checking Railway connection..."
railway status

if [ $? -ne 0 ]; then
    echo "❌ Not connected to Railway. Please run 'railway login' and 'railway link' first."
    exit 1
fi

# Copy the specific CSV file and import script to backend directory
echo "📁 Preparing HHM Events NYC data..."
cp "data/HHM Events NYC.csv" backend/
cp "import-single-csv.js" backend/

# Upload files to Railway
echo "📤 Uploading files to Railway..."
railway up backend/HHM\ Events\ NYC.csv --service backend
railway up backend/import-single-csv.js --service backend

# Run the targeted import script on Railway
echo "🔄 Importing HHM Events NYC data..."
railway run --service backend "node import-single-csv.js"

# Clean up
echo "🧹 Cleaning up..."
rm -f "backend/HHM Events NYC.csv" "backend/import-single-csv.js"

echo "✅ HHM Events NYC data added successfully!"
echo "🌐 New events are now available in your Railway database."
