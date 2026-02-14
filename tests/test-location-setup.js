// Test script to create sample addresses for location testing
const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api'; // Adjust port as needed
const AUTH_TOKEN = 'your_jwt_token_here'; // Replace with actual token

const sampleAddresses = [
  {
    apartment_number: 'A101',
    street: 'Victoria Island',
    building: 'Block A',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    estate_id: 'your_estate_id_here' // Replace with actual estate ID
  },
  {
    apartment_number: 'B205',
    street: 'Lekki Phase 1',
    building: 'Block B',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    estate_id: 'your_estate_id_here'
  }
];

async function createTestAddresses() {
  for (const address of sampleAddresses) {
    try {
      const response = await axios.post(`${BASE_URL}/addresses`, address, {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
      });
      console.log('Created address:', response.data);
    } catch (error) {
      console.error('Error creating address:', error.response?.data || error.message);
    }
  }
}

// Run: node test-location-setup.js
createTestAddresses();