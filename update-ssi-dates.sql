-- Update SSI events with correct dates and time
UPDATE events 
SET 
  start_date = '2026-01-30'::DATE,
  end_date = '2026-02-15'::DATE,
  event_date = '2026-01-30'::DATE,
  event_time = 'All Day'
WHERE event_type = 'Exclusive Savings - SSI';
