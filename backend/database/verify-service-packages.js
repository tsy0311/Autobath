const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

console.log('Verifying service packages...');

const verifyQuery = `
  SELECT name, base_price, duration_minutes, vehicle_type, is_popular, is_active
  FROM service_packages 
  WHERE is_active = 1 
  ORDER BY vehicle_type, name
`;

db.all(verifyQuery, [], (err, rows) => {
  if (err) {
    console.error('Error verifying service packages:', err.message);
  } else {
    console.log('\n📋 Service Packages:');
    console.log('===================');
    
    const vehicleTypes = {};
    rows.forEach(pkg => {
      if (!vehicleTypes[pkg.vehicle_type]) {
        vehicleTypes[pkg.vehicle_type] = [];
      }
      vehicleTypes[pkg.vehicle_type].push(pkg);
    });
    
    Object.keys(vehicleTypes).forEach(vehicleType => {
      console.log(`\n${vehicleType.toUpperCase()}:`);
      vehicleTypes[vehicleType].forEach(pkg => {
        const popular = pkg.is_popular ? ' (POPULAR)' : '';
        console.log(`  • ${pkg.name} - RM${pkg.base_price} (${pkg.duration_minutes}min)${popular}`);
      });
    });
    
    console.log(`\n✅ Total service packages: ${rows.length}`);
    
    // Check if we have the required sedan/suv packages for home page
    const sedanPackages = rows.filter(pkg => pkg.vehicle_type === 'sedan/suv');
    console.log(`\n🏠 Sedan/SUV packages for Home page: ${sedanPackages.length}`);
    sedanPackages.forEach(pkg => {
      console.log(`  • ${pkg.name} - RM${pkg.base_price}`);
    });
  }
  
  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('\nDatabase connection closed');
      console.log('✅ Service packages verified!');
    }
    process.exit(0);
  });
});
