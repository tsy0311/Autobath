const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🔄 Running database migrations...');

db.serialize(() => {
  // 1) Ensure contact_messages.updated_at exists
  db.all("PRAGMA table_info(contact_messages)", (err, columns) => {
    if (err) {
      console.error('Error checking contact_messages table info:', err);
    } else {
      const hasUpdatedAt = columns.some(col => col.name === 'updated_at');
      if (!hasUpdatedAt) {
        console.log('Adding updated_at column to contact_messages table...');
        db.run(`ALTER TABLE contact_messages ADD COLUMN updated_at DATETIME`, (alterErr) => {
          if (alterErr) {
            console.error('Error adding updated_at column:', alterErr);
          } else {
            console.log('Column added, now updating existing rows...');
            db.run(`UPDATE contact_messages SET updated_at = created_at WHERE updated_at IS NULL`, (updateErr) => {
              if (updateErr) {
                console.error('Error updating existing rows:', updateErr);
              } else {
                console.log('✅ Successfully added updated_at column to contact_messages table');
              }
            });
          }
        });
      } else {
        console.log('✅ contact_messages.updated_at already exists');
      }
    }
  });

  // 2) Ensure products.brand exists
  db.all("PRAGMA table_info(products)", (err, columns) => {
    if (err) {
      console.error('Error checking products table info:', err);
    } else {
      const hasBrand = columns.some(col => col.name === 'brand');
      if (!hasBrand) {
        console.log('Adding brand column to products table...');
        db.run(`ALTER TABLE products ADD COLUMN brand TEXT`, (alterErr) => {
          if (alterErr) {
            console.error('Error adding brand column:', alterErr);
          } else {
            console.log('✅ Successfully added brand column to products');
          }
        });
      } else {
        console.log('✅ products.brand already exists');
      }
    }
  });
});

