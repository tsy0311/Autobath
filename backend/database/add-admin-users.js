const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create admin_users table
db.serialize(() => {
  // Create table
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
      return;
    }
    console.log('✅ admin_users table created successfully');

    // Check if default admin exists
    db.get('SELECT * FROM admin_users WHERE username = ?', ['admin'], async (err, row) => {
      if (err) {
        console.error('Error checking for admin user:', err);
        return;
      }

      if (!row) {
        // Create default admin user
        const defaultPassword = 'admin123'; // Change this in production!
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        db.run(`
          INSERT INTO admin_users (username, email, password_hash, full_name)
          VALUES (?, ?, ?, ?)
        `, ['admin', 'admin@autobath.com', hashedPassword, 'Admin User'], (err) => {
          if (err) {
            console.error('Error creating default admin:', err);
            return;
          }
          console.log('✅ Default admin user created successfully');
          console.log('📧 Username: admin');
          console.log('🔑 Password: admin123');
          console.log('⚠️  IMPORTANT: Change the default password after first login!');
          db.close();
        });
      } else {
        console.log('ℹ️  Admin user already exists');
        db.close();
      }
    });
  });
});

