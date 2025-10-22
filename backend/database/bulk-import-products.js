const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🚀 Bulk importing products with Chinese names and stock...');

// All products with Chinese names, stock levels, and variants
const products = [
  // An-Riddle Brand Products
  { 
    name: 'Metal Sprayer 原液壶', 
    brand: 'An-Riddle', 
    price: 58, 
    stock: 10, 
    description: 'Professional metal sprayer for car detailing',
    category: 'Tools'
  },
  { 
    name: 'Washing Brush Tool Set (3pcs) 细节刷三件套', 
    brand: 'An-Riddle', 
    price: 28, 
    stock: 25, 
    description: 'Complete brush set for detailed cleaning',
    category: 'Tools'
  },
  { 
    name: 'Washing Glove 纤维手套', 
    brand: 'An-Riddle', 
    price: 16, 
    stock: 50, 
    description: 'High-quality washing gloves',
    category: 'Accessories'
  },
  { 
    name: 'Hand-Carry Box 手提工具篮', 
    brand: 'An-Riddle', 
    price: 28, 
    stock: 20, 
    description: 'Portable tool storage box',
    category: 'Accessories'
  },
  { 
    name: 'Multi-functional Clip 脚垫夹', 
    brand: 'An-Riddle', 
    price: 65, 
    stock: 6, 
    description: 'Multi-purpose clip for car mats',
    category: 'Accessories'
  },
  { 
    name: 'Multi-functional Detail Brush (5pcs) 细节刷五件套', 
    brand: 'An-Riddle', 
    price: 20, 
    stock: 52, 
    description: '5-piece detail brush set',
    category: 'Tools'
  },
  { 
    name: 'PA Foam Separator PA壶', 
    brand: 'An-Riddle', 
    price: 55, 
    stock: 10, 
    description: 'PA foam separator for car washing',
    category: 'Tools'
  },
  
  // Autobath Brand Products
  { 
    name: 'Curve Holding Brush 鱼形毛刷', 
    brand: 'Autobath', 
    price: 22, 
    stock: 40, 
    description: 'Curved brush for hard-to-reach areas',
    category: 'Tools'
  },
  { 
    name: 'Straight Holding Brush 方形毛刷', 
    brand: 'Autobath', 
    price: 22, 
    stock: 50, 
    description: 'Straight brush for general cleaning',
    category: 'Tools'
  },
  { 
    name: 'Butter Knife 刮蜡刀', 
    brand: 'Autobath', 
    price: 15, 
    stock: 30, 
    description: 'Professional butter knife for wax removal',
    category: 'Tools'
  },
  { 
    name: 'Squeeze Bottle with Measurement 250毫升分蜡瓶', 
    brand: 'Autobath', 
    price: 9.9, 
    stock: 50, 
    description: 'Measuring squeeze bottle for precise application',
    category: 'Tools'
  },
  
  // Benzhi Brand Products
  { 
    name: 'Rim Brush 轮毂刷', 
    brand: 'Benzhi', 
    price: 23.9, 
    stock: 70, 
    description: 'Specialized brush for wheel rims',
    category: 'Tools'
  },
  { 
    name: 'Tyre Brush 轮子刷', 
    brand: 'Benzhi', 
    price: 18.8, 
    stock: 50, 
    description: 'Brush designed for tire cleaning',
    category: 'Tools'
  },
  { 
    name: 'JOYBOND Beauty Clay 去污剂蓝色200G', 
    brand: 'Benzhi', 
    price: 65, 
    stock: 30, 
    description: 'Professional beauty clay for paint decontamination',
    category: 'Detailing'
  },
  { 
    name: 'AJIGE Cup Measurement PC透明量杯', 
    brand: 'Benzhi', 
    price: 9.9, 
    stock: 50, 
    description: 'Transparent measuring cup for accurate mixing',
    category: 'Tools'
  },
  { 
    name: 'MJJC Foam Cannon 蓝白', 
    brand: 'Benzhi', 
    price: 239, 
    stock: 10, 
    description: 'High-quality foam cannon for car washing',
    category: 'Tools'
  },
  { 
    name: 'MJJC V3', 
    brand: 'Benzhi', 
    price: 239, 
    stock: 5, 
    description: 'Advanced foam cannon V3 model',
    category: 'Tools'
  },
  { 
    name: 'Unicorn Brush (Large) 独角兽圣诞树轮毂刷', 
    brand: 'Benzhi', 
    price: 39.9, 
    stock: 100, 
    description: 'Large unicorn brush for wheel cleaning',
    category: 'Tools',
    variants: [
      { name: 'Small', price_adjustment: 0, stock: 100 },
      { name: 'Big', price_adjustment: 0, stock: 100 }
    ]
  },
  { 
    name: 'Washing Brush (Pig Hair) 刷子', 
    brand: 'Benzhi', 
    price: 18, 
    stock: 50, 
    description: 'Pig hair brush for gentle cleaning',
    category: 'Tools',
    variants: [
      { name: 'Pig Hair (猪毛)', price_adjustment: 0, stock: 50 },
      { name: 'Plastic (塑料细节刷)', price_adjustment: 0, stock: 50 }
    ]
  },
  { 
    name: 'Tear-Off Towel 毛巾卷', 
    brand: 'Benzhi', 
    price: 28.8, 
    stock: 80, 
    description: 'Tear-off towel for easy disposal',
    category: 'Towels',
    variants: [
      { name: 'Pink', price_adjustment: 0, stock: 80 },
      { name: 'Grey', price_adjustment: 0, stock: 80 }
    ]
  },
  
  // Lutian Brand Products
  { 
    name: 'F4', 
    brand: 'Lutian', 
    price: 339, 
    stock: 5, 
    description: 'High pressure washer F4 model',
    category: 'Equipment'
  },
  { 
    name: 'P4', 
    brand: 'Lutian', 
    price: 399, 
    stock: 5, 
    description: 'High pressure washer P4 model',
    category: 'Equipment'
  },
  { 
    name: 'P6PRO', 
    brand: 'Lutian', 
    price: 669, 
    stock: 5, 
    description: 'High pressure washer P6 PRO',
    category: 'Equipment'
  },
  { 
    name: 'P6PRO bundle', 
    brand: 'Lutian', 
    price: 849, 
    stock: 3, 
    description: 'P6PRO with trolley bundle',
    category: 'Equipment'
  },
  { 
    name: 'Car Wash Brush Mop 伸缩拖把', 
    brand: 'Lutian', 
    price: 58, 
    stock: 10, 
    description: 'Telescopic brush mop for car washing',
    category: 'Tools'
  },
  { 
    name: 'Detachable Brush Mop 可拆卸雪尼尔洗车刷', 
    brand: 'Lutian', 
    price: 99.8, 
    stock: 8, 
    description: 'Detachable chenille brush mop',
    category: 'Tools'
  },
  { 
    name: 'Easy Super PA PRO 金属高压泡沫发生器PA壶', 
    brand: 'Lutian', 
    price: 159, 
    stock: 3, 
    description: 'Metal high-pressure foam generator',
    category: 'Tools'
  },
  { 
    name: 'Foamer - F15 暴雪气压', 
    brand: 'Lutian', 
    price: 89, 
    stock: 8, 
    description: 'F15 foamer with blizzard pressure',
    category: 'Tools'
  },
  { 
    name: 'Snow Pro Foam Cannon 雪炮PA壶', 
    brand: 'Lutian', 
    price: 89, 
    stock: 5, 
    description: 'Snow Pro foam cannon PA bottle',
    category: 'Tools'
  },
  { 
    name: 'Multi-functional Collapsible Box 多功能折叠收纳箱36L', 
    brand: 'Lutian', 
    price: 99, 
    stock: 5, 
    description: '36L collapsible storage box',
    category: 'Accessories'
  },
  { 
    name: 'PA Bottle Separator PA药剂分瓶', 
    brand: 'Lutian', 
    price: 59, 
    stock: 6, 
    description: 'PA bottle separator for chemicals',
    category: 'Tools'
  },
  { 
    name: 'Windstorm Vacuum-10L 雄风', 
    brand: 'Lutian', 
    price: 150, 
    stock: 3, 
    description: '10L Windstorm vacuum cleaner',
    category: 'Equipment'
  },
  { 
    name: 'Windstorm Vacuum-20L 雄风', 
    brand: 'Lutian', 
    price: 269, 
    stock: 3, 
    description: '20L Windstorm vacuum cleaner',
    category: 'Equipment'
  },
  { 
    name: 'Windstorm Vacuum-30L 雄风', 
    brand: 'Lutian', 
    price: 339, 
    stock: 2, 
    description: '30L Windstorm vacuum cleaner',
    category: 'Equipment'
  }
];

let processedCount = 0;
let errorCount = 0;

db.serialize(() => {
  db.run('BEGIN');

  products.forEach((product, index) => {
    const { name, brand, price, stock, description, category, variants = [] } = product;
    
    // Check if product already exists
    db.get('SELECT id FROM products WHERE name = ?', [name], (err, existingProduct) => {
      if (err) {
        console.error(`❌ Error checking product ${name}:`, err);
        errorCount++;
        return;
      }
      
      if (existingProduct) {
        // Update existing product
        db.run(
          'UPDATE products SET description = ?, price = ?, brand = ?, stock = ?, category = ?, updated_at = datetime("now") WHERE id = ?',
          [description, price, brand, stock, category, existingProduct.id],
          function(err) {
            if (err) {
              console.error(`❌ Error updating product ${name}:`, err);
              errorCount++;
            } else {
              console.log(`✅ Updated: ${name} (Stock: ${stock})`);
            }
            
            // Add variants if they exist
            if (variants.length > 0) {
              addVariants(existingProduct.id, variants, name);
            }
            
            processedCount++;
            if (processedCount === products.length) {
              finishImport();
            }
          }
        );
      } else {
        // Insert new product
        db.run(
          'INSERT INTO products (name, description, price, brand, stock, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
          [name, description, price, brand, stock, category],
          function(err) {
            if (err) {
              console.error(`❌ Error inserting product ${name}:`, err);
              errorCount++;
            } else {
              console.log(`➕ Inserted: ${name} (Stock: ${stock})`);
              
              // Add variants if they exist
              if (variants.length > 0) {
                addVariants(this.lastID, variants, name);
              }
            }
            
            processedCount++;
            if (processedCount === products.length) {
              finishImport();
            }
          }
        );
      }
    });
  });
});

function addVariants(productId, variants, productName) {
  // Clear existing variants
  db.run('DELETE FROM product_colors WHERE product_id = ?', [productId], (err) => {
    if (err) {
      console.error(`❌ Error clearing variants for ${productName}:`, err);
      return;
    }
    
    // Add new variants
    variants.forEach((variant, index) => {
      db.run(
        'INSERT INTO product_colors (product_id, color_name, price_adjustment, stock, sort_order) VALUES (?, ?, ?, ?, ?)',
        [productId, variant.name, variant.price_adjustment, variant.stock, index],
        function(err) {
          if (err) {
            console.error(`❌ Error adding variant ${variant.name} for ${productName}:`, err);
          } else {
            console.log(`  ✅ Added variant: ${productName} - ${variant.name} (Stock: ${variant.stock})`);
          }
        }
      );
    });
  });
}

function finishImport() {
  console.log('\n📊 Bulk Import Summary:');
  console.log(`✅ Successfully processed: ${processedCount} products`);
  console.log(`❌ Errors: ${errorCount} products`);
  
  db.run('COMMIT', (e) => {
    if (e) console.error('Commit error:', e.message);
    console.log('🎉 Bulk product import completed!');
    db.close();
  });
}
