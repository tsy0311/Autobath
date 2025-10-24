const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

console.log('🔄 Adding missing products to live database...');

// Check current product count
db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
  if (err) {
    console.error('Error checking products count:', err.message);
    process.exit(1);
  }

  console.log(`Current products in database: ${result.count}`);

  if (result.count > 0) {
    console.log('Products already exist, skipping insertion');
    db.close();
    return;
  }

  // Insert all 37 products
  const products = [
    {
      name: 'Metal Sprayer 原液壶',
      description: 'Professional metal sprayer for car detailing',
      price: 58.00,
      image_url: '/img/metalsprayer1.jpg',
      category: 'Tools',
      brand: 'An-Riddle',
      stock: 10
    },
    {
      name: 'Washing Brush Tool Set (3pcs) 细节刷三件套',
      description: 'Complete brush set for detailed cleaning',
      price: 28.00,
      image_url: '/img/washingbrushset3pcs.jpg',
      category: 'Tools',
      brand: 'An-Riddle',
      stock: 25
    },
    {
      name: 'Washing Glove 纤维手套',
      description: 'High-quality washing gloves',
      price: 16.00,
      image_url: '/img/glovewasherBlackWhite.jpg',
      category: 'Accessories',
      brand: 'An-Riddle',
      stock: 50
    },
    {
      name: 'Hand-Carry Box 手提工具篮',
      description: 'Portable tool storage box',
      price: 28.00,
      image_url: '/img/handcarrybox.jpg',
      category: 'Accessories',
      brand: 'An-Riddle',
      stock: 20
    },
    {
      name: 'Multi-functional Clip 脚垫夹',
      description: 'Multi-purpose clip for car mats',
      price: 65.00,
      image_url: '/img/clip.jpg',
      category: 'Accessories',
      brand: 'An-Riddle',
      stock: 6
    },
    {
      name: 'Multi-functional Detail Brush (5pcs) 细节刷五件套',
      description: '5-piece detail brush set',
      price: 20.00,
      image_url: '/img/brushset5pc1.jpg',
      category: 'Tools',
      brand: 'An-Riddle',
      stock: 52
    },
    {
      name: 'PA Foam Separator PA壶',
      description: 'PA foam separator for car washing',
      price: 55.00,
      image_url: '/img/simplepapot.jpg',
      category: 'Tools',
      brand: 'An-Riddle',
      stock: 10
    },
    {
      name: 'One Sided Towel 单面毛巾',
      description: 'High-quality one-sided microfiber towel for car detailing',
      price: 18.00,
      image_url: '/img/onesided40x40(1).jpg',
      category: 'Towels',
      brand: 'An-Riddle',
      stock: 50
    },
    {
      name: 'Two Sided Towel 双面毛巾',
      description: 'Premium two-sided microfiber towel for superior cleaning',
      price: 29.00,
      image_url: '/img/twosided40x40.jpg',
      category: 'Towels',
      brand: 'An-Riddle',
      stock: 80
    },
    {
      name: 'Microfiber Towel 超细纤维毛巾',
      description: 'Soft microfiber towel for gentle cleaning and drying',
      price: 9.90,
      image_url: '/img/microfiber30x40(1).jpg',
      category: 'Towels',
      brand: 'An-Riddle',
      stock: 30
    },
    {
      name: 'Curve Holding Brush 鱼形毛刷',
      description: 'Curved brush for hard-to-reach areas',
      price: 22.00,
      image_url: '/img/curvebrush.jpg',
      category: 'Tools',
      brand: 'Autobath',
      stock: 40
    },
    {
      name: 'Straight Holding Brush 方形毛刷',
      description: 'Straight brush for general cleaning',
      price: 22.00,
      image_url: '/img/straightbrush.jpg',
      category: 'Tools',
      brand: 'Autobath',
      stock: 50
    },
    {
      name: 'Butter Knife 刮蜡刀',
      description: 'Professional butter knife for wax removal',
      price: 15.00,
      image_url: '/img/spatula.jpg',
      category: 'Tools',
      brand: 'Autobath',
      stock: 30
    },
    {
      name: 'Squeeze Bottle with Measurement 250毫升分蜡瓶',
      description: 'Measuring squeeze bottle for precise application',
      price: 9.90,
      image_url: '/img/squeezebottle.jpg',
      category: 'Tools',
      brand: 'Autobath',
      stock: 50
    },
    {
      name: 'Rim Brush 轮毂刷',
      description: 'Specialized brush for wheel rims',
      price: 23.90,
      image_url: '/img/rimbrush.jpg',
      category: 'Tools',
      brand: 'Benzhi',
      stock: 70
    },
    {
      name: 'Tyre Brush 轮子刷',
      description: 'Brush designed for tire cleaning',
      price: 18.80,
      image_url: '/img/smallbrush.jpg',
      category: 'Tools',
      brand: 'Benzhi',
      stock: 50
    },
    {
      name: 'JOYBOND Beauty Clay 去污剂蓝色200G',
      description: 'Professional beauty clay for paint decontamination',
      price: 65.00,
      image_url: '/img/beautyclay.jpg',
      category: 'Detailing',
      brand: 'Benzhi',
      stock: 30
    },
    {
      name: 'AJIGE Cup Measurement PC透明量杯',
      description: 'Transparent measuring cup for accurate mixing',
      price: 9.90,
      image_url: '/img/cupmeasurement.jpg',
      category: 'Tools',
      brand: 'Benzhi',
      stock: 50
    },
    {
      name: 'MJJC Foam Cannon 蓝白',
      description: 'High-quality foam cannon for car washing',
      price: 239.00,
      image_url: '/img/mjjcfoamcannon.jpg',
      category: 'Tools',
      brand: 'Benzhi',
      stock: 10
    },
    {
      name: 'MJJC V3 泡沫炮',
      description: 'Advanced foam cannon V3 model',
      price: 239.00,
      image_url: '/img/mjjcv3.jpg',
      category: 'Tools',
      brand: 'Benzhi',
      stock: 5
    },
    {
      name: 'Unicorn Brush 独角兽圣诞树轮毂刷',
      description: 'Large unicorn brush for wheel cleaning',
      price: 39.90,
      image_url: '/img/smallunicorn.jpg',
      category: 'Tools',
      brand: 'Benzhi',
      stock: 100
    },
    {
      name: 'Washing Brush 刷子',
      description: 'Pig hair brush for gentle cleaning',
      price: 18.00,
      image_url: '/img/plasticbrush.jpg',
      category: 'Tools',
      brand: 'Benzhi',
      stock: 50
    },
    {
      name: 'Tear-Off Towel 毛巾卷',
      description: 'Tear-off towel for easy disposal',
      price: 28.80,
      image_url: '/img/tearOffTowel.jpg',
      category: 'Towels',
      brand: 'Benzhi',
      stock: 80
    },
    {
      name: 'High Pressure Washer F4 高压清洗机',
      description: 'High pressure washer F4 model',
      price: 339.00,
      image_url: '/img/panther-f4.jpg',
      category: 'Equipment',
      brand: 'Lutian',
      stock: 5
    },
    {
      name: 'High Pressure Washer P4 高压清洗机',
      description: 'High pressure washer P4 model',
      price: 399.00,
      image_url: '/img/panther-p4-1.jpg',
      category: 'Equipment',
      brand: 'Lutian',
      stock: 5
    },
    {
      name: 'High Pressure Washer P6 PRO 高压清洗机',
      description: 'High pressure washer P6 PRO',
      price: 669.00,
      image_url: '/img/panther-p6.jpg',
      category: 'Equipment',
      brand: 'Lutian',
      stock: 5
    },
    {
      name: 'High Pressure Washer P6 PRO + Trolley (Bundle) 高压清洗机套装',
      description: 'P6PRO with trolley bundle',
      price: 849.00,
      image_url: '/img/trolleybundle.jpg',
      category: 'Equipment',
      brand: 'Lutian',
      stock: 3
    },
    {
      name: 'Car Wash Brush Mop 伸缩拖把',
      description: 'Telescopic brush mop for car washing',
      price: 58.00,
      image_url: '/img/carwashbrush1.jpg',
      category: 'Tools',
      brand: 'Lutian',
      stock: 10
    },
    {
      name: 'Detachable Brush Mop 可拆卸雪尼尔洗车刷',
      description: 'Detachable chenille brush mop',
      price: 99.80,
      image_url: '/img/detachablebrush1.jpg',
      category: 'Tools',
      brand: 'Lutian',
      stock: 8
    },
    {
      name: 'Easy Super PA PRO 金属高压泡沫发生器PA壶',
      description: 'Metal high-pressure foam generator',
      price: 159.00,
      image_url: '/img/easyPA.jpg',
      category: 'Tools',
      brand: 'Lutian',
      stock: 3
    },
    {
      name: 'Foamer - F15 暴雪气压',
      description: 'F15 foamer with blizzard pressure',
      price: 89.00,
      image_url: '/img/foamerf15.jpg',
      category: 'Tools',
      brand: 'Lutian',
      stock: 8
    },
    {
      name: 'Snow Pro Foam Cannon 雪炮PA壶',
      description: 'Snow Pro foam cannon PA bottle',
      price: 89.00,
      image_url: '/img/snowprofoamcannon.jpg',
      category: 'Tools',
      brand: 'Lutian',
      stock: 5
    },
    {
      name: 'Multi-functional Collapsible Box 多功能折叠收纳箱36L',
      description: '36L collapsible storage box',
      price: 99.00,
      image_url: '/img/collapsablebox.jpg',
      category: 'Accessories',
      brand: 'Lutian',
      stock: 5
    },
    {
      name: 'PA Bottle Separator PA药剂分瓶',
      description: 'PA bottle separator for chemicals',
      price: 59.00,
      image_url: '/img/blizzardPApot.jpg',
      category: 'Tools',
      brand: 'Lutian',
      stock: 6
    },
    {
      name: 'Windstorm Vacuum-10L 雄风',
      description: '10L Windstorm vacuum cleaner',
      price: 150.00,
      image_url: '/img/ws10.jpg',
      category: 'Equipment',
      brand: 'Lutian',
      stock: 3
    },
    {
      name: 'Windstorm Vacuum-20L 雄风',
      description: '20L Windstorm vacuum cleaner',
      price: 269.00,
      image_url: '/img/ws20.jpg',
      category: 'Equipment',
      brand: 'Lutian',
      stock: 3
    },
    {
      name: 'Windstorm Vacuum-30L 雄风',
      description: '30L Windstorm vacuum cleaner',
      price: 339.00,
      image_url: '/img/ws30.jpg',
      category: 'Equipment',
      brand: 'Lutian',
      stock: 2
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, image_url, category, brand, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  products.forEach(product => {
    stmt.run(product.name, product.description, product.price, product.image_url, 
             product.category, product.brand, product.stock, (err) => {
      if (err) {
        console.error(`Error inserting product "${product.name}":`, err.message);
      } else {
        inserted++;
        console.log(`✅ Inserted: ${product.name}`);
      }
    });
  });

  stmt.finalize((err) => {
    if (err) {
      console.error('Error finalizing statement:', err.message);
    } else {
      console.log(`\n🎉 Successfully inserted ${inserted} products!`);
      
      // Verify the insertion
      db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
        if (err) {
          console.error('Error verifying products count:', err.message);
        } else {
          console.log(`✅ Total products in database: ${result.count}`);
          console.log('🚀 Live website should now show all products!');
        }
        
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('\nDatabase connection closed');
            process.exit(0);
          }
        });
      });
    }
  });
});
