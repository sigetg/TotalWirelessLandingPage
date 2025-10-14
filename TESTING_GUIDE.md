# Admin Upload Feature - Testing Guide

## Local Testing

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```
The server should start on port 3001.

### 2. Start the Frontend
```bash
cd frontend  
npm start
```
The frontend should start on port 3000.

### 3. Test Admin Login
1. Open http://localhost:3000 in your browser
2. Scroll to the bottom of the page
3. Click "Admin Login" button
4. Enter password: `admin123`
5. You should see the Admin Data Manager modal

### 4. Test Admin Features

#### View Events
- The modal should show all existing events in a table
- Events should be displayed with all fields (date, time, type, address, city, state, zip)

#### Edit Events
- Click "Edit" on any event row
- Modify fields inline (date, time, type, address, etc.)
- Click "Save" to save changes
- Address changes will automatically trigger geocoding

#### Add New Events
- Click "Add New Event" button
- Fill in the new event fields
- Click "Save" to create the event

#### Delete Events
- Click "Delete" on any event row
- Confirm deletion in the popup
- Event should be removed from the table

#### CSV Upload
- In the CSV Upload section, select a CSV file
- CSV should have columns: event_date, event_time, event_type, address, address2, city, state, zip, start_date, end_date
- Click "Upload CSV" to bulk create events
- All addresses will be automatically geocoded

#### Batch Save
- Make multiple edits
- Click "Save All Changes" to batch save everything
- Modal will close after successful save

## Railway Deployment

### 1. Update Environment Variables
Add to your Railway project environment variables:
```
ADMIN_PASSWORD=your_secure_password_here
```

### 2. Deploy Backend
```bash
cd backend
# Your existing Railway deployment process
```

### 3. Deploy Frontend
```bash
cd frontend
# Your existing Railway deployment process
```

### 4. Test on Railway
1. Visit your Railway frontend URL
2. Click "Admin Login" in footer
3. Enter your admin password
4. Test all admin features

## CSV Format Example

Create a test CSV file with this format:
```csv
event_date,event_time,event_type,address,address2,city,state,zip,start_date,end_date
2024-01-15,10:00,Community Event,123 Main St,,New York,NY,10001,2024-01-15,2024-01-15
2024-01-16,14:00,Workshop,456 Oak Ave,,Los Angeles,CA,90210,2024-01-16,2024-01-16
```

## Troubleshooting

### Backend Issues
- Check that `ADMIN_PASSWORD` is set in .env
- Verify database connection
- Check server logs for errors

### Frontend Issues
- Check browser console for errors
- Verify API calls are reaching the backend
- Check network tab for failed requests

### Database Issues
- Ensure your database has the events table
- Check that geocoding is working (requires Google Maps API key)
- Verify all required fields are present

## Security Notes
- Change the default admin password in production
- Use a strong, unique password
- Consider IP restrictions for admin access in production
