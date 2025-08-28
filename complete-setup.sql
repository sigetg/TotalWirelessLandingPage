-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  start_date DATE,
  end_date DATE,
  event_date DATE NOT NULL,
  event_time VARCHAR(20) NOT NULL,
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

-- Create index for faster location-based queries
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_zip ON events(zip);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Now import the data
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-01', '10:00 AM', 'Total Wireless Event', '123 Main St', NULL, 'Chicago', 'IL', '60601') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-02', '11:00 AM', 'Total Wireless Event', '456 Oak Ave', NULL, 'Chicago', 'IL', '60602') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-03', '12:00 PM', 'Total Wireless Event', '789 Pine St', NULL, 'Chicago', 'IL', '60603') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-04', '1:00 PM', 'Total Wireless Event', '321 Elm St', NULL, 'Chicago', 'IL', '60604') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-05', '2:00 PM', 'Total Wireless Event', '654 Maple Ave', NULL, 'Chicago', 'IL', '60605') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-06', '3:00 PM', 'Total Wireless Event', '987 Cedar St', NULL, 'Chicago', 'IL', '60606') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-07', '4:00 PM', 'Total Wireless Event', '147 Birch Ave', NULL, 'Chicago', 'IL', '60607') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-08', '5:00 PM', 'Total Wireless Event', '258 Spruce St', NULL, 'Chicago', 'IL', '60608') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-09', '6:00 PM', 'Total Wireless Event', '369 Willow Ave', NULL, 'Chicago', 'IL', '60609') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-10', '7:00 PM', 'Total Wireless Event', '741 Poplar St', NULL, 'Chicago', 'IL', '60610') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-01', '10:00 AM', 'Total Wireless Event', '123 Main St', NULL, 'Houston', 'TX', '77001') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-02', '11:00 AM', 'Total Wireless Event', '456 Oak Ave', NULL, 'Houston', 'TX', '77002') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-03', '12:00 PM', 'Total Wireless Event', '789 Pine St', NULL, 'Houston', 'TX', '77003') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-04', '1:00 PM', 'Total Wireless Event', '321 Elm St', NULL, 'Houston', 'TX', '77004') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-05', '2:00 PM', 'Total Wireless Event', '654 Maple Ave', NULL, 'Houston', 'TX', '77005') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-06', '3:00 PM', 'Total Wireless Event', '987 Cedar St', NULL, 'Houston', 'TX', '77006') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-07', '4:00 PM', 'Total Wireless Event', '147 Birch Ave', NULL, 'Houston', 'TX', '77007') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-08', '5:00 PM', 'Total Wireless Event', '258 Spruce St', NULL, 'Houston', 'TX', '77008') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-09', '6:00 PM', 'Total Wireless Event', '369 Willow Ave', NULL, 'Houston', 'TX', '77009') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-10', '7:00 PM', 'Total Wireless Event', '741 Poplar St', NULL, 'Houston', 'TX', '77010') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-01', '10:00 AM', 'Total Wireless Event', '123 Main St', NULL, 'Los Angeles', 'CA', '90001') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-02', '11:00 AM', 'Total Wireless Event', '456 Oak Ave', NULL, 'Los Angeles', 'CA', '90002') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-03', '12:00 PM', 'Total Wireless Event', '789 Pine St', NULL, 'Los Angeles', 'CA', '90003') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-04', '1:00 PM', 'Total Wireless Event', '321 Elm St', NULL, 'Los Angeles', 'CA', '90004') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-05', '2:00 PM', 'Total Wireless Event', '654 Maple Ave', NULL, 'Los Angeles', 'CA', '90005') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-06', '3:00 PM', 'Total Wireless Event', '987 Cedar St', NULL, 'Los Angeles', 'CA', '90006') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-07', '4:00 PM', 'Total Wireless Event', '147 Birch Ave', NULL, 'Los Angeles', 'CA', '90007') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-08', '5:00 PM', 'Total Wireless Event', '258 Spruce St', NULL, 'Los Angeles', 'CA', '90008') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-09', '6:00 PM', 'Total Wireless Event', '369 Willow Ave', NULL, 'Los Angeles', 'CA', '90009') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-10', '7:00 PM', 'Total Wireless Event', '741 Poplar St', NULL, 'Los Angeles', 'CA', '90010') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-01', '10:00 AM', 'Total Wireless Event', '123 Main St', NULL, 'Miami', 'FL', '33101') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-02', '11:00 AM', 'Total Wireless Event', '456 Oak Ave', NULL, 'Miami', 'FL', '33102') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-03', '12:00 PM', 'Total Wireless Event', '789 Pine St', NULL, 'Miami', 'FL', '33103') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-04', '1:00 PM', 'Total Wireless Event', '321 Elm St', NULL, 'Miami', 'FL', '33104') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-05', '2:00 PM', 'Total Wireless Event', '654 Maple Ave', NULL, 'Miami', 'FL', '33105') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-06', '3:00 PM', 'Total Wireless Event', '987 Cedar St', NULL, 'Miami', 'FL', '33106') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-07', '4:00 PM', 'Total Wireless Event', '147 Birch Ave', NULL, 'Miami', 'FL', '33107') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-08', '5:00 PM', 'Total Wireless Event', '258 Spruce St', NULL, 'Miami', 'FL', '33108') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-09', '6:00 PM', 'Total Wireless Event', '369 Willow Ave', NULL, 'Miami', 'FL', '33109') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-10', '7:00 PM', 'Total Wireless Event', '741 Poplar St', NULL, 'Miami', 'FL', '33110') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-01', '10:00 AM', 'Total Wireless Event', '123 Main St', NULL, 'New York', 'NY', '10001') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-02', '11:00 AM', 'Total Wireless Event', '456 Oak Ave', NULL, 'New York', 'NY', '10002') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-03', '12:00 PM', 'Total Wireless Event', '789 Pine St', NULL, 'New York', 'NY', '10003') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-04', '1:00 PM', 'Total Wireless Event', '321 Elm St', NULL, 'New York', 'NY', '10004') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-05', '2:00 PM', 'Total Wireless Event', '654 Maple Ave', NULL, 'New York', 'NY', '10005') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-06', '3:00 PM', 'Total Wireless Event', '987 Cedar St', NULL, 'New York', 'NY', '10006') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-07', '4:00 PM', 'Total Wireless Event', '147 Birch Ave', NULL, 'New York', 'NY', '10007') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-08', '5:00 PM', 'Total Wireless Event', '258 Spruce St', NULL, 'New York', 'NY', '10008') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-09', '6:00 PM', 'Total Wireless Event', '369 Willow Ave', NULL, 'New York', 'NY', '10009') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-10', '7:00 PM', 'Total Wireless Event', '741 Poplar St', NULL, 'New York', 'NY', '10010') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-11', '8:00 AM', 'Total Wireless Event', '852 Oak St', NULL, 'New York', 'NY', '10011') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-12', '9:00 AM', 'Total Wireless Event', '963 Pine Ave', NULL, 'New York', 'NY', '10012') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-13', '10:00 AM', 'Total Wireless Event', '147 Elm St', NULL, 'New York', 'NY', '10013') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-14', '11:00 AM', 'Total Wireless Event', '258 Maple Ave', NULL, 'New York', 'NY', '10014') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-15', '12:00 PM', 'Total Wireless Event', '369 Cedar St', NULL, 'New York', 'NY', '10015') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-16', '1:00 PM', 'Total Wireless Event', '741 Birch Ave', NULL, 'New York', 'NY', '10016') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-17', '2:00 PM', 'Total Wireless Event', '852 Spruce St', NULL, 'New York', 'NY', '10017') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-18', '3:00 PM', 'Total Wireless Event', '963 Willow Ave', NULL, 'New York', 'NY', '10018') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-19', '4:00 PM', 'Total Wireless Event', '147 Poplar St', NULL, 'New York', 'NY', '10019') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-20', '5:00 PM', 'Total Wireless Event', '258 Oak Ave', NULL, 'New York', 'NY', '10020') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-21', '6:00 PM', 'Total Wireless Event', '369 Pine St', NULL, 'New York', 'NY', '10021') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-22', '7:00 PM', 'Total Wireless Event', '741 Elm Ave', NULL, 'New York', 'NY', '10022') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-23', '8:00 AM', 'Total Wireless Event', '852 Maple St', NULL, 'New York', 'NY', '10023') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-24', '9:00 AM', 'Total Wireless Event', '963 Cedar Ave', NULL, 'New York', 'NY', '10024') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-25', '10:00 AM', 'Total Wireless Event', '147 Birch St', NULL, 'New York', 'NY', '10025') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-26', '11:00 AM', 'Total Wireless Event', '258 Spruce Ave', NULL, 'New York', 'NY', '10026') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-27', '12:00 PM', 'Total Wireless Event', '369 Willow St', NULL, 'New York', 'NY', '10027') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-28', '1:00 PM', 'Total Wireless Event', '741 Poplar Ave', NULL, 'New York', 'NY', '10028') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-29', '2:00 PM', 'Total Wireless Event', '852 Oak St', NULL, 'New York', 'NY', '10029') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-30', '3:00 PM', 'Total Wireless Event', '963 Pine Ave', NULL, 'New York', 'NY', '10030') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-31', '4:00 PM', 'Total Wireless Event', '147 Elm St', NULL, 'New York', 'NY', '10031') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-09-01', '5:00 PM', 'Total Wireless Event', '258 Maple Ave', NULL, 'New York', 'NY', '10032') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-09-02', '6:00 PM', 'Total Wireless Event', '369 Cedar St', NULL, 'New York', 'NY', '10033') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-09-03', '7:00 PM', 'Total Wireless Event', '741 Birch Ave', NULL, 'New York', 'NY', '10034') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-09-04', '8:00 AM', 'Total Wireless Event', '852 Spruce St', NULL, 'New York', 'NY', '10035') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-09-05', '9:00 AM', 'Total Wireless Event', '963 Willow Ave', NULL, 'New York', 'NY', '10036') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-09-06', '10:00 AM', 'Total Wireless Event', '147 Poplar St', NULL, 'New York', 'NY', '10037') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-09-07', '11:00 AM', 'Total Wireless Event', '258 Oak Ave', NULL, 'New York', 'NY', '10038') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-09-08', '12:00 PM', 'Total Wireless Event', '369 Pine St', NULL, 'New York', 'NY', '10039') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-09-09', '1:00 PM', 'Total Wireless Event', '741 Elm Ave', NULL, 'New York', 'NY', '10040') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-09-10', '2:00 PM', 'Total Wireless Event', '852 Maple St', NULL, 'New York', 'NY', '10041') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-09-11', '3:00 PM', 'Total Wireless Event', '963 Cedar Ave', NULL, 'New York', 'NY', '10042') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-01', '10:00 AM', 'Total Wireless Event', '123 Main St', NULL, 'San Antonio', 'TX', '78201') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-02', '11:00 AM', 'Total Wireless Event', '456 Oak Ave', NULL, 'San Antonio', 'TX', '78202') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-03', '12:00 PM', 'Total Wireless Event', '789 Pine St', NULL, 'San Antonio', 'TX', '78203') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-04', '1:00 PM', 'Total Wireless Event', '321 Elm St', NULL, 'San Antonio', 'TX', '78204') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-05', '2:00 PM', 'Total Wireless Event', '654 Maple Ave', NULL, 'San Antonio', 'TX', '78205') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-06', '3:00 PM', 'Total Wireless Event', '987 Cedar St', NULL, 'San Antonio', 'TX', '78206') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-07', '4:00 PM', 'Total Wireless Event', '147 Birch Ave', NULL, 'San Antonio', 'TX', '78207') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-08', '5:00 PM', 'Total Wireless Event', '258 Spruce St', NULL, 'San Antonio', 'TX', '78208') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-09', '6:00 PM', 'Total Wireless Event', '369 Willow Ave', NULL, 'San Antonio', 'TX', '78209') ON CONFLICT DO NOTHING;
INSERT INTO events (event_date, event_time, event_type, address, address2, city, state, zip) VALUES ('2025-08-10', '7:00 PM', 'Total Wireless Event', '741 Poplar St', NULL, 'San Antonio', 'TX', '78210') ON CONFLICT DO NOTHING;

-- Verify the data was imported
SELECT COUNT(*) FROM events; 