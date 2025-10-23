const fs = require('fs');
const path = require('path');

// Create a mapping of products to their actual image files
const productImageMapping = {
  1: 'metalsprayer1.jpg',
  3: 'glovewasherBlackWhite.jpg', 
  4: 'handcarrybox.jpg',
  5: 'clip.jpg',
  6: 'brushset5pc1.jpg',
  7: 'simplepapot.jpg',
  8: 'onesided40x40(1).jpg',
  9: 'twosided40x40.jpg',
  10: 'microfiber30x40(1).jpg',
  11: 'curvebrush.jpg',
  12: 'straightbrush.jpg',
  13: 'spatula.jpg',
  14: 'squeezebottle.jpg',
  15: 'rimbrush.jpg',
  16: 'smallbrush.jpg',
  17: 'beautyclay.jpg',
  18: 'cupmeasurement.jpg',
  19: 'mjjcfoamcannon.jpg',
  20: 'mjjcv3.jpg',
  21: 'largeunicorn.jpg',
  22: 'pighairbrush.jpg',
  23: 'tearOffTowel.jpg',
  24: 'panther-f4.jpg',
  25: 'panther-p4-1.jpg',
  26: 'panther-p6.jpg',
  27: 'trolleybundle.jpg',
  28: 'carwashbrush1.jpg',
  29: 'detachablebrush1.jpg',
  30: 'easyPA.jpg',
  31: 'foamerf15.jpg',
  32: 'snowprofoamcannon.jpg',
  33: 'collapsablebox.jpg',
  34: 'blizzardPApot.jpg',
  35: 'ws10.jpg',
  36: 'ws20.jpg',
  37: 'ws30.jpg',
  40: 'brushset3pcs.jpg'
};

// For now, let's use a simple approach with GitHub raw URLs
// You can upload the images to GitHub and use raw URLs
const githubRawBase = 'https://raw.githubusercontent.com/tsy0311/Autobath/main/backend/uploads/';

console.log('🖼️  Setting up real product images...');
console.log('📝 This script will update products with GitHub raw URLs');
console.log('📝 Make sure to push the uploads folder to GitHub first\n');

// Read the products.js file
const productsFile = path.join(__dirname, '..', 'routes', 'products.js');
let productsContent = fs.readFileSync(productsFile, 'utf8');

let updatedCount = 0;

// Update each product with its real image URL
Object.entries(productImageMapping).forEach(([productId, imageFile]) => {
  const imageUrl = `${githubRawBase}${imageFile}`;
  
  // Replace the base64 placeholder with the real image URL
  const oldPattern = new RegExp(`(id: ${productId}[\\s\\S]*?image_url: ')[^']*(')`, 'g');
  const newContent = productsContent.replace(oldPattern, `$1${imageUrl}$2`);
  
  if (newContent !== productsContent) {
    productsContent = newContent;
    updatedCount++;
    console.log(`✅ Updated product ${productId} with ${imageFile}`);
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

console.log(`\n🎉 Update complete! ${updatedCount} products updated with real images`);
console.log('📁 Products file updated: backend/routes/products.js');
console.log('\n📋 Next steps:');
console.log('1. Make sure uploads folder is committed to GitHub');
console.log('2. Commit and push the changes');
console.log('3. Wait for deployment');
console.log('4. Check the live website');

// Create a backup of the original file
const backupFile = path.join(__dirname, '..', 'routes', 'products.js.backup');
fs.writeFileSync(backupFile, fs.readFileSync(productsFile, 'utf8'));
console.log(`\n💾 Backup created: ${backupFile}`);
