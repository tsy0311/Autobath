const fs = require('fs');
const path = require('path');

// For now, let's use a simple approach with a reliable free image hosting service
// Using Lorem Picsum as a temporary solution, then we can replace with real images
const loremPicsumBase = 'https://picsum.photos/400/300';

// Create a mapping of products to their image seeds (for consistent images)
const productImageSeeds = {
  1: 1,   // Metal Sprayer
  3: 2,   // Washing Glove
  4: 3,   // Hand-Carry Box
  5: 4,   // Multi-functional Clip
  6: 5,   // Detail Brush Set
  7: 6,   // PA Foam Separator
  8: 7,   // One Sided Towel
  9: 8,   // Two Sided Towel
  10: 9,  // Microfiber Towel
  11: 10, // Curve Brush
  12: 11, // Straight Brush
  13: 12, // Butter Knife
  14: 13, // Squeeze Bottle
  15: 14, // Rim Brush
  16: 15, // Tyre Brush
  17: 16, // Beauty Clay
  18: 17, // Cup Measurement
  19: 18, // MJJC Foam Cannon
  20: 19, // MJJC V3
  21: 20, // Unicorn Brush
  22: 21, // Washing Brush
  23: 22, // Tear-Off Towel
  24: 23, // High Pressure Washer F4
  25: 24, // High Pressure Washer P4
  26: 25, // High Pressure Washer P6 PRO
  27: 26, // High Pressure Washer P6 PRO + Trolley
  28: 27, // Car Wash Brush Mop
  29: 28, // Detachable Brush Mop
  30: 29, // Easy Super PA PRO
  31: 30, // Foamer F15
  32: 31, // Snow Pro Foam Cannon
  33: 32, // Collapsible Box
  34: 33, // PA Bottle Separator
  35: 34, // Windstorm Vacuum 10L
  36: 35, // Windstorm Vacuum 20L
  37: 36, // Windstorm Vacuum 30L
  40: 37  // Detail Brush Set
};

console.log('🖼️  Setting up product images with Lorem Picsum...');
console.log('📝 This will use Lorem Picsum for consistent placeholder images');
console.log('📝 Each product will have a unique but consistent image\n');

// Read the products.js file
const productsFile = path.join(__dirname, '..', 'routes', 'products.js');
let productsContent = fs.readFileSync(productsFile, 'utf8');

let updatedCount = 0;

// Update each product with its Lorem Picsum image URL
Object.entries(productImageSeeds).forEach(([productId, seed]) => {
  const imageUrl = `${loremPicsumBase}?random=${seed}`;
  
  // Replace the base64 placeholder with the Lorem Picsum URL
  const oldPattern = new RegExp(`(id: ${productId}[\\s\\S]*?image_url: ')[^']*(')`, 'g');
  const newContent = productsContent.replace(oldPattern, `$1${imageUrl}$2`);
  
  if (newContent !== productsContent) {
    productsContent = newContent;
    updatedCount++;
    console.log(`✅ Updated product ${productId} with Lorem Picsum image`);
  }
  
  // Also update the images array for each product
  const imagesPattern = new RegExp(`(id: ${productId}[\\s\\S]*?images: \\[[\\s\\S]*?image_url: ')[^']*(')`, 'g');
  const updatedContent = productsContent.replace(imagesPattern, `$1${imageUrl}$2`);
  
  if (updatedContent !== productsContent) {
    productsContent = updatedContent;
    console.log(`✅ Updated images array for product ${productId}`);
  }
});

// Write the updated content back to the file
fs.writeFileSync(productsFile, productsContent);

console.log(`\n🎉 Update complete! ${updatedCount} products updated with Lorem Picsum images`);
console.log('📁 Products file updated: backend/routes/products.js');
console.log('\n📋 Next steps:');
console.log('1. Commit and push the changes');
console.log('2. Wait for deployment');
console.log('3. Check the live website');
console.log('\n💡 Note: These are placeholder images. You can replace them with real product photos later.');

// Create a backup of the original file
const backupFile = path.join(__dirname, '..', 'routes', 'products.js.backup2');
fs.writeFileSync(backupFile, fs.readFileSync(productsFile, 'utf8'));
console.log(`\n💾 Backup created: ${backupFile}`);
