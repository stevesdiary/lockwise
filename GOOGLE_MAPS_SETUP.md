# Google Maps API Setup Guide

## 1. Google Cloud Console Setup

### Create Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Note your Project ID

### Enable APIs
Enable these APIs in the Google Cloud Console:
- **Maps JavaScript API**
- **Places API (New)**
- **Geocoding API**

### Create API Key
1. Go to "Credentials" in Google Cloud Console
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Click "Restrict Key" for security

### API Key Restrictions
**Application Restrictions:**
- HTTP referrers (web sites)
- Add your domains: `localhost:*`, `yourdomain.com/*`

**API Restrictions:**
- Restrict to: Maps JavaScript API, Places API, Geocoding API

## 2. Environment Configuration

Add to your `.env` file:
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

## 3. Frontend Configuration

Replace in `location-picker.html`:
```html
<gmpx-api-loader key="YOUR_API_KEY" solution-channel="GMP_GE_mapsandplacesapi_v1"></gmpx-api-loader>
```

With:
```html
<gmpx-api-loader key="your_actual_api_key" solution-channel="GMP_GE_mapsandplacesapi_v1"></gmpx-api-loader>
```

## 4. Map ID Configuration

### Create Map ID (Optional but Recommended)
1. Go to [Google Maps Platform](https://console.cloud.google.com/google/maps-apis/studio/maps)
2. Click "Create Map ID"
3. Choose "JavaScript" as map type
4. Configure styling if needed
5. Copy the Map ID

Replace in HTML:
```html
<gmp-map id="map" center="6.5244,3.3792" zoom="10" map-id="YOUR_MAP_ID">
```

## 5. Usage Limits & Billing

### Free Tier Limits
- **Maps JavaScript API**: $200 free credit monthly
- **Places API**: $200 free credit monthly  
- **Geocoding API**: $200 free credit monthly

### Cost Optimization
- Set daily quotas to prevent overuse
- Use client-side geocoding when possible
- Cache geocoding results
- Implement request throttling

## 6. Security Best Practices

### API Key Security
- Never expose API key in client-side code for production
- Use HTTP referrer restrictions
- Monitor API usage regularly
- Rotate keys periodically

### Production Setup
For production, consider:
- Server-side proxy for API calls
- API key stored in environment variables
- Rate limiting on your backend
- User authentication before map access

## 7. Testing

Test your setup:
1. Load the location picker page
2. Search for a location
3. Verify map updates and marker placement
4. Test saving location to backend
5. Check browser console for errors

## 8. Troubleshooting

### Common Issues
- **"This page can't load Google Maps correctly"**: Check API key and billing
- **Place picker not working**: Ensure Places API is enabled
- **Geocoding errors**: Verify Geocoding API is enabled and has quota
- **CORS errors**: Check HTTP referrer restrictions

### Debug Steps
1. Check browser console for errors
2. Verify API key in Google Cloud Console
3. Check API quotas and billing
4. Test with a simple map first
5. Gradually add features