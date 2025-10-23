/**
 * PRODUCTS ROUTE - HARDCODED PRODUCTS
 * 
 * This file contains all product data hardcoded in the hardcodedProducts array below.
 * To edit products:
 * 1. Find the product in the hardcodedProducts array (lines 16-584)
 * 2. Modify the product object directly (name, price, stock, description, etc.)
 * 3. Save the file and restart the backend server
 * 4. Changes will be immediately visible in the admin panel and frontend
 * 
 * Product structure:
 * - id: unique identifier
 * - name: product name (with Chinese translation)
 * - brand: manufacturer brand
 * - price: price in RM (use parsePrice() for string prices)
 * - stock: available quantity
 * - description: product description
 * - category: product category
 * - image_url: image URL (null if no image)
 * - sold: number sold (usually 0)
 * - colors: array of variants/colors (empty array if no variants)
 */

const express = require('express');
const router = express.Router();
// Helper function to get database connection
const getDatabase = () => {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const config = require('../config');
  
  const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
  return new sqlite3.Database(dbPath);
};
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Helper to parse RM price strings
function parsePrice(p) {
  if (typeof p === 'number') return p;
  if (!p) return 0;
  const cleaned = String(p).trim().toLowerCase().replace(/rm\s*/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

// Function to seed hardcoded products into database
function seedHardcodedProducts(db) {
  return new Promise((resolve, reject) => {
    console.log('🌱 Seeding hardcoded products into database...');
    
    // First, clear existing products to avoid duplicates
    db.run('DELETE FROM products', (err) => {
      if (err) {
        console.error('Error clearing products:', err);
        return reject(err);
      }
      
      // Insert hardcoded products
      const insertProductQuery = `
        INSERT INTO products (id, name, description, price, brand, stock, category, image_url, sold, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      const insertImageQuery = `
        INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `;
      
      const insertColorQuery = `
        INSERT INTO product_colors (product_id, color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      
      let completed = 0;
      const total = hardcodedProducts.length;
      
      hardcodedProducts.forEach(product => {
        // Insert product
        db.run(insertProductQuery, [
          product.id,
          product.name,
          product.description || null,
          product.price,
          product.brand,
          product.stock || 0,
          product.category || null,
          product.image_url || null,
          product.sold || 0
        ], function(err) {
          if (err) {
            console.error(`Error inserting product ${product.id}:`, err);
            completed++;
            if (completed === total) {
              resolve(); // Continue even if some products fail
            }
            return;
          }
          
          // Insert images if they exist
          if (product.images && product.images.length > 0) {
            product.images.forEach(image => {
              db.run(insertImageQuery, [
                product.id,
                image.image_url,
                image.alt_text || null,
                image.sort_order || 0,
                image.is_primary || 0
              ], (err) => {
                if (err) console.error(`Error inserting image for product ${product.id}:`, err);
              });
            });
          }
          
          // Insert colors if they exist
          if (product.colors && product.colors.length > 0) {
            product.colors.forEach(color => {
              db.run(insertColorQuery, [
                product.id,
                color.color_name,
                color.color_code || null,
                color.color_image_url || null,
                color.price_adjustment || 0,
                color.stock || 0,
                color.is_available !== undefined ? color.is_available : 1,
                color.sort_order || 0
              ], (err) => {
                if (err) console.error(`Error inserting color for product ${product.id}:`, err);
              });
            });
          }
          
          completed++;
          if (completed === total) {
            console.log(`✅ Seeded ${total} products into database`);
            resolve();
          }
        });
      });
    });
  });
}

// Hardcoded products data - edit this directly to modify products
const hardcodedProducts = [
  // An-Riddle Brand Products (10 products)
  { 
    id: 1,
    name: 'Metal Sprayer 原液壶', 
    brand: 'An-Riddle', 
    price: parsePrice('rm58'), 
    stock: 10, 
    description: 'Professional metal sprayer for car detailing',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: [],
    images: [
      {
        id: 1,
        product_id: 1,
        image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
        alt_text: null,
        sort_order: 0,
        is_primary: 1,
        created_at: '2025-10-23T08:00:00.000Z'
      }
    ]
  },
  { 
    id: 2,
    name: 'Washing Brush Tool Set (3pcs) 细节刷三件套', 
    brand: 'An-Riddle', 
    price: parsePrice('rm28'), 
    stock: 25, 
    description: 'Complete brush set for detailed cleaning',
    category: 'Tools',
    image_url: null,
    sold: 0,
    colors: []
  },
  { 
    id: 3,
    name: 'Washing Glove 纤维手套', 
    brand: 'An-Riddle', 
    price: parsePrice('rm16'), 
    stock: 50, 
    description: 'High-quality washing gloves',
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 4,
    name: 'Hand-Carry Box 手提工具篮', 
    brand: 'An-Riddle', 
    price: parsePrice('rm28'), 
    stock: 20, 
    description: 'Portable tool storage box',
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 5,
    name: 'Multi-functional Clip 脚垫夹', 
    brand: 'An-Riddle', 
    price: parsePrice('rm65'), 
    stock: 6, 
    description: 'Multi-purpose clip for car mats',
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 6,
    name: 'Multi-functional Detail Brush (5pcs) 细节刷五件套', 
    brand: 'An-Riddle', 
    price: parsePrice('rm20'), 
    stock: 52, 
    description: '5-piece detail brush set',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 7,
    name: 'PA Foam Separator PA壶', 
    brand: 'An-Riddle', 
    price: parsePrice('rm55'), 
    stock: 10, 
    description: 'PA foam separator for car washing',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 8,
    name: 'One Sided Towel 单面毛巾', 
    brand: 'An-Riddle', 
    price: parsePrice('rm18'), 
    stock: 50, 
    description: 'High-quality one-sided microfiber towel for car detailing',
    category: 'Towels',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: [
      { id: 1, product_id: 8, color_name: '40x40', color_code: null, color_image_url: null, price_adjustment: 0, stock: 50, is_available: 1, sort_order: 0, created_at: '2025-10-22 18:32:26' },
      { id: 2, product_id: 8, color_name: '60x80', color_code: null, color_image_url: null, price_adjustment: 11, stock: 25, is_available: 1, sort_order: 1, created_at: '2025-10-22 18:32:26' }
    ]
  },
  { 
    id: 9,
    name: 'Two Sided Towel 双面毛巾', 
    brand: 'An-Riddle', 
    price: parsePrice('rm29'), 
    stock: 80, 
    description: 'Premium two-sided microfiber towel for superior cleaning',
    category: 'Towels',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: [
      { id: 3, product_id: 9, color_name: '40x40', color_code: null, color_image_url: null, price_adjustment: 0, stock: 80, is_available: 1, sort_order: 0, created_at: '2025-10-22 18:32:26' },
      { id: 4, product_id: 9, color_name: '60x80', color_code: null, color_image_url: null, price_adjustment: 19, stock: 80, is_available: 1, sort_order: 1, created_at: '2025-10-22 18:32:26' }
    ]
  },
  { 
    id: 10,
    name: 'Microfiber Towel 超细纤维毛巾', 
    brand: 'An-Riddle', 
    price: parsePrice('rm9.9'), 
    stock: 30, 
    description: 'Soft microfiber towel for gentle cleaning and drying',
    category: 'Towels',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: [
      { id: 5, product_id: 10, color_name: '30x40', color_code: null, color_image_url: null, price_adjustment: 0, stock: 30, is_available: 1, sort_order: 0, created_at: '2025-10-22 18:32:26' },
      { id: 6, product_id: 10, color_name: '30x60', color_code: null, color_image_url: null, price_adjustment: 4.1, stock: 30, is_available: 1, sort_order: 1, created_at: '2025-10-22 18:32:26' }
    ]
  },
  
  // Autobath Brand Products (4 products)
  { 
    id: 11,
    name: 'Curve Holding Brush 鱼形毛刷', 
    brand: 'Autobath', 
    price: parsePrice('rm22'), 
    stock: 40, 
    description: 'Curved brush for hard-to-reach areas',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 12,
    name: 'Straight Holding Brush 方形毛刷', 
    brand: 'Autobath', 
    price: parsePrice('rm22'), 
    stock: 50, 
    description: 'Straight brush for general cleaning',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 13,
    name: 'Butter Knife 刮蜡刀', 
    brand: 'Autobath', 
    price: parsePrice('rm15'), 
    stock: 30, 
    description: 'Professional butter knife for wax removal',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 14,
    name: 'Squeeze Bottle with Measurement 250毫升分蜡瓶', 
    brand: 'Autobath', 
    price: parsePrice('rm9.9'), 
    stock: 50, 
    description: 'Measuring squeeze bottle for precise application',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  
  // Benzhi Brand Products (9 products)
  { 
    id: 15,
    name: 'Rim Brush 轮毂刷', 
    brand: 'Benzhi', 
    price: parsePrice('rm23.9'), 
    stock: 70, 
    description: 'Specialized brush for wheel rims',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 16,
    name: 'Tyre Brush 轮子刷', 
    brand: 'Benzhi', 
    price: parsePrice('rm18.8'), 
    stock: 50, 
    description: 'Brush designed for tire cleaning',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 17,
    name: 'JOYBOND Beauty Clay 去污剂蓝色200G', 
    brand: 'Benzhi', 
    price: parsePrice('rm65'), 
    stock: 30, 
    description: 'Professional beauty clay for paint decontamination',
    category: 'Detailing',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 18,
    name: 'AJIGE Cup Measurement PC透明量杯', 
    brand: 'Benzhi', 
    price: parsePrice('rm9.9'), 
    stock: 50, 
    description: 'Transparent measuring cup for accurate mixing',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 19,
    name: 'MJJC Foam Cannon 蓝白', 
    brand: 'Benzhi', 
    price: parsePrice('rm239'), 
    stock: 10, 
    description: 'High-quality foam cannon for car washing',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 20,
    name: 'MJJC V3 泡沫炮', 
    brand: 'Benzhi', 
    price: parsePrice('rm239'), 
    stock: 5, 
    description: 'Advanced foam cannon V3 model',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 21,
    name: 'Unicorn Brush 独角兽圣诞树轮毂刷', 
    brand: 'Benzhi', 
    price: parsePrice('rm39.9'), 
    stock: 100, 
    description: 'Large unicorn brush for wheel cleaning',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: [
      { id: 7, product_id: 21, color_name: 'Small', color_code: null, color_image_url: null, price_adjustment: 0, stock: 100, is_available: 1, sort_order: 0, created_at: '2025-10-22 18:32:26' },
      { id: 8, product_id: 21, color_name: 'Big', color_code: null, color_image_url: null, price_adjustment: 0, stock: 100, is_available: 1, sort_order: 1, created_at: '2025-10-22 18:32:26' }
    ]
  },
  { 
    id: 22,
    name: 'Washing Brush 刷子', 
    brand: 'Benzhi', 
    price: parsePrice('rm18'), 
    stock: 50, 
    description: 'Pig hair brush for gentle cleaning',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: [
      { id: 9, product_id: 22, color_name: 'Pig Hair (猪毛)', color_code: null, color_image_url: null, price_adjustment: 0, stock: 50, is_available: 1, sort_order: 0, created_at: '2025-10-22 18:32:26' },
      { id: 10, product_id: 22, color_name: 'Plastic (塑料细节刷)', color_code: null, color_image_url: null, price_adjustment: 0, stock: 50, is_available: 1, sort_order: 1, created_at: '2025-10-22 18:32:26' }
    ]
  },
  { 
    id: 23,
    name: 'Tear-Off Towel 毛巾卷', 
    brand: 'Benzhi', 
    price: parsePrice('rm28.8'), 
    stock: 80, 
    description: 'Tear-off towel for easy disposal',
    category: 'Towels',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: [
      { id: 11, product_id: 23, color_name: 'Pink', color_code: null, color_image_url: null, price_adjustment: 0, stock: 80, is_available: 1, sort_order: 0, created_at: '2025-10-22 18:32:26' },
      { id: 12, product_id: 23, color_name: 'Grey', color_code: null, color_image_url: null, price_adjustment: 0, stock: 80, is_available: 1, sort_order: 1, created_at: '2025-10-22 18:32:26' }
    ]
  },
  
  // Lutian Brand Products (22 products)
  { 
    id: 24,
    name: 'High Pressure Washer F4 高压清洗机', 
    brand: 'Lutian', 
    price: parsePrice('rm339'), 
    stock: 5, 
    description: 'High pressure washer F4 model',
    category: 'Equipment',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 25,
    name: 'High Pressure Washer P4 高压清洗机', 
    brand: 'Lutian', 
    price: parsePrice('rm399'), 
    stock: 5, 
    description: 'High pressure washer P4 model',
    category: 'Equipment',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 26,
    name: 'High Pressure Washer P6 PRO 高压清洗机', 
    brand: 'Lutian', 
    price: parsePrice('rm669'), 
    stock: 5, 
    description: 'High pressure washer P6 PRO',
    category: 'Equipment',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 27,
    name: 'High Pressure Washer P6 PRO + Trolley (Bundle) 高压清洗机套装', 
    brand: 'Lutian', 
    price: parsePrice('rm849'), 
    stock: 3, 
    description: 'P6PRO with trolley bundle',
    category: 'Equipment',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 28,
    name: 'Car Wash Brush Mop 伸缩拖把', 
    brand: 'Lutian', 
    price: parsePrice('rm58'), 
    stock: 10, 
    description: 'Telescopic brush mop for car washing',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 29,
    name: 'Detachable Brush Mop 可拆卸雪尼尔洗车刷', 
    brand: 'Lutian', 
    price: parsePrice('rm99.8'), 
    stock: 8, 
    description: 'Detachable chenille brush mop',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 30,
    name: 'Easy Super PA PRO 金属高压泡沫发生器PA壶', 
    brand: 'Lutian', 
    price: parsePrice('rm159'), 
    stock: 3, 
    description: 'Metal high-pressure foam generator',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 31,
    name: 'Foamer - F15 暴雪气压', 
    brand: 'Lutian', 
    price: parsePrice('rm89'), 
    stock: 8, 
    description: 'F15 foamer with blizzard pressure',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 32,
    name: 'Snow Pro Foam Cannon 雪炮PA壶', 
    brand: 'Lutian', 
    price: parsePrice('rm89'), 
    stock: 5, 
    description: 'Snow Pro foam cannon PA bottle',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 33,
    name: 'Multi-functional Collapsible Box 多功能折叠收纳箱36L', 
    brand: 'Lutian', 
    price: parsePrice('rm99'), 
    stock: 5, 
    description: '36L collapsible storage box',
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 34,
    name: 'PA Bottle Separator PA药剂分瓶', 
    brand: 'Lutian', 
    price: parsePrice('rm59'), 
    stock: 6, 
    description: 'PA bottle separator for chemicals',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 35,
    name: 'Windstorm Vacuum-10L 雄风', 
    brand: 'Lutian', 
    price: parsePrice('rm150'), 
    stock: 3, 
    description: '10L Windstorm vacuum cleaner',
    category: 'Equipment',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 36,
    name: 'Windstorm Vacuum-20L 雄风', 
    brand: 'Lutian', 
    price: parsePrice('rm269'), 
    stock: 3, 
    description: '20L Windstorm vacuum cleaner',
    category: 'Equipment',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 37,
    name: 'Windstorm Vacuum-30L 雄风', 
    brand: 'Lutian', 
    price: parsePrice('rm339'), 
    stock: 2, 
    description: '30L Windstorm vacuum cleaner',
    category: 'Equipment',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 38,
    name: 'Spatula 刮蜡刀', 
    brand: 'Lutian', 
    price: parsePrice('rm9.9'), 
    stock: 30, 
    description: 'Professional spatula for wax removal',
    category: 'Tools',
    image_url: null,
    sold: 0,
    colors: []
  },
  
  // Additional Products (7 products)
  { 
    id: 39,
    name: 'Squeeze Bottle 分蜡瓶', 
    brand: 'An-Riddle', 
    price: parsePrice('rm12'), 
    stock: 25, 
    description: 'Professional squeeze bottle for wax application',
    category: 'Tools',
    image_url: null,
    sold: 0,
    colors: []
  },
  { 
    id: 40,
    name: 'Detail Brush Set 细节刷套装', 
    brand: 'An-Riddle', 
    price: parsePrice('rm35'), 
    stock: 15, 
    description: 'Complete detail brush set for precision cleaning',
    category: 'Tools',
    image_url: 'https://images.unsplash.com/photo-1506905925346-3b390af30677?w=400&h=300&fit=crop',
    sold: 0,
    colors: []
  },
  { 
    id: 41,
    name: 'Wax Applicator Pad 上蜡垫', 
    brand: 'An-Riddle', 
    price: parsePrice('rm8'), 
    stock: 40, 
    description: 'Soft applicator pad for wax application',
    category: 'Tools',
    image_url: null,
    sold: 0,
    colors: []
  },
  { 
    id: 42,
    name: 'Microfiber Wash Mitt 洗车手套', 
    brand: 'An-Riddle', 
    price: parsePrice('rm15'), 
    stock: 30, 
    description: 'Microfiber wash mitt for gentle car washing',
    category: 'Tools',
    image_url: null,
    sold: 0,
    colors: []
  },
  { 
    id: 43,
    name: 'Tire Dressing Applicator 轮胎护理刷', 
    brand: 'Benzhi', 
    price: parsePrice('rm12'), 
    stock: 20, 
    description: 'Specialized applicator for tire dressing',
    category: 'Tools',
    image_url: null,
    sold: 0,
    colors: []
  },
  { 
    id: 44,
    name: 'Interior Detail Brush 内饰细节刷', 
    brand: 'Benzhi', 
    price: parsePrice('rm18'), 
    stock: 25, 
    description: 'Soft brush for interior detailing',
    category: 'Tools',
    image_url: null,
    sold: 0,
    colors: []
  },
  { 
    id: 45,
    name: 'Wheel Cleaner Brush 轮毂清洁刷', 
    brand: 'Benzhi', 
    price: parsePrice('rm22'), 
    stock: 15, 
    description: 'Heavy-duty brush for wheel cleaning',
    category: 'Tools',
    image_url: null,
    sold: 0,
    colors: []
  }
];

// Get all products
router.get('/', (req, res) => {
  const db = getDatabase();
  
  // Get products from database
  const getProductsQuery = `SELECT * FROM products ORDER BY id`;
  const getImagesQuery = `SELECT * FROM product_images ORDER BY product_id, sort_order`;
  
  db.all(getProductsQuery, [], (err, products) => {
    if (err) {
      console.error('Error fetching products from database:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch products'
      });
    }
    
        // If no products in database, use hardcoded products and seed them
        // Force deployment update - ensure external image URLs are used
        if (!products || products.length === 0) {
          console.log('📦 No products in database, using hardcoded products and seeding database...');
      
      // Seed hardcoded products into database
      seedHardcodedProducts(db)
        .then(() => {
          // Return hardcoded products immediately
          res.json({
            success: true,
            products: hardcodedProducts
          });
        })
        .catch(seedErr => {
          console.error('Error seeding products:', seedErr);
          // Still return hardcoded products even if seeding fails
          res.json({
            success: true,
            products: hardcodedProducts
          });
        });
      return;
    }
    
    // Get images for all products
    db.all(getImagesQuery, [], (err, images) => {
      if (err) {
        console.error('Error fetching images from database:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch product images'
        });
      }
      
      // Group images by product_id
      const imagesByProduct = {};
      images.forEach(image => {
        if (!imagesByProduct[image.product_id]) {
          imagesByProduct[image.product_id] = [];
        }
        imagesByProduct[image.product_id].push(image);
      });
      
      // Get colors for all products
      const getColorsQuery = `SELECT * FROM product_colors ORDER BY product_id, sort_order`;
      
      db.all(getColorsQuery, [], (err, colors) => {
        if (err) {
          console.error('Error fetching colors from database:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch product colors'
          });
        }
        
        // Group colors by product_id
        const colorsByProduct = {};
        colors.forEach(color => {
          if (!colorsByProduct[color.product_id]) {
            colorsByProduct[color.product_id] = [];
          }
          colorsByProduct[color.product_id].push(color);
        });
        
        // Combine products with their images and colors
        const productsWithImagesAndColors = products.map(product => {
          const productImages = imagesByProduct[product.id] || [];
          const productColors = colorsByProduct[product.id] || [];
          
          // If no images in database but has image_url, create a fallback
          if (productImages.length === 0 && product.image_url) {
            productImages.push({
              id: Date.now() + product.id,
              product_id: product.id,
              image_url: product.image_url,
              alt_text: null,
              sort_order: 0,
              is_primary: 1,
              created_at: new Date().toISOString()
            });
          }
          
          return {
            ...product,
            images: productImages,
            colors: productColors
          };
        });
        
        res.json({
          success: true,
          products: productsWithImagesAndColors
        });
      });
    });
  });
});

// Get all categories
router.get('/categories', (req, res) => {
  // Extract unique categories from hardcoded products
  const categories = [...new Set(hardcodedProducts.map(p => p.category).filter(Boolean))].sort();
  
  res.json({
    success: true,
    categories: categories.map(category => ({ name: category }))
  });
});

// Note: Database initialization routes removed - using hardcoded products

// Get product by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id);
  const db = getDatabase();

  // Get product from database
  const getProductQuery = `SELECT * FROM products WHERE id = ?`;
  const getImagesQuery = `SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order`;
  
  db.get(getProductQuery, [productId], (err, product) => {
    if (err) {
      console.error('Error fetching product from database:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch product'
      });
    }
    
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the given ID'
      });
    }
    
    // Get images and colors for this product
    const getColorsQuery = `SELECT * FROM product_colors WHERE product_id = ? ORDER BY sort_order`;
    
    db.all(getImagesQuery, [productId], (err, images) => {
      if (err) {
        console.error('Error fetching product images from database:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch product images'
        });
      }
      
      db.all(getColorsQuery, [productId], (err, colors) => {
        if (err) {
          console.error('Error fetching product colors from database:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch product colors'
          });
        }
        
        // If no images in database but has image_url, create a fallback
        if (images.length === 0 && product.image_url) {
          images.push({
            id: Date.now() + productId,
            product_id: productId,
            image_url: product.image_url,
            alt_text: null,
            sort_order: 0,
            is_primary: 1,
            created_at: new Date().toISOString()
          });
        }
        
        res.json({
          success: true,
          product: {
            ...product,
            images,
            colors: colors || []
          }
        });
      });
    });
  });
});

// Get products by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params;

  const products = hardcodedProducts.filter(p => p.category === category);

  res.json({
    success: true,
    products
  });
});

// Get all categories
router.get('/categories/list', (req, res) => {
  // Extract unique categories from hardcoded products
  const categories = [...new Set(hardcodedProducts.map(p => p.category).filter(Boolean))].sort();
  
  res.json({
    success: true,
    categories
  });
});

// Get all brands
router.get('/brands/list', (req, res) => {
  // Extract unique brands from hardcoded products
  const brands = [...new Set(hardcodedProducts.map(p => p.brand).filter(Boolean))].sort();
  
  res.json({
    success: true,
    brands
  });
});

// Create new product (admin endpoint)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, image_url, category, brand, stock } = req.body;

  console.log('📦 Creating new product:', { name, brand, price, stock, description });

  // Validate required fields
  if (!name || !brand) {
    console.error('❌ Validation failed - missing name or brand:', { name, brand });
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Name and brand are required'
    });
  }

  // Normalize price (optional; default 0)
  const normalizedPrice = (price === undefined || price === null || price === '') ? 0 : Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({
      error: 'Invalid price',
      message: 'Price must be a non-negative number'
    });
  }

  // Generate new ID
  const newId = Math.max(...hardcodedProducts.map(p => p.id)) + 1;

  // Save to database first
  const db = getDatabase();
  const insertProductQuery = `
    INSERT INTO products (name, description, price, brand, stock, category, image_url, sold)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(insertProductQuery, [
    name,
    description || null,
    normalizedPrice,
    brand,
    stock || 0,
    category || null,
    image_url || null,
    0
  ], function(err) {
    if (err) {
      console.error('❌ Error saving product to database:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to save product to database'
      });
    }
    
    // Update the product ID with the database ID
    const newProduct = {
      id: this.lastID,
      name,
      description: description || null,
      price: normalizedPrice,
      image_url: image_url || null,
      category: category || null,
      brand,
      stock: stock || 0,
      sold: 0,
      colors: []
    };

    // Add to memory array
    hardcodedProducts.push(newProduct);

    console.log('✅ Product created successfully with ID:', this.lastID);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: this.lastID
    });
  });
});

// Update product (admin endpoint)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category, brand, stock } = req.body;
  const productId = parseInt(id);

  const normalizedPrice = (price === undefined || price === null || price === '') ? 0 : Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({
      error: 'Invalid price',
      message: 'Price must be a non-negative number'
    });
  }

  const productIndex = hardcodedProducts.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({
      error: 'Product not found',
      message: 'No product found with the given ID'
    });
  }

  // Update in database first
  const db = getDatabase();
  const updateProductQuery = `
    UPDATE products 
    SET name = ?, description = ?, price = ?, image_url = ?, category = ?, brand = ?, stock = ?
    WHERE id = ?
  `;
  
  db.run(updateProductQuery, [
    name,
    description || null,
    normalizedPrice,
    image_url || null,
    category || null,
    brand,
    stock || 0,
    productId
  ], function(err) {
    if (err) {
      console.error('❌ Error updating product in database:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update product in database'
      });
    }
    
    // Update the product in the hardcoded array
    hardcodedProducts[productIndex] = {
      ...hardcodedProducts[productIndex],
      name,
      description: description || null,
      price: normalizedPrice,
      image_url: image_url || null,
      category: category || null,
      brand,
      stock: stock || 0
    };

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  });
});

// Delete product (admin endpoint)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id);

  // Delete from database first
  const db = getDatabase();
  const deleteProductQuery = `DELETE FROM products WHERE id = ?`;
  
  console.log('🗑️ Attempting to delete product ID:', productId);
  
  db.run(deleteProductQuery, [productId], function(err) {
    if (err) {
      console.error('❌ Error deleting product from database:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete product from database'
      });
    }
    
    console.log('🗑️ Delete query executed. Changes:', this.changes);
    
    if (this.changes === 0) {
      console.log('❌ No rows affected - product not found');
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the given ID'
      });
    }
    
    // Also delete associated images and colors
    const deleteImagesQuery = `DELETE FROM product_images WHERE product_id = ?`;
    const deleteColorsQuery = `DELETE FROM product_colors WHERE product_id = ?`;
    
    db.run(deleteImagesQuery, [productId], function(err) {
      if (err) {
        console.error('❌ Error deleting product images:', err);
      }
    });
    
    db.run(deleteColorsQuery, [productId], function(err) {
      if (err) {
        console.error('❌ Error deleting product colors:', err);
      }
    });
    
    // Remove the product from the hardcoded array if it exists
    const productIndex = hardcodedProducts.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      hardcodedProducts.splice(productIndex, 1);
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  });
});

// Add product image (admin endpoint)
router.post('/:id/images', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { image_url, alt_text, sort_order, is_primary } = req.body;
  const productId = parseInt(id);

  if (!image_url) {
    return res.status(400).json({
      success: false,
      message: 'Image URL is required'
    });
  }

  const productIndex = hardcodedProducts.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Create new image object
  const newImage = {
    id: Date.now() + Math.random(), // Generate unique ID
    product_id: productId,
    image_url,
    alt_text: alt_text || null,
    sort_order: sort_order || 0,
    is_primary: is_primary || 0,
    created_at: new Date().toISOString()
  };

  // Initialize images array if it doesn't exist
  if (!hardcodedProducts[productIndex].images) {
    hardcodedProducts[productIndex].images = [];
  }

  // If this is the first image or is_primary is true, set as primary
  if (hardcodedProducts[productIndex].images.length === 0 || is_primary) {
    // Remove primary status from other images
    hardcodedProducts[productIndex].images.forEach(img => {
      img.is_primary = 0;
    });
    newImage.is_primary = 1;
    
    // Also update the main image_url field for backward compatibility
    hardcodedProducts[productIndex].image_url = image_url;
  }

  // Add the new image to the images array
  hardcodedProducts[productIndex].images.push(newImage);

  // Save to database
  const db = getDatabase();
  const insertImageQuery = `
    INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(insertImageQuery, [
    productId,
    image_url,
    alt_text || null,
    sort_order || 0,
    is_primary || 0,
    new Date().toISOString()
  ], function(err) {
    if (err) {
      console.error('Error saving image to database:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to save image to database'
      });
    }
    
    // Update the image ID with the database ID
    newImage.id = this.lastID;
    
    // If this is a primary image, update the products table image_url field
    if (is_primary || newImage.is_primary) {
      const updateProductQuery = `UPDATE products SET image_url = ? WHERE id = ?`;
      db.run(updateProductQuery, [image_url, productId], function(err) {
        if (err) {
          console.error('Error updating product image_url:', err);
        } else {
          console.log('✅ Updated product image_url in database');
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Image added successfully',
      imageId: newImage.id
    });
  });
});

// Delete product image (admin endpoint)
router.delete('/images/:imageId', authenticateToken, requireAdmin, (req, res) => {
  const { imageId } = req.params;
  const { productId } = req.query;
  
  console.log('Delete image request:', { imageId, productId });
  
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  const productIndex = hardcodedProducts.findIndex(p => p.id === parseInt(productId));
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  console.log('Product found at index:', productIndex);
  console.log('Product images:', hardcodedProducts[productIndex].images);

  // Find and remove the image from the images array
  if (hardcodedProducts[productIndex].images) {
    const imageIndex = hardcodedProducts[productIndex].images.findIndex(img => img.id === parseInt(imageId));
    
    console.log('Image index found:', imageIndex);
    
    if (imageIndex !== -1) {
      const deletedImage = hardcodedProducts[productIndex].images[imageIndex];
      
      // Remove the image from memory
      hardcodedProducts[productIndex].images.splice(imageIndex, 1);
      
      // Delete from database
      const db = getDatabase();
      const deleteImageQuery = `DELETE FROM product_images WHERE id = ?`;
      
      db.run(deleteImageQuery, [imageId], function(err) {
        if (err) {
          console.error('Error deleting image from database:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to delete image from database'
          });
        }
        
        // If the deleted image was primary, set the first remaining image as primary
        if (deletedImage.is_primary && hardcodedProducts[productIndex].images.length > 0) {
          hardcodedProducts[productIndex].images[0].is_primary = 1;
          hardcodedProducts[productIndex].image_url = hardcodedProducts[productIndex].images[0].image_url;
          
          // Update primary status in database
          const updatePrimaryQuery = `UPDATE product_images SET is_primary = 1 WHERE id = ?`;
          db.run(updatePrimaryQuery, [hardcodedProducts[productIndex].images[0].id]);
        } else if (hardcodedProducts[productIndex].images.length === 0) {
          // No images left, clear the main image_url
          hardcodedProducts[productIndex].image_url = null;
        }
        
        console.log('Image deleted successfully. Remaining images:', hardcodedProducts[productIndex].images.length);
        
        res.json({
          success: true,
          message: 'Image deleted successfully'
        });
      });
    } else {
      console.log('Image not found in array');
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  } else {
    console.log('No images array found');
    res.status(404).json({
      success: false,
      message: 'No images found for this product'
    });
  }
});


// Update product color/variant (admin endpoint)
router.put('/colors/:colorId', authenticateToken, requireAdmin, (req, res) => {
  const { colorId } = req.params;
  const { color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order } = req.body;
  const colorIdNum = parseInt(colorId);

  // Find the product and color
  let found = false;
  for (let product of hardcodedProducts) {
    if (product.colors) {
      const colorIndex = product.colors.findIndex(c => c.id === colorIdNum);
      if (colorIndex !== -1) {
        // Update the color
        product.colors[colorIndex] = {
          ...product.colors[colorIndex],
          color_name,
          color_code,
          color_image_url,
          price_adjustment,
          stock,
          is_available,
          sort_order
        };
        found = true;
        break;
      }
    }
  }

  if (!found) {
    return res.status(404).json({
      success: false,
      message: 'Color not found'
    });
  }

  res.json({
    success: true,
    message: 'Color updated successfully'
  });
});

// Delete product color/variant (admin endpoint)
router.delete('/colors/:colorId', authenticateToken, requireAdmin, (req, res) => {
  const { colorId } = req.params;
  const colorIdNum = parseInt(colorId);

  // Find and remove the color
  let found = false;
  for (let product of hardcodedProducts) {
    if (product.colors) {
      const colorIndex = product.colors.findIndex(c => c.id === colorIdNum);
      if (colorIndex !== -1) {
        product.colors.splice(colorIndex, 1);
        found = true;
        break;
      }
    }
  }

  if (!found) {
    return res.status(404).json({
      success: false,
      message: 'Color not found'
    });
  }

  res.json({
    success: true,
    message: 'Color deleted successfully'
  });
});

// Add product variant (color)
router.post('/:id/colors', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order } = req.body;
  const productId = parseInt(id);

  if (!color_name) {
    return res.status(400).json({ success: false, message: 'Color name is required' });
  }

  const db = getDatabase();
  const insertColorQuery = `
    INSERT INTO product_colors (product_id, color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(insertColorQuery, [
    productId, color_name, color_code || null, color_image_url || null, 
    price_adjustment || 0, stock || 0, is_available ? 1 : 0, sort_order || 0, 
    new Date().toISOString()
  ], function(err) {
    if (err) {
      console.error('Error adding variant to database:', err);
      return res.status(500).json({ success: false, message: 'Failed to add variant to database' });
    }
    
    res.json({ success: true, message: 'Variant added successfully', variantId: this.lastID });
  });
});

// Delete product variant (color)
router.delete('/:id/colors/:colorId', authenticateToken, requireAdmin, (req, res) => {
  const { id, colorId } = req.params;
  const productId = parseInt(id);
  const variantId = parseInt(colorId);

  const db = getDatabase();
  const deleteColorQuery = `DELETE FROM product_colors WHERE id = ? AND product_id = ?`;
  
  db.run(deleteColorQuery, [variantId, productId], function(err) {
    if (err) {
      console.error('Error deleting variant from database:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete variant from database' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }
    
    res.json({ success: true, message: 'Variant deleted successfully' });
  });
});

// Note: All routes now work with hardcoded products
// To edit products, modify the hardcodedProducts array above

module.exports = { router, hardcodedProducts };
