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

console.log('🔄 Adding multiple images to products...');

// Clear existing images first (keep only primary images)
const clearExistingImages = () => {
  return new Promise((resolve, reject) => {
    console.log('1. Clearing non-primary images...');
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
};

// Add multiple images for specific products
const addMultipleImages = () => {
  return new Promise((resolve, reject) => {
    console.log('2. Adding multiple images to products...');
    
    const images = [
      // Metal Sprayer (Product ID 1)
      { product_id: 1, image_url: 'https://api.autobath.co/img/metalsprayer2.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      
      // Washing Glove (Product ID 3)
      { product_id: 3, image_url: 'https://api.autobath.co/img/glovewasherBlue.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 3, image_url: 'https://api.autobath.co/img/glovewasherRed.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // Multi-functional Detail Brush (Product ID 6)
      { product_id: 6, image_url: 'https://api.autobath.co/img/brushset5pc2.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 6, image_url: 'https://api.autobath.co/img/washingbrushset3pcs.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // One Sided Towel (Product ID 8)
      { product_id: 8, image_url: 'https://api.autobath.co/img/onesided60x80(1).jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 8, image_url: 'https://api.autobath.co/img/onesided60x80(2).jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      { product_id: 8, image_url: 'https://api.autobath.co/img/onesided40x40(2).jpg', alt_text: null, sort_order: 3, is_primary: 0 },
      { product_id: 8, image_url: 'https://api.autobath.co/img/onesided60x80(1).jpg', alt_text: null, sort_order: 4, is_primary: 0 },
      { product_id: 8, image_url: 'https://api.autobath.co/img/onesided60x80(2).jpg', alt_text: null, sort_order: 5, is_primary: 0 },
      
      // Two Sided Towel (Product ID 9)
      { product_id: 9, image_url: 'https://api.autobath.co/img/twosided40x40(2).jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 9, image_url: 'https://api.autobath.co/img/twosided60x80(1).jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      { product_id: 9, image_url: 'https://api.autobath.co/img/twosided60x80(2).jpg', alt_text: null, sort_order: 3, is_primary: 0 },
      
      // Microfiber Towel (Product ID 10)
      { product_id: 10, image_url: 'https://api.autobath.co/img/microfiber30x40(2).jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 10, image_url: 'https://api.autobath.co/img/microfiber30x60.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      { product_id: 10, image_url: 'https://api.autobath.co/img/microfiber40x60.jpg', alt_text: null, sort_order: 3, is_primary: 0 },
      { product_id: 10, image_url: 'https://api.autobath.co/img/microfiber40x60(2).jpg', alt_text: null, sort_order: 4, is_primary: 0 },
      { product_id: 10, image_url: 'https://api.autobath.co/img/microfiber60x80.jpg', alt_text: null, sort_order: 5, is_primary: 0 },
      
      // Unicorn Brush (Product ID 21)
      { product_id: 21, image_url: 'https://api.autobath.co/img/largeunicorn.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 21, image_url: 'https://api.autobath.co/img/smallunicorn1.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // Washing Brush (Product ID 22)
      { product_id: 22, image_url: 'https://api.autobath.co/img/pighairbrush.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 22, image_url: 'https://api.autobath.co/img/plasticbrush.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // Tear-Off Towel (Product ID 23)
      { product_id: 23, image_url: 'https://api.autobath.co/img/tearoff.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      
      // High Pressure Washer F4 (Product ID 24)
      { product_id: 24, image_url: 'https://api.autobath.co/img/panther-p4-1.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 24, image_url: 'https://api.autobath.co/img/panther-p6.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // High Pressure Washer P4 (Product ID 25)
      { product_id: 25, image_url: 'https://api.autobath.co/img/panther-f4.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 25, image_url: 'https://api.autobath.co/img/panther-p6.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // High Pressure Washer P6 PRO (Product ID 26)
      { product_id: 26, image_url: 'https://api.autobath.co/img/panther-f4.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 26, image_url: 'https://api.autobath.co/img/panther-p4-1.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // Car Wash Brush Mop (Product ID 28)
      { product_id: 28, image_url: 'https://api.autobath.co/img/carwashbrush2.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
      { product_id: 28, image_url: 'https://api.autobath.co/img/carwashbrush3.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
      
      // Detachable Brush Mop (Product ID 29)
      { product_id: 29, image_url: 'https://api.autobath.co/img/detachablebrush2.jpg', alt_text: null, sort_order: 1, is_primary: 0 }
    ];

    const stmt = db.prepare(`
      INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
      VALUES (?, ?, ?, ?, ?)
    `);

    let completed = 0;
    images.forEach((image, index) => {
      stmt.run(
        image.product_id,
        image.image_url,
        image.alt_text,
        image.sort_order,
        image.is_primary,
        (err) => {
          if (err) {
            console.error(`Error inserting image for product ${image.product_id}:`, err.message);
            return;
          }
          
          completed++;
          console.log(`✅ Image ${completed}/${images.length}: Added to product ${image.product_id}`);
          
          if (completed === images.length) {
            stmt.finalize();
            console.log('✅ All multiple images inserted successfully');
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
    
    db.get('SELECT COUNT(*) as count FROM product_images', (err, result) => {
      if (err) {
        console.error('Error checking images count:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ Total product images: ${result.count}`);
      
      // Show products with multiple images
      db.all(`
        SELECT p.name, COUNT(pi.id) as image_count 
        FROM products p 
        LEFT JOIN product_images pi ON p.id = pi.product_id 
        GROUP BY p.id 
        HAVING image_count > 1 
        ORDER BY p.id
      `, (err, rows) => {
        if (err) {
          console.error('Error fetching products with multiple images:', err.message);
          reject(err);
          return;
        }
        
        console.log('\n📸 Products with multiple images:');
        rows.forEach(row => {
          console.log(`  • ${row.name}: ${row.image_count} images`);
        });
        
        resolve();
      });
    });
  });
};

// Main execution
const main = async () => {
  try {
    await clearExistingImages();
    await addMultipleImages();
    await verifyResults();
    
    console.log('\n🎉 Multiple images added successfully!');
    console.log('✅ All products now have their multiple images');
    console.log('🚀 Live website should now show multiple images correctly');
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\nDatabase connection closed');
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error adding multiple images:', error);
    process.exit(1);
  }
};

main();
