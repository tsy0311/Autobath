const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing database issues...');

// Create all tables with proper structure
const createTables = () => {
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
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating products table:', err);
        else console.log('✅ Products table ready');
      });

      // Bookings table
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT,
          service_name TEXT,
          date TEXT NOT NULL,
          time_slot TEXT NOT NULL,
          duration_minutes INTEGER DEFAULT 60,
          vehicle_type TEXT,
          service_type TEXT,
          notes TEXT,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating bookings table:', err);
        else console.log('✅ Bookings table ready');
      });

      // Services table
      db.run(`
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          duration_minutes INTEGER DEFAULT 60,
          category TEXT,
          vehicle_types TEXT,
          requirements TEXT,
          image_url TEXT,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating services table:', err);
        else console.log('✅ Services table ready');
      });

      // Service packages table
      db.run(`
        CREATE TABLE IF NOT EXISTS service_packages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          duration_minutes INTEGER DEFAULT 120,
          services TEXT,
          discount_percentage DECIMAL(5,2) DEFAULT 0,
          image_url TEXT,
          is_popular INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating service_packages table:', err);
        else console.log('✅ Service packages table ready');
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
          products TEXT,
          image_url TEXT,
          is_popular INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating product_bundles table:', err);
        else console.log('✅ Product bundles table ready');
      });

      // Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_method TEXT,
          payment_status TEXT DEFAULT 'pending',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating orders table:', err);
        else console.log('✅ Orders table ready');
      });

      // Order items table
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER,
          quantity INTEGER DEFAULT 1,
          price DECIMAL(10,2) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `, (err) => {
        if (err) console.error('Error creating order_items table:', err);
        else console.log('✅ Order items table ready');
      });

      // Customers table
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          total_orders INTEGER DEFAULT 0,
          total_spent DECIMAL(10,2) DEFAULT 0,
          last_order_date DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating customers table:', err);
        else console.log('✅ Customers table ready');
      });

      // Reviews table
      db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          service_id INTEGER,
          booking_id INTEGER,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title TEXT,
          comment TEXT,
          photos TEXT,
          is_verified INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating reviews table:', err);
        else console.log('✅ Reviews table ready');
      });

      // Admin users table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email TEXT,
          is_active INTEGER DEFAULT 1,
          last_login DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating admin_users table:', err);
        else console.log('✅ Admin users table ready');
      });

      // Finalize
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error setting foreign keys:', err);
          reject(err);
        } else {
          console.log('✅ Database initialization complete');
          resolve();
        }
      });
    });
  });
};

// Run the fix
createTables()
  .then(() => {
    console.log('🎉 Database fixed successfully!');
    
    // Test the bookings query
    db.all('SELECT * FROM bookings LIMIT 1', [], (err, rows) => {
      if (err) {
        console.error('❌ Bookings table test failed:', err);
      } else {
        console.log('✅ Bookings table test passed');
      }
      
      db.close();
    });
  })
  .catch((error) => {
    console.error('❌ Database fix failed:', error);
    db.close();
  });