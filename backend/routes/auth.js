const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/init');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user
    db.get(
      'SELECT * FROM admin_users WHERE username = ? AND is_active = 1',
      [username],
      async (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Server error during login'
          });
        }

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
          });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
          return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
          });
        }

        // Update last login
        db.run(
          'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id]
        );

        // Create JWT token
        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: true
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Set cookie with token
        res.cookie('authToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Return success with token
        res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }
  });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Change password endpoint
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get current user
    db.get(
      'SELECT * FROM admin_users WHERE id = ?',
      [req.user.id],
      async (err, user) => {
        if (err || !user) {
          return res.status(500).json({
            success: false,
            message: 'Error fetching user data'
          });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!validPassword) {
          return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        db.run(
          'UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedPassword, req.user.id],
          (err) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: 'Error updating password'
              });
            }

            res.json({
              success: true,
              message: 'Password changed successfully'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
});

// Initialize admin user endpoint (for production setup)
router.post('/init-admin', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Check if admin already exists
    db.get('SELECT * FROM admin_users WHERE username = ?', [username || 'admin'], (err, existingAdmin) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (existingAdmin) {
        return res.json({
          success: true,
          message: 'Admin user already exists',
          admin: {
            username: existingAdmin.username,
            email: existingAdmin.email
          }
        });
      }

      // Create admin user
      const adminUsername = username || 'admin';
      const adminEmail = email || 'admin@autobath.com';
      const adminPassword = password || 'admin123';
      
      bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Password hashing error:', err);
          return res.status(500).json({
            success: false,
            message: 'Error creating admin user'
          });
        }

        db.run(`
          INSERT INTO admin_users (username, email, password_hash, full_name, is_active)
          VALUES (?, ?, ?, ?, ?)
        `, [adminUsername, adminEmail, hashedPassword, 'Admin User', 1], function(err) {
          if (err) {
            console.error('Error creating admin user:', err);
            return res.status(500).json({
              success: false,
              message: 'Error creating admin user'
            });
          }

          res.json({
            success: true,
            message: 'Admin user created successfully',
            admin: {
              id: this.lastID,
              username: adminUsername,
              email: adminEmail
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Init admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

