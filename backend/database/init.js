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
    insertDefaultCategories()
      .then(() => insertSampleServices())
      .then(() => insertSampleServicePackages())
      .then(() => insertSampleProducts())
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
        name: 'Engine Bay Wash & Protect',
        description: 'Complete engine bay cleaning and protection',
        base_price: 88.00,
        duration_minutes: 60,
        category: 'Add-on',
        vehicle_types: JSON.stringify(['hatchback', 'sedan', 'suv', 'truck', 'mpv']),
        requirements: JSON.stringify(['Water access', 'Ventilation'])
      },
      {
        name: 'Interior Detailing & Protect (5-seater)',
        description: 'Complete interior detailing and protection for 5-seater vehicles',
        base_price: 280.00,
        duration_minutes: 120,
        category: 'Add-on',
        vehicle_types: JSON.stringify(['hatchback', 'sedan', 'suv']),
        requirements: JSON.stringify(['Water access', 'Ventilation'])
      },
      {
        name: 'Interior Detailing & Protect (7-seater)',
        description: 'Complete interior detailing and protection for 7-seater vehicles',
        base_price: 389.00,
        duration_minutes: 150,
        category: 'Add-on',
        vehicle_types: JSON.stringify(['truck', 'mpv']),
        requirements: JSON.stringify(['Water access', 'Ventilation'])
      },
      {
        name: 'GYEON Coating - Hatchback',
        description: 'Professional GYEON ceramic coating application for hatchback',
        base_price: 1400.00,
        duration_minutes: 480,
        category: 'Coating',
        vehicle_types: JSON.stringify(['hatchback']),
        requirements: JSON.stringify(['Indoor facility', '24-48 hours curing time'])
      },
      {
        name: 'GYEON Coating - Sedan/SUV',
        description: 'Professional GYEON ceramic coating application for sedan/SUV',
        base_price: 1600.00,
        duration_minutes: 540,
        category: 'Coating',
        vehicle_types: JSON.stringify(['sedan', 'suv']),
        requirements: JSON.stringify(['Indoor facility', '24-48 hours curing time'])
      },
      {
        name: 'GYEON Coating - MPV/Truck',
        description: 'Professional GYEON ceramic coating application for MPV/Truck',
        base_price: 1800.00,
        duration_minutes: 600,
        category: 'Coating',
        vehicle_types: JSON.stringify(['truck', 'mpv']),
        requirements: JSON.stringify(['Indoor facility', '24-48 hours curing time'])
      },
      {
        name: 'Polish - Hatchback',
        description: 'Professional paint correction and polish for hatchback',
        base_price: 400.00,
        duration_minutes: 240,
        category: 'Polish',
        vehicle_types: JSON.stringify(['hatchback']),
        requirements: JSON.stringify(['Indoor facility', 'Good lighting'])
      },
      {
        name: 'Polish - Sedan/SUV',
        description: 'Professional paint correction and polish for sedan/SUV',
        base_price: 600.00,
        duration_minutes: 270,
        category: 'Polish',
        vehicle_types: JSON.stringify(['sedan', 'suv']),
        requirements: JSON.stringify(['Indoor facility', 'Good lighting'])
      },
      {
        name: 'Polish - MPV/Truck',
        description: 'Professional paint correction and polish for MPV/Truck',
        base_price: 800.00,
        duration_minutes: 360,
        category: 'Polish',
        vehicle_types: JSON.stringify(['truck', 'mpv']),
        requirements: JSON.stringify(['Indoor facility', 'Good lighting'])
      },
      {
        name: 'Basic Wash - Normal Bike',
        description: 'Essential motorcycle wash with basic cleaning',
        base_price: 35.00,
        duration_minutes: 40,
        category: 'Motorcycle',
        vehicle_types: JSON.stringify([]),
        bike_type: 'normal',
        requirements: JSON.stringify(['Water access', 'Parking space'])
      },
      {
        name: 'Basic Wash - Sportbike',
        description: 'Essential sportbike wash with detailed cleaning',
        base_price: 45.00,
        duration_minutes: 70,
        category: 'Motorcycle',
        vehicle_types: JSON.stringify([]),
        bike_type: 'sportbike',
        requirements: JSON.stringify(['Water access', 'Parking space'])
      },
      {
        name: 'Detailing + Wax - Normal Bike',
        description: 'Complete motorcycle detailing with wax protection',
        base_price: 55.00,
        duration_minutes: 50,
        category: 'Motorcycle',
        vehicle_types: JSON.stringify([]),
        bike_type: 'normal',
        requirements: JSON.stringify(['Water access', 'Parking space', 'Shade preferred'])
      },
      {
        name: 'Detailing + Wax - Sportbike',
        description: 'Complete sportbike detailing with premium wax protection',
        base_price: 75.00,
        duration_minutes: 120,
        category: 'Motorcycle',
        vehicle_types: JSON.stringify([]),
        bike_type: 'sportbike',
        requirements: JSON.stringify(['Water access', 'Parking space', 'Shade preferred'])
      },
      {
        name: 'Polish - Normal Bike',
        description: 'Professional motorcycle polish service',
        base_price: 120.00,
        duration_minutes: 120,
        category: 'Motorcycle',
        vehicle_types: JSON.stringify([]),
        bike_type: 'normal',
        requirements: JSON.stringify(['Indoor facility', 'Good lighting'])
      },
      {
        name: 'Polish - Sportbike',
        description: 'Professional sportbike polish service',
        base_price: 150.00,
        duration_minutes: 150,
        category: 'Motorcycle',
        vehicle_types: JSON.stringify([]),
        bike_type: 'sportbike',
        requirements: JSON.stringify(['Indoor facility', 'Good lighting'])
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
          name: 'Basic Wash - Hatchback',
          description: 'Essential car wash with interior cleaning - Perfect for regular maintenance',
          base_price: 78.00,
          duration_minutes: 90,
          vehicle_type: 'hatchback',
          services: JSON.stringify([]),
          discount_percentage: 0.00
        },
        {
          name: 'Basic Wash - Sedan/SUV',
          description: 'Essential car wash with interior cleaning - Perfect for regular maintenance',
          base_price: 88.00,
          duration_minutes: 120,
          vehicle_type: 'sedan/suv',
          services: JSON.stringify([]),
          discount_percentage: 0.00
        },
        {
          name: 'Basic Wash - Truck/MPV',
          description: 'Essential car wash with interior cleaning - Perfect for regular maintenance',
          base_price: 108.00,
          duration_minutes: 150,
          vehicle_type: 'truck/mpv',
          services: JSON.stringify([]),
          discount_percentage: 0.00
        },
        {
          name: 'Premium Wash - Hatchback',
          description: 'Comprehensive detailing with premium products - Our most popular choice',
          base_price: 120.00,
          duration_minutes: 105,
          vehicle_type: 'hatchback',
          services: JSON.stringify([]),
          discount_percentage: 0.00,
          is_popular: 1
        },
        {
          name: 'Premium Wash - Sedan/SUV',
          description: 'Comprehensive detailing with premium products - Our most popular choice',
          base_price: 150.00,
          duration_minutes: 135,
          vehicle_type: 'sedan/suv',
          services: JSON.stringify([]),
          discount_percentage: 0.00,
          is_popular: 1
        },
        {
          name: 'Premium Wash - Truck/MPV',
          description: 'Comprehensive detailing with premium products - Our most popular choice',
          base_price: 190.00,
          duration_minutes: 165,
          vehicle_type: 'truck/mpv',
          services: JSON.stringify([]),
          discount_percentage: 0.00,
          is_popular: 1
        },
        {
          name: 'Ultra - Hatchback',
          description: 'Complete transformation with ceramic coating - The complete package',
          base_price: 190.00,
          duration_minutes: 135,
          vehicle_type: 'hatchback',
          services: JSON.stringify([]),
          discount_percentage: 0.00
        },
        {
          name: 'Ultra - Sedan/SUV',
          description: 'Complete transformation with ceramic coating - The complete package',
          base_price: 230.00,
          duration_minutes: 165,
          vehicle_type: 'sedan/suv',
          services: JSON.stringify([]),
          discount_percentage: 0.00
        },
        {
          name: 'Ultra - Truck/MPV',
          description: 'Complete transformation with ceramic coating - The complete package',
          base_price: 260.00,
          duration_minutes: 195,
          vehicle_type: 'truck/mpv',
          services: JSON.stringify([]),
          discount_percentage: 0.00
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO service_packages (name, description, base_price, duration_minutes, vehicle_type, services, discount_percentage, is_popular)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      packages.forEach(pkg => {
        stmt.run(pkg.name, pkg.description, pkg.base_price, pkg.duration_minutes, 
                 pkg.vehicle_type, pkg.services, pkg.discount_percentage, pkg.is_popular);
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

// Insert sample products
const insertSampleProducts = () => {
  return new Promise((resolve, reject) => {
    // First check if products already exist
    db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
      if (err) {
        console.error('Error checking existing products:', err.message);
        reject(err);
        return;
      }

      if (result.count > 0) {
        console.log('Products already exist, skipping insertion');
        resolve();
        return;
      }

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

      products.forEach(product => {
        stmt.run(product.name, product.description, product.price, product.image_url, 
                 product.category, product.brand, product.stock);
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting sample products:', err.message);
          reject(err);
        } else {
          console.log('Sample products inserted successfully');
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
