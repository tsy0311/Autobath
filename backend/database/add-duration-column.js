const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🔧 Adding duration_minutes column to bookings table...\n');

db.serialize(() => {
  // Check if column exists
  db.all("PRAGMA table_info(bookings)", (err, columns) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }

    const hasDuration = columns.some(col => col.name === 'duration_minutes');
    
    if (!hasDuration) {
      console.log('Adding duration_minutes column...');
      
      db.run(`ALTER TABLE bookings ADD COLUMN duration_minutes INTEGER DEFAULT 60`, (err) => {
        if (err) {
          console.error('Error adding column:', err);
        } else {
          console.log('✅ Successfully added duration_minutes column!');
          console.log('✅ Default duration set to 60 minutes for existing bookings');
        }
        db.close();
      });
    } else {
      console.log('✅ duration_minutes column already exists!');
      db.close();
    }
  });
});

