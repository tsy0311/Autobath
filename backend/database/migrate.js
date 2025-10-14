const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🔄 Running database migrations...');

db.serialize(() => {
  // Check if updated_at column exists in contact_messages
  db.all("PRAGMA table_info(contact_messages)", (err, columns) => {
    if (err) {
      console.error('Error checking table info:', err);
      return;
    }

    const hasUpdatedAt = columns.some(col => col.name === 'updated_at');
    
    if (!hasUpdatedAt) {
      console.log('Adding updated_at column to contact_messages table...');
      // SQLite doesn't support DEFAULT CURRENT_TIMESTAMP in ALTER TABLE
      // So we add the column with NULL default, then update existing rows
      db.run(`ALTER TABLE contact_messages ADD COLUMN updated_at DATETIME`, (err) => {
        if (err) {
          console.error('Error adding updated_at column:', err);
          db.close();
        } else {
          console.log('Column added, now updating existing rows...');
          db.run(`UPDATE contact_messages SET updated_at = created_at WHERE updated_at IS NULL`, (err2) => {
            if (err2) {
              console.error('Error updating existing rows:', err2);
            } else {
              console.log('✅ Successfully added updated_at column to contact_messages table');
            }
            db.close();
          });
        }
      });
    } else {
      console.log('✅ Database is already up to date');
      db.close();
    }
  });
});

