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

console.log('🔄 Restoring complete live data from localhost...');

// Clear existing data
const clearExistingData = () => {
  return new Promise((resolve, reject) => {
    console.log('1. Clearing existing data...');
    
    const clearQueries = [
      'DELETE FROM product_colors',
      'DELETE FROM product_images',
      'DELETE FROM products'
    ];

    let completed = 0;
    clearQueries.forEach((query, index) => {
      db.run(query, (err) => {
        if (err) {
          console.error(`Error clearing ${query}:`, err.message);
          reject(err);
          return;
        }
        completed++;
        console.log(`✅ Cleared ${query.split(' ')[2]}`);
        
        if (completed === clearQueries.length) {
          console.log('✅ All existing data cleared');
          resolve();
        }
      });
    });
  });
};

// Insert products with full data
const insertCompleteProducts = () => {
  return new Promise((resolve, reject) => {
    console.log('2. Inserting complete products with images and variants...');
    
    const products = [
      {
        id: 1,
        name: 'Metal Sprayer 原液壶',
        description: 'Professional metal sprayer for car detailing',
        price: 58.00,
        image_url: 'https://api.autobath.co/img/metalsprayer1.jpg',
        category: 'Tools',
        brand: 'An-Riddle',
        stock: 10,
        images: [
          { image_url: 'https://api.autobath.co/img/metalsprayer1.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/metalsprayer2.jpg', alt_text: null, sort_order: 1, is_primary: 0 }
        ],
        colors: []
      },
      {
        id: 2,
        name: 'Washing Brush Tool Set (3pcs) 细节刷三件套',
        description: 'Complete brush set for detailed cleaning',
        price: 28.00,
        image_url: 'https://api.autobath.co/img/washingbrushset3pcs.jpg',
        category: 'Tools',
        brand: 'An-Riddle',
        stock: 25,
        images: [
          { image_url: 'https://api.autobath.co/img/washingbrushset3pcs.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 3,
        name: 'Washing Glove 纤维手套',
        description: 'High-quality washing gloves',
        price: 16.00,
        image_url: 'https://api.autobath.co/img/glovewasherBlackWhite.jpg',
        category: 'Accessories',
        brand: 'An-Riddle',
        stock: 50,
        images: [
          { image_url: 'https://api.autobath.co/img/glovewasherBlackWhite.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/glovewasherBlue.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/glovewasherRed.jpg', alt_text: null, sort_order: 2, is_primary: 0 }
        ],
        colors: []
      },
      {
        id: 4,
        name: 'Hand-Carry Box 手提工具篮',
        description: 'Portable tool storage box',
        price: 28.00,
        image_url: 'https://api.autobath.co/img/handcarrybox.jpg',
        category: 'Accessories',
        brand: 'An-Riddle',
        stock: 20,
        images: [
          { image_url: 'https://api.autobath.co/img/handcarrybox.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 5,
        name: 'Multi-functional Clip 脚垫夹',
        description: 'Multi-purpose clip for car mats',
        price: 65.00,
        image_url: 'https://api.autobath.co/img/clip.jpg',
        category: 'Accessories',
        brand: 'An-Riddle',
        stock: 6,
        images: [
          { image_url: 'https://api.autobath.co/img/clip.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 6,
        name: 'Multi-functional Detail Brush (5pcs) 细节刷五件套',
        description: '5-piece detail brush set',
        price: 20.00,
        image_url: 'https://api.autobath.co/img/brushset5pc1.jpg',
        category: 'Tools',
        brand: 'An-Riddle',
        stock: 52,
        images: [
          { image_url: 'https://api.autobath.co/img/brushset5pc1.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/brushset5pc2.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/washingbrushset3pcs.jpg', alt_text: null, sort_order: 2, is_primary: 0 }
        ],
        colors: []
      },
      {
        id: 7,
        name: 'PA Foam Separator PA壶',
        description: 'PA foam separator for car washing',
        price: 55.00,
        image_url: 'https://api.autobath.co/img/simplepapot.jpg',
        category: 'Tools',
        brand: 'An-Riddle',
        stock: 10,
        images: [
          { image_url: 'https://api.autobath.co/img/simplepapot.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 8,
        name: 'One Sided Towel 单面毛巾',
        description: 'High-quality one-sided microfiber towel for car detailing',
        price: 18.00,
        image_url: 'https://api.autobath.co/img/onesided40x40(1).jpg',
        category: 'Towels',
        brand: 'An-Riddle',
        stock: 50,
        images: [
          { image_url: 'https://api.autobath.co/img/onesided40x40(1).jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/onesided60x80(1).jpg', alt_text: null, sort_order: 1, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/onesided60x80(2).jpg', alt_text: null, sort_order: 2, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/onesided40x40(2).jpg', alt_text: null, sort_order: 3, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/onesided60x80(1).jpg', alt_text: null, sort_order: 4, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/onesided60x80(2).jpg', alt_text: null, sort_order: 5, is_primary: 0 }
        ],
        colors: [
          { color_name: '40x40', color_code: null, color_image_url: null, price_adjustment: 0, stock: 50, is_available: 1, sort_order: 0 },
          { color_name: '60x80', color_code: null, color_image_url: null, price_adjustment: 11, stock: 25, is_available: 1, sort_order: 1 }
        ]
      },
      {
        id: 9,
        name: 'Two Sided Towel 双面毛巾',
        description: 'Premium two-sided microfiber towel for superior cleaning',
        price: 29.00,
        image_url: 'https://api.autobath.co/img/twosided40x40.jpg',
        category: 'Towels',
        brand: 'An-Riddle',
        stock: 80,
        images: [
          { image_url: 'https://api.autobath.co/img/twosided40x40.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/twosided40x40(2).jpg', alt_text: null, sort_order: 1, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/twosided60x80(1).jpg', alt_text: null, sort_order: 2, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/twosided60x80(2).jpg', alt_text: null, sort_order: 3, is_primary: 0 }
        ],
        colors: [
          { color_name: '40x40', color_code: null, color_image_url: null, price_adjustment: 0, stock: 80, is_available: 1, sort_order: 0 },
          { color_name: '60x80', color_code: null, color_image_url: null, price_adjustment: 19, stock: 80, is_available: 1, sort_order: 1 }
        ]
      },
      {
        id: 10,
        name: 'Microfiber Towel 超细纤维毛巾',
        description: 'Soft microfiber towel for gentle cleaning and drying',
        price: 9.90,
        image_url: 'https://api.autobath.co/img/microfiber30x40(1).jpg',
        category: 'Towels',
        brand: 'An-Riddle',
        stock: 30,
        images: [
          { image_url: 'https://api.autobath.co/img/microfiber30x40(1).jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/microfiber30x40(2).jpg', alt_text: null, sort_order: 1, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/microfiber30x60.jpg', alt_text: null, sort_order: 2, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/microfiber40x60.jpg', alt_text: null, sort_order: 3, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/microfiber40x60(2).jpg', alt_text: null, sort_order: 4, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/microfiber60x80.jpg', alt_text: null, sort_order: 5, is_primary: 0 }
        ],
        colors: [
          { color_name: '30x40', color_code: null, color_image_url: null, price_adjustment: 0, stock: 30, is_available: 1, sort_order: 0 },
          { color_name: '30x60', color_code: null, color_image_url: null, price_adjustment: 4.1, stock: 30, is_available: 1, sort_order: 1 }
        ]
      },
      {
        id: 11,
        name: 'Curve Holding Brush 鱼形毛刷',
        description: 'Curved brush for hard-to-reach areas',
        price: 22.00,
        image_url: 'https://api.autobath.co/img/curvebrush.jpg',
        category: 'Tools',
        brand: 'Autobath',
        stock: 40,
        images: [
          { image_url: 'https://api.autobath.co/img/curvebrush.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 12,
        name: 'Straight Holding Brush 方形毛刷',
        description: 'Straight brush for general cleaning',
        price: 22.00,
        image_url: 'https://api.autobath.co/img/straightbrush.jpg',
        category: 'Tools',
        brand: 'Autobath',
        stock: 50,
        images: [
          { image_url: 'https://api.autobath.co/img/straightbrush.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 13,
        name: 'Butter Knife 刮蜡刀',
        description: 'Professional butter knife for wax removal',
        price: 15.00,
        image_url: 'https://api.autobath.co/img/spatula.jpg',
        category: 'Tools',
        brand: 'Autobath',
        stock: 30,
        images: [
          { image_url: 'https://api.autobath.co/img/spatula.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 14,
        name: 'Squeeze Bottle with Measurement 250毫升分蜡瓶',
        description: 'Measuring squeeze bottle for precise application',
        price: 9.90,
        image_url: 'https://api.autobath.co/img/squeezebottle.jpg',
        category: 'Tools',
        brand: 'Autobath',
        stock: 50,
        images: [
          { image_url: 'https://api.autobath.co/img/squeezebottle.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 15,
        name: 'Rim Brush 轮毂刷',
        description: 'Specialized brush for wheel rims',
        price: 23.90,
        image_url: 'https://api.autobath.co/img/rimbrush.jpg',
        category: 'Tools',
        brand: 'Benzhi',
        stock: 70,
        images: [
          { image_url: 'https://api.autobath.co/img/rimbrush.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 16,
        name: 'Tyre Brush 轮子刷',
        description: 'Brush designed for tire cleaning',
        price: 18.80,
        image_url: 'https://api.autobath.co/img/smallbrush.jpg',
        category: 'Tools',
        brand: 'Benzhi',
        stock: 50,
        images: [
          { image_url: 'https://api.autobath.co/img/smallbrush.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 17,
        name: 'JOYBOND Beauty Clay 去污剂蓝色200G',
        description: 'Professional beauty clay for paint decontamination',
        price: 65.00,
        image_url: 'https://api.autobath.co/img/beautyclay.jpg',
        category: 'Detailing',
        brand: 'Benzhi',
        stock: 30,
        images: [
          { image_url: 'https://api.autobath.co/img/beautyclay.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 18,
        name: 'AJIGE Cup Measurement PC透明量杯',
        description: 'Transparent measuring cup for accurate mixing',
        price: 9.90,
        image_url: 'https://api.autobath.co/img/cupmeasurement.jpg',
        category: 'Tools',
        brand: 'Benzhi',
        stock: 50,
        images: [
          { image_url: 'https://api.autobath.co/img/cupmeasurement.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 19,
        name: 'MJJC Foam Cannon 蓝白',
        description: 'High-quality foam cannon for car washing',
        price: 239.00,
        image_url: 'https://api.autobath.co/img/mjjcfoamcannon.jpg',
        category: 'Tools',
        brand: 'Benzhi',
        stock: 10,
        images: [
          { image_url: 'https://api.autobath.co/img/mjjcfoamcannon.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 20,
        name: 'MJJC V3 泡沫炮',
        description: 'Advanced foam cannon V3 model',
        price: 239.00,
        image_url: 'https://api.autobath.co/img/mjjcv3.jpg',
        category: 'Tools',
        brand: 'Benzhi',
        stock: 5,
        images: [
          { image_url: 'https://api.autobath.co/img/mjjcv3.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 21,
        name: 'Unicorn Brush 独角兽圣诞树轮毂刷',
        description: 'Large unicorn brush for wheel cleaning',
        price: 39.90,
        image_url: 'https://api.autobath.co/img/smallunicorn.jpg',
        category: 'Tools',
        brand: 'Benzhi',
        stock: 100,
        images: [
          { image_url: 'https://api.autobath.co/img/smallunicorn.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/largeunicorn.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/smallunicorn1.jpg', alt_text: null, sort_order: 2, is_primary: 0 }
        ],
        colors: [
          { color_name: 'Small', color_code: null, color_image_url: null, price_adjustment: 0, stock: 100, is_available: 1, sort_order: 0 },
          { color_name: 'Big', color_code: null, color_image_url: null, price_adjustment: 0, stock: 100, is_available: 1, sort_order: 1 }
        ]
      },
      {
        id: 22,
        name: 'Washing Brush 刷子',
        description: 'Pig hair brush for gentle cleaning',
        price: 18.00,
        image_url: 'https://api.autobath.co/img/plasticbrush.jpg',
        category: 'Tools',
        brand: 'Benzhi',
        stock: 50,
        images: [
          { image_url: 'https://api.autobath.co/img/plasticbrush.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/pighairbrush.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/plasticbrush.jpg', alt_text: null, sort_order: 2, is_primary: 0 }
        ],
        colors: [
          { color_name: 'Pig Hair (猪毛)', color_code: null, color_image_url: null, price_adjustment: 0, stock: 50, is_available: 1, sort_order: 0 },
          { color_name: 'Plastic (塑料细节刷)', color_code: null, color_image_url: null, price_adjustment: 0, stock: 50, is_available: 1, sort_order: 1 }
        ]
      },
      {
        id: 23,
        name: 'Tear-Off Towel 毛巾卷',
        description: 'Tear-off towel for easy disposal',
        price: 28.80,
        image_url: 'https://api.autobath.co/img/tearOffTowel.jpg',
        category: 'Towels',
        brand: 'Benzhi',
        stock: 80,
        images: [
          { image_url: 'https://api.autobath.co/img/tearOffTowel.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/tearoff.jpg', alt_text: null, sort_order: 1, is_primary: 0 }
        ],
        colors: [
          { color_name: 'Pink', color_code: null, color_image_url: null, price_adjustment: 0, stock: 80, is_available: 1, sort_order: 0 },
          { color_name: 'Grey', color_code: null, color_image_url: null, price_adjustment: 0, stock: 80, is_available: 1, sort_order: 1 }
        ]
      },
      {
        id: 24,
        name: 'High Pressure Washer F4 高压清洗机',
        description: 'High pressure washer F4 model',
        price: 339.00,
        image_url: 'https://api.autobath.co/img/panther-f4.jpg',
        category: 'Equipment',
        brand: 'Lutian',
        stock: 5,
        images: [
          { image_url: 'https://api.autobath.co/img/panther-f4.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/panther-p4-1.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/panther-p6.jpg', alt_text: null, sort_order: 2, is_primary: 0 }
        ],
        colors: []
      },
      {
        id: 25,
        name: 'High Pressure Washer P4 高压清洗机',
        description: 'High pressure washer P4 model',
        price: 399.00,
        image_url: 'https://api.autobath.co/img/panther-p4-1.jpg',
        category: 'Equipment',
        brand: 'Lutian',
        stock: 5,
        images: [
          { image_url: 'https://api.autobath.co/img/panther-p4-1.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/panther-f4.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/panther-p6.jpg', alt_text: null, sort_order: 2, is_primary: 0 }
        ],
        colors: []
      },
      {
        id: 26,
        name: 'High Pressure Washer P6 PRO 高压清洗机',
        description: 'High pressure washer P6 PRO',
        price: 669.00,
        image_url: 'https://api.autobath.co/img/panther-p6.jpg',
        category: 'Equipment',
        brand: 'Lutian',
        stock: 5,
        images: [
          { image_url: 'https://api.autobath.co/img/panther-p6.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/panther-f4.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/panther-p4-1.jpg', alt_text: null, sort_order: 2, is_primary: 0 }
        ],
        colors: []
      },
      {
        id: 27,
        name: 'High Pressure Washer P6 PRO + Trolley (Bundle) 高压清洗机套装',
        description: 'P6PRO with trolley bundle',
        price: 849.00,
        image_url: 'https://api.autobath.co/img/trolleybundle.jpg',
        category: 'Equipment',
        brand: 'Lutian',
        stock: 3,
        images: [
          { image_url: 'https://api.autobath.co/img/trolleybundle.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 28,
        name: 'Car Wash Brush Mop 伸缩拖把',
        description: 'Telescopic brush mop for car washing',
        price: 58.00,
        image_url: 'https://api.autobath.co/img/carwashbrush1.jpg',
        category: 'Tools',
        brand: 'Lutian',
        stock: 10,
        images: [
          { image_url: 'https://api.autobath.co/img/carwashbrush1.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/carwashbrush2.jpg', alt_text: null, sort_order: 1, is_primary: 0 },
          { image_url: 'https://api.autobath.co/img/carwashbrush3.jpg', alt_text: null, sort_order: 2, is_primary: 0 }
        ],
        colors: []
      },
      {
        id: 29,
        name: 'Detachable Brush Mop 可拆卸雪尼尔洗车刷',
        description: 'Detachable chenille brush mop',
        price: 99.80,
        image_url: 'https://api.autobath.co/img/detachablebrush1.jpg',
        category: 'Tools',
        brand: 'Lutian',
        stock: 8,
        images: [
          { image_url: 'https://api.autobath.co/img/detachablebrush1.jpg', alt_text: null, sort_order: 0, is_primary: 1 },
          { image_url: 'https://api.autobath.co/img/detachablebrush2.jpg', alt_text: null, sort_order: 1, is_primary: 0 }
        ],
        colors: []
      },
      {
        id: 30,
        name: 'Easy Super PA PRO 金属高压泡沫发生器PA壶',
        description: 'Metal high-pressure foam generator',
        price: 159.00,
        image_url: 'https://api.autobath.co/img/easyPA.jpg',
        category: 'Tools',
        brand: 'Lutian',
        stock: 3,
        images: [
          { image_url: 'https://api.autobath.co/img/easyPA.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 31,
        name: 'Foamer - F15 暴雪气压',
        description: 'F15 foamer with blizzard pressure',
        price: 89.00,
        image_url: 'https://api.autobath.co/img/foamerf15.jpg',
        category: 'Tools',
        brand: 'Lutian',
        stock: 8,
        images: [
          { image_url: 'https://api.autobath.co/img/foamerf15.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 32,
        name: 'Snow Pro Foam Cannon 雪炮PA壶',
        description: 'Snow Pro foam cannon PA bottle',
        price: 89.00,
        image_url: 'https://api.autobath.co/img/snowprofoamcannon.jpg',
        category: 'Tools',
        brand: 'Lutian',
        stock: 5,
        images: [
          { image_url: 'https://api.autobath.co/img/snowprofoamcannon.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 33,
        name: 'Multi-functional Collapsible Box 多功能折叠收纳箱36L',
        description: '36L collapsible storage box',
        price: 99.00,
        image_url: 'https://api.autobath.co/img/collapsablebox.jpg',
        category: 'Accessories',
        brand: 'Lutian',
        stock: 5,
        images: [
          { image_url: 'https://api.autobath.co/img/collapsablebox.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 34,
        name: 'PA Bottle Separator PA药剂分瓶',
        description: 'PA bottle separator for chemicals',
        price: 59.00,
        image_url: 'https://api.autobath.co/img/blizzardPApot.jpg',
        category: 'Tools',
        brand: 'Lutian',
        stock: 6,
        images: [
          { image_url: 'https://api.autobath.co/img/blizzardPApot.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 35,
        name: 'Windstorm Vacuum-10L 雄风',
        description: '10L Windstorm vacuum cleaner',
        price: 150.00,
        image_url: 'https://api.autobath.co/img/ws10.jpg',
        category: 'Equipment',
        brand: 'Lutian',
        stock: 3,
        images: [
          { image_url: 'https://api.autobath.co/img/ws10.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 36,
        name: 'Windstorm Vacuum-20L 雄风',
        description: '20L Windstorm vacuum cleaner',
        price: 269.00,
        image_url: 'https://api.autobath.co/img/ws20.jpg',
        category: 'Equipment',
        brand: 'Lutian',
        stock: 3,
        images: [
          { image_url: 'https://api.autobath.co/img/ws20.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      },
      {
        id: 37,
        name: 'Windstorm Vacuum-30L 雄风',
        description: '30L Windstorm vacuum cleaner',
        price: 339.00,
        image_url: 'https://api.autobath.co/img/ws30.jpg',
        category: 'Equipment',
        brand: 'Lutian',
        stock: 2,
        images: [
          { image_url: 'https://api.autobath.co/img/ws30.jpg', alt_text: null, sort_order: 0, is_primary: 1 }
        ],
        colors: []
      }
    ];

    // Insert products
    const productStmt = db.prepare(`
      INSERT INTO products (id, name, description, price, image_url, category, brand, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert product images
    const imageStmt = db.prepare(`
      INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Insert product colors
    const colorStmt = db.prepare(`
      INSERT INTO product_colors (product_id, color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let completed = 0;
    products.forEach((product, index) => {
      // Insert product
      productStmt.run(product.id, product.name, product.description, product.price, product.image_url, product.category, product.brand, product.stock, (err) => {
        if (err) {
          console.error(`Error inserting product ${product.name}:`, err.message);
          return;
        }
        
        console.log(`✅ Product ${index + 1}/37: ${product.name}`);
        
        // Insert images
        product.images.forEach((image, imgIndex) => {
          imageStmt.run(product.id, image.image_url, image.alt_text, image.sort_order, image.is_primary, (err) => {
            if (err) {
              console.error(`Error inserting image for ${product.name}:`, err.message);
            }
          });
        });
        
        // Insert colors
        product.colors.forEach((color, colorIndex) => {
          colorStmt.run(product.id, color.color_name, color.color_code, color.color_image_url, color.price_adjustment, color.stock, color.is_available, color.sort_order, (err) => {
            if (err) {
              console.error(`Error inserting color for ${product.name}:`, err.message);
            }
          });
        });
        
        completed++;
        if (completed === products.length) {
          productStmt.finalize();
          imageStmt.finalize();
          colorStmt.finalize();
          console.log('✅ All products, images, and variants inserted');
          resolve();
        }
      });
    });
  });
};

// Verify the results
const verifyResults = () => {
  return new Promise((resolve, reject) => {
    console.log('3. Verifying results...');
    
    db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
      if (err) {
        console.error('Error checking products count:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ Total products: ${result.count}`);
      
      db.get('SELECT COUNT(*) as count FROM product_images', (err, result2) => {
        if (err) {
          console.error('Error checking images count:', err.message);
          reject(err);
          return;
        }
        
        console.log(`✅ Total product images: ${result2.count}`);
        
        db.get('SELECT COUNT(*) as count FROM product_colors', (err, result3) => {
          if (err) {
            console.error('Error checking colors count:', err.message);
            reject(err);
            return;
          }
          
          console.log(`✅ Total product variants: ${result3.count}`);
          
          // Show sample with variants
          db.all('SELECT p.name, COUNT(pc.id) as variant_count FROM products p LEFT JOIN product_colors pc ON p.id = pc.product_id GROUP BY p.id HAVING variant_count > 0 LIMIT 3', (err, rows) => {
            if (err) {
              console.error('Error fetching sample data:', err.message);
              reject(err);
              return;
            }
            
            console.log('\n📦 Sample products with variants:');
            rows.forEach(row => {
              console.log(`  • ${row.name}: ${row.variant_count} variants`);
            });
            
            resolve();
          });
        });
      });
    });
  });
};

// Main execution
const main = async () => {
  try {
    await clearExistingData();
    await insertCompleteProducts();
    await verifyResults();
    
    console.log('\n🎉 Complete live data restoration successful!');
    console.log('✅ All products with images and variants restored');
    console.log('🚀 Live website should now match localhost exactly');
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\nDatabase connection closed');
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error during complete restoration:', error);
    process.exit(1);
  }
};

main();
