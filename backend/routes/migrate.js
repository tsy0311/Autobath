const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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

// Create admin user endpoint
router.post('/create-admin', async (req, res) => {
  try {
    console.log('👤 Creating admin user...');
    
    // Create admin_users table first
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT,
          is_active BOOLEAN DEFAULT 1,
          last_login DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating admin_users table:', err);
          reject(err);
        } else {
          console.log('✅ admin_users table ready');
          resolve();
        }
      });
    });

    // Check if admin already exists
    const existingAdmin = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM admin_users WHERE username = ?', ['admin'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin user already exists',
        username: 'admin',
        password: 'admin123'
      });
    }

    // Create default admin user
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO admin_users (username, email, password_hash, full_name)
        VALUES (?, ?, ?, ?)
      `, ['admin', 'admin@autobath.com', hashedPassword, 'Admin User'], (err) => {
        if (err) {
          console.error('Error creating admin user:', err);
          reject(err);
        } else {
          console.log('✅ Admin user created successfully');
          resolve();
        }
      });
    });

    res.json({
      success: true,
      message: 'Admin user created successfully',
      username: 'admin',
      password: 'admin123',
      warning: 'Please change the default password after first login!'
    });

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create admin user',
      message: error.message
    });
  }
});

module.exports = router;
