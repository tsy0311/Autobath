const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🧤 Adding color variants to Washing Glove product...');

db.serialize(() => {
  // First, check if the washing glove product exists
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
    
    // Check existing variants
    db.all('SELECT * FROM product_colors WHERE product_id = ?', [product.id], (err, existingVariants) => {
      if (err) {
        console.error('Error checking existing variants:', err);
        return;
      }
      
      console.log(`📊 Current variants: ${existingVariants.length}`);
      existingVariants.forEach(variant => {
        console.log(`  - ${variant.color_name}: Stock ${variant.stock}`);
      });
      
      // Define the color variants to add
      const variants = [
        { color_name: 'BlackWhite', stock: 20 },
        { color_name: 'Red', stock: 15 },
        { color_name: 'Blue', stock: 15 }
      ];
      
      // Check which variants already exist
      const existingColors = existingVariants.map(v => v.color_name);
      const newVariants = variants.filter(v => !existingColors.includes(v.color_name));
      
      if (newVariants.length === 0) {
        console.log('✅ All color variants already exist!');
        db.close();
        return;
      }
      
      console.log(`➕ Adding ${newVariants.length} new variants...`);
      
      // Add new variants
      const stmt = db.prepare(`
        INSERT INTO product_colors (product_id, color_name, stock, is_available, created_at) 
        VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
      `);
      
      let addedCount = 0;
      newVariants.forEach(variant => {
        stmt.run(product.id, variant.color_name, variant.stock, (err) => {
          if (err) {
            console.error(`❌ Error adding ${variant.color_name}:`, err.message);
          } else {
            console.log(`✅ Added ${variant.color_name} variant with stock ${variant.stock}`);
            addedCount++;
          }
        });
      });
      
      stmt.finalize();
      
      // Verify the final result
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
            console.log(`\n🎉 Total variants: ${finalVariants.length}`);
          }
          db.close();
        });
      }, 1000);
    });
  });
});
