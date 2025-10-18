const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🧹 Clearing TEST data...');

const TEST_EMAIL_DOMAIN = '@autobath.test';

db.serialize(() => {
  db.run('BEGIN');

  // Delete order_items referencing orders by test emails
  db.all(`SELECT id FROM orders WHERE customer_email LIKE ?`, ['%' + TEST_EMAIL_DOMAIN], (err, orders) => {
    if (err) {
      console.error('Error selecting test orders:', err.message);
    } else {
      const ids = orders.map(o => o.id);
      if (ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');
        db.run(`DELETE FROM order_items WHERE order_id IN (${placeholders})`, ids, (e) => {
          if (e) console.error('Error deleting order_items:', e.message);
          else console.log('✅ Cleared order_items for test orders');
        });
        db.run(`DELETE FROM orders WHERE id IN (${placeholders})`, ids, (e) => {
          if (e) console.error('Error deleting orders:', e.message);
          else console.log('✅ Cleared orders');
        });
      }
    }
  });

  // Delete reviews by test emails
  db.run(`DELETE FROM reviews WHERE customer_email LIKE ?`, ['%' + TEST_EMAIL_DOMAIN], (e) => {
    if (e) console.error('Error deleting reviews:', e.message);
    else console.log('✅ Cleared reviews');
  });

  // Delete bookings by test emails
  db.run(`DELETE FROM bookings WHERE customer_email LIKE ?`, ['%' + TEST_EMAIL_DOMAIN], (e) => {
    if (e) console.error('Error deleting bookings:', e.message);
    else console.log('✅ Cleared bookings');
  });

  // Delete customers by test emails
  db.run(`DELETE FROM customers WHERE email LIKE ?`, ['%' + TEST_EMAIL_DOMAIN], (e) => {
    if (e) console.error('Error deleting customers:', e.message);
    else console.log('✅ Cleared customers');
  });

  db.run('COMMIT', (e) => {
    if (e) console.error('Commit error:', e.message);
    console.log('🎉 TEST data cleared');
    db.close();
  });
});


