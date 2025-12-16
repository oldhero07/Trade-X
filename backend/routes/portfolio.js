const express = require('express');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

const router = express.Router();

// Get user's portfolio
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all transactions for the user
    const transactions = await pool.query(
      `SELECT ticker, 
              SUM(CASE WHEN type = 'BUY' THEN quantity ELSE -quantity END) as total_quantity,
              AVG(CASE WHEN type = 'BUY' THEN price_per_share END) as avg_buy_price
       FROM transactions 
       WHERE user_id = $1 
       GROUP BY ticker 
       HAVING SUM(CASE WHEN type = 'BUY' THEN quantity ELSE -quantity END) > 0`,
      [userId]
    );

    // Get current market prices (from cache or external API)
    const portfolio = [];
    let totalValue = 0;

    for (const holding of transactions.rows) {
      // Get current price from cache
      const priceData = await pool.query(
        'SELECT current_price FROM market_data_cache WHERE ticker = $1',
        [holding.ticker]
      );

      const currentPrice = priceData.rows[0]?.current_price || holding.avg_buy_price;
      const value = holding.total_quantity * currentPrice;
      const gainLoss = ((currentPrice - holding.avg_buy_price) / holding.avg_buy_price) * 100;

      portfolio.push({
        ticker: holding.ticker,
        quantity: parseFloat(holding.total_quantity),
        avgBuyPrice: parseFloat(holding.avg_buy_price),
        currentPrice: parseFloat(currentPrice),
        value: parseFloat(value.toFixed(2)),
        gainLossPercent: parseFloat(gainLoss.toFixed(2))
      });

      totalValue += value;
    }

    // Calculate allocations
    const portfolioWithAllocations = portfolio.map(holding => ({
      ...holding,
      allocation: parseFloat(((holding.value / totalValue) * 100).toFixed(2))
    }));

    res.json({
      totalValue: parseFloat(totalValue.toFixed(2)),
      holdings: portfolioWithAllocations
    });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new transaction
router.post('/transaction', authenticateToken, async (req, res) => {
  try {
    const { ticker, type, quantity, pricePerShare } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!ticker || !type || !quantity || !pricePerShare) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['BUY', 'SELL'].includes(type.toUpperCase())) {
      return res.status(400).json({ error: 'Type must be BUY or SELL' });
    }

    // Add transaction
    const newTransaction = await pool.query(
      'INSERT INTO transactions (user_id, ticker, type, quantity, price_per_share) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, ticker.toUpperCase(), type.toUpperCase(), quantity, pricePerShare]
    );

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction: newTransaction.rows[0]
    });
  } catch (error) {
    console.error('Transaction add error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const transactions = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC',
      [userId]
    );

    res.json(transactions.rows);
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;