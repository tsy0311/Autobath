const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const readline = require('readline');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 AUTOBATH Admin Password Reset Tool\n');

// Get username
rl.question('Enter admin username (default: admin): ', (username) => {
  const targetUsername = username || 'admin';

  // Get new password
  rl.question('Enter new password (min 6 characters): ', async (newPassword) => {
    
    if (!newPassword || newPassword.length < 6) {
      console.error('❌ Password must be at least 6 characters long');
      rl.close();
      db.close();
      return;
    }

    // Confirm password
    rl.question('Confirm new password: ', async (confirmPassword) => {
      
      if (newPassword !== confirmPassword) {
        console.error('❌ Passwords do not match!');
        rl.close();
        db.close();
        return;
      }

      try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        db.run(
          'UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?',
          [hashedPassword, targetUsername],
          function(err) {
            if (err) {
              console.error('❌ Error updating password:', err);
            } else if (this.changes === 0) {
              console.error(`❌ User '${targetUsername}' not found`);
            } else {
              console.log('\n✅ Password updated successfully!');
              console.log(`📧 Username: ${targetUsername}`);
              console.log(`🔑 New password has been set`);
              console.log('\n🎯 You can now login with the new password at http://localhost:3000/login\n');
            }
            
            rl.close();
            db.close();
          }
        );
      } catch (error) {
        console.error('❌ Error hashing password:', error);
        rl.close();
        db.close();
      }
    });
  });
});

