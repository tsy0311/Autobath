// Test booking endpoint
const http = require('http');

const testData = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '+60123456789',
  service: 'Premium Package',
  date: '2025-10-15',
  timeSlot: '10:00',
  notes: 'Test booking',
  vehicleType: 'sedan',
  serviceType: 'package',
  packageId: 1
};

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/bookings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(testData))
  }
};

console.log('🧪 Testing Booking Endpoint...\n');
console.log('📤 Sending:', testData);

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📊 Response Status:', res.statusCode);
    console.log('📋 Response Headers:', res.headers);
    
    try {
      const parsed = JSON.parse(body);
      console.log('📥 Response Body:', JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ Booking endpoint is WORKING!');
      } else {
        console.log('\n❌ Booking endpoint returned error');
      }
    } catch (e) {
      console.log('📥 Raw Response:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});

req.write(JSON.stringify(testData));
req.end();

