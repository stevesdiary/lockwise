# Location Feature Testing Guide

## Prerequisites

### 1. Environment Setup
Ensure your `.env` file has:
```env
MAP_API_KEY=AIzaSyC8tTHsDPsah3IuD8_4TLGFusiuRjxRr_g
MAP_ID=DEMO_MAP_ID  # Optional, will use default if not set
```

### 2. Google Cloud Console
Verify these APIs are enabled:
- Maps JavaScript API
- Places API (New)
- Geocoding API

## Testing Steps

### Step 1: Start the Server
```bash
cd /Users/stv/Documents/Github/lockwise
npm start
```
Server should start on port 3002 (or your configured port).

### Step 2: Create Test Data
1. Login to get JWT token
2. Create an estate if none exists
3. Update `test-location-setup.js` with:
   - Your JWT token
   - Your estate ID
   - Correct server port
4. Run: `node test-location-setup.js`

### Step 3: Test Location Picker
1. Open `location-picker.html` in browser
2. Open browser DevTools (F12) to monitor console

### Step 4: Test Authentication
- Ensure you have a valid JWT token in localStorage
- Check browser console for authentication errors

### Step 5: Test Address Loading
1. Select an address from dropdown
2. Verify addresses load from `/api/addresses/map`
3. Check console for any API errors

### Step 6: Test Place Search
1. Type a location in the search box (e.g., "Lagos, Nigeria")
2. Select a place from suggestions
3. Verify map centers on location
4. Check marker appears on map

### Step 7: Test Location Saving
1. Select an address from dropdown
2. Search and select a location
3. Click "Save Location" button
4. Verify success message appears

### Step 8: Test Location Loading
1. Select an address that has saved coordinates
2. Verify map centers on saved location
3. Check marker appears at correct position

## API Testing with cURL

### Get Map Config
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/config/map
```

### Get Address Map Data
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/addresses/map
```

### Save Location
```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"latitude": 6.5244, "longitude": 3.3792, "formatted_address": "Lagos, Nigeria"}' \
  http://localhost:3000/api/addresses/location/ADDRESS_ID
```

### Get Address Location
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/addresses/location/ADDRESS_ID
```

## Troubleshooting

### Common Issues

#### 1. "This page can't load Google Maps correctly"
- Check MAP_API_KEY in .env file
- Verify Google Cloud billing is enabled
- Check API quotas in Google Cloud Console

#### 2. Place picker not working
- Ensure Places API is enabled
- Check browser console for JavaScript errors
- Verify API key has Places API access

#### 3. Authentication errors
- Check JWT token in localStorage
- Verify token hasn't expired
- Test login endpoint first

#### 4. Address dropdown empty
- Check if addresses exist in database
- Verify estate_id in addresses
- Check API response in Network tab

#### 5. Location not saving
- Check request payload in Network tab
- Verify address_id is valid
- Check server logs for errors

### Debug Commands

#### Check Database
```sql
-- Check addresses
SELECT * FROM addresses WHERE estate_id = 'your_estate_id';

-- Check coordinates
SELECT apartment_number, latitude, longitude FROM addresses 
WHERE latitude IS NOT NULL;
```

#### Check Server Logs
Monitor server console for:
- API request logs
- Database query logs
- Error messages

#### Browser DevTools
- **Console**: JavaScript errors
- **Network**: API request/response
- **Application**: localStorage token

## Success Criteria

✅ Map loads without errors
✅ Address dropdown populates
✅ Place search returns results
✅ Map centers on selected places
✅ Markers appear correctly
✅ Location saves successfully
✅ Saved locations load correctly

## Next Steps

After successful testing:
1. Style the interface to match your app
2. Add error handling and loading states
3. Implement batch location updates
4. Add location validation
5. Create mobile-responsive version