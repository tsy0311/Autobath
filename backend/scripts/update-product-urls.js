const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

// Read the image mapping file
const mappingFile = path.join(__dirname, '../image-mapping.json');
if (!fs.existsSync(mappingFile)) {
  console.error('Image mapping file not found. Please run upload-images.js first.');
  process.exit(1);
}

const imageMapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));

console.log('Updating product image URLs...');

// Update products table
const updateProductsQuery = `
  UPDATE products 
  SET image_url = ? 
  WHERE image_url = ?
`;

// Update product_images table
const updateProductImagesQuery = `
  UPDATE product_images 
  SET image_url = ? 
  WHERE image_url = ?
`;

let updatedCount = 0;

Object.entries(imageMapping).forEach(([filename, newUrl]) => {
  const oldUrl = `/uploads/${filename}`;
  
  // Update products table
  db.run(updateProductsQuery, [newUrl, oldUrl], function(err) {
    if (err) {
      console.error(`Error updating products for ${filename}:`, err);
    } else if (this.changes > 0) {
      console.log(`Updated products table: ${filename} -> ${newUrl}`);
      updatedCount++;
    }
  });
  
  // Update product_images table
  db.run(updateProductImagesQuery, [newUrl, oldUrl], function(err) {
    if (err) {
      console.error(`Error updating product_images for ${filename}:`, err);
    } else if (this.changes > 0) {
      console.log(`Updated product_images table: ${filename} -> ${newUrl}`);
    }
  });
});

// Also update the hardcoded products in products.js
const productsFile = path.join(__dirname, '../routes/products.js');
let productsContent = fs.readFileSync(productsFile, 'utf8');

Object.entries(imageMapping).forEach(([filename, newUrl]) => {
  const oldUrl = `/uploads/${filename}`;
  productsContent = productsContent.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
});

fs.writeFileSync(productsFile, productsContent);
console.log('Updated hardcoded products in products.js');

setTimeout(() => {
  console.log(`\nUpdate complete! Updated ${updatedCount} products.`);
  console.log('Please restart the server and test the changes.');
  db.close();
}, 2000);
