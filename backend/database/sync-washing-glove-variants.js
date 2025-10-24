const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Syncing Washing Glove variants to live database...');

db.serialize(() => {
  // Get the washing glove product
  db.get('SELECT id, name FROM products WHERE name LIKE "%glove%" OR name LIKE "%Glove%"', (err, product) => {
    if (err) {
      console.error('Error finding washing glove product:', err);
      return;
    }
    
    if (!product) {
      console.error('❌ Washing glove product not found!');
      db.close();
      return;
    }
    
    console.log(`✅ Found product: ${product.name} (ID: ${product.id})`);
    
    // Get all variants for this product
    db.all('SELECT * FROM product_colors WHERE product_id = ?', [product.id], (err, variants) => {
      if (err) {
        console.error('Error fetching variants:', err);
        return;
      }
      
      console.log(`📊 Found ${variants.length} variants to sync:`);
      variants.forEach(variant => {
        console.log(`  - ${variant.color_name}: Stock ${variant.stock}`);
      });
      
      // Clear existing variants for this product (to ensure clean sync)
      db.run('DELETE FROM product_colors WHERE product_id = ?', [product.id], (err) => {
        if (err) {
          console.error('Error clearing existing variants:', err);
          return;
        }
        
        console.log('🧹 Cleared existing variants');
        
        // Insert all variants
        const stmt = db.prepare(`
          INSERT INTO product_colors (product_id, color_name, stock, is_available, created_at) 
          VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
        `);
        
        let insertedCount = 0;
        variants.forEach(variant => {
          stmt.run(variant.product_id, variant.color_name, variant.stock, (err) => {
            if (err) {
              console.error(`❌ Error inserting ${variant.color_name}:`, err.message);
            } else {
              console.log(`✅ Inserted ${variant.color_name} variant`);
              insertedCount++;
            }
          });
        });
        
        stmt.finalize();
        
        // Final verification
        setTimeout(() => {
          console.log('\n🔍 Final verification...');
          db.all('SELECT * FROM product_colors WHERE product_id = ? ORDER BY color_name', [product.id], (err, finalVariants) => {
            if (err) {
              console.error('Error verifying variants:', err);
            } else {
              console.log(`\n📋 Final variants for ${product.name}:`);
              finalVariants.forEach(variant => {
                console.log(`  - ${variant.color_name}: Stock ${variant.stock}`);
              });
              console.log(`\n🎉 Successfully synced ${finalVariants.length} variants to database!`);
            }
            db.close();
          });
        }, 1000);
      });
    });
  });
});
