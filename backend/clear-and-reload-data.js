const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Clearing old dummy data and reloading fresh data...\n');

db.serialize(() => {
  // Clear existing dummy data (but keep products)
  console.log('📝 Clearing old data...');
  
  db.run('DELETE FROM order_items', (err) => {
    if (err) console.error('Error clearing order_items:', err);
  });
  
  db.run('DELETE FROM orders', (err) => {
    if (err) console.error('Error clearing orders:', err);
    else console.log('✅ Cleared orders');
  });
  
  db.run('DELETE FROM bookings', (err) => {
    if (err) console.error('Error clearing bookings:', err);
    else console.log('✅ Cleared bookings');
  });
  
  db.run('DELETE FROM reviews', (err) => {
    if (err) console.error('Error clearing reviews:', err);
    else console.log('✅ Cleared reviews');
  });
  
  db.run('DELETE FROM customers', (err) => {
    if (err) console.error('Error clearing customers:', err);
    else console.log('✅ Cleared customers\n');
    
    // After clearing, run the add script
    setTimeout(() => {
      db.close();
      console.log('🔄 Now running add-dummy-data.js...\n');
      require('./add-dummy-data.js');
    }, 1000);
  });
});







