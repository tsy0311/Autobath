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

console.log('🔄 Resetting production database to match localhost...');

// Step 1: Clear existing data
console.log('1. Clearing existing services...');
db.run('DELETE FROM services', (err) => {
  if (err) {
    console.error('Error clearing services:', err.message);
    process.exit(1);
  }
  console.log('✅ Services cleared');
});

console.log('2. Clearing existing service packages...');
db.run('DELETE FROM service_packages', (err) => {
  if (err) {
    console.error('Error clearing service packages:', err.message);
    process.exit(1);
  }
  console.log('✅ Service packages cleared');
});

console.log('3. Clearing existing products...');
db.run('DELETE FROM products', (err) => {
  if (err) {
    console.error('Error clearing products:', err.message);
    process.exit(1);
  }
  console.log('✅ Products cleared');
});

console.log('4. Clearing existing product images...');
db.run('DELETE FROM product_images', (err) => {
  if (err) {
    console.error('Error clearing product images:', err.message);
    process.exit(1);
  }
  console.log('✅ Product images cleared');
});

console.log('5. Clearing existing product colors...');
db.run('DELETE FROM product_colors', (err) => {
  if (err) {
    console.error('Error clearing product colors:', err.message);
    process.exit(1);
  }
  console.log('✅ Product colors cleared');
});

// Step 2: Reinitialize with correct data
console.log('6. Reinitializing database...');
const { initDatabase } = require('./init');

initDatabase()
  .then(() => {
    console.log('✅ Database reinitialized successfully');
    console.log('🎉 Production database now matches localhost!');
    
    // Verify the data
    console.log('\n📊 Verification:');
    
    // Check services
    db.get('SELECT COUNT(*) as count FROM services', (err, result) => {
      if (err) {
        console.error('Error checking services:', err.message);
      } else {
        console.log(`✅ Services: ${result.count} (expected: 15)`);
      }
    });
    
    // Check service packages
    db.get('SELECT COUNT(*) as count FROM service_packages', (err, result) => {
      if (err) {
        console.error('Error checking service packages:', err.message);
      } else {
        console.log(`✅ Service packages: ${result.count} (expected: 9)`);
      }
    });
    
    // Check products
    db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
      if (err) {
        console.error('Error checking products:', err.message);
      } else {
        console.log(`✅ Products: ${result.count} (expected: 37)`);
      }
    });
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\nDatabase connection closed');
        console.log('🚀 Ready for deployment!');
      }
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('Error reinitializing database:', error);
    process.exit(1);
  });
