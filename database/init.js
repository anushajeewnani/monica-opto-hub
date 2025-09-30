const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists (only in non-serverless environments)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir) && process.env.NODE_ENV !== 'production') {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.log('Note: Could not create uploads directory (serverless environment)');
  }
}

// Database path
const dbPath = path.join(__dirname, 'database.sqlite');

// Global database instance - this will stay open for the entire server lifetime
let dbInstance = null;
let isInitialized = false;

// Get database instance (singleton pattern with persistent connection)
function getDatabase() {
  if (!dbInstance) {
    console.log('Creating new database connection...');
    dbInstance = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        throw err;
      }
      console.log('✅ Database connection established');
    });
    
    // Handle database errors gracefully
    dbInstance.on('error', (err) => {
      console.error('Database error:', err);
      if (err.code === 'SQLITE_MISUSE') {
        console.log('Database connection lost, recreating...');
        dbInstance = null; // Reset instance to force reconnection
        isInitialized = false;
      }
    });
  }
  return dbInstance;
}

// Initialize database
function initDatabase() {
  return new Promise((resolve, reject) => {
    if (isInitialized) {
      console.log('Database already initialized');
      resolve();
      return;
    }
    
    const db = getDatabase();
    
    // Create tables
    const createTables = `
      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        gender TEXT NOT NULL,
        model TEXT,
        description TEXT,
        image_url TEXT,
        featured BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Appointments table
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        preferred_date DATE,
        preferred_time TIME,
        message TEXT,
        status TEXT DEFAULT 'pending',
        source TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Admin users table
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      );

      -- Website settings table
      CREATE TABLE IF NOT EXISTS website_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Analytics table
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visitor_id TEXT NOT NULL,
        page TEXT NOT NULL,
        user_agent TEXT,
        referrer TEXT,
        ip_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
      CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
      CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
      CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(type);
      CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
    `;

    db.exec(createTables, (err) => {
      if (err) {
        console.error('Error creating tables:', err);
        reject(err);
        return;
      }
      console.log('✅ Database tables created successfully');
      
      // Insert default data
      insertDefaultData(db)
        .then(() => {
          isInitialized = true;
          console.log('✅ Database initialization completed');
          resolve();
        })
        .catch(reject);
    });
  });
}

// Insert default data
function insertDefaultData(db) {
  return new Promise((resolve, reject) => {
    const bcrypt = require('bcryptjs');
    
    // Check if admin user exists
    db.get('SELECT id FROM admin_users WHERE username = ?', ['admin'], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!row) {
        // Create default admin user
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.run(
          'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
          ['admin', hashedPassword],
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            console.log('✅ Default admin user created (username: admin, password: admin123)');
          }
        );
      }
      
      // Insert default website settings
      const defaultSettings = [
        ['site_title', 'MONICA OPTO HUB'],
        ['site_description', 'Premium eyewear boutique offering luxury sunglasses, optical frames, and contact lenses.'],
        ['contact_phone', '+91-7000532010'],
        ['contact_email', 'info@example.com'],
        ['hero_eyebrow', 'Now Trending'],
        ['hero_title', 'Ray-Ban Meta Glasses'],
        ['hero_description', 'Immersive, iconic, and innovative. Book your pair today.'],
        ['announcement_text', 'Our prices are being updated to reflect GST changes. Chat with us for revised prices.'],
        ['announcement_visible', 'true'],
        ['whatsapp_number', '917000532010'],
        ['instagram_handle', ''],
        ['facebook_page', '']
      ];
      
      const insertSettings = db.prepare(`
        INSERT OR REPLACE INTO website_settings (setting_key, setting_value) 
        VALUES (?, ?)
      `);
      
      defaultSettings.forEach(([key, value]) => {
        insertSettings.run(key, value);
      });
      
      insertSettings.finalize();
      console.log('✅ Default website settings inserted');
      
      // Insert sample products
      insertSampleProducts(db)
        .then(() => resolve())
        .catch(reject);
    });
  });
}

// Insert sample products
function insertSampleProducts(db) {
  return new Promise((resolve, reject) => {
    const sampleProducts = [
      {
        id: '1',
        name: 'Ray-Ban Aviator Classic',
        brand: 'Ray-Ban',
        price: 10990,
        category: 'sunglasses',
        gender: 'unisex',
        model: 'RB3025 001/58',
        description: 'Classic aviator sunglasses with crystal green lenses',
        image_url: '',
        featured: 1
      },
      {
        id: '2',
        name: 'Gucci Oversized Square',
        brand: 'Gucci',
        price: 20700,
        category: 'sunglasses',
        gender: 'women',
        model: 'GG0061S 001',
        description: 'Oversized square sunglasses with crystal lenses',
        image_url: '',
        featured: 1
      },
      {
        id: '3',
        name: 'Tom Ford Optical Frame',
        brand: 'Tom Ford',
        price: 24500,
        category: 'optical-frames',
        gender: 'men',
        model: 'TF5156 001',
        description: 'Premium optical frame with titanium construction',
        image_url: '',
        featured: 0
      },
      {
        id: '4',
        name: 'Prada Cat Eye Sunglasses',
        brand: 'Prada',
        price: 33700,
        category: 'sunglasses',
        gender: 'women',
        model: 'PR 01VS 1AB-1F0',
        description: 'Elegant cat eye sunglasses with gradient lenses',
        image_url: '',
        featured: 1
      },
      {
        id: '5',
        name: 'Cartier Skyline Optical',
        brand: 'Cartier',
        price: 96500,
        category: 'optical-frames',
        gender: 'unisex',
        model: 'CT0046S 001',
        description: 'Luxury optical frame with 18k gold accents',
        image_url: '',
        featured: 1
      },
      {
        id: '6',
        name: 'Acuvue Oasys Contact Lenses',
        brand: 'Johnson & Johnson',
        price: 2500,
        category: 'contact-lenses',
        gender: 'unisex',
        model: 'ACUVUE OASYS',
        description: 'Monthly disposable contact lenses for all-day comfort',
        image_url: '',
        featured: 0
      }
    ];
    
    const insertProduct = db.prepare(`
      INSERT OR REPLACE INTO products 
      (id, name, brand, price, category, gender, model, description, image_url, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    sampleProducts.forEach(product => {
      insertProduct.run(
        product.id,
        product.name,
        product.brand,
        product.price,
        product.category,
        product.gender,
        product.model,
        product.description,
        product.image_url,
        product.featured
      );
    });
    
    insertProduct.finalize();
    console.log('✅ Sample products inserted');
    resolve();
  });
}

// Ensure database connection is ready
function ensureDatabaseConnection() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    // Simple test query to verify connection
    db.get('SELECT 1 as test', (err, row) => {
      if (err) {
        console.error('Database connection test failed:', err);
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

module.exports = {
  initDatabase,
  getDatabase,
  ensureDatabaseConnection
};
