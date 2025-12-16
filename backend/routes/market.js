const express = require('express');
const axios = require('axios');
const pool = require('../config/database');

const router = express.Router();

// Get market movers (top gainers/losers)
router.get('/movers', async (req, res) => {
  try {
    // For demo purposes, return mock data
    // In production, you'd fetch from a real API like Finnhub or Alpha Vantage
    const mockData = {
      gainers: [
        { ticker: 'NVDA', price: 875.50, change: '+5.2%', volume: '45.2M' },
        { ticker: 'AMD', price: 142.30, change: '+3.8%', volume: '32.1M' },
        { ticker: 'TSLA', price: 248.90, change: '+2.9%', volume: '89.5M' },
        { ticker: 'AAPL', price: 195.20, change: '+1.7%', volume: '67.3M' },
        { ticker: 'MSFT', price: 415.80, change: '+1.4%', volume: '28.9M' }
      ],
      losers: [
        { ticker: 'META', price: 512.30, change: '-2.1%', volume: '15.7M' },
        { ticker: 'GOOGL', price: 168.90, change: '-1.8%', volume: '22.4M' },
        { ticker: 'AMZN', price: 178.50, change: '-1.5%', volume: '41.2M' },
        { ticker: 'NFLX', price: 485.60, change: '-1.2%', volume: '8.9M' },
        { ticker: 'CRM', price: 289.40, change: '-0.9%', volume: '12.3M' }
      ]
    };

    res.json(mockData);
  } catch (error) {
    console.error('Market movers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sector performance
router.get('/sector-flow', async (req, res) => {
  try {
    // Mock sector data
    const sectorData = [
      { name: 'Technology', performance: 2.8, color: '#46ec13' },
      { name: 'Healthcare', performance: 1.5, color: '#3bd10f' },
      { name: 'Financial', performance: 0.9, color: '#2fb80c' },
      { name: 'Consumer', performance: -0.3, color: '#ff6b6b' },
      { name: 'Energy', performance: -1.2, color: '#ff5252' },
      { name: 'Utilities', performance: -1.8, color: '#ff4d4d' }
    ];

    res.json(sectorData);
  } catch (error) {
    console.error('Sector flow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current price for a ticker
router.get('/price/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;

    // Check cache first
    const cachedData = await pool.query(
      'SELECT * FROM market_data_cache WHERE ticker = $1 AND last_updated > NOW() - INTERVAL \'5 minutes\'',
      [ticker.toUpperCase()]
    );

    if (cachedData.rows.length > 0) {
      return res.json(cachedData.rows[0]);
    }

    // If not in cache or outdated, fetch from external API
    // For demo, return mock data
    const mockPrice = {
      ticker: ticker.toUpperCase(),
      current_price: Math.random() * 500 + 50, // Random price between 50-550
      change_percent: (Math.random() - 0.5) * 10, // Random change between -5% to +5%
      volume: Math.floor(Math.random() * 100000000),
      last_updated: new Date()
    };

    // Update cache
    await pool.query(
      `INSERT INTO market_data_cache (ticker, current_price, change_percent, volume, last_updated) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (ticker) DO UPDATE SET 
       current_price = $2, change_percent = $3, volume = $4, last_updated = $5`,
      [mockPrice.ticker, mockPrice.current_price, mockPrice.change_percent, mockPrice.volume, mockPrice.last_updated]
    );

    res.json(mockPrice);
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get market overview (SPY, GLD, BTC, etc.)
router.get('/overview', async (req, res) => {
  try {
    const overview = {
      indices: [
        { ticker: 'SPY', name: 'S&P 500', price: 478.50, change: '+0.8%', trend: 'up' },
        { ticker: 'QQQ', name: 'NASDAQ', price: 412.30, change: '+1.2%', trend: 'up' },
        { ticker: 'GLD', name: 'Gold', price: 198.90, change: '-0.3%', trend: 'down' },
        { ticker: 'BTC-USD', name: 'Bitcoin', price: 42150.00, change: '+2.1%', trend: 'up' }
      ],
      marketStatus: 'OPEN', // or 'CLOSED', 'PRE_MARKET', 'AFTER_HOURS'
      lastUpdated: new Date().toISOString()
    };

    res.json(overview);
  } catch (error) {
    console.error('Market overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;