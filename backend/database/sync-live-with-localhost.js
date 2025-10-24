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

console.log('🔄 Syncing live website with localhost data...');

// Step 1: Clear existing variants and non-primary images
const clearExistingData = () => {
  return new Promise((resolve, reject) => {
    console.log('1. Clearing existing variants and non-primary images...');
    
    db.run('DELETE FROM product_colors', (err) => {
      if (err) {
        console.error('Error clearing variants:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Variants cleared');
      
      db.run('DELETE FROM product_images WHERE is_primary = 0', (err) => {
        if (err) {
          console.error('Error clearing non-primary images:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Non-primary images cleared');
        resolve();
      });
    });
  });
};

// Step 2: Add variants (exact data from localhost)
const addVariants = () => {
  return new Promise((resolve, reject) => {
    console.log('2. Adding variants...');
    
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
    variants.forEach((variant) => {
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
            console.error(`Error inserting variant:`, err.message);
            return;
          }
          completed++;
          if (completed === variants.length) {
            stmt.finalize();
            console.log('✅ All variants added');
            resolve();
          }
        }
      );
    });
  });
};

// Step 3: Add multiple images (exact data from localhost)
const addMultipleImages = () => {
  return new Promise((resolve, reject) => {
    console.log('3. Adding multiple images...');
    
    const images = [
      // Metal Sprayer (Product ID 1) - 2 images total
      { product_id: 1, image_url: 'https://api.autobath.co/img/metalsprayer2.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      
      // Washing Glove (Product ID 3) - 3 images total
      { product_id: 3, image_url: 'https://api.autobath.co/img/glovewasherBlue.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 3, image_url: 'https://api.autobath.co/img/glovewasherRed.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // Multi-functional Detail Brush (Product ID 6) - 3 images total
      { product_id: 6, image_url: 'https://api.autobath.co/img/brushset5pc2.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 6, image_url: 'https://api.autobath.co/img/washingbrushset3pcs.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // One Sided Towel (Product ID 8) - 6 images total
      { product_id: 8, image_url: 'https://api.autobath.co/img/onesided60x80(1).jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 8, image_url: 'https://api.autobath.co/img/onesided60x80(2).jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      { product_id: 8, image_url: 'https://api.autobath.co/img/onesided40x40(2).jpg', alt_text: null, sort_order: 3, is_primary: 0 },
      { product_id: 8, image_url: 'https://api.autobath.co/img/onesided60x80(1).jpg', alt_text: null, sort_order: 4, is_primary: 0 },
      { product_id: 8, image_url: 'https://api.autobath.co/img/onesided60x80(2).jpg', alt_text: null, sort_order: 5, is_primary: 0 },
      
      // Two Sided Towel (Product ID 9) - 4 images total
      { product_id: 9, image_url: 'https://api.autobath.co/img/twosided40x40(2).jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 9, image_url: 'https://api.autobath.co/img/twosided60x80(1).jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      { product_id: 9, image_url: 'https://api.autobath.co/img/twosided60x80(2).jpg', alt_text: null, sort_order: 3, is_primary: 0 },
      
      // Microfiber Towel (Product ID 10) - 6 images total
      { product_id: 10, image_url: 'https://api.autobath.co/img/microfiber30x40(2).jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 10, image_url: 'https://api.autobath.co/img/microfiber30x60.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      { product_id: 10, image_url: 'https://api.autobath.co/img/microfiber40x60.jpg', alt_text: null, sort_order: 3, is_primary: 0 },
      { product_id: 10, image_url: 'https://api.autobath.co/img/microfiber40x60(2).jpg', alt_text: null, sort_order: 4, is_primary: 0 },
      { product_id: 10, image_url: 'https://api.autobath.co/img/microfiber60x80.jpg', alt_text: null, sort_order: 5, is_primary: 0 },
      
      // Unicorn Brush (Product ID 21) - 3 images total
      { product_id: 21, image_url: 'https://api.autobath.co/img/largeunicorn.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 21, image_url: 'https://api.autobath.co/img/smallunicorn1.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // Washing Brush (Product ID 22) - 3 images total
      { product_id: 22, image_url: 'https://api.autobath.co/img/pighairbrush.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 22, image_url: 'https://api.autobath.co/img/plasticbrush.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // Tear-Off Towel (Product ID 23) - 2 images total
      { product_id: 23, image_url: 'https://api.autobath.co/img/tearoff.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      
      // High Pressure Washer F4 (Product ID 24) - 3 images total
      { product_id: 24, image_url: 'https://api.autobath.co/img/panther-p4-1.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 24, image_url: 'https://api.autobath.co/img/panther-p6.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // High Pressure Washer P4 (Product ID 25) - 3 images total
      { product_id: 25, image_url: 'https://api.autobath.co/img/panther-f4.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 25, image_url: 'https://api.autobath.co/img/panther-p6.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // High Pressure Washer P6 PRO (Product ID 26) - 3 images total
      { product_id: 26, image_url: 'https://api.autobath.co/img/panther-f4.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 26, image_url: 'https://api.autobath.co/img/panther-p4-1.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // Car Wash Brush Mop (Product ID 28) - 3 images total
      { product_id: 28, image_url: 'https://api.autobath.co/img/carwashbrush2.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 28, image_url: 'https://api.autobath.co/img/carwashbrush3.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // Detachable Brush Mop (Product ID 29) - 2 images total
      { product_id: 29, image_url: 'https://api.autobath.co/img/detachablebrush2.jpg', alt_text: null, sort_order: 1, is_primary: 0 }
    ];

    const stmt = db.prepare(`
      INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
      VALUES (?, ?, ?, ?, ?)
    `);

    let completed = 0;
    images.forEach((image) => {
      stmt.run(
        image.product_id,
        image.image_url,
        image.alt_text,
        image.sort_order,
        image.is_primary,
        (err) => {
          if (err) {
            console.error(`Error inserting image:`, err.message);
            return;
          }
          completed++;
          if (completed === images.length) {
            stmt.finalize();
            console.log('✅ All multiple images added');
            resolve();
          }
        }
      );
    });
  });
};

// Step 4: Verify results
const verifyResults = () => {
  return new Promise((resolve, reject) => {
    console.log('4. Verifying results...');
    
    db.get('SELECT COUNT(*) as count FROM product_colors', (err, result) => {
      if (err) {
        console.error('Error checking variants count:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ Total variants: ${result.count}`);
      
      db.get('SELECT COUNT(*) as count FROM product_images', (err, result2) => {
        if (err) {
          console.error('Error checking images count:', err.message);
          reject(err);
          return;
        }
        
        console.log(`✅ Total product images: ${result2.count}`);
        
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
          
          // Show products with multiple images
          db.all(`
            SELECT p.name, COUNT(pi.id) as image_count 
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            GROUP BY p.id 
            HAVING image_count > 1 
            ORDER BY p.id
          `, (err, imageRows) => {
            if (err) {
              console.error('Error fetching products with multiple images:', err.message);
              reject(err);
              return;
            }
            
            console.log('\n📸 Products with multiple images:');
            imageRows.forEach(row => {
              console.log(`  • ${row.name}: ${row.image_count} images`);
            });
            
            console.log('\n🎉 Live website sync completed successfully!');
            console.log('✅ Variants and multiple images now match localhost');
            console.log('🚀 Website should now show variants and multiple images correctly');
            
            resolve();
          });
        });
      });
    });
  });
};

// Main execution
const main = async () => {
  try {
    await clearExistingData();
    await addVariants();
    await addMultipleImages();
    await verifyResults();
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\nDatabase connection closed');
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error syncing live website:', error);
    process.exit(1);
  }
};

main();
