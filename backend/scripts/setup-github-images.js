const fs = require('fs');
const path = require('path');

// This script will update all image URLs to use GitHub raw URLs
// You'll need to:
// 1. Create a new GitHub repository (e.g., "autobath-images")
// 2. Upload all images from backend/uploads/ to that repository
// 3. Update the GITHUB_RAW_URL below with your repository URL

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/tsy0311/autobath-images/main';
const uploadsDir = path.join(__dirname, '../uploads');

// List of all image files
const imageFiles = fs.readdirSync(uploadsDir).filter(file => 
  file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
);

console.log(`Found ${imageFiles.length} images to process`);

// Create mapping with GitHub URLs
const imageMapping = {};
imageFiles.forEach(file => {
  imageMapping[file] = `${GITHUB_RAW_URL}/${file}`;
});

// Save the mapping
const outputFile = path.join(__dirname, '../image-mapping.json');
fs.writeFileSync(outputFile, JSON.stringify(imageMapping, null, 2));
console.log(`Created image mapping file: ${outputFile}`);

console.log('\n=== NEXT STEPS ===');
console.log('1. Create a new GitHub repository called "autobath-images"');
console.log('2. Upload all images from backend/uploads/ to that repository');
console.log('3. Update the GITHUB_RAW_URL in this script if needed');
console.log('4. Run: node scripts/update-product-urls.js');
console.log('5. Commit and push the changes');

// Also create a simple script to copy images to a folder for easy upload
const copyDir = path.join(__dirname, '../images-for-github');
if (!fs.existsSync(copyDir)) {
  fs.mkdirSync(copyDir);
}

console.log(`\nCopying images to ${copyDir} for easy upload...`);
imageFiles.forEach(file => {
  const src = path.join(uploadsDir, file);
  const dest = path.join(copyDir, file);
  fs.copyFileSync(src, dest);
});

console.log(`✅ Copied ${imageFiles.length} images to ${copyDir}`);
console.log('You can now zip this folder and upload to GitHub repository.');
