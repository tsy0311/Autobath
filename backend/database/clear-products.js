const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🧹 Clearing products and related dummy data...');

db.serialize(() => {
  // Delete order items first to avoid FK issues
  db.run('DELETE FROM order_items', (err) => {
    if (err) console.error('Error clearing order_items:', err.message);
    else console.log('✅ Cleared order_items');
  });

  // Delete product bundles that reference products list
  db.run('DELETE FROM product_bundles', (err) => {
    if (err) console.error('Error clearing product_bundles:', err.message);
    else console.log('✅ Cleared product_bundles');
  });

  // Delete products
  db.run('DELETE FROM products', (err) => {
    if (err) console.error('Error clearing products:', err.message);
    else console.log('✅ Cleared products');
  });

  // Reset autoincrement sequences (SQLite specific)
  db.run("DELETE FROM sqlite_sequence WHERE name IN ('products','order_items','product_bundles')", (err) => {
    if (err) console.error('Error resetting sequences:', err.message);
    else console.log('✅ Reset sqlite_sequence for products, order_items, product_bundles');
  });

  // Done
  setTimeout(() => {
    console.log('🎉 All dummy product data removed.');
    db.close();
  }, 500);
});


