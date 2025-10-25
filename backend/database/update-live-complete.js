/**
 * Complete Live Website Update Script
 * 
 * This script updates both images and variants on the live website to match localhost.
 * It should be run on the production environment after deployment.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

// Use production database path
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.resolve(__dirname, '..', 'database.sqlite')
  : path.resolve(__dirname, '..', config.DB_PATH);

const db = new sqlite3.Database(dbPath);

// Product image mappings - each product gets multiple local images
const productImageMappings = {
  1: [ // Metal Sprayer
    { filename: 'metalsprayer1.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'metalsprayer2.jpg', is_primary: 0, sort_order: 1 }
  ],
  2: [ // Washing Brush Tool Set (3pcs)
    { filename: 'washingbrushset3pcs.jpg', is_primary: 1, sort_order: 0 }
  ],
  3: [ // Washing Glove
    { filename: 'glovewasherBlackWhite.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'glovewasherBlue.jpg', is_primary: 0, sort_order: 1 },
    { filename: 'glovewasherRed.jpg', is_primary: 0, sort_order: 2 }
  ],
  4: [ // Hand-Carry Box
    { filename: 'handcarrybox.jpg', is_primary: 1, sort_order: 0 }
  ],
  5: [ // Multi-functional Clip
    { filename: 'clip.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'clip1.jpg', is_primary: 0, sort_order: 1 }
  ],
  6: [ // Multi-functional Detail Brush (5pcs)
    { filename: 'brushset5pc1.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'brushset5pc2.jpg', is_primary: 0, sort_order: 1 }
  ],
  7: [ // PA Foam Separator
    { filename: 'simplepapot.jpg', is_primary: 1, sort_order: 0 }
  ],
  8: [ // One Sided Towel
    { filename: 'onesided40x40(1).jpg', is_primary: 1, sort_order: 0 },
    { filename: 'onesided60x80(1).jpg', is_primary: 0, sort_order: 1 },
    { filename: 'onesided60x80(2).jpg', is_primary: 0, sort_order: 2 },
    { filename: 'onesided40x40(2).jpg', is_primary: 0, sort_order: 3 }
  ],
  9: [ // Two Sided Towel
    { filename: 'twosided40x40.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'twosided40x40(2).jpg', is_primary: 0, sort_order: 1 }
  ],
  10: [ // Microfiber Towel
    { filename: 'microfiber30x40(1).jpg', is_primary: 1, sort_order: 0 },
    { filename: 'microfiber30x40(2).jpg', is_primary: 0, sort_order: 1 },
    { filename: 'microfiber30x60.jpg', is_primary: 0, sort_order: 2 }
  ],
  11: [ // Curve Holding Brush
    { filename: 'curvebrush.jpg', is_primary: 1, sort_order: 0 }
  ],
  12: [ // Straight Holding Brush
    { filename: 'straightbrush.jpg', is_primary: 1, sort_order: 0 }
  ],
  13: [ // Butter Knife
    { filename: 'spatula.jpg', is_primary: 1, sort_order: 0 }
  ],
  14: [ // Squeeze Bottle
    { filename: 'squeezebottle.jpg', is_primary: 1, sort_order: 0 }
  ],
  15: [ // Rim Brush
    { filename: 'rimbrush.jpg', is_primary: 1, sort_order: 0 }
  ],
  16: [ // Tyre Brush
    { filename: 'smallbrush.jpg', is_primary: 1, sort_order: 0 }
  ],
  17: [ // JOYBOND Beauty Clay
    { filename: 'beautyclay.jpg', is_primary: 1, sort_order: 0 }
  ],
  18: [ // AJIGE Cup Measurement
    { filename: 'cupmeasurement.jpg', is_primary: 1, sort_order: 0 }
  ],
  19: [ // MJJC Foam Cannon
    { filename: 'mjjcfoamcannon.jpg', is_primary: 1, sort_order: 0 }
  ],
  20: [ // MJJC V3
    { filename: 'mjjcv3.jpg', is_primary: 1, sort_order: 0 }
  ],
  21: [ // Unicorn Brush
    { filename: 'smallunicorn.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'largeunicorn.jpg', is_primary: 0, sort_order: 1 },
    { filename: 'smallunicorn1.jpg', is_primary: 0, sort_order: 2 }
  ],
  22: [ // Washing Brush
    { filename: 'pighairplasticbrush.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'pighairbrush.jpg', is_primary: 0, sort_order: 1 },
    { filename: 'plasticbrush.jpg', is_primary: 0, sort_order: 2 }
  ],
  23: [ // Tear-Off Towel
    { filename: 'tearOffTowel.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'tearoff.jpg', is_primary: 0, sort_order: 1 }
  ],
  24: [ // High Pressure Washer F4
    { filename: 'panther-f4.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'panther-p4-1.jpg', is_primary: 0, sort_order: 1 },
    { filename: 'panther-p6.jpg', is_primary: 0, sort_order: 2 }
  ],
  25: [ // High Pressure Washer P4
    { filename: 'panther-p4-1.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'panther-f4.jpg', is_primary: 0, sort_order: 1 },
    { filename: 'panther-p6.jpg', is_primary: 0, sort_order: 2 }
  ],
  26: [ // High Pressure Washer P6 PRO
    { filename: 'panther-p6.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'panther-f4.jpg', is_primary: 0, sort_order: 1 },
    { filename: 'panther-p4-1.jpg', is_primary: 0, sort_order: 2 }
  ],
  27: [ // High Pressure Washer P6 PRO + Trolley
    { filename: 'trolleybundle.jpg', is_primary: 1, sort_order: 0 }
  ],
  28: [ // Car Wash Brush Mop
    { filename: 'carwashbrush1.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'carwashbrush2.jpg', is_primary: 0, sort_order: 1 },
    { filename: 'carwashbrush3.jpg', is_primary: 0, sort_order: 2 }
  ],
  29: [ // Detachable Brush Mop
    { filename: 'detachablebrush1.jpg', is_primary: 1, sort_order: 0 },
    { filename: 'detachablebrush2.jpg', is_primary: 0, sort_order: 1 }
  ],
  30: [ // Easy Super PA PRO
    { filename: 'easyPA.jpg', is_primary: 1, sort_order: 0 }
  ],
  31: [ // Foamer - F15
    { filename: 'foamerf15.jpg', is_primary: 1, sort_order: 0 }
  ],
  32: [ // Snow Pro Foam Cannon
    { filename: 'snowprofoamcannon.jpg', is_primary: 1, sort_order: 0 }
  ],
  33: [ // Multi-functional Collapsible Box
    { filename: 'collapsablebox.jpg', is_primary: 1, sort_order: 0 }
  ],
  34: [ // PA Bottle Separator
    { filename: 'blizzardPApot.jpg', is_primary: 1, sort_order: 0 }
  ],
  35: [ // Windstorm Vacuum-10L
    { filename: 'ws10.jpg', is_primary: 1, sort_order: 0 }
  ],
  36: [ // Windstorm Vacuum-20L
    { filename: 'ws20.jpg', is_primary: 1, sort_order: 0 }
  ],
  37: [ // Windstorm Vacuum-30L
    { filename: 'ws30.jpg', is_primary: 1, sort_order: 0 }
  ]
};

// Product variant mappings - products with color/size variants
const productVariantMappings = {
  3: [ // Washing Glove
    { color_name: 'BlackWhite', stock: 20, is_available: 1, sort_order: 0 },
    { color_name: 'Blue', stock: 15, is_available: 1, sort_order: 1 },
    { color_name: 'Red', stock: 15, is_available: 1, sort_order: 2 }
  ],
  8: [ // One Sided Towel
    { color_name: '40x40', stock: 50, is_available: 1, sort_order: 0 },
    { color_name: '60x80', stock: 25, is_available: 1, sort_order: 1 }
  ],
  9: [ // Two Sided Towel
    { color_name: '40x40', stock: 80, is_available: 1, sort_order: 0 },
    { color_name: '60x80', stock: 80, is_available: 1, sort_order: 1 }
  ],
  10: [ // Microfiber Towel
    { color_name: '30x40', stock: 30, is_available: 1, sort_order: 0 },
    { color_name: '30x60', stock: 30, is_available: 1, sort_order: 1 }
  ],
  21: [ // Unicorn Brush
    { color_name: 'Big', stock: 100, is_available: 1, sort_order: 0 },
    { color_name: 'Small', stock: 100, is_available: 1, sort_order: 1 }
  ],
  22: [ // Washing Brush
    { color_name: 'Pig Hair (猪毛)', stock: 50, is_available: 1, sort_order: 0 },
    { color_name: 'Plastic (塑料细节刷)', stock: 50, is_available: 1, sort_order: 1 }
  ],
  23: [ // Tear-Off Towel
    { color_name: 'Grey', stock: 80, is_available: 1, sort_order: 0 },
    { color_name: 'Pink', stock: 80, is_available: 1, sort_order: 1 }
  ]
};

console.log('🚀 Starting complete live website update...');
console.log(`📁 Database path: ${dbPath}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Start transaction
db.serialize(() => {
  db.run('BEGIN TRANSACTION');

  // 1. Clear existing images
  console.log('\n🗑️ Step 1: Clearing existing product images...');
  db.run('DELETE FROM product_images', (err) => {
    if (err) {
      console.error('❌ Error clearing images:', err);
      return;
    }
    console.log('✅ Cleared existing images');
  });

  // 2. Clear existing variants
  console.log('\n🗑️ Step 2: Clearing existing product variants...');
  db.run('DELETE FROM product_colors', (err) => {
    if (err) {
      console.error('❌ Error clearing variants:', err);
      return;
    }
    console.log('✅ Cleared existing variants');
  });

  // 3. Insert new images
  console.log('\n📸 Step 3: Inserting new product images...');
  const insertImageStmt = db.prepare(`
    INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  let totalImages = 0;
  Object.entries(productImageMappings).forEach(([productId, images]) => {
    images.forEach(image => {
      const localImageUrl = `/img/${image.filename}`;
      const altText = `Product ${productId} - ${image.filename}`;
      
      insertImageStmt.run(
        parseInt(productId),
        localImageUrl,
        altText,
        image.sort_order,
        image.is_primary,
        new Date().toISOString(),
        (err) => {
          if (err) {
            console.error(`❌ Error inserting image for product ${productId}:`, err);
          } else {
            totalImages++;
            console.log(`✅ Inserted image: ${image.filename} for product ${productId}`);
          }
        }
      );
    });
  });

  insertImageStmt.finalize();

  // 4. Insert new variants
  console.log('\n🎨 Step 4: Inserting new product variants...');
  const insertVariantStmt = db.prepare(`
    INSERT INTO product_colors (product_id, color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalVariants = 0;
  Object.entries(productVariantMappings).forEach(([productId, variants]) => {
    variants.forEach(variant => {
      insertVariantStmt.run(
        parseInt(productId),
        variant.color_name,
        null, // color_code
        null, // color_image_url
        0,    // price_adjustment
        variant.stock,
        variant.is_available,
        variant.sort_order,
        new Date().toISOString(),
        (err) => {
          if (err) {
            console.error(`❌ Error inserting variant for product ${productId}:`, err);
          } else {
            totalVariants++;
            console.log(`✅ Inserted variant: ${variant.color_name} for product ${productId}`);
          }
        }
      );
    });
  });

  insertVariantStmt.finalize();

  // 5. Update main product image_url fields
  console.log('\n🔄 Step 5: Updating main product image URLs...');
  Object.entries(productImageMappings).forEach(([productId, images]) => {
    const primaryImage = images.find(img => img.is_primary === 1);
    if (primaryImage) {
      const primaryImageUrl = `/img/${primaryImage.filename}`;
      db.run(
        'UPDATE products SET image_url = ? WHERE id = ?',
        [primaryImageUrl, parseInt(productId)],
        (err) => {
          if (err) {
            console.error(`❌ Error updating product ${productId} image_url:`, err);
          } else {
            console.log(`✅ Updated product ${productId} primary image: ${primaryImage.filename}`);
          }
        }
      );
    }
  });

  // Commit transaction
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('❌ Error committing transaction:', err);
    } else {
      console.log('\n🎉 Complete update finished successfully!');
      console.log(`📊 Summary:`);
      console.log(`   • ${totalImages} images updated`);
      console.log(`   • ${totalVariants} variants updated`);
      console.log(`   • 37 products processed`);
      console.log(`\n🌐 Live website should now display:`);
      console.log(`   • Multiple images per product`);
      console.log(`   • All product variants (colors/sizes)`);
      console.log(`   • Correct image order and primary images`);
      console.log(`\n🔗 Test at: https://autobath.co/products`);
    }
  });
});

db.close();
