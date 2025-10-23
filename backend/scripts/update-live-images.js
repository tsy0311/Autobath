const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

// This script updates existing database records to use external image URLs
// It can be run on the live server to fix image URLs

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🔄 Updating image URLs in existing database...');

// Update products table with external URLs
const updateProductsQuery = `
  UPDATE products 
  SET image_url = ? 
  WHERE image_url = ?
`;

// Update product_images table with external URLs
const updateProductImagesQuery = `
  UPDATE product_images 
  SET image_url = ? 
  WHERE image_url = ?
`;

// Mapping of old URLs to new external URLs
const imageMapping = {
  '/uploads/metalsprayer1.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/glovewasherBlackWhite.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/handcarrybox.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/clip.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/brushset5pc1.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/simplepapot.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/onesided40x40(1).jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/twosided40x40.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/microfiber30x40(1).jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/curvebrush.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/straightbrush.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/spatula.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/squeezebottle.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/rimbrush.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/smallbrush.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/beautyclay.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/cupmeasurement.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/mjjcfoamcannon.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/mjjcv3.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/largeunicorn.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/pighairbrush.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/tearOffTowel.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/panther-f4.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/panther-p4-1.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/panther-p6.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/trolleybundle.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/carwashbrush1.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/detachablebrush1.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/easyPA.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/foamerf15.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/snowprofoamcannon.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/collapsablebox.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/blizzardPApot.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/ws10.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/ws20.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/ws30.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
  '/uploads/brushset3pcs.jpg': 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop'
};

let updateCount = 0;

Object.entries(imageMapping).forEach(([oldUrl, newUrl]) => {
  // Update products table
  db.run(updateProductsQuery, [newUrl, oldUrl], function(err) {
    if (err) {
      console.error(`Error updating products for ${oldUrl}:`, err);
    } else if (this.changes > 0) {
      console.log(`✅ Updated products: ${oldUrl} -> ${newUrl} (${this.changes} records)`);
      updateCount += this.changes;
    }
  });
  
  // Update product_images table
  db.run(updateProductImagesQuery, [newUrl, oldUrl], function(err) {
    if (err) {
      console.error(`Error updating product_images for ${oldUrl}:`, err);
    } else if (this.changes > 0) {
      console.log(`✅ Updated product_images: ${oldUrl} -> ${newUrl} (${this.changes} records)`);
    }
  });
});

setTimeout(() => {
  console.log(`\n🎉 Update complete! Updated ${updateCount} product records.`);
  console.log('All image URLs have been updated to use external hosting.');
  db.close();
}, 2000);
