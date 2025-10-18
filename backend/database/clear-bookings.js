const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🧹 Clearing ALL bookings...');

db.serialize(() => {
  db.run('BEGIN');

  db.run(`DELETE FROM bookings`, [], (err) => {
    if (err) {
      console.error('Error deleting bookings:', err.message);
    } else {
      console.log('✅ All bookings cleared');
    }
  });

  db.run('COMMIT', (e) => {
    if (e) console.error('Commit error:', e.message);
    console.log('🎉 Bookings table is now empty');
    db.close();
  });
});


