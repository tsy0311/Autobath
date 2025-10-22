const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

// This script will update the live database when deployed
const dbPath = path.resolve(__dirname, config.DB_PATH);
const db = new sqlite3.Database(dbPath);

// Product updates with Chinese names and stock numbers
const productUpdates = [
  // An-Riddle Brand Products
  { englishName: 'Metal Sprayer', chineseName: '原液壶', stock: 10, brand: 'An-Riddle' },
  { englishName: 'Washing Brush Tool Set (3pcs)', chineseName: '细节刷三件套', stock: 25, brand: 'An-Riddle' },
  { englishName: 'Washing Glove', chineseName: '纤维手套', stock: 50, brand: 'An-Riddle' },
  { englishName: 'Hand-Carry Box', chineseName: '手提工具篮', stock: 20, brand: 'An-Riddle' },
  { englishName: 'Multi-functional Clip', chineseName: '脚垫夹', stock: 6, brand: 'An-Riddle' },
  { englishName: 'Multi-functional Detail Brush (5pcs)', chineseName: '细节刷五件套', stock: 52, brand: 'An-Riddle' },
  { englishName: 'PA Foam Separator', chineseName: 'PA壶', stock: 10, brand: 'An-Riddle' },
  
  // Autobath Brand Products
  { englishName: 'Curve Holding Brush', chineseName: '鱼形毛刷', stock: 40, brand: 'Autobath' },
  { englishName: 'Straight Holding Brush', chineseName: '方形毛刷', stock: 50, brand: 'Autobath' },
  { englishName: 'Butter Knife', chineseName: '刮蜡刀', stock: 30, brand: 'Autobath' },
  { englishName: 'Squeeze Bottle with Measurement', chineseName: '250毫升分蜡瓶', stock: 50, brand: 'Autobath' },
  
  // Benzhi Brand Products
  { englishName: 'Rim Brush', chineseName: '轮毂刷', stock: 70, brand: 'Benzhi' },
  { englishName: 'Tyre Brush', chineseName: '轮子刷', stock: 50, brand: 'Benzhi' },
  { englishName: 'JOYBOND Beauty Clay', chineseName: '去污剂蓝色200G', stock: 30, brand: 'Benzhi' },
  { englishName: 'AJIGE Cup Measurement', chineseName: 'PC透明量杯', stock: 50, brand: 'Benzhi' },
  { englishName: 'MJJC Foam Cannon', chineseName: '蓝白', stock: 10, brand: 'Benzhi' },
  { englishName: 'MJJC V3', chineseName: 'V3', stock: 5, brand: 'Benzhi' },
  
  // Lutian Brand Products
  { englishName: 'F4', chineseName: 'F4', stock: 5, brand: 'Lutian' },
  { englishName: 'P4', chineseName: 'P4', stock: 5, brand: 'Lutian' },
  { englishName: 'P6PRO', chineseName: 'P6PRO', stock: 5, brand: 'Lutian' },
  { englishName: 'P6PRO bundle', chineseName: 'P6PRO bundle', stock: 3, brand: 'Lutian' },
  { englishName: 'Car Wash Brush Mop', chineseName: '伸缩拖把', stock: 10, brand: 'Lutian' },
  { englishName: 'Detachable Brush Mop', chineseName: '可拆卸雪尼尔洗车刷', stock: 8, brand: 'Lutian' },
  { englishName: 'Easy Super PA PRO', chineseName: '金属高压泡沫发生器PA壶', stock: 3, brand: 'Lutian' },
  { englishName: 'Foamer - F15', chineseName: '暴雪气压', stock: 8, brand: 'Lutian' },
  { englishName: 'Snow Pro Foam Cannon', chineseName: '雪炮PA壶', stock: 5, brand: 'Lutian' },
  { englishName: 'Multi-functional Collapsible Box', chineseName: '多功能折叠收纳箱36L', stock: 5, brand: 'Lutian' },
  { englishName: 'PA Bottle Separator', chineseName: 'PA药剂分瓶', stock: 6, brand: 'Lutian' },
  { englishName: 'Windstorm Vacuum-10L', chineseName: '雄风', stock: 3, brand: 'Lutian' },
  { englishName: 'Windstorm Vacuum-20L', chineseName: '雄风', stock: 3, brand: 'Lutian' },
  { englishName: 'Windstorm Vacuum-30L', chineseName: '雄风', stock: 2, brand: 'Lutian' }
];

// Product variants to add
const productVariants = [
  {
    productName: 'Unicorn Brush (Large) 独角兽圣诞树轮毂刷',
    variants: [
      { name: 'Small', priceAdjustment: 0, stock: 100 },
      { name: 'Big', priceAdjustment: 0, stock: 100 }
    ]
  },
  {
    productName: 'Washing Brush (Pig Hair) 刷子',
    variants: [
      { name: 'Pig Hair (猪毛)', priceAdjustment: 0, stock: 50 },
      { name: 'Plastic (塑料细节刷)', priceAdjustment: 0, stock: 50 }
    ]
  },
  {
    productName: 'Tear-Off Towel 毛巾卷',
    variants: [
      { name: 'Pink', priceAdjustment: 0, stock: 80 },
      { name: 'Grey', priceAdjustment: 0, stock: 80 }
    ]
  }
];

async function updateLiveDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Updating live database with Chinese names and stock...');
    
    db.serialize(() => {
      let updatedCount = 0;
      let errorCount = 0;
      
      // Step 1: Update existing products
      productUpdates.forEach((update, index) => {
        const { englishName, chineseName, stock, brand } = update;
        
        // Find the product by English name and brand
        db.get(
          'SELECT id, name FROM products WHERE name LIKE ? AND brand = ?',
          [`%${englishName}%`, brand],
          (err, product) => {
            if (err) {
              console.error(`❌ Error finding product ${englishName}:`, err);
              errorCount++;
              return;
            }
            
            if (!product) {
              console.log(`⚠️  Product not found: ${englishName} (${brand})`);
              errorCount++;
              return;
            }
            
            // Update the product with Chinese name and stock
            const newName = `${englishName} ${chineseName}`;
            db.run(
              'UPDATE products SET name = ?, stock = ?, updated_at = datetime("now") WHERE id = ?',
              [newName, stock, product.id],
              function(err) {
                if (err) {
                  console.error(`❌ Error updating product ${englishName}:`, err);
                  errorCount++;
                } else {
                  console.log(`✅ Updated: ${englishName} → ${newName} (Stock: ${stock})`);
                  updatedCount++;
                }
                
                // Check if this is the last update
                if (index === productUpdates.length - 1) {
                  console.log(`\n📊 Product Update Summary:`);
                  console.log(`✅ Successfully updated: ${updatedCount} products`);
                  console.log(`❌ Errors: ${errorCount} products`);
                  
                  // Step 2: Update variants
                  updateVariants();
                }
              }
            );
          }
        );
      });
    });
  });
}

function updateVariants() {
  console.log('\n🔄 Updating product variants...');
  
  let processedCount = 0;
  
  productVariants.forEach((productData, index) => {
    const { productName, variants } = productData;
    
    // Find the product
    db.get('SELECT id FROM products WHERE name = ?', [productName], (err, product) => {
      if (err) {
        console.error(`❌ Error finding product ${productName}:`, err);
        return;
      }
      
      if (!product) {
        console.log(`⚠️  Product not found: ${productName}`);
        processedCount++;
        if (processedCount === productVariants.length) {
          finishUpdate();
        }
        return;
      }
      
      // Clear existing variants
      db.run('DELETE FROM product_colors WHERE product_id = ?', [product.id], (err) => {
        if (err) {
          console.error(`❌ Error clearing variants for ${productName}:`, err);
          return;
        }
        
        // Add new variants
        let variantCount = 0;
        variants.forEach((variant, variantIndex) => {
          db.run(
            'INSERT INTO product_colors (product_id, color_name, price_adjustment, stock, sort_order) VALUES (?, ?, ?, ?, ?)',
            [product.id, variant.name, variant.priceAdjustment, variant.stock, variantIndex],
            function(err) {
              if (err) {
                console.error(`❌ Error adding variant ${variant.name} for ${productName}:`, err);
              } else {
                console.log(`✅ Added variant: ${productName} - ${variant.name} (Stock: ${variant.stock})`);
              }
              
              variantCount++;
              if (variantCount === variants.length) {
                processedCount++;
                if (processedCount === productVariants.length) {
                  finishUpdate();
                }
              }
            }
          );
        });
      });
    });
  });
}

function finishUpdate() {
  console.log('\n🎉 Live database update completed!');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
  });
}

// Run the update
updateLiveDatabase()
  .then(() => {
    console.log('✅ Live database update script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Live database update script failed:', error);
    process.exit(1);
  });
