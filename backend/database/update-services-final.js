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

console.log('Updating services to match localhost data...');

// First, remove the unwanted services
const servicesToRemove = [
  'Paint Correction',
  'Premium Detailing', 
  'Interior Deep Clean',
  'Basic Car Wash',
  'Ceramic Coating'
];

console.log('Removing unwanted services:', servicesToRemove);

const deleteQuery = `
  DELETE FROM services 
  WHERE name IN (${servicesToRemove.map(() => '?').join(', ')})
`;

db.run(deleteQuery, servicesToRemove, function(err) {
  if (err) {
    console.error('Error deleting services:', err.message);
  } else {
    console.log(`✅ Successfully removed ${this.changes} unwanted services`);
  }
  
  // Verify remaining services
  const verifyQuery = `
    SELECT name, base_price, duration_minutes, category 
    FROM services 
    WHERE is_active = 1 
    ORDER BY category, name
  `;
  
  db.all(verifyQuery, [], (err, rows) => {
    if (err) {
      console.error('Error verifying services:', err.message);
    } else {
      console.log('\n📋 Remaining individual services:');
      console.log('================================');
      
      const categories = {};
      rows.forEach(service => {
        if (!categories[service.category]) {
          categories[service.category] = [];
        }
        categories[service.category].push(service);
      });
      
      Object.keys(categories).forEach(category => {
        console.log(`\n${category}:`);
        categories[category].forEach(service => {
          console.log(`  • ${service.name} - RM${service.base_price} (${service.duration_minutes}min)`);
        });
      });
      
      console.log(`\n✅ Total services: ${rows.length}`);
    }
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\nDatabase connection closed');
        console.log('✅ Services updated successfully!');
      }
      process.exit(0);
    });
  });
});
