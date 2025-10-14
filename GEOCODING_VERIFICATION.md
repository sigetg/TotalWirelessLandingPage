# Geocoding Verification Guide

## How to Verify Events Are Being Geocoded

### 1. Visual Verification in Admin Interface
- **Coordinates Column**: The admin table now shows a "Coordinates" column
- **Green Checkmark**: ✓ 40.7128, -73.9566 (means geocoding successful)
- **Red "No coordinates"**: Means geocoding failed or not attempted

### 2. Backend Logs
When you add/edit events, watch the terminal for logs like:
```
📍 Geocoding address: "123 Main St, New York, NY 10001"
✅ Geocoded to: 40.7128, -73.9566
```

### 3. Test Geocoding Endpoint
Test any address directly:
```bash
curl -X POST http://localhost:3001/api/events/test-geocoding \
  -H "Content-Type: application/json" \
  -d '{"address":"Your test address here"}'
```

### 4. Database Verification
Check the database directly:
```sql
SELECT id, address, city, latitude, longitude 
FROM events 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

### 5. Test Scenarios

#### Test 1: Add New Event
1. Open admin panel (http://localhost:3000 → Admin Login)
2. Click "Add New Event"
3. Fill in: Address: "1600 Amphitheatre Parkway, Mountain View, CA"
4. Fill in: City: "Mountain View", State: "CA", Zip: "94043"
5. Click "Save"
6. Check coordinates column shows: ✓ 37.4221, -122.0841

#### Test 2: Edit Existing Event
1. Click "Edit" on any event
2. Change the address to: "1 Apple Park Way, Cupertino, CA 95014"
3. Click "Save"
4. Check coordinates update to: ✓ 37.3349, -122.0090

#### Test 3: CSV Upload
1. Create a CSV file with test data:
```csv
event_date,event_time,event_type,address,city,state,zip
2024-01-15,10:00,Test Event,1 Microsoft Way,Redmond,WA,98052
2024-01-16,14:00,Test Event,1 Hacker Way,Menlo Park,CA,94025
```
2. Upload via admin panel
3. Check that all events get coordinates

### 6. Troubleshooting

#### If Geocoding Fails:
- Check Google Maps API key is valid
- Verify API has Geocoding API enabled
- Check API quotas and billing
- Test with simple addresses first

#### If Coordinates Are Wrong:
- Verify the address format is correct
- Try more specific addresses (include zip code)
- Check if address exists in Google Maps

### 7. Expected Results

**Successful Geocoding:**
- Coordinates column shows: ✓ lat, lng
- Backend logs show: ✅ Geocoded to: lat, lng
- Events appear in search results with correct distances

**Failed Geocoding:**
- Coordinates column shows: No coordinates
- Backend logs show: ❌ Geocoding failed
- Events may not appear in location-based searches

### 8. Production Verification

After deploying to Railway:
1. Test the same scenarios on production
2. Check Railway logs for geocoding activity
3. Verify events appear in the public search
4. Test with real addresses from your target areas
