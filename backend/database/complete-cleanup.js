const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🧹 Complete cleanup: Removing ALL products and starting fresh...');

let deletedCount = 0;

db.serialize(() => {
  db.run('BEGIN');

  // Step 1: Delete ALL existing products and related data
  console.log('🧹 Step 1: Clearing ALL existing data...');
  
  db.run('DELETE FROM product_colors', (err) => {
    if (err) {
      console.error('Error deleting product colors:', err);
    } else {
      console.log('✅ Deleted all product colors');
    }
  });
  
  db.run('DELETE FROM product_images', (err) => {
    if (err) {
      console.error('Error deleting product images:', err);
    } else {
      console.log('✅ Deleted all product images');
    }
  });
  
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('Error deleting products:', err);
      return;
    }
    
    console.log('✅ Deleted all products');
    
    // Reset auto-increment counters
    db.run('DELETE FROM sqlite_sequence WHERE name="products"', (err) => {
      if (err) console.error('Error resetting sequence:', err);
    });
    
    db.run('DELETE FROM sqlite_sequence WHERE name="product_colors"', (err) => {
      if (err) console.error('Error resetting sequence:', err);
    });
    
    db.run('DELETE FROM sqlite_sequence WHERE name="product_images"', (err) => {
      if (err) console.error('Error resetting sequence:', err);
    });
    
    console.log('🎉 Complete cleanup finished! Database is now empty and ready for fresh import.');
    console.log('📝 Next step: Run the bulk import to add exactly 45 products with variants.');
    
    db.run('COMMIT', (err) => {
      if (err) console.error('Commit error:', err.message);
      db.close();
    });
  });
});
