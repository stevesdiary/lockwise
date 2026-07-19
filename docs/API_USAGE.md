# Map API Usage Guide

## Setup
1. Add `GOOGLE_MAPS_API_KEY` to your `.env` file
2. Run migration: `npm run migrate`

## API Endpoints

### Get Estate Map Data
```
GET /api/addresses/map/:estateId?
Authorization: Bearer JWT_TOKEN
```

### Update Address Coordinates
```
PUT /api/addresses/:addressId/location
Authorization: Bearer JWT_TOKEN
```

### Get Directions URL
```
GET /api/addresses/directions?fromLat=LAT&fromLng=LNG&toLat=LAT&toLng=LNG
Authorization: Bearer JWT_TOKEN
```

## Frontend Integration
Replace `YOUR_API_KEY` and `YOUR_JWT_TOKEN` in `map-example.html` with actual values.