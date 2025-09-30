const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// GET /api/appointments - Get all appointments with optional filtering
router.get('/', (req, res) => {
  const db = getDatabase();
  const { status, type, search, limit, offset } = req.query;
  
  let query = 'SELECT * FROM appointments WHERE 1=1';
  const params = [];
  
  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (type && type !== 'all') {
    query += ' AND type = ?';
    params.push(type);
  }
  
  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
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
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
    
    res.json({ appointments: rows, count: rows.length });
  });
});

// GET /api/appointments/:id - Get single appointment
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  db.get('SELECT * FROM appointments WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching appointment:', err);
      return res.status(500).json({ error: 'Failed to fetch appointment' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(row);
  });
});

// POST /api/appointments - Create new appointment
router.post('/', (req, res) => {
  const db = getDatabase();
  const {
    type,
    name,
    email,
    phone,
    service,
    preferredDate,
    preferredTime,
    message,
    source
  } = req.body;
  
  // Validate required fields
  if (!type || !name || !email || !phone || !service) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const id = 'apt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  const query = `
    INSERT INTO appointments 
    (id, type, name, email, phone, service, preferred_date, preferred_time, message, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    id,
    type,
    name,
    email,
    phone,
    service,
    preferredDate || null,
    preferredTime || null,
    message || '',
    source || 'Website'
  ];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error creating appointment:', err);
      return res.status(500).json({ error: 'Failed to create appointment' });
    }
    
    // Fetch the created appointment
    db.get('SELECT * FROM appointments WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching created appointment:', err);
        return res.status(500).json({ error: 'Appointment created but failed to fetch' });
      }
      
      res.status(201).json(row);
    });
  });
});

// PUT /api/appointments/:id - Update appointment status
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  db.run(
    'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        console.error('Error updating appointment:', err);
        return res.status(500).json({ error: 'Failed to update appointment' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      // Fetch the updated appointment
      db.get('SELECT * FROM appointments WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated appointment:', err);
          return res.status(500).json({ error: 'Appointment updated but failed to fetch' });
        }
        
        res.json(row);
      });
    }
  );
  
  db.close();
});

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  db.run('DELETE FROM appointments WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting appointment:', err);
      return res.status(500).json({ error: 'Failed to delete appointment' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully', id: id });
  });
});

// GET /api/appointments/stats/summary - Get appointment statistics
router.get('/stats/summary', (req, res) => {
  const db = getDatabase();
  
  const queries = {
    total: 'SELECT COUNT(*) as count FROM appointments',
    pending: 'SELECT COUNT(*) as count FROM appointments WHERE status = "pending"',
    confirmed: 'SELECT COUNT(*) as count FROM appointments WHERE status = "confirmed"',
    completed: 'SELECT COUNT(*) as count FROM appointments WHERE status = "completed"',
    cancelled: 'SELECT COUNT(*) as count FROM appointments WHERE status = "cancelled"',
    byType: 'SELECT type, COUNT(*) as count FROM appointments GROUP BY type',
    byStatus: 'SELECT status, COUNT(*) as count FROM appointments GROUP BY status'
  };
  
  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    if (key === 'total' || key === 'pending' || key === 'confirmed' || key === 'completed' || key === 'cancelled') {
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
