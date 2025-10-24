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

console.log('🔄 Adding variants to existing products...');

// Clear existing variants first
const clearExistingVariants = () => {
  return new Promise((resolve, reject) => {
    console.log('1. Clearing existing variants...');
    db.run('DELETE FROM product_colors', (err) => {
      if (err) {
        console.error('Error clearing variants:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Existing variants cleared');
      resolve();
    });
  });
};

// Add variants for specific products
const addVariants = () => {
  return new Promise((resolve, reject) => {
    console.log('2. Adding variants to products...');
    
    const variants = [
      // One Sided Towel (Product ID 8)
      { product_id: 8, color_name: '40x40', color_code: null, color_image_url: null, price_adjustment: 0, stock: 50, is_available: 1, sort_order: 0 },
      { product_id: 8, color_name: '60x80', color_code: null, color_image_url: null, price_adjustment: 11, stock: 25, is_available: 1, sort_order: 1 },
      
      // Two Sided Towel (Product ID 9)
      { product_id: 9, color_name: '40x40', color_code: null, color_image_url: null, price_adjustment: 0, stock: 80, is_available: 1, sort_order: 0 },
      { product_id: 9, color_name: '60x80', color_code: null, color_image_url: null, price_adjustment: 19, stock: 80, is_available: 1, sort_order: 1 },
      
      // Microfiber Towel (Product ID 10)
      { product_id: 10, color_name: '30x40', color_code: null, color_image_url: null, price_adjustment: 0, stock: 30, is_available: 1, sort_order: 0 },
      { product_id: 10, color_name: '30x60', color_code: null, color_image_url: null, price_adjustment: 4.1, stock: 30, is_available: 1, sort_order: 1 },
      
      // Unicorn Brush (Product ID 21)
      { product_id: 21, color_name: 'Small', color_code: null, color_image_url: null, price_adjustment: 0, stock: 100, is_available: 1, sort_order: 0 },
      { product_id: 21, color_name: 'Big', color_code: null, color_image_url: null, price_adjustment: 0, stock: 100, is_available: 1, sort_order: 1 },
      
      // Washing Brush (Product ID 22)
      { product_id: 22, color_name: 'Pig Hair (猪毛)', color_code: null, color_image_url: null, price_adjustment: 0, stock: 50, is_available: 1, sort_order: 0 },
      { product_id: 22, color_name: 'Plastic (塑料细节刷)', color_code: null, color_image_url: null, price_adjustment: 0, stock: 50, is_available: 1, sort_order: 1 },
      
      // Tear-Off Towel (Product ID 23)
      { product_id: 23, color_name: 'Pink', color_code: null, color_image_url: null, price_adjustment: 0, stock: 80, is_available: 1, sort_order: 0 },
      { product_id: 23, color_name: 'Grey', color_code: null, color_image_url: null, price_adjustment: 0, stock: 80, is_available: 1, sort_order: 1 }
    ];

    const stmt = db.prepare(`
      INSERT INTO product_colors (product_id, color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let completed = 0;
    variants.forEach((variant, index) => {
      stmt.run(
        variant.product_id,
        variant.color_name,
        variant.color_code,
        variant.color_image_url,
        variant.price_adjustment,
        variant.stock,
        variant.is_available,
        variant.sort_order,
        (err) => {
          if (err) {
            console.error(`Error inserting variant for product ${variant.product_id}:`, err.message);
            return;
          }
          
          completed++;
          console.log(`✅ Variant ${completed}/${variants.length}: ${variant.color_name} for product ${variant.product_id}`);
          
          if (completed === variants.length) {
            stmt.finalize();
            console.log('✅ All variants inserted successfully');
            resolve();
          }
        }
      );
    });
  });
};

// Verify the results
const verifyResults = () => {
  return new Promise((resolve, reject) => {
    console.log('3. Verifying results...');
    
    db.get('SELECT COUNT(*) as count FROM product_colors', (err, result) => {
      if (err) {
        console.error('Error checking variants count:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ Total variants: ${result.count}`);
      
      // Show products with variants
      db.all(`
        SELECT p.name, COUNT(pc.id) as variant_count 
        FROM products p 
        LEFT JOIN product_colors pc ON p.id = pc.product_id 
        GROUP BY p.id 
        HAVING variant_count > 0 
        ORDER BY p.id
      `, (err, rows) => {
        if (err) {
          console.error('Error fetching products with variants:', err.message);
          reject(err);
          return;
        }
        
        console.log('\n📦 Products with variants:');
        rows.forEach(row => {
          console.log(`  • ${row.name}: ${row.variant_count} variants`);
        });
        
        resolve();
      });
    });
  });
};

// Main execution
const main = async () => {
  try {
    await clearExistingVariants();
    await addVariants();
    await verifyResults();
    
    console.log('\n🎉 Variants added successfully!');
    console.log('✅ All products now have their variants');
    console.log('🚀 Live website should now show variants correctly');
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\nDatabase connection closed');
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error adding variants:', error);
    process.exit(1);
  }
};

main();
