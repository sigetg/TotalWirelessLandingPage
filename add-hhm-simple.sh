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

# Copy the import script to backend directory
echo "📁 Preparing import script..."
cp "import-hhm-direct.js" backend/

# Upload the script to Railway
echo "📤 Uploading script to Railway..."
railway up backend/import-hhm-direct.js --service backend

# Run the import script on Railway
echo "🔄 Importing HHM Events NYC data..."
railway run --service backend "node import-hhm-direct.js"

# Clean up
echo "🧹 Cleaning up..."
rm -f "backend/import-hhm-direct.js"

echo "✅ HHM Events NYC data added successfully!"
echo "🌐 New events are now available in your Railway database."
