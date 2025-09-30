const express = require('express');
const router = express.Router();
const { getDatabase, ensureDatabaseConnection } = require('../database/init');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/products - Get all products with optional filtering
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const { category, gender, featured, search, brand, limit, offset } = req.query;
  
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  
  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (gender && gender !== 'all') {
    query += ' AND gender = ?';
    params.push(gender);
  }
  
  if (brand && brand !== 'all') {
    query += ' AND brand = ?';
    params.push(brand);
  }
  
  if (featured !== undefined) {
    query += ' AND featured = ?';
    params.push(featured === 'true' ? 1 : 0);
  }
  
  if (search) {
    query += ' AND (name LIKE ? OR brand LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  query += ' ORDER BY created_at DESC';
  
  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
    
    if (offset) {
      query += ' OFFSET ?';
      params.push(parseInt(offset));
    }
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    
    // Convert featured boolean values
    const products = rows.map(row => ({
      ...row,
      featured: Boolean(row.featured),
      price: Number(row.price)
    }));
    
    res.json({ products, count: products.length });
  });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = {
      ...row,
      featured: Boolean(row.featured),
      price: Number(row.price)
    };
    
    res.json(product);
  });
});

// POST /api/products - Create new product
router.post('/', upload.single('image'), (req, res) => {
  try {
    const db = getDatabase();
    const {
      name,
      brand,
      price,
      category,
      gender,
      model,
      description,
      featured
    } = req.body;
    
    // Validate required fields
    if (!name || !brand || !price || !category || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
  const id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : '';
  
  const query = `
    INSERT INTO products 
    (id, name, brand, price, category, gender, model, description, image_url, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    id,
    name,
    brand,
    parseFloat(price),
    category,
    gender,
    model || '',
    description || '',
    imageUrl,
    featured === 'true' || featured === true ? 1 : 0
  ];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error creating product:', err);
      return res.status(500).json({ error: 'Failed to create product' });
    }
    
    // Fetch the created product
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching created product:', err);
        return res.status(500).json({ error: 'Product created but failed to fetch' });
      }
      
      const product = {
        ...row,
        featured: Boolean(row.featured),
        price: Number(row.price)
      };
      
      res.status(201).json(product);
    });
  });
  } catch (error) {
    console.error('Error in product creation:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', upload.single('image'), (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const {
    name,
    brand,
    price,
    category,
    gender,
    model,
    description,
    featured
  } = req.body;
  
  // Check if product exists
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, existingProduct) => {
    if (err) {
      console.error('Error checking product:', err);
      return res.status(500).json({ error: 'Failed to check product' });
    }
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Handle image update
    let imageUrl = existingProduct.image_url;
    if (req.file) {
      // Delete old image if it exists
      if (existingProduct.image_url) {
        const oldImagePath = path.join(__dirname, '../', existingProduct.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = `/uploads/products/${req.file.filename}`;
    }
    
    const query = `
      UPDATE products 
      SET name = ?, brand = ?, price = ?, category = ?, gender = ?, 
          model = ?, description = ?, image_url = ?, featured = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      name || existingProduct.name,
      brand || existingProduct.brand,
      price ? parseFloat(price) : existingProduct.price,
      category || existingProduct.category,
      gender || existingProduct.gender,
      model || existingProduct.model,
      description || existingProduct.description,
      imageUrl,
      featured !== undefined ? (featured === 'true' || featured === true ? 1 : 0) : existingProduct.featured,
      id
    ];
    
    db.run(query, params, function(err) {
      if (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({ error: 'Failed to update product' });
      }
      
      // Fetch the updated product
      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated product:', err);
          return res.status(500).json({ error: 'Product updated but failed to fetch' });
        }
        
        const product = {
          ...row,
          featured: Boolean(row.featured),
          price: Number(row.price)
        };
        
        res.json(product);
      });
    });
  });
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  // Check if product exists and get image info
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      console.error('Error checking product:', err);
      return res.status(500).json({ error: 'Failed to check product' });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete the product
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({ error: 'Failed to delete product' });
      }
      
      // Delete associated image file
      if (product.image_url) {
        const imagePath = path.join(__dirname, '../', product.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      res.json({ message: 'Product deleted successfully', id: id });
    });
  });
});

// GET /api/products/stats/summary - Get product statistics
router.get('/stats/summary', (req, res) => {
  const db = getDatabase();
  
  const queries = {
    total: 'SELECT COUNT(*) as count FROM products',
    featured: 'SELECT COUNT(*) as count FROM products WHERE featured = 1',
    byCategory: 'SELECT category, COUNT(*) as count FROM products GROUP BY category',
    byGender: 'SELECT gender, COUNT(*) as count FROM products GROUP BY gender'
  };
  
  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    if (key === 'total' || key === 'featured') {
      db.get(query, (err, row) => {
        if (err) {
          console.error(`Error fetching ${key} stats:`, err);
          results[key] = 0;
        } else {
          results[key] = row.count;
        }
        
        completed++;
        if (completed === totalQueries) {
          res.json(results);
        }
      });
    } else {
      db.all(query, (err, rows) => {
        if (err) {
          console.error(`Error fetching ${key} stats:`, err);
          results[key] = [];
        } else {
          results[key] = rows;
        }
        
        completed++;
        if (completed === totalQueries) {
          res.json(results);
        }
      });
    }
  });
});

module.exports = router;
