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

console.log('🔄 Fixing image URLs for live website...');

// Update product image URLs to use full live website URL
const updateProductImages = () => {
  return new Promise((resolve, reject) => {
    console.log('1. Updating product image URLs...');
    
    // Update all products with relative image URLs to use full live website URL
    db.run(`
      UPDATE products 
      SET image_url = 'https://api.autobath.co' || image_url 
      WHERE image_url LIKE '/img/%'
    `, (err) => {
      if (err) {
        console.error('Error updating product image URLs:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Product image URLs updated');
      resolve();
    });
  });
};

// Update product_images table URLs
const updateProductImagesTable = () => {
  return new Promise((resolve, reject) => {
    console.log('2. Updating product_images table URLs...');
    
    // Update all product_images with relative image URLs to use full live website URL
    db.run(`
      UPDATE product_images 
      SET image_url = 'https://api.autobath.co' || image_url 
      WHERE image_url LIKE '/img/%'
    `, (err) => {
      if (err) {
        console.error('Error updating product_images URLs:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Product_images table URLs updated');
      resolve();
    });
  });
};

// Verify the updates
const verifyUpdates = () => {
  return new Promise((resolve, reject) => {
    console.log('3. Verifying image URL updates...');
    
    // Check products table
    db.get('SELECT COUNT(*) as count FROM products WHERE image_url LIKE "https://api.autobath.co/img/%"', (err, result) => {
      if (err) {
        console.error('Error checking products:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ Products with correct URLs: ${result.count}`);
      
      // Check product_images table
      db.get('SELECT COUNT(*) as count FROM product_images WHERE image_url LIKE "https://api.autobath.co/img/%"', (err, result2) => {
        if (err) {
          console.error('Error checking product_images:', err.message);
          reject(err);
          return;
        }
        
        console.log(`✅ Product images with correct URLs: ${result2.count}`);
        
        // Show sample updated URLs
        db.all('SELECT name, image_url FROM products LIMIT 3', (err, rows) => {
          if (err) {
            console.error('Error fetching sample data:', err.message);
            reject(err);
            return;
          }
          
          console.log('\n📸 Sample updated image URLs:');
          rows.forEach(row => {
            console.log(`  • ${row.name}: ${row.image_url}`);
          });
          
          resolve();
        });
      });
    });
  });
};

// Main execution
const main = async () => {
  try {
    await updateProductImages();
    await updateProductImagesTable();
    await verifyUpdates();
    
    console.log('\n🎉 Image URL fix complete!');
    console.log('✅ All product images now use full live website URLs');
    console.log('🚀 Live website should now display all product images');
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\nDatabase connection closed');
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error during image URL fix:', error);
    process.exit(1);
  }
};

main();
