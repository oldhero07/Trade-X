const express = require('express');
const axios = require('axios');
const pool = require('../config/database');
const marketDataService = require('../services/marketDataService');
const priceCache = require('../services/priceCache');

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

// Search stocks
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const results = await marketDataService.searchStocks(query);
    res.json(results);
  } catch (error) {
    console.error('Stock search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cache status
router.get('/cache/status', async (req, res) => {
  try {
    const status = priceCache.getStatus();
    
    // Get cache statistics
    const cacheStats = await pool.query(`
      SELECT 
        COUNT(*) as total_cached,
        COUNT(CASE WHEN last_updated > NOW() - INTERVAL '10 minutes' THEN 1 END) as fresh_data,
        MAX(last_updated) as latest_update,
        MIN(last_updated) as oldest_update
      FROM market_data_cache
    `);
    
    res.json({
      ...status,
      statistics: cacheStats.rows[0]
    });
  } catch (error) {
    console.error('Cache status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Force cache update for specific ticker
router.post('/cache/update/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const updatedPrice = await priceCache.forceUpdate(ticker);
    
    res.json({
      message: `Cache updated for ${ticker}`,
      data: updatedPrice
    });
  } catch (error) {
    console.error('Cache update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current price for a ticker (cached)
router.get('/price/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const { force } = req.query;

    // Try to get from cache first
    let cachedPrice = await priceCache.getCachedPrice(ticker);
    
    // If no cache or force refresh requested, update it
    if (!cachedPrice || force === 'true') {
      cachedPrice = await priceCache.forceUpdate(ticker);
    }
    
    if (cachedPrice) {
      res.json({
        ticker: cachedPrice.ticker,
        current_price: cachedPrice.price,
        change_percent: cachedPrice.changePercent,
        volume: cachedPrice.volume,
        last_updated: cachedPrice.lastUpdated,
        cached: cachedPrice.cached,
        age_minutes: cachedPrice.ageMinutes
      });
    } else {
      res.status(404).json({ error: 'Price data not available' });
    }
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get market overview (cached)
router.get('/overview', async (req, res) => {
  try {
    // Get cached prices for major indices
    const majorTickers = ['SPY', 'QQQ', 'GLD', 'BTC-USD'];
    const cachedPrices = await priceCache.getCachedPrices(majorTickers);
    
    // Get Indian indices (these update less frequently, so we can call directly)
    const indianIndices = await marketDataService.getIndianIndices();
    
    const overview = {
      indianIndices: indianIndices,
      globalIndices: cachedPrices.map(quote => ({
        ticker: quote.ticker,
        name: quote.ticker === 'SPY' ? 'S&P 500' : 
              quote.ticker === 'QQQ' ? 'NASDAQ' :
              quote.ticker === 'GLD' ? 'Gold' : 'Bitcoin',
        price: quote.price,
        change: `${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%`,
        trend: quote.changePercent > 0 ? 'up' : 'down',
        age_minutes: quote.ageMinutes
      })),
      marketStatus: 'OPEN',
      lastUpdated: new Date().toISOString(),
      cacheStatus: priceCache.getStatus()
    };

    res.json(overview);
  } catch (error) {
    console.error('Market overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;