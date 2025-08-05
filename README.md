# Event Finder - Total Wireless Landing Page

A React application that allows users to find nearby events based on their location. The app features a modern UI styled similarly to Total Wireless, with geolocation capabilities and driving distance calculations.

## 🌐 Live Demo

**Visit the live application:** [https://total-events.up.railway.app/](https://total-events.up.railway.app/)

## Features

- **Location-based Search**: Search by address, zip code, or city/state
- **Distance Calculations**: Both straight-line and driving distances
- **Event Filtering**: Filter by event type and date
- **Responsive Design**: Mobile-friendly interface
- **Real-time Results**: Instant search results with loading states
- **Bilingual Support**: English and Spanish language options
- **Tabbed Search Interface**: Choose between zip code, full address, or city/state search methods

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- TanStack Query for data fetching
- Tailwind CSS for styling
- Lucide React for icons
- React Hook Form for form handling

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Google Maps API for geocoding and distance calculations

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Google Maps API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd TotalWirelessLandingPage

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database named `event_finder`
2. Run the schema file:
   ```bash
   cd backend
   psql -d event_finder -f src/database/schema.sql
   ```

### 3. Environment Configuration

#### Backend (.env file in backend directory)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_finder
DB_USER=postgres
DB_PASSWORD=your_password

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Server Configuration
PORT=3001
NODE_ENV=development
```

#### Frontend (.env file in frontend directory)
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. Import Data

```bash
cd backend
npm run import-data
```

### 5. Start the Application

#### Development Mode

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory, in a new terminal)
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Endpoints

- `GET /api/events` - Get all events
- `GET /api/events/type/:eventType` - Get events by type
- `POST /api/events/search` - Search events by location
- `POST /api/events` - Add new event
- `POST /api/events/update-geocoding` - Update event geocoding

## Deployment

### Current Deployment

The application is currently deployed on **Railway**:
- **Live Site**: [https://total-events.up.railway.app/](https://total-events.up.railway.app/)
- **Backend**: Railway with PostgreSQL database
- **Frontend**: Railway static hosting

### Deployment Steps

1. **Set up PostgreSQL database** on your chosen platform
2. **Deploy the backend** to your hosting platform
3. **Deploy the frontend** to Railway or similar
4. **Configure environment variables** in your hosting platform
5. **Import your data** using the import script

## Project Structure

```
TotalWirelessLandingPage/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── tailwind.config.js
└── data/
    ├── Chicago.csv
    ├── Houston.csv
    ├── Los_Angeles.csv
    ├── Miami.csv
    ├── New_York.csv
    └── San_Antonio.csv
```

## License

This project is licensed under the MIT License. 