-- Fix dates for QR Code Landing Page events
-- Using explicit DATE casting to avoid timezone conversion issues

-- Halloween Events - October 24
UPDATE events SET start_date = '2025-10-24'::DATE, end_date = '2025-10-24'::DATE, event_date = '2025-10-24'::DATE 
WHERE address = '4916 Church Avenue' AND city = 'Brooklyn';

UPDATE events SET start_date = '2025-10-24'::DATE, end_date = '2025-10-24'::DATE, event_date = '2025-10-24'::DATE 
WHERE address = '379 Knickerbocker Ave' AND city = 'Brooklyn';

UPDATE events SET start_date = '2025-10-24'::DATE, end_date = '2025-10-24'::DATE, event_date = '2025-10-24'::DATE 
WHERE address = '200 S Neltnor Blvd' AND city = 'West Chicago';

-- Halloween Events - October 25
UPDATE events SET start_date = '2025-10-25'::DATE, end_date = '2025-10-25'::DATE, event_date = '2025-10-25'::DATE 
WHERE address = '2513 Broadway' AND city = 'Astoria';

UPDATE events SET start_date = '2025-10-25'::DATE, end_date = '2025-10-25'::DATE, event_date = '2025-10-25'::DATE 
WHERE address = '55-17 Myrtle Ave' AND city = 'Ridgewood';

UPDATE events SET start_date = '2025-10-25'::DATE, end_date = '2025-10-25'::DATE, event_date = '2025-10-25'::DATE 
WHERE address = '2317 S Cicero Ave' AND city = 'Cicero';

UPDATE events SET start_date = '2025-10-25'::DATE, end_date = '2025-10-25'::DATE, event_date = '2025-10-25'::DATE 
WHERE address = '5858 S Kedzie Ave' AND city = 'Chicago';

UPDATE events SET start_date = '2025-10-25'::DATE, end_date = '2025-10-25'::DATE, event_date = '2025-10-25'::DATE 
WHERE address = 'Doral Downtown' AND city = 'Miami' AND event_type = 'Halloween Event';

-- Halloween Events - October 31
UPDATE events SET start_date = '2025-10-31'::DATE, end_date = '2025-10-31'::DATE, event_date = '2025-10-31'::DATE 
WHERE address = '542 W 181 St' AND city = 'New York';

UPDATE events SET start_date = '2025-10-31'::DATE, end_date = '2025-10-31'::DATE, event_date = '2025-10-31'::DATE 
WHERE address = '199 Ave A' AND city = 'New York';

UPDATE events SET start_date = '2025-10-31'::DATE, end_date = '2025-10-31'::DATE, event_date = '2025-10-31'::DATE 
WHERE address = '1020 Longwood Ave' AND city = 'Bronx';

UPDATE events SET start_date = '2025-10-31'::DATE, end_date = '2025-10-31'::DATE, event_date = '2025-10-31'::DATE 
WHERE address = '2395 Westchester Ave' AND city = 'Bronx';

UPDATE events SET start_date = '2025-10-31'::DATE, end_date = '2025-10-31'::DATE, event_date = '2025-10-31'::DATE 
WHERE address = '3217 W 47th Pl' AND city = 'Chicago';

-- Dia de Los Muertos - November 1
UPDATE events SET start_date = '2025-11-01'::DATE, end_date = '2025-11-01'::DATE, event_date = '2025-11-01'::DATE 
WHERE address = 'Doral Downtown' AND city = 'Miami' AND event_type = 'Dia de Los Muertos';

-- UFC Meet & Greet - November 14
UPDATE events SET start_date = '2025-11-14'::DATE, end_date = '2025-11-14'::DATE, event_date = '2025-11-14'::DATE 
WHERE address = '3341 Broadway' AND city = 'New York' AND event_type LIKE '%UFC%';

-- UFC Meet & Greet - November 15
UPDATE events SET start_date = '2025-11-15'::DATE, end_date = '2025-11-15'::DATE, event_date = '2025-11-15'::DATE 
WHERE address = '1656 Broadway' AND city = 'New York' AND event_type LIKE '%UFC%';

-- Holiday Lights - November 18
UPDATE events SET start_date = '2025-11-18'::DATE, end_date = '2025-11-18'::DATE, event_date = '2025-11-18'::DATE 
WHERE address = '501 W 125th St' AND city = 'New York';

UPDATE events SET start_date = '2025-11-18'::DATE, end_date = '2025-11-18'::DATE, event_date = '2025-11-18'::DATE 
WHERE address = '28 E 125th St' AND city = 'New York';



