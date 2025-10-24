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

console.log('🔄 FORCE RESET: Clearing ALL data and reinitializing...');

// Clear ALL data in correct order (respecting foreign keys)
const clearAllData = () => {
  return new Promise((resolve, reject) => {
    console.log('1. Clearing all data...');
    
    // Clear in reverse dependency order
    const clearQueries = [
      'DELETE FROM product_colors',
      'DELETE FROM product_images', 
      'DELETE FROM order_items',
      'DELETE FROM orders',
      'DELETE FROM bookings',
      'DELETE FROM contact_messages',
      'DELETE FROM product_bundles',
      'DELETE FROM service_packages',
      'DELETE FROM services',
      'DELETE FROM products',
      'DELETE FROM admin_users'
    ];

    let completed = 0;
    clearQueries.forEach((query, index) => {
      db.run(query, (err) => {
        if (err) {
          console.error(`Error clearing ${query}:`, err.message);
          reject(err);
          return;
        }
        completed++;
        console.log(`✅ Cleared ${query.split(' ')[2]}`);
        
        if (completed === clearQueries.length) {
          console.log('✅ All data cleared successfully');
          resolve();
        }
      });
    });
  });
};

// Reinitialize database
const reinitializeDatabase = () => {
  return new Promise((resolve, reject) => {
    console.log('2. Reinitializing database with fresh data...');
    const { initDatabase } = require('./init');
    
    initDatabase()
      .then(() => {
        console.log('✅ Database reinitialized successfully');
        resolve();
      })
      .catch(reject);
  });
};

// Verify data
const verifyData = () => {
  return new Promise((resolve, reject) => {
    console.log('3. Verifying data...');
    
    const checks = [
      { table: 'services', expected: 15, name: 'Individual Services' },
      { table: 'service_packages', expected: 9, name: 'Service Packages' },
      { table: 'products', expected: 37, name: 'Products' }
    ];

    let completed = 0;
    checks.forEach(check => {
      db.get(`SELECT COUNT(*) as count FROM ${check.table}`, (err, result) => {
        if (err) {
          console.error(`Error checking ${check.table}:`, err.message);
          reject(err);
          return;
        }
        
        const actual = result.count;
        const status = actual === check.expected ? '✅' : '❌';
        console.log(`${status} ${check.name}: ${actual}/${check.expected}`);
        
        completed++;
        if (completed === checks.length) {
          resolve();
        }
      });
    });
  });
};

// Main execution
const main = async () => {
  try {
    await clearAllData();
    await reinitializeDatabase();
    await verifyData();
    
    console.log('\n🎉 FORCE RESET COMPLETE!');
    console.log('✅ Production database now matches localhost');
    console.log('🚀 Live website should now show all data');
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\nDatabase connection closed');
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error during force reset:', error);
    process.exit(1);
  }
};

main();
