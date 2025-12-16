const express = require('express');
const axios = require('axios');
const pool = require('../config/database');
const marketDataService = require('../services/marketDataService');

const router = express.Router();

// Get market movers (top gainers/losers)
router.get('/movers', async (req, res) => {
  try {
    const movers = await marketDataService.getTopMovers();
    res.json(movers);
  } catch (error) {
    console.error('Market movers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sector performance
router.get('/sector-flow', async (req, res) => {
  try {
    const sectorData = await marketDataService.getSectorPerformance();
    res.json(sectorData);
  } catch (error) {
    console.error('Sector flow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get market news
router.get('/news', async (req, res) => {
  try {
    const news = await marketDataService.getMarketNews();
    res.json(news);
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current price for a ticker (supports both Indian and US stocks)
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

    // Determine if it's an Indian stock
    const indianStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'BHARTIARTL', 'ITC', 'SBIN', 'LT', 'HCLTECH'];
    let quote;
    
    if (indianStocks.includes(ticker.toUpperCase())) {
      quote = await marketDataService.getIndianQuote(ticker.toUpperCase());
    } else {
      quote = await marketDataService.getQuote(ticker.toUpperCase());
    }

    // Update cache
    await pool.query(
      `INSERT INTO market_data_cache (ticker, current_price, change_percent, volume, last_updated) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (ticker) DO UPDATE SET 
       current_price = $2, change_percent = $3, volume = $4, last_updated = $5`,
      [quote.symbol, quote.price, quote.changePercent, quote.volume, quote.lastUpdated]
    );

    res.json({
      ticker: quote.symbol,
      current_price: quote.price,
      change_percent: quote.changePercent,
      volume: quote.volume,
      last_updated: quote.lastUpdated
    });
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get market overview (Indian indices + Global)
router.get('/overview', async (req, res) => {
  try {
    // Get Indian indices
    const indianIndices = await marketDataService.getIndianIndices();
    
    // Get global indices
    const globalQuotes = await marketDataService.getMultipleQuotes(['SPY', 'QQQ', 'GLD', 'BTC-USD']);
    
    const overview = {
      indianIndices: indianIndices,
      globalIndices: globalQuotes.map(quote => ({
        ticker: quote.symbol,
        name: quote.symbol === 'SPY' ? 'S&P 500' : 
              quote.symbol === 'QQQ' ? 'NASDAQ' :
              quote.symbol === 'GLD' ? 'Gold' : 'Bitcoin',
        price: quote.price,
        change: `${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%`,
        trend: quote.changePercent > 0 ? 'up' : 'down'
      })),
      marketStatus: 'OPEN',
      lastUpdated: new Date().toISOString()
    };

    res.json(overview);
  } catch (error) {
    console.error('Market overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;