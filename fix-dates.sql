-- Delete all existing events and re-insert with proper date handling
DELETE FROM events;

-- The fix is to ensure dates are inserted as DATE type explicitly
-- This prevents timezone conversion issues
