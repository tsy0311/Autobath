const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🛒 Seeding products...');

// Helper to parse RM price strings
function parsePrice(p) {
  if (typeof p === 'number') return p;
  if (!p) return 0;
  const cleaned = String(p).trim().toLowerCase().replace(/rm\s*/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

// Complete list of 45 products with Chinese names, stock levels, and variants
const products = [
  // An-Riddle Brand Products (10 products)
  { 
    name: 'Metal Sprayer 原液壶', 
    brand: 'An-Riddle', 
    price: 'rm58', 
    stock: 10, 
    description: 'Professional metal sprayer for car detailing',
    category: 'Tools'
  },
  { 
    name: 'Washing Brush Tool Set (3pcs) 细节刷三件套', 
    brand: 'An-Riddle', 
    price: 'rm28', 
    stock: 25, 
    description: 'Complete brush set for detailed cleaning',
    category: 'Tools'
  },
  { 
    name: 'Washing Glove 纤维手套', 
    brand: 'An-Riddle', 
    price: 'rm16', 
    stock: 50, 
    description: 'High-quality washing gloves',
    category: 'Accessories'
  },
  { 
    name: 'Hand-Carry Box 手提工具篮', 
    brand: 'An-Riddle', 
    price: 'rm28', 
    stock: 20, 
    description: 'Portable tool storage box',
    category: 'Accessories'
  },
  { 
    name: 'Multi-functional Clip 脚垫夹', 
    brand: 'An-Riddle', 
    price: 'rm65', 
    stock: 6, 
    description: 'Multi-purpose clip for car mats',
    category: 'Accessories'
  },
  { 
    name: 'Multi-functional Detail Brush (5pcs) 细节刷五件套', 
    brand: 'An-Riddle', 
    price: 'rm20', 
    stock: 52, 
    description: '5-piece detail brush set',
    category: 'Tools'
  },
  { 
    name: 'PA Foam Separator PA壶', 
    brand: 'An-Riddle', 
    price: 'rm55', 
    stock: 10, 
    description: 'PA foam separator for car washing',
    category: 'Tools'
  },
  { 
    name: 'One Sided Towel 单面毛巾', 
    brand: 'An-Riddle', 
    price: 'rm18', 
    stock: 50, 
    description: 'High-quality one-sided microfiber towel for car detailing',
    category: 'Towels',
    variants: [
      { name: '40x40', price_adjustment: 0, stock: 50 },
      { name: '60x80', price_adjustment: 11, stock: 25 }
    ]
  },
  { 
    name: 'Two Sided Towel 双面毛巾', 
    brand: 'An-Riddle', 
    price: 'rm29', 
    stock: 80, 
    description: 'Premium two-sided microfiber towel for superior cleaning',
    category: 'Towels',
    variants: [
      { name: '40x40', price_adjustment: 0, stock: 80 },
      { name: '60x80', price_adjustment: 19, stock: 80 }
    ]
  },
  { 
    name: 'Microfiber Towel 超细纤维毛巾', 
    brand: 'An-Riddle', 
    price: 'rm9.9', 
    stock: 30, 
    description: 'Soft microfiber towel for gentle cleaning and drying',
    category: 'Towels',
    variants: [
      { name: '30x40', price_adjustment: 0, stock: 30 },
      { name: '30x60', price_adjustment: 4.1, stock: 30 }
    ]
  },
  
  // Autobath Brand Products (4 products)
  { 
    name: 'Curve Holding Brush 鱼形毛刷', 
    brand: 'Autobath', 
    price: 'rm22', 
    stock: 40, 
    description: 'Curved brush for hard-to-reach areas',
    category: 'Tools'
  },
  { 
    name: 'Straight Holding Brush 方形毛刷', 
    brand: 'Autobath', 
    price: 'rm22', 
    stock: 50, 
    description: 'Straight brush for general cleaning',
    category: 'Tools'
  },
  { 
    name: 'Butter Knife 刮蜡刀', 
    brand: 'Autobath', 
    price: 'rm15', 
    stock: 30, 
    description: 'Professional butter knife for wax removal',
    category: 'Tools'
  },
  { 
    name: 'Squeeze Bottle with Measurement 250毫升分蜡瓶', 
    brand: 'Autobath', 
    price: 'rm9.9', 
    stock: 50, 
    description: 'Measuring squeeze bottle for precise application',
    category: 'Tools'
  },
  
  // Benzhi Brand Products (9 products)
  { 
    name: 'Rim Brush 轮毂刷', 
    brand: 'Benzhi', 
    price: 'rm23.9', 
    stock: 70, 
    description: 'Specialized brush for wheel rims',
    category: 'Tools'
  },
  { 
    name: 'Tyre Brush 轮子刷', 
    brand: 'Benzhi', 
    price: 'rm18.8', 
    stock: 50, 
    description: 'Brush designed for tire cleaning',
    category: 'Tools'
  },
  { 
    name: 'JOYBOND Beauty Clay 去污剂蓝色200G', 
    brand: 'Benzhi', 
    price: 'rm65', 
    stock: 30, 
    description: 'Professional beauty clay for paint decontamination',
    category: 'Detailing'
  },
  { 
    name: 'AJIGE Cup Measurement PC透明量杯', 
    brand: 'Benzhi', 
    price: 'rm9.9', 
    stock: 50, 
    description: 'Transparent measuring cup for accurate mixing',
    category: 'Tools'
  },
  { 
    name: 'MJJC Foam Cannon 蓝白', 
    brand: 'Benzhi', 
    price: 'rm239', 
    stock: 10, 
    description: 'High-quality foam cannon for car washing',
    category: 'Tools'
  },
  { 
    name: 'MJJC V3 泡沫炮', 
    brand: 'Benzhi', 
    price: 'rm239', 
    stock: 5, 
    description: 'Advanced foam cannon V3 model',
    category: 'Tools'
  },
  { 
    name: 'Unicorn Brush (Large) 独角兽圣诞树轮毂刷', 
    brand: 'Benzhi', 
    price: 'rm39.9', 
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
    price: 'rm18', 
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
    price: 'rm28.8', 
    stock: 80, 
    description: 'Tear-off towel for easy disposal',
    category: 'Towels',
    variants: [
      { name: 'Pink', price_adjustment: 0, stock: 80 },
      { name: 'Grey', price_adjustment: 0, stock: 80 }
    ]
  },
  
  // Lutian Brand Products (22 products)
  { 
    name: 'F4 高压清洗机', 
    brand: 'Lutian', 
    price: 'rm339', 
    stock: 5, 
    description: 'High pressure washer F4 model',
    category: 'Equipment'
  },
  { 
    name: 'P4 高压清洗机', 
    brand: 'Lutian', 
    price: 'rm399', 
    stock: 5, 
    description: 'High pressure washer P4 model',
    category: 'Equipment'
  },
  { 
    name: 'P6PRO 高压清洗机', 
    brand: 'Lutian', 
    price: 'rm669', 
    stock: 5, 
    description: 'High pressure washer P6 PRO',
    category: 'Equipment'
  },
  { 
    name: 'P6PRO bundle 高压清洗机套装', 
    brand: 'Lutian', 
    price: 'rm849', 
    stock: 3, 
    description: 'P6PRO with trolley bundle',
    category: 'Equipment'
  },
  { 
    name: 'Car Wash Brush Mop 伸缩拖把', 
    brand: 'Lutian', 
    price: 'rm58', 
    stock: 10, 
    description: 'Telescopic brush mop for car washing',
    category: 'Tools'
  },
  { 
    name: 'Detachable Brush Mop 可拆卸雪尼尔洗车刷', 
    brand: 'Lutian', 
    price: 'rm99.8', 
    stock: 8, 
    description: 'Detachable chenille brush mop',
    category: 'Tools'
  },
  { 
    name: 'Easy Super PA PRO 金属高压泡沫发生器PA壶', 
    brand: 'Lutian', 
    price: 'rm159', 
    stock: 3, 
    description: 'Metal high-pressure foam generator',
    category: 'Tools'
  },
  { 
    name: 'Foamer - F15 暴雪气压', 
    brand: 'Lutian', 
    price: 'rm89', 
    stock: 8, 
    description: 'F15 foamer with blizzard pressure',
    category: 'Tools'
  },
  { 
    name: 'Snow Pro Foam Cannon 雪炮PA壶', 
    brand: 'Lutian', 
    price: 'rm89', 
    stock: 5, 
    description: 'Snow Pro foam cannon PA bottle',
    category: 'Tools'
  },
  { 
    name: 'Multi-functional Collapsible Box 多功能折叠收纳箱36L', 
    brand: 'Lutian', 
    price: 'rm99', 
    stock: 5, 
    description: '36L collapsible storage box',
    category: 'Accessories'
  },
  { 
    name: 'PA Bottle Separator PA药剂分瓶', 
    brand: 'Lutian', 
    price: 'rm59', 
    stock: 6, 
    description: 'PA bottle separator for chemicals',
    category: 'Tools'
  },
  { 
    name: 'Windstorm Vacuum-10L 雄风', 
    brand: 'Lutian', 
    price: 'rm150', 
    stock: 3, 
    description: '10L Windstorm vacuum cleaner',
    category: 'Equipment'
  },
  { 
    name: 'Windstorm Vacuum-20L 雄风', 
    brand: 'Lutian', 
    price: 'rm269', 
    stock: 3, 
    description: '20L Windstorm vacuum cleaner',
    category: 'Equipment'
  },
  { 
    name: 'Windstorm Vacuum-30L 雄风', 
    brand: 'Lutian', 
    price: 'rm339', 
    stock: 2, 
    description: '30L Windstorm vacuum cleaner',
    category: 'Equipment'
  },
  { 
    name: 'Spatula 刮蜡刀', 
    brand: 'Lutian', 
    price: 'rm9.9', 
    stock: 30, 
    description: 'Professional spatula for wax removal',
    category: 'Tools'
  },
  
  // Additional Products (7 products)
  { 
    name: 'Squeeze Bottle 分蜡瓶', 
    brand: 'An-Riddle', 
    price: 'rm12', 
    stock: 25, 
    description: 'Professional squeeze bottle for wax application',
    category: 'Tools'
  },
  { 
    name: 'Detail Brush Set 细节刷套装', 
    brand: 'An-Riddle', 
    price: 'rm35', 
    stock: 15, 
    description: 'Complete detail brush set for precision cleaning',
    category: 'Tools'
  },
  { 
    name: 'Wax Applicator Pad 上蜡垫', 
    brand: 'An-Riddle', 
    price: 'rm8', 
    stock: 40, 
    description: 'Soft applicator pad for wax application',
    category: 'Tools'
  },
  { 
    name: 'Microfiber Wash Mitt 洗车手套', 
    brand: 'An-Riddle', 
    price: 'rm15', 
    stock: 30, 
    description: 'Microfiber wash mitt for gentle car washing',
    category: 'Tools'
  },
  { 
    name: 'Tire Dressing Applicator 轮胎护理刷', 
    brand: 'Benzhi', 
    price: 'rm12', 
    stock: 20, 
    description: 'Specialized applicator for tire dressing',
    category: 'Tools'
  },
  { 
    name: 'Interior Detail Brush 内饰细节刷', 
    brand: 'Benzhi', 
    price: 'rm18', 
    stock: 25, 
    description: 'Soft brush for interior detailing',
    category: 'Tools'
  },
  { 
    name: 'Wheel Cleaner Brush 轮毂清洁刷', 
    brand: 'Benzhi', 
    price: 'rm22', 
    stock: 15, 
    description: 'Heavy-duty brush for wheel cleaning',
    category: 'Tools'
  }
];

let processedCount = 0;
let errorCount = 0;

db.serialize(() => {
  db.run('BEGIN');

  products.forEach((product, index) => {
    const { name, brand, price, stock, description, category, variants = [] } = product;
    const parsedPrice = parsePrice(price);
    
    db.run(
      'INSERT OR REPLACE INTO products (name, description, price, brand, stock, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
      [name, description, parsedPrice, brand, stock, category],
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
  });
});

function addVariants(productId, variants, productName) {
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
}

function finishImport() {
  console.log('\n📊 Seed Products Summary:');
  console.log(`✅ Successfully processed: ${processedCount} products`);
  console.log(`❌ Errors: ${errorCount} products`);
  console.log(`🎯 Total products: ${products.length}`);
  
  // Count variants
  const totalVariants = products.reduce((sum, product) => sum + (product.variants?.length || 0), 0);
  console.log(`🎨 Total variants: ${totalVariants}`);
  
  db.run('COMMIT', (e) => {
    if (e) console.error('Commit error:', e.message);
    console.log('🎉 Products seeded successfully! All 45 products with Chinese names and variants are now in the database.');
    db.close();
  });
}