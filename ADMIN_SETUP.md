# Admin Upload Feature Setup

## Environment Variables

Add the following environment variable to your backend `.env` file:

```
ADMIN_PASSWORD=your_secure_admin_password_here
```

## Features

### Admin Login
- Click "Admin Login" button in the footer of the homepage
- Enter the admin password to access the data manager

### Data Manager Features
- **View All Events**: See all events in a sortable table
- **Edit Events**: Click "Edit" to modify any event field inline
- **Delete Events**: Click "Delete" to remove events (with confirmation)
- **Add New Events**: Click "Add New Event" to create new events
- **CSV Upload**: Upload CSV files to bulk create events
- **Auto-Geocoding**: All address changes automatically get coordinates via Google Maps API
- **Batch Save**: Make multiple changes and save them all at once

### CSV Upload Format

Your CSV file should include these columns:
- `event_date` (YYYY-MM-DD format)
- `event_time` (HH:MM format)
- `event_type` (event type name)
- `address` (street address)
- `address2` (optional second address line)
- `city` (city name)
- `state` (state abbreviation)
- `zip` (zip code)
- `start_date` (optional, YYYY-MM-DD format)
- `end_date` (optional, YYYY-MM-DD format)

### Security
- Admin access is password-protected
- No session management - password required for each login
- All address changes are automatically geocoded for accuracy

## Usage

1. Set the `ADMIN_PASSWORD` environment variable
2. Restart the backend server
3. Click "Admin Login" on the homepage
4. Enter the admin password
5. Use the data manager to manage events
