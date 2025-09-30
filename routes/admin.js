const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase, ensureDatabaseConnection } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST /api/admin/login - Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    const db = getDatabase();
  
  db.get(
    'SELECT * FROM admin_users WHERE username = ?',
    [username],
    (err, user) => {
      if (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ error: 'Login failed' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Verify password
      bcrypt.compare(password, user.password_hash, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).json({ error: 'Login failed' });
        }
        
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Update last login
        db.run(
          'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id]
        );
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            id: user.id, 
            username: user.username,
            type: 'admin'
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            lastLogin: user.last_login
          }
        });
      });
    }
  );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/admin/logout - Admin logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // You could implement token blacklisting here if needed
  res.json({ message: 'Logged out successfully' });
});

// GET /api/admin/profile - Get admin profile
router.get('/profile', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.get(
    'SELECT id, username, created_at, last_login FROM admin_users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error('Error fetching profile:', err);
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    }
  );
});

// PUT /api/admin/profile - Update admin profile
router.put('/profile', authenticateToken, (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  const db = getDatabase();
  
  // Get current user data
  db.get(
    'SELECT * FROM admin_users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Failed to fetch user data' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password if changing password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password required to change password' });
        }
        
        bcrypt.compare(currentPassword, user.password_hash, (err, isMatch) => {
          if (err) {
            console.error('Error comparing passwords:', err);
            return res.status(500).json({ error: 'Password verification failed' });
          }
          
          if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
          }
          
          // Hash new password and update
          bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) {
              console.error('Error hashing password:', err);
              return res.status(500).json({ error: 'Password update failed' });
            }
            
            updateUserProfile(db, req.user.id, username, hashedPassword, res);
          });
        });
      } else {
        // Update username only
        updateUserProfile(db, req.user.id, username, null, res);
      }
    }
  );
});

function updateUserProfile(db, userId, username, hashedPassword, res) {
  let query, params;
  
  if (hashedPassword) {
    query = 'UPDATE admin_users SET username = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [username, hashedPassword, userId];
  } else {
    query = 'UPDATE admin_users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [username, userId];
  }
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error updating profile:', err);
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    res.json({ message: 'Profile updated successfully' });
  });
}

// GET /api/admin/dashboard - Get dashboard data
router.get('/dashboard', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  const queries = {
    totalProducts: 'SELECT COUNT(*) as count FROM products',
    featuredProducts: 'SELECT COUNT(*) as count FROM products WHERE featured = 1',
    totalAppointments: 'SELECT COUNT(*) as count FROM appointments',
    pendingAppointments: 'SELECT COUNT(*) as count FROM appointments WHERE status = "pending"',
    totalVisitors: 'SELECT COUNT(DISTINCT visitor_id) as count FROM analytics',
    todayVisitors: 'SELECT COUNT(DISTINCT visitor_id) as count FROM analytics WHERE DATE(timestamp) = DATE("now")'
  };
  
  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, (err, row) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        results[key] = 0;
      } else {
        results[key] = row.count;
      }
      
      completed++;
      if (completed === totalQueries) {
        res.json(results);
      }
    });
  });
  
  db.close();
});

// GET /api/admin/settings - Get website settings
router.get('/settings', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT setting_key, setting_value FROM website_settings', (err, rows) => {
    if (err) {
      console.error('Error fetching settings:', err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
    
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    res.json(settings);
  });
  
  db.close();
});

// PUT /api/admin/settings - Update website settings
router.put('/settings', authenticateToken, (req, res) => {
  const settings = req.body;
  const db = getDatabase();
  
  const updateSettings = db.prepare(`
    INSERT OR REPLACE INTO website_settings (setting_key, setting_value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `);
  
  try {
    Object.entries(settings).forEach(([key, value]) => {
      updateSettings.run(key, value);
    });
    
    updateSettings.finalize();
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
  
  db.close();
});

module.exports = router;
