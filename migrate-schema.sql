-- Migration script: Restructure event schema
-- This drops the old table and creates a new one with the updated schema
-- WARNING: This will DELETE ALL DATA in the events table

-- Drop the old events table
DROP TABLE IF EXISTS events CASCADE;

-- Create the new events table with updated schema
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  event_type VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  address2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip VARCHAR(10) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_events_location ON events(latitude, longitude);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_end_date ON events(end_date);
CREATE INDEX idx_events_zip ON events(zip);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the new schema
\d events;
