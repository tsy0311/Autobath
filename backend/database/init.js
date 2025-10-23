const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
console.log('📁 Database path:', dbPath);
console.log('📁 Current directory:', __dirname);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          image_url TEXT,
          category TEXT,
          brand TEXT,
          stock INTEGER DEFAULT 0,
          sold INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating products table:', err);
        else console.log('✅ Products table ready');
      });

      // Add sold column if it doesn't exist (migration)
      db.run(`
        ALTER TABLE products ADD COLUMN sold INTEGER DEFAULT 0
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding sold column:', err);
        } else if (!err) {
          console.log('✅ Added sold column to products table');
        }
      });

      // Product images table
      db.run(`
        CREATE TABLE IF NOT EXISTS product_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          image_url TEXT NOT NULL,
          alt_text TEXT,
          sort_order INTEGER DEFAULT 0,
          is_primary BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('Error creating product_images table:', err);
        else console.log('✅ Product images table ready');
      });

      // Product color options table
      db.run(`
        CREATE TABLE IF NOT EXISTS product_colors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          color_name TEXT NOT NULL,
          color_code TEXT,
          color_image_url TEXT,
          price_adjustment DECIMAL(10,2) DEFAULT 0,
          stock INTEGER DEFAULT 0,
          is_available BOOLEAN DEFAULT 1,
          sort_order INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('Error creating product_colors table:', err);
        else console.log('✅ Product colors table ready');
      });

      // Categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating categories table:', err);
        else console.log('✅ Categories table ready');
      });

      // Bookings table
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT,
          service_name TEXT,               -- name of the service/package
          date TEXT NOT NULL,              -- YYYY-MM-DD
          time_slot TEXT NOT NULL,         -- e.g., 09:00, 10:00
          status TEXT DEFAULT 'pending',   -- pending | confirmed | cancelled
          notes TEXT,
          vehicle_type TEXT,               -- sedan, suv, truck
          service_type TEXT,               -- package, individual
          package_id INTEGER,              -- reference to service_packages
          service_id INTEGER,              -- reference to services
          duration_minutes INTEGER DEFAULT 60,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating bookings table:', err);
        else console.log('✅ Bookings table ready');
      });

      // Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_method TEXT DEFAULT 'tng',
          payment_reference TEXT,
          payment_proof_url TEXT,
          payment_verified BOOLEAN DEFAULT 0,
          payment_verified_by TEXT,
          payment_verified_at DATETIME,
          delivery_option TEXT DEFAULT 'collection',
          delivery_address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Order items table
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id TEXT NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          variant_id INTEGER,
          variant_name TEXT,
          variant_price_adjustment DECIMAL(10,2) DEFAULT 0,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id),
          FOREIGN KEY (variant_id) REFERENCES product_colors (id)
        )
      `);

      // Contact messages table
      db.run(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          service_type TEXT,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'unread',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Services table
      db.run(`
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          duration_minutes INTEGER NOT NULL,
          category TEXT NOT NULL,
          vehicle_types TEXT, -- JSON array: ["motorcycle", "hatchback", "sedan/suv", "truck/mpv"]
          bike_type TEXT, -- 'normal' or 'sportbike' for motorcycle services
          requirements TEXT, -- JSON array of requirements
          image_url TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Service packages table
      db.run(`
        CREATE TABLE IF NOT EXISTS service_packages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          duration_minutes INTEGER NOT NULL,
          vehicle_type TEXT, -- 'hatchback', 'sedan/suv', 'truck/mpv'
          services TEXT, -- JSON array of service IDs
          discount_percentage DECIMAL(5,2) DEFAULT 0,
          image_url TEXT,
          is_popular BOOLEAN DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Customers table
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          address TEXT,
          vehicle_make TEXT,
          vehicle_model TEXT,
          vehicle_year INTEGER,
          vehicle_color TEXT,
          loyalty_points INTEGER DEFAULT 0,
          loyalty_tier TEXT DEFAULT 'Bronze',
          total_spent DECIMAL(10,2) DEFAULT 0,
          last_service_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Reviews table
      db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          service_id INTEGER,
          booking_id INTEGER,
          rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
          title TEXT,
          comment TEXT,
          photos TEXT, -- JSON array of photo URLs
          is_verified BOOLEAN DEFAULT 0,
          is_approved BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers (id),
          FOREIGN KEY (service_id) REFERENCES services (id),
          FOREIGN KEY (booking_id) REFERENCES bookings (id)
        )
      `);

      // Loyalty transactions table
      db.run(`
        CREATE TABLE IF NOT EXISTS loyalty_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL,
          transaction_type TEXT NOT NULL, -- 'earn', 'redeem', 'adjustment'
          points INTEGER NOT NULL,
          description TEXT,
          order_id TEXT,
          booking_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers (id),
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (booking_id) REFERENCES bookings (id)
        )
      `);

      // Admin users table
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
        if (err) console.error('Error creating admin_users table:', err);
        else console.log('✅ Admin users table ready');
      });

      // Product bundles table
      db.run(`
        CREATE TABLE IF NOT EXISTS product_bundles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          bundle_price DECIMAL(10,2) NOT NULL,
          individual_price DECIMAL(10,2) NOT NULL,
          savings DECIMAL(10,2) NOT NULL,
          products TEXT, -- JSON array of product IDs with quantities
          image_url TEXT,
          is_popular BOOLEAN DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating tables:', err.message);
          reject(err);
        } else {
          console.log('Database tables initialized successfully');
          // Insert sample data
          insertSampleData()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  });
};

// Insert default categories
const insertDefaultCategories = () => {
  return new Promise((resolve, reject) => {
    const categories = [
      { name: 'Brushes & Tools', description: 'Cleaning brushes and detailing tools', sort_order: 1 },
      { name: 'Pressure Washers', description: 'High pressure washing equipment', sort_order: 2 },
      { name: 'Foam Cannons', description: 'Foam cannon and PA foam systems', sort_order: 3 },
      { name: 'Vacuum Cleaners', description: 'Car vacuum and cleaning systems', sort_order: 4 },
      { name: 'Accessories', description: 'Miscellaneous car detailing accessories', sort_order: 5 },
      { name: 'Brushes', description: 'Specialized cleaning brushes', sort_order: 6 },
      { name: 'Tools', description: 'Detailing tools and equipment', sort_order: 7 }
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO categories (name, description, sort_order, is_active)
      VALUES (?, ?, ?, 1)
    `);

    let completed = 0;
    categories.forEach(category => {
      stmt.run(category.name, category.description, category.sort_order, (err) => {
        if (err) {
          console.error('Error inserting category:', err);
        }
        completed++;
        if (completed === categories.length) {
          stmt.finalize();
          console.log('✅ Default categories inserted');
          resolve();
        }
      });
    });
  });
};

// Insert sample data
const insertSampleData = () => {
  return new Promise((resolve, reject) => {
    // Do not insert sample products anymore
    insertDefaultCategories()
      .then(() => insertSampleServices())
      .then(() => insertSampleServicePackages())
      .then(() => insertSampleProductBundles())
      .then(() => createDefaultAdmin())
      .then(() => resolve())
      .catch(reject);
  });
};

// Create default admin user
const createDefaultAdmin = () => {
  return new Promise((resolve, reject) => {
    const bcrypt = require('bcryptjs');
    
    // Check if admin already exists
    db.get('SELECT * FROM admin_users WHERE username = ?', ['admin'], async (err, row) => {
      if (err) {
        console.error('Error checking for admin user:', err);
        return reject(err);
      }

      if (row) {
        console.log('ℹ️  Admin user already exists');
        return resolve();
      }

      // Create default admin user
      try {
        const defaultPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        db.run(`
          INSERT INTO admin_users (username, email, password_hash, full_name, is_active)
          VALUES (?, ?, ?, ?, ?)
        `, ['admin', 'admin@autobath.com', hashedPassword, 'Admin User', 1], (err) => {
          if (err) {
            console.error('Error creating default admin:', err);
            return reject(err);
          }
          console.log('✅ Default admin user created successfully');
          console.log('📧 Username: admin');
          console.log('🔑 Password: admin123');
          console.log('⚠️  IMPORTANT: Change the default password after first login!');
          resolve();
        });
      } catch (error) {
        console.error('Error hashing password:', error);
        reject(error);
      }
    });
  });
};

// Insert sample services
const insertSampleServices = () => {
  return new Promise((resolve, reject) => {
    const services = [
      {
        name: 'Basic Car Wash',
        description: 'Exterior wash, wheel cleaning, and basic interior vacuum',
        base_price: 25.00,
        duration_minutes: 45,
        category: 'Wash',
        vehicle_types: JSON.stringify(['sedan', 'suv', 'truck']),
        requirements: JSON.stringify(['Water access', 'Parking space'])
      },
      {
        name: 'Premium Detailing',
        description: 'Full exterior wash, wax, interior cleaning, and tire shine',
        base_price: 85.00,
        duration_minutes: 120,
        category: 'Detailing',
        vehicle_types: JSON.stringify(['sedan', 'suv', 'truck']),
        requirements: JSON.stringify(['Water access', 'Parking space', 'Shade preferred'])
      },
      {
        name: 'Ceramic Coating',
        description: 'Professional ceramic coating application with paint correction',
        base_price: 299.00,
        duration_minutes: 360,
        category: 'Protection',
        vehicle_types: JSON.stringify(['sedan', 'suv', 'truck']),
        requirements: JSON.stringify(['Indoor facility', '24-48 hours curing time'])
      },
      {
        name: 'Paint Correction',
        description: 'Multi-stage paint correction to remove swirls and scratches',
        base_price: 199.00,
        duration_minutes: 240,
        category: 'Correction',
        vehicle_types: JSON.stringify(['sedan', 'suv', 'truck']),
        requirements: JSON.stringify(['Indoor facility', 'Good lighting'])
      },
      {
        name: 'Interior Deep Clean',
        description: 'Complete interior cleaning including leather treatment and fabric protection',
        base_price: 75.00,
        duration_minutes: 90,
        category: 'Interior',
        vehicle_types: JSON.stringify(['sedan', 'suv', 'truck']),
        requirements: JSON.stringify(['Water access', 'Ventilation'])
      }
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO services (name, description, base_price, duration_minutes, category, vehicle_types, requirements)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    services.forEach(service => {
      stmt.run(service.name, service.description, service.base_price, service.duration_minutes, 
               service.category, service.vehicle_types, service.requirements);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error inserting sample services:', err.message);
        reject(err);
      } else {
        console.log('Sample services inserted successfully');
        resolve();
      }
    });
  });
};

// Insert sample service packages
const insertSampleServicePackages = () => {
  return new Promise((resolve, reject) => {
    // First check if packages already exist
    db.get('SELECT COUNT(*) as count FROM service_packages', (err, result) => {
      if (err) {
        console.error('Error checking existing packages:', err.message);
        reject(err);
        return;
      }

      if (result.count > 0) {
        console.log('Service packages already exist, skipping insertion');
        resolve();
        return;
      }

      const packages = [
        {
          name: 'Basic',
          description: 'Essential car wash with interior cleaning - Perfect for regular maintenance',
          base_price: 45.00,
          duration_minutes: 75,
          services: JSON.stringify([1, 5]), // Basic Car Wash + Interior Deep Clean
          discount_percentage: 10.00
        },
        {
          name: 'Premium',
          description: 'Comprehensive detailing with paint protection - Our most popular choice',
          base_price: 120.00,
          duration_minutes: 180,
          services: JSON.stringify([2, 5]), // Premium Detailing + Interior Deep Clean
          discount_percentage: 15.00,
          is_popular: 1
        },
        {
          name: 'Ultra',
          description: 'Ultimate protection with ceramic coating and paint correction - The complete package',
          base_price: 450.00,
          duration_minutes: 480,
          services: JSON.stringify([3, 4, 5]), // Ceramic Coating + Paint Correction + Interior Deep Clean
          discount_percentage: 20.00
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO service_packages (name, description, base_price, duration_minutes, services, discount_percentage, is_popular)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      packages.forEach(pkg => {
        stmt.run(pkg.name, pkg.description, pkg.base_price, pkg.duration_minutes, 
                 pkg.services, pkg.discount_percentage, pkg.is_popular);
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting sample service packages:', err.message);
          reject(err);
        } else {
          console.log('Sample service packages inserted successfully');
          resolve();
        }
      });
    });
  });
};

// Insert sample product bundles
const insertSampleProductBundles = () => {
  return new Promise((resolve, reject) => {
    const bundles = [
      {
        name: 'Cleaning Starter Kit',
        description: 'Everything you need to start detailing at home',
        bundle_price: 89.99,
        individual_price: 110.97,
        savings: 20.98,
        products: JSON.stringify([
          {product_id: 1, quantity: 1}, // Koch Chemie Car Soap
          {product_id: 3, quantity: 1}, // Wheel Cleaner
          {product_id: 5, quantity: 1}  // Microfiber Towels
        ]),
        is_popular: 1
      },
      {
        name: 'Interior Care Bundle',
        description: 'Complete interior cleaning and protection kit',
        bundle_price: 39.99,
        individual_price: 46.98,
        savings: 6.99,
        products: JSON.stringify([
          {product_id: 2, quantity: 1}, // Quick Detailer Spray
          {product_id: 6, quantity: 1}  // Leather Conditioner
        ])
      },
      {
        name: 'Professional Protection Kit',
        description: 'Premium protection products for serious car enthusiasts',
        bundle_price: 129.99,
        individual_price: 149.97,
        savings: 19.98,
        products: JSON.stringify([
          {product_id: 4, quantity: 1}, // Ceramic Coating Kit
          {product_id: 2, quantity: 2}, // Quick Detailer Spray
          {product_id: 5, quantity: 1}  // Microfiber Towels
        ])
      }
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO product_bundles (name, description, bundle_price, individual_price, savings, products, is_popular)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    bundles.forEach(bundle => {
      stmt.run(bundle.name, bundle.description, bundle.bundle_price, bundle.individual_price, 
               bundle.savings, bundle.products, bundle.is_popular);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error inserting sample product bundles:', err.message);
        reject(err);
      } else {
        console.log('Sample product bundles inserted successfully');
        resolve();
      }
    });
  });
};

module.exports = {
  db,
  initDatabase
};
