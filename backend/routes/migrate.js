const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Database migration endpoint
router.post('/fix-database', async (req, res) => {
  try {
    console.log('🔧 Starting database migration...');
    
    // Drop and recreate tables with correct structure
    const tables = [
      {
        name: 'bookings',
        sql: `
          CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            service_name TEXT,
            date TEXT NOT NULL,
            time_slot TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            vehicle_type TEXT,
            service_type TEXT,
            package_id INTEGER,
            service_id INTEGER,
            duration_minutes INTEGER DEFAULT 60,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'products',
        sql: `
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image_url TEXT,
            category TEXT,
            brand TEXT,
            stock INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `
      }
    ];

    // Execute migrations
    for (const table of tables) {
      await new Promise((resolve, reject) => {
        db.run(table.sql, (err) => {
          if (err) {
            console.error(`Error creating ${table.name} table:`, err);
            reject(err);
          } else {
            console.log(`✅ ${table.name} table ready`);
            resolve();
          }
        });
      });
    }

    // Add sample products if products table is empty
    const productCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    if (productCount === 0) {
      console.log('📦 Adding sample products...');
      
      const sampleProducts = [
        {
          name: "Car Shampoo",
          description: "High-quality pH-neutral car shampoo for safe and effective cleaning",
          price: 24.99,
          category: "Cleaning",
          stock: 50,
          brand: "AUTOBATH"
        },
        {
          name: "Interior Cleaner",
          description: "Multi-surface interior cleaner for leather, plastic, and fabric",
          price: 18.99,
          category: "Interior",
          stock: 30,
          brand: "AUTOBATH"
        },
        {
          name: "Microfiber Towels",
          description: "Premium microfiber towels for streak-free drying and polishing",
          price: 12.99,
          category: "Accessories",
          stock: 25,
          brand: "AUTOBATH"
        },
        {
          name: "Ceramic Coating Kit",
          description: "Professional-grade ceramic coating for long-lasting protection",
          price: 89.99,
          category: "Protection",
          stock: 15,
          brand: "AUTOBATH"
        },
        {
          name: "Wax Polish",
          description: "Premium carnauba wax for deep shine and protection",
          price: 34.99,
          category: "Protection",
          stock: 20,
          brand: "AUTOBATH"
        },
        {
          name: "Tire Shine",
          description: "Long-lasting tire shine gel for a glossy finish",
          price: 14.99,
          category: "Accessories",
          stock: 35,
          brand: "AUTOBATH"
        }
      ];

      for (const product of sampleProducts) {
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO products (name, description, price, category, stock, brand, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `, [product.name, product.description, product.price, product.category, product.stock, product.brand], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      
      console.log(`✅ Added ${sampleProducts.length} sample products`);
    }

    console.log('🎉 Database migration completed successfully!');
    
    res.json({
      success: true,
      message: 'Database migration completed successfully',
      products_added: productCount === 0 ? 6 : 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database migration failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database migration failed',
      message: error.message
    });
  }
});

module.exports = router;
