const express = require('express');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate JWT token (optional for development)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For development, use a default user ID
    req.user = { userId: 1 };
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      // For development, use a default user ID
      req.user = { userId: 1 };
      return next();
    }
    req.user = user;
    next();
  });
}

// Get user's watchlists
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const watchlists = await pool.query(`
      SELECT w.watchlist_id, w.name, w.created_at,
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'ticker', wi.ticker,
                   'added_at', wi.added_at
                 ) ORDER BY wi.added_at DESC
               ) FILTER (WHERE wi.ticker IS NOT NULL), 
               '[]'::json
             ) as stocks
      FROM watchlists w
      LEFT JOIN watchlist_items wi ON w.watchlist_id = wi.watchlist_id
      WHERE w.user_id = $1
      GROUP BY w.watchlist_id, w.name, w.created_at
      ORDER BY w.created_at DESC
    `, [userId]);

    res.json(watchlists.rows);
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new watchlist
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ error: 'Watchlist name is required' });
    }

    const newWatchlist = await pool.query(
      'INSERT INTO watchlists (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name]
    );

    res.status(201).json({
      message: 'Watchlist created successfully',
      watchlist: newWatchlist.rows[0]
    });
  } catch (error) {
    console.error('Watchlist creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add stock to watchlist
router.post('/:watchlistId/stocks', authenticateToken, async (req, res) => {
  try {
    const { watchlistId } = req.params;
    const { ticker } = req.body;
    const userId = req.user.userId;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker is required' });
    }

    // Verify watchlist belongs to user
    const watchlist = await pool.query(
      'SELECT * FROM watchlists WHERE watchlist_id = $1 AND user_id = $2',
      [watchlistId, userId]
    );

    if (watchlist.rows.length === 0) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    // Check if stock already exists in watchlist
    const existingStock = await pool.query(
      'SELECT * FROM watchlist_items WHERE watchlist_id = $1 AND ticker = $2',
      [watchlistId, ticker.toUpperCase()]
    );

    if (existingStock.rows.length > 0) {
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }

    // Add stock to watchlist
    await pool.query(
      'INSERT INTO watchlist_items (watchlist_id, ticker) VALUES ($1, $2)',
      [watchlistId, ticker.toUpperCase()]
    );

    res.status(201).json({
      message: 'Stock added to watchlist successfully'
    });
  } catch (error) {
    console.error('Add stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove stock from watchlist
router.delete('/:watchlistId/stocks/:ticker', authenticateToken, async (req, res) => {
  try {
    const { watchlistId, ticker } = req.params;
    const userId = req.user.userId;

    // Verify watchlist belongs to user
    const watchlist = await pool.query(
      'SELECT * FROM watchlists WHERE watchlist_id = $1 AND user_id = $2',
      [watchlistId, userId]
    );

    if (watchlist.rows.length === 0) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    // Remove stock from watchlist
    const result = await pool.query(
      'DELETE FROM watchlist_items WHERE watchlist_id = $1 AND ticker = $2',
      [watchlistId, ticker.toUpperCase()]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Stock not found in watchlist' });
    }

    res.json({
      message: 'Stock removed from watchlist successfully'
    });
  } catch (error) {
    console.error('Remove stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete watchlist
router.delete('/:watchlistId', authenticateToken, async (req, res) => {
  try {
    const { watchlistId } = req.params;
    const userId = req.user.userId;

    // Verify watchlist belongs to user
    const watchlist = await pool.query(
      'SELECT * FROM watchlists WHERE watchlist_id = $1 AND user_id = $2',
      [watchlistId, userId]
    );

    if (watchlist.rows.length === 0) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    // Delete watchlist (cascade will delete watchlist_items)
    await pool.query(
      'DELETE FROM watchlists WHERE watchlist_id = $1',
      [watchlistId]
    );

    res.json({
      message: 'Watchlist deleted successfully'
    });
  } catch (error) {
    console.error('Delete watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;