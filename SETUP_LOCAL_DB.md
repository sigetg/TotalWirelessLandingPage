# Local Database Setup

## Option 1: Use Railway Database (Recommended)
1. Get your Railway DATABASE_URL from your Railway dashboard
2. Add it to `backend/.env`:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

## Option 2: Set up Local PostgreSQL
1. Install PostgreSQL locally
2. Create a local database:
   ```bash
   sudo -u postgres createdb event_finder
   ```
3. Update your `.env` file with local database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=event_finder
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

## Option 3: Use Docker (Alternative)
```bash
docker run --name postgres-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=event_finder -p 5432:5432 -d postgres:13
```

Then update your `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_finder
DB_USER=postgres
DB_PASSWORD=password
```

## Test Database Connection
After setting up, test with:
```bash
curl http://localhost:3001/api/events
```

Should return events or empty array, not 500 error.
