const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing database schema...\n');

// Check current columns
db.all("PRAGMA table_info(bookings)", (err, columns) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  console.log('Current columns:', columns.map(c => c.name).join(', '));
  
  const hasServiceName = columns.some(col => col.name === 'service_name');
  
  if (!hasServiceName) {
    console.log('\n❌ Missing service_name column. Adding it...');
    
    db.run(`ALTER TABLE bookings ADD COLUMN service_name TEXT`, (err) => {
      if (err) {
        console.error('Error adding column:', err);
      } else {
        console.log('✅ Successfully added service_name column!');
      }
      db.close();
    });
  } else {
    console.log('\n✅ Database schema is correct!');
    db.close();
  }
});

