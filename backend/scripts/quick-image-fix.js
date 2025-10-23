const fs = require('fs');
const path = require('path');

// Quick fix: Use a free image hosting service
// This script will update all image URLs to use a reliable free service

const uploadsDir = path.join(__dirname, '../uploads');
const productsFile = path.join(__dirname, '../routes/products.js');

// List of all image files
const imageFiles = fs.readdirSync(uploadsDir).filter(file => 
  file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
);

console.log(`Found ${imageFiles.length} images to process`);

// For now, let's use a placeholder service that provides reliable image hosting
// You can replace this with any free image hosting service
const BASE_URL = 'https://images.unsplash.com/photo-';

// Create a simple mapping - we'll use placeholder images for now
const imageMapping = {};
imageFiles.forEach((file, index) => {
  // Use different placeholder images for variety
  const placeholderIds = [
    '1506905925346-3b390af30677', // Car wash
    '1506905925346-3b390af30677', // Car wash
    '1506905925346-3b390af30677', // Car wash
    '1506905925346-3b390af30677', // Car wash
    '1506905925346-3b390af30677', // Car wash
  ];
  const id = placeholderIds[index % placeholderIds.length];
  imageMapping[file] = `${BASE_URL}${id}?w=400&h=300&fit=crop`;
});

// Update the products.js file
let productsContent = fs.readFileSync(productsFile, 'utf8');

console.log('Updating product image URLs...');
let updateCount = 0;

Object.entries(imageMapping).forEach(([filename, newUrl]) => {
  const oldUrl = `/uploads/${filename}`;
  const regex = new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = productsContent.match(regex);
  if (matches) {
    productsContent = productsContent.replace(regex, newUrl);
    updateCount += matches.length;
    console.log(`Updated ${filename}: ${matches.length} occurrences`);
  }
});

fs.writeFileSync(productsFile, productsContent);

console.log(`\n✅ Updated ${updateCount} image URLs in products.js`);
console.log('Using placeholder images from Unsplash for now.');
console.log('\nTo use your actual images:');
console.log('1. Upload images to a free service like ImgBB, Cloudinary, or GitHub');
console.log('2. Update the imageMapping object with real URLs');
console.log('3. Run this script again');

// Also update the database if it exists
const sqlite3 = require('sqlite3').verbose();
const config = require('../config');
const dbPath = path.resolve(__dirname, '..', config.DB_PATH);

if (fs.existsSync(dbPath)) {
  const db = new sqlite3.Database(dbPath);
  
  console.log('\nUpdating database...');
  
  Object.entries(imageMapping).forEach(([filename, newUrl]) => {
    const oldUrl = `/uploads/${filename}`;
    
    // Update products table
    db.run('UPDATE products SET image_url = ? WHERE image_url = ?', [newUrl, oldUrl]);
    
    // Update product_images table
    db.run('UPDATE product_images SET image_url = ? WHERE image_url = ?', [newUrl, oldUrl]);
  });
  
  console.log('✅ Database updated');
  db.close();
}

console.log('\n🚀 Ready to deploy! Images will now show placeholder images.');
console.log('To use real images, upload them to a hosting service and update the URLs.');
