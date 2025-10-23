const fs = require('fs');
const path = require('path');

// Comprehensive mapping of products to their actual image files
const productImageMapping = {
  // An-Riddle Brand Products
  1: { // Metal Sprayer 原液壶
    primary: 'metalsprayer1.jpg',
    secondary: 'metalsprayer2.jpg'
  },
  3: { // Washing Glove 纤维手套
    primary: 'glovewasherBlackWhite.jpg',
    secondary: 'glovewasherBlue.jpg'
  },
  4: { // Hand-Carry Box 手提工具篮
    primary: 'handcarrybox.jpg',
    secondary: null
  },
  5: { // Multi-functional Clip 脚垫夹
    primary: 'clip.jpg',
    secondary: 'clip1.jpg'
  },
  6: { // Multi-functional Detail Brush (5pcs) 细节刷五件套
    primary: 'brushset5pc1.jpg',
    secondary: 'brushset5pc2.jpg'
  },
  7: { // PA Foam Separator PA壶
    primary: 'simplepapot.jpg',
    secondary: 'blizzardPApot.jpg'
  },
  8: { // One Sided Towel 单面毛巾
    primary: 'onesided40x40(1).jpg',
    secondary: 'onesided60x80(1).jpg'
  },
  9: { // Two Sided Towel 双面毛巾
    primary: 'twosided40x40.jpg',
    secondary: 'twosided40x40(2).jpg'
  },
  10: { // Microfiber Towel 超细纤维毛巾
    primary: 'microfiber30x40(1).jpg',
    secondary: 'microfiber30x40(2).jpg'
  },
  
  // Autobath Brand Products
  11: { // Curve Holding Brush 鱼形毛刷
    primary: 'curvebrush.jpg',
    secondary: null
  },
  12: { // Straight Holding Brush 方形毛刷
    primary: 'straightbrush.jpg',
    secondary: null
  },
  13: { // Butter Knife 刮蜡刀
    primary: 'spatula.jpg',
    secondary: null
  },
  14: { // Squeeze Bottle with Measurement 250毫升分蜡瓶
    primary: 'squeezebottle.jpg',
    secondary: null
  },
  
  // Benzhi Brand Products
  15: { // Rim Brush 轮毂刷
    primary: 'rimbrush.jpg',
    secondary: null
  },
  16: { // Tyre Brush 轮子刷
    primary: 'smallbrush.jpg',
    secondary: null
  },
  17: { // JOYBOND Beauty Clay 去污剂蓝色200G
    primary: 'beautyclay.jpg',
    secondary: null
  },
  18: { // AJIGE Cup Measurement PC透明量杯
    primary: 'cupmeasurement.jpg',
    secondary: null
  },
  19: { // MJJC Foam Cannon 蓝白
    primary: 'mjjcfoamcannon.jpg',
    secondary: null
  },
  20: { // MJJC V3 泡沫炮
    primary: 'mjjcv3.jpg',
    secondary: null
  },
  21: { // Unicorn Brush 独角兽圣诞树轮毂刷
    primary: 'largeunicorn.jpg',
    secondary: 'smallunicorn.jpg'
  },
  22: { // Washing Brush 刷子
    primary: 'pighairbrush.jpg',
    secondary: 'pighairplasticbrush.jpg'
  },
  23: { // Tear-Off Towel 毛巾卷
    primary: 'tearOffTowel.jpg',
    secondary: 'tearoff.jpg'
  },
  
  // Lutian Brand Products
  24: { // High Pressure Washer F4 高压清洗机
    primary: 'panther-f4.jpg',
    secondary: null
  },
  25: { // High Pressure Washer P4 高压清洗机
    primary: 'panther-p4-1.jpg',
    secondary: null
  },
  26: { // High Pressure Washer P6 PRO 高压清洗机
    primary: 'panther-p6.jpg',
    secondary: null
  },
  27: { // High Pressure Washer P6 PRO + Trolley (Bundle) 高压清洗机套装
    primary: 'trolleybundle.jpg',
    secondary: null
  },
  28: { // Car Wash Brush Mop 伸缩拖把
    primary: 'carwashbrush1.jpg',
    secondary: 'carwashbrush2.jpg'
  },
  29: { // Detachable Brush Mop 可拆卸雪尼尔洗车刷
    primary: 'detachablebrush1.jpg',
    secondary: 'detachablebrush2.jpg'
  },
  30: { // Easy Super PA PRO 金属高压泡沫发生器PA壶
    primary: 'easyPA.jpg',
    secondary: null
  },
  31: { // Foamer - F15 暴雪气压
    primary: 'foamerf15.jpg',
    secondary: null
  },
  32: { // Snow Pro Foam Cannon 雪炮PA壶
    primary: 'snowprofoamcannon.jpg',
    secondary: null
  },
  33: { // Multi-functional Collapsible Box 多功能折叠收纳箱36L
    primary: 'collapsablebox.jpg',
    secondary: null
  },
  34: { // PA Bottle Separator PA药剂分瓶
    primary: 'blizzardPApot.jpg',
    secondary: null
  },
  35: { // Windstorm Vacuum-10L 雄风
    primary: 'ws10.jpg',
    secondary: null
  },
  36: { // Windstorm Vacuum-20L 雄风
    primary: 'ws20.jpg',
    secondary: null
  },
  37: { // Windstorm Vacuum-30L 雄风
    primary: 'ws30.jpg',
    secondary: null
  },
  40: { // Detail Brush Set 细节刷套装
    primary: 'brushset3pcs.jpg',
    secondary: null
  }
};

// Use GitHub raw URLs for the images
const githubRawBase = 'https://raw.githubusercontent.com/tsy0311/Autobath/main/backend/uploads/';

console.log('🖼️  Updating products with real images...');
console.log('📝 Mapping products to their actual image files');
console.log('📝 Using GitHub raw URLs for image hosting\n');

// Read the products.js file
const productsFile = path.join(__dirname, '..', 'routes', 'products.js');
let productsContent = fs.readFileSync(productsFile, 'utf8');

let updatedCount = 0;

// Update each product with its real image URLs
Object.entries(productImageMapping).forEach(([productId, images]) => {
  const primaryUrl = images.primary ? `${githubRawBase}${images.primary}` : null;
  const secondaryUrl = images.secondary ? `${githubRawBase}${images.secondary}` : null;
  
  // Update the main image_url
  if (primaryUrl) {
    const oldPattern = new RegExp(`(id: ${productId}[\\s\\S]*?image_url: ')[^']*(')`, 'g');
    const newContent = productsContent.replace(oldPattern, `$1${primaryUrl}$2`);
    
    if (newContent !== productsContent) {
      productsContent = newContent;
      updatedCount++;
      console.log(`✅ Updated product ${productId} primary image: ${images.primary}`);
    }
  }
  
  // Update the images array
  if (primaryUrl) {
    const imagesPattern = new RegExp(`(id: ${productId}[\\s\\S]*?images: \\[[\\s\\S]*?image_url: ')[^']*(')`, 'g');
    const updatedContent = productsContent.replace(imagesPattern, `$1${primaryUrl}$2`);
    
    if (updatedContent !== productsContent) {
      productsContent = updatedContent;
      console.log(`✅ Updated images array for product ${productId}`);
    }
  }
  
  // Add secondary image if available
  if (secondaryUrl) {
    // This would require more complex logic to add to the images array
    console.log(`📷 Secondary image available for product ${productId}: ${images.secondary}`);
  }
});

// Update deployment version to force cache refresh
const versionPattern = /deployment_version: 'v[\d.]+'/g;
const newVersion = `deployment_version: 'v5.0.0'`;
productsContent = productsContent.replace(versionPattern, newVersion);

// Write the updated content back to the file
fs.writeFileSync(productsFile, productsContent);

console.log(`\n🎉 Update complete! ${updatedCount} products updated with real images`);
console.log('📁 Products file updated: backend/routes/products.js');
console.log('🚀 Deployment version updated to v5.0.0');
console.log('\n📋 Next steps:');
console.log('1. Commit and push the changes');
console.log('2. Wait for deployment');
console.log('3. Check the live website');

// Create a backup of the original file
const backupFile = path.join(__dirname, '..', 'routes', 'products.js.backup3');
fs.writeFileSync(backupFile, fs.readFileSync(productsFile, 'utf8'));
console.log(`\n💾 Backup created: ${backupFile}`);

// Show summary of image mappings
console.log('\n📊 Image Mapping Summary:');
Object.entries(productImageMapping).forEach(([productId, images]) => {
  console.log(`Product ${productId}: ${images.primary}${images.secondary ? ` + ${images.secondary}` : ''}`);
});
