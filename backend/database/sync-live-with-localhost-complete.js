const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Syncing live database with complete localhost data...');

// Complete localhost data with proper image ordering and all variants
const completeLocalhostData = {
  products: [
    {
      id: 1,
      name: "Metal Sprayer 原液壶",
      description: "High-quality metal sprayer for car detailing products",
      price: 45.00,
      stock: 50,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/metalsprayer1.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/metalsprayer1.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/metalsprayer2.jpg", is_primary: 0 }
      ],
      variants: []
    },
    {
      id: 2,
      name: "Washing Brush Tool Set (3pcs) 细节刷三件套",
      description: "Complete 3-piece brush set for detailed car cleaning",
      price: 35.00,
      stock: 30,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/washingbrushset3pcs.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/washingbrushset3pcs.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 3,
      name: "Washing Glove 纤维手套",
      description: "High-quality microfiber washing gloves",
      price: 25.00,
      stock: 50,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/glovewasherBlackWhite.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/glovewasherBlackWhite.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/glovewasherBlue.jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/glovewasherRed.jpg", is_primary: 0 }
      ],
      variants: [
        { color_name: "BlackWhite", stock: 20 },
        { color_name: "Blue", stock: 15 },
        { color_name: "Red", stock: 15 }
      ]
    },
    {
      id: 4,
      name: "Hand-Carry Box 手提工具篮",
      description: "Portable tool storage box for car detailing",
      price: 28.00,
      stock: 40,
      category: "Storage",
      image_url: "https://autobath-backend.onrender.com/img/handcarrybox.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/handcarrybox.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 5,
      name: "Multi-functional Clip 脚垫夹",
      description: "Versatile clip for car floor mat handling",
      price: 15.00,
      stock: 60,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/clip.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/clip.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 6,
      name: "Multi-functional Detail Brush (5pcs) 细节刷五件套",
      description: "Complete 5-piece detail brush set for precision cleaning",
      price: 55.00,
      stock: 25,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/brushset5pc1.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/brushset5pc1.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/brushset5pc2.jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/washingbrushset3pcs.jpg", is_primary: 0 }
      ],
      variants: []
    },
    {
      id: 7,
      name: "PA Foam Separator PA壶",
      description: "Professional PA foam separator for car washing",
      price: 38.00,
      stock: 35,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/simplepapot.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/simplepapot.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 8,
      name: "One Sided Towel 单面毛巾",
      description: "High-quality one-sided microfiber towel",
      price: 12.00,
      stock: 100,
      category: "Towels",
      image_url: "https://autobath-backend.onrender.com/img/onesided40x40(1).jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/onesided40x40(1).jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/onesided60x80(1).jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/onesided60x80(2).jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/onesided40x40(2).jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/onesided60x80(1).jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/onesided60x80(2).jpg", is_primary: 0 }
      ],
      variants: [
        { color_name: "40x40", stock: 50 },
        { color_name: "60x80", stock: 25 }
      ]
    },
    {
      id: 9,
      name: "Two Sided Towel 双面毛巾",
      description: "Premium two-sided microfiber towel for superior cleaning",
      price: 18.00,
      stock: 80,
      category: "Towels",
      image_url: "https://autobath-backend.onrender.com/img/twosided40x40.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/twosided40x40.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/twosided40x40(2).jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/twosided60x80(1).jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/twosided60x80(2).jpg", is_primary: 0 }
      ],
      variants: [
        { color_name: "40x40", stock: 80 },
        { color_name: "60x80", stock: 80 }
      ]
    },
    {
      id: 10,
      name: "Microfiber Towel 超细纤维毛巾",
      description: "Ultra-soft microfiber towel for gentle car cleaning",
      price: 15.00,
      stock: 120,
      category: "Towels",
      image_url: "https://autobath-backend.onrender.com/img/microfiber30x40(1).jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/microfiber30x40(1).jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/microfiber30x40(2).jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/microfiber30x60.jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/microfiber40x60.jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/microfiber40x60(2).jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/microfiber60x80.jpg", is_primary: 0 }
      ],
      variants: [
        { color_name: "30x40", stock: 30 },
        { color_name: "30x60", stock: 30 }
      ]
    },
    {
      id: 11,
      name: "Curve Holding Brush 鱼形毛刷",
      description: "Ergonomic curved brush for hard-to-reach areas",
      price: 22.00,
      stock: 45,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/curvebrush.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/curvebrush.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 12,
      name: "Straight Holding Brush 方形毛刷",
      description: "Straight brush for precise cleaning applications",
      price: 20.00,
      stock: 50,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/straightbrush.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/straightbrush.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 13,
      name: "Butter Knife 刮蜡刀",
      description: "Professional butter knife for wax removal",
      price: 18.00,
      stock: 40,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/spatula.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/spatula.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 14,
      name: "Squeeze Bottle with Measurement 250毫升分蜡瓶",
      description: "250ml squeeze bottle with measurement markings",
      price: 12.00,
      stock: 60,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/squeezebottle.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/squeezebottle.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 15,
      name: "Rim Brush 轮毂刷",
      description: "Specialized brush for wheel rim cleaning",
      price: 25.00,
      stock: 35,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/rimbrush.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/rimbrush.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 16,
      name: "Tyre Brush 轮子刷",
      description: "Heavy-duty brush for tire cleaning",
      price: 28.00,
      stock: 30,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/smallbrush.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/smallbrush.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 17,
      name: "JOYBOND Beauty Clay 去污剂蓝色200G",
      description: "Professional clay bar for paint decontamination",
      price: 45.00,
      stock: 25,
      category: "Detailing",
      image_url: "https://autobath-backend.onrender.com/img/beautyclay.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/beautyclay.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 18,
      name: "AJIGE Cup Measurement PC透明量杯",
      description: "Transparent measuring cup for precise mixing",
      price: 15.00,
      stock: 40,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/cupmeasurement.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/cupmeasurement.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 19,
      name: "MJJC Foam Cannon 蓝白",
      description: "Professional foam cannon for car washing",
      price: 85.00,
      stock: 20,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/mjjcfoamcannon.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/mjjcfoamcannon.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 20,
      name: "MJJC V3 泡沫炮",
      description: "Advanced V3 foam cannon with improved performance",
      price: 95.00,
      stock: 15,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/mjjcv3.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/mjjcv3.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 21,
      name: "Unicorn Brush 独角兽圣诞树轮毂刷",
      description: "Unique unicorn-themed wheel brush for festive cleaning",
      price: 35.00,
      stock: 200,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/smallunicorn.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/smallunicorn.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/largeunicorn.jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/smallunicorn1.jpg", is_primary: 0 }
      ],
      variants: [
        { color_name: "Big", stock: 100 },
        { color_name: "Small", stock: 100 }
      ]
    },
    {
      id: 22,
      name: "Washing Brush 刷子",
      description: "Professional washing brush set for car detailing",
      price: 30.00,
      stock: 100,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/pighairplasticbrush.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/pighairplasticbrush.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/pighairbrush.jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/plasticbrush.jpg", is_primary: 0 }
      ],
      variants: [
        { color_name: "Pig Hair (猪毛)", stock: 50 },
        { color_name: "Plastic (塑料细节刷)", stock: 50 }
      ]
    },
    {
      id: 23,
      name: "Tear-Off Towel 毛巾卷",
      description: "Convenient tear-off towel roll for easy use",
      price: 20.00,
      stock: 160,
      category: "Towels",
      image_url: "https://autobath-backend.onrender.com/img/tearOffTowel.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/tearOffTowel.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/tearoff.jpg", is_primary: 0 }
      ],
      variants: [
        { color_name: "Grey", stock: 80 },
        { color_name: "Pink", stock: 80 }
      ]
    },
    {
      id: 24,
      name: "High Pressure Washer F4 高压清洗机",
      description: "Professional F4 high pressure washer for car cleaning",
      price: 450.00,
      stock: 10,
      category: "Equipment",
      image_url: "https://autobath-backend.onrender.com/img/panther-f4.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/panther-f4.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/panther-p4-1.jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/panther-p6.jpg", is_primary: 0 }
      ],
      variants: []
    },
    {
      id: 25,
      name: "High Pressure Washer P4 高压清洗机",
      description: "Advanced P4 high pressure washer with enhanced features",
      price: 550.00,
      stock: 8,
      category: "Equipment",
      image_url: "https://autobath-backend.onrender.com/img/panther-p4-1.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/panther-p4-1.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/panther-f4.jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/panther-p6.jpg", is_primary: 0 }
      ],
      variants: []
    },
    {
      id: 26,
      name: "High Pressure Washer P6 PRO 高压清洗机",
      description: "Professional P6 PRO high pressure washer for commercial use",
      price: 750.00,
      stock: 5,
      category: "Equipment",
      image_url: "https://autobath-backend.onrender.com/img/panther-p6.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/panther-p6.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/panther-f4.jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/panther-p4-1.jpg", is_primary: 0 }
      ],
      variants: []
    },
    {
      id: 27,
      name: "High Pressure Washer P6 PRO + Trolley (Bundle) 高压清洗机套装",
      description: "Complete P6 PRO washer with trolley bundle",
      price: 850.00,
      stock: 3,
      category: "Equipment",
      image_url: "https://autobath-backend.onrender.com/img/trolleybundle.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/trolleybundle.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 28,
      name: "Car Wash Brush Mop 伸缩拖把",
      description: "Extendable car wash brush mop for large areas",
      price: 65.00,
      stock: 15,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/carwashbrush1.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/carwashbrush1.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/carwashbrush2.jpg", is_primary: 0 },
        { url: "https://autobath-backend.onrender.com/img/carwashbrush3.jpg", is_primary: 0 }
      ],
      variants: []
    },
    {
      id: 29,
      name: "Detachable Brush Mop 可拆卸雪尼尔洗车刷",
      description: "Detachable chenille brush mop for versatile cleaning",
      price: 55.00,
      stock: 20,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/detachablebrush1.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/detachablebrush1.jpg", is_primary: 1 },
        { url: "https://autobath-backend.onrender.com/img/detachablebrush2.jpg", is_primary: 0 }
      ],
      variants: []
    },
    {
      id: 30,
      name: "Easy Super PA PRO 金属高压泡沫发生器PA壶",
      description: "Professional metal PA foam generator",
      price: 120.00,
      stock: 12,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/easyPA.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/easyPA.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 31,
      name: "Foamer - F15 暴雪气压",
      description: "F15 snow foam cannon for heavy foam generation",
      price: 75.00,
      stock: 18,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/foamerf15.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/foamerf15.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 32,
      name: "Snow Pro Foam Cannon 雪炮PA壶",
      description: "Professional snow foam cannon for maximum foam",
      price: 90.00,
      stock: 15,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/snowprofoamcannon.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/snowprofoamcannon.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 33,
      name: "Multi-functional Collapsible Box 多功能折叠收纳箱36L",
      description: "36L collapsible storage box for car detailing tools",
      price: 35.00,
      stock: 25,
      category: "Storage",
      image_url: "https://autobath-backend.onrender.com/img/collapsablebox.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/collapsablebox.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 34,
      name: "PA Bottle Separator PA药剂分瓶",
      description: "PA chemical separator bottle for organized storage",
      price: 25.00,
      stock: 30,
      category: "Tools",
      image_url: "https://autobath-backend.onrender.com/img/blizzardPApot.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/blizzardPApot.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 35,
      name: "Windstorm Vacuum-10L 雄风",
      description: "10L portable vacuum cleaner for car interior",
      price: 180.00,
      stock: 8,
      category: "Equipment",
      image_url: "https://autobath-backend.onrender.com/img/ws10.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/ws10.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 36,
      name: "Windstorm Vacuum-20L 雄风",
      description: "20L portable vacuum cleaner for car interior",
      price: 220.00,
      stock: 6,
      category: "Equipment",
      image_url: "https://autobath-backend.onrender.com/img/ws20.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/ws20.jpg", is_primary: 1 }
      ],
      variants: []
    },
    {
      id: 37,
      name: "Windstorm Vacuum-30L 雄风",
      description: "30L portable vacuum cleaner for car interior",
      price: 280.00,
      stock: 4,
      category: "Equipment",
      image_url: "https://autobath-backend.onrender.com/img/ws30.jpg",
      images: [
        { url: "https://autobath-backend.onrender.com/img/ws30.jpg", is_primary: 1 }
      ],
      variants: []
    }
  ]
};

db.serialize(() => {
  db.run('BEGIN TRANSACTION;');

  // 1. Clear existing product-related data
  console.log('🧹 Clearing existing product data...');
  db.run('DELETE FROM product_colors', (err) => {
    if (err) console.error('Error clearing variants:', err);
    else console.log('✅ Cleared variants');
  });
  
  db.run('DELETE FROM product_images', (err) => {
    if (err) console.error('Error clearing images:', err);
    else console.log('✅ Cleared images');
  });
  
  db.run('DELETE FROM products', (err) => {
    if (err) console.error('Error clearing products:', err);
    else console.log('✅ Cleared products');
  });

  // 2. Insert all products
  console.log('📦 Inserting products...');
  const productStmt = db.prepare(`
    INSERT INTO products (id, name, description, price, stock, category, image_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  completeLocalhostData.products.forEach(product => {
    productStmt.run(
      product.id,
      product.name,
      product.description,
      product.price,
      product.stock,
      product.category,
      product.image_url,
      (err) => {
        if (err) console.error(`Error inserting product ${product.id}:`, err.message);
        else console.log(`✅ Inserted product: ${product.name}`);
      }
    );
  });
  productStmt.finalize();

  // 3. Insert all images with proper ordering
  console.log('🖼️ Inserting images...');
  const imageStmt = db.prepare(`
    INSERT INTO product_images (product_id, image_url, is_primary, created_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `);

  completeLocalhostData.products.forEach(product => {
    product.images.forEach((image, index) => {
      imageStmt.run(
        product.id,
        image.url,
        image.is_primary,
        (err) => {
          if (err) console.error(`Error inserting image for product ${product.id}:`, err.message);
          else console.log(`✅ Inserted image ${index + 1} for ${product.name}`);
        }
      );
    });
  });
  imageStmt.finalize();

  // 4. Insert all variants
  console.log('🎨 Inserting variants...');
  const variantStmt = db.prepare(`
    INSERT INTO product_colors (product_id, color_name, stock, is_available, created_at)
    VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
  `);

  completeLocalhostData.products.forEach(product => {
    product.variants.forEach(variant => {
      variantStmt.run(
        product.id,
        variant.color_name,
        variant.stock,
        (err) => {
          if (err) console.error(`Error inserting variant for product ${product.id}:`, err.message);
          else console.log(`✅ Inserted variant ${variant.color_name} for ${product.name}`);
        }
      );
    });
  });
  variantStmt.finalize();

  db.run('COMMIT', (err) => {
    if (err) {
      console.error('❌ Commit error:', err);
      db.run('ROLLBACK');
    } else {
      console.log('🎉 Successfully synced live database with localhost data!');
      
      // Final verification
      setTimeout(() => {
        console.log('\n🔍 Final verification...');
        db.all('SELECT COUNT(*) as product_count FROM products', (err, result) => {
          if (err) console.error('Error:', err);
          else console.log(`📊 Total products: ${result[0].product_count}`);
          
          db.all('SELECT COUNT(*) as image_count FROM product_images', (err, result) => {
            if (err) console.error('Error:', err);
            else console.log(`📊 Total images: ${result[0].image_count}`);
            
            db.all('SELECT COUNT(*) as variant_count FROM product_colors', (err, result) => {
              if (err) console.error('Error:', err);
              else console.log(`📊 Total variants: ${result[0].variant_count}`);
              
              db.close();
            });
          });
        });
      }, 2000);
    }
  });
});
