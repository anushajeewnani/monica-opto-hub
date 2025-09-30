const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// POST /api/analytics/track - Track visitor analytics
router.post('/track', (req, res) => {
  const db = getDatabase();
  const {
    visitorId,
    page,
    userAgent,
    referrer,
    ipAddress
  } = req.body;
  
  if (!visitorId || !page) {
    return res.status(400).json({ error: 'visitorId and page are required' });
  }
  
  const query = `
    INSERT INTO analytics (visitor_id, page, user_agent, referrer, ip_address)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const params = [
    visitorId,
    page,
    userAgent || '',
    referrer || '',
    ipAddress || ''
  ];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error tracking analytics:', err);
      return res.status(500).json({ error: 'Failed to track analytics' });
    }
    
    res.json({ message: 'Analytics tracked successfully', id: this.lastID });
  });
});

// GET /api/analytics/visitors - Get visitor analytics
router.get('/visitors', (req, res) => {
  const db = getDatabase();
  const { period = '30', page } = req.query;
  
  let query = `
    SELECT 
      visitor_id,
      page,
      user_agent,
      referrer,
      ip_address,
      timestamp
    FROM analytics 
    WHERE timestamp >= datetime('now', '-${parseInt(period)} days')
  `;
  
  const params = [];
  
  if (page) {
    query += ' AND page = ?';
    params.push(page);
  }
  
  query += ' ORDER BY timestamp DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching visitor analytics:', err);
      return res.status(500).json({ error: 'Failed to fetch visitor analytics' });
    }
    
    res.json({ visitors: rows, count: rows.length });
  });
});

// GET /api/analytics/stats - Get analytics statistics
router.get('/stats', (req, res) => {
  const db = getDatabase();
  const { period = '30' } = req.query;
  
  const queries = {
    totalVisitors: `
      SELECT COUNT(DISTINCT visitor_id) as count 
      FROM analytics 
      WHERE timestamp >= datetime('now', '-${parseInt(period)} days')
    `,
    totalPageViews: `
      SELECT COUNT(*) as count 
      FROM analytics 
      WHERE timestamp >= datetime('now', '-${parseInt(period)} days')
    `,
    uniqueVisitors: `
      SELECT COUNT(DISTINCT visitor_id) as count 
      FROM analytics 
      WHERE timestamp >= datetime('now', '-${parseInt(period)} days')
    `,
    popularPages: `
      SELECT page, COUNT(*) as views 
      FROM analytics 
      WHERE timestamp >= datetime('now', '-${parseInt(period)} days')
      GROUP BY page 
      ORDER BY views DESC 
      LIMIT 10
    `,
    dailyVisitors: `
      SELECT DATE(timestamp) as date, COUNT(DISTINCT visitor_id) as visitors
      FROM analytics 
      WHERE timestamp >= datetime('now', '-${parseInt(period)} days')
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `,
    deviceStats: `
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Mobile%' OR user_agent LIKE '%Android%' OR user_agent LIKE '%iPhone%' THEN 'Mobile'
          WHEN user_agent LIKE '%Tablet%' OR user_agent LIKE '%iPad%' THEN 'Tablet'
          ELSE 'Desktop'
        END as device_type,
        COUNT(DISTINCT visitor_id) as count
      FROM analytics 
      WHERE timestamp >= datetime('now', '-${parseInt(period)} days')
      GROUP BY device_type
    `
  };
  
  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    if (key === 'totalVisitors' || key === 'totalPageViews' || key === 'uniqueVisitors') {
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
    } else {
      db.all(query, (err, rows) => {
        if (err) {
          console.error(`Error fetching ${key}:`, err);
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

// GET /api/analytics/timeline - Get visitor timeline
router.get('/timeline', (req, res) => {
  const db = getDatabase();
  const { period = '7' } = req.query;
  
  const query = `
    SELECT 
      DATE(timestamp) as date,
      COUNT(DISTINCT visitor_id) as unique_visitors,
      COUNT(*) as page_views
    FROM analytics 
    WHERE timestamp >= datetime('now', '-${parseInt(period)} days')
    GROUP BY DATE(timestamp)
    ORDER BY date DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching timeline:', err);
      return res.status(500).json({ error: 'Failed to fetch timeline' });
    }
    
    res.json({ timeline: rows });
  });
});

// GET /api/analytics/pages - Get page analytics
router.get('/pages', (req, res) => {
  const db = getDatabase();
  const { period = '30' } = req.query;
  
  const query = `
    SELECT 
      page,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_id) as unique_visitors,
      AVG(CASE 
        WHEN visitor_id IN (
          SELECT visitor_id 
          FROM analytics 
          WHERE timestamp >= datetime('now', '-${parseInt(period)} days')
          GROUP BY visitor_id 
          HAVING COUNT(*) > 1
        ) THEN 1 
        ELSE 0 
      END) as bounce_rate
    FROM analytics 
    WHERE timestamp >= datetime('now', '-${parseInt(period)} days')
    GROUP BY page
    ORDER BY views DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching page analytics:', err);
      return res.status(500).json({ error: 'Failed to fetch page analytics' });
    }
    
    res.json({ pages: rows });
  });
});

module.exports = router;
