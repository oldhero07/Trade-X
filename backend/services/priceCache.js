const pool = require('../config/database');
const marketDataService = require('./marketDataService');

class PriceCache {
  constructor() {
    this.isUpdating = false;
    this.updateInterval = 5 * 60 * 1000; // 5 minutes
    this.popularStocks = [
      // Indian stocks
      'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'BHARTIARTL', 
      'ITC', 'SBIN', 'LT', 'HCLTECH', 'WIPRO', 'MARUTI', 'ASIANPAINT',
      'NESTLEIND', 'ULTRACEMCO', 'KOTAKBANK', 'AXISBANK', 'BAJFINANCE',
      'TITAN', 'SUNPHARMA',
      
      // US stocks
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'AMD',
      'NFLX', 'CRM', 'ORCL', 'INTC', 'PYPL', 'ADBE', 'CSCO',
      
      // ETFs and Indices
      'SPY', 'QQQ', 'GLD', 'BTC-USD'
    ];
  }

  async start() {
    console.log('🚀 Starting price cache service...');
    
    // Initial update
    await this.updateAllPrices();
    
    // Set up periodic updates
    setInterval(async () => {
      await this.updateAllPrices();
    }, this.updateInterval);
    
    console.log(`✅ Price cache service started. Updates every ${this.updateInterval / 1000 / 60} minutes.`);
  }

  async updateAllPrices() {
    if (this.isUpdating) {
      console.log('⏳ Price update already in progress, skipping...');
      return;
    }

    this.isUpdating = true;
    console.log('🔄 Updating cached prices...');
    
    try {
      // Get all unique tickers from watchlists and transactions
      const watchlistTickers = await pool.query(`
        SELECT DISTINCT ticker FROM watchlist_items
      `);
      
      const transactionTickers = await pool.query(`
        SELECT DISTINCT ticker FROM transactions
      `);
      
      // Combine all tickers
      const allTickers = new Set([
        ...this.popularStocks,
        ...watchlistTickers.rows.map(row => row.ticker),
        ...transactionTickers.rows.map(row => row.ticker)
      ]);

      console.log(`📊 Updating prices for ${allTickers.size} stocks...`);

      // Update prices in batches to avoid rate limits
      const batchSize = 5;
      const tickerArray = Array.from(allTickers);
      
      for (let i = 0; i < tickerArray.length; i += batchSize) {
        const batch = tickerArray.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (ticker) => {
          try {
            await this.updateSinglePrice(ticker);
          } catch (error) {
            console.error(`❌ Failed to update ${ticker}:`, error.message);
          }
        }));
        
        // Small delay between batches to respect rate limits
        if (i + batchSize < tickerArray.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log('✅ Price cache update completed');
    } catch (error) {
      console.error('❌ Price cache update failed:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  async updateSinglePrice(ticker) {
    try {
      // Use the new unified getQuote function (handles Indian stocks automatically)
      const quote = await marketDataService.getQuote(ticker);

      // Check if there was an error
      if (quote.error) {
        throw new Error(quote.message);
      }

      // Update cache in database
      await pool.query(`
        INSERT INTO market_data_cache (ticker, current_price, change_percent, volume, last_updated) 
        VALUES ($1, $2, $3, $4, NOW()) 
        ON CONFLICT (ticker) DO UPDATE SET 
        current_price = $2, 
        change_percent = $3, 
        volume = $4, 
        last_updated = NOW()
      `, [ticker, quote.price, quote.changePercent, quote.volume]);

      console.log(`📈 Updated ${ticker}: $${quote.price} (${quote.changePercent > 0 ? '+' : ''}${quote.changePercent}%)`);
      
    } catch (error) {
      // If API fails, keep existing cache data
      console.warn(`⚠️ Could not update ${ticker}, keeping cached data:`, error.message);
    }
  }

  async getCachedPrice(ticker) {
    try {
      const result = await pool.query(`
        SELECT * FROM market_data_cache 
        WHERE ticker = $1 
        ORDER BY last_updated DESC 
        LIMIT 1
      `, [ticker.toUpperCase()]);

      if (result.rows.length > 0) {
        const cached = result.rows[0];
        const ageMinutes = (Date.now() - new Date(cached.last_updated).getTime()) / (1000 * 60);
        
        return {
          ticker: cached.ticker,
          price: parseFloat(cached.current_price),
          changePercent: parseFloat(cached.change_percent),
          volume: parseInt(cached.volume) || 0,
          lastUpdated: cached.last_updated,
          cached: true,
          ageMinutes: Math.round(ageMinutes)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Cache lookup error:', error);
      return null;
    }
  }

  async getCachedPrices(tickers) {
    try {
      const placeholders = tickers.map((_, i) => `$${i + 1}`).join(',');
      const upperTickers = tickers.map(t => t.toUpperCase());
      
      const result = await pool.query(`
        SELECT * FROM market_data_cache 
        WHERE ticker IN (${placeholders})
        ORDER BY last_updated DESC
      `, upperTickers);

      return result.rows.map(cached => ({
        ticker: cached.ticker,
        price: parseFloat(cached.current_price),
        changePercent: parseFloat(cached.change_percent),
        volume: parseInt(cached.volume) || 0,
        lastUpdated: cached.last_updated,
        cached: true,
        ageMinutes: Math.round((Date.now() - new Date(cached.last_updated).getTime()) / (1000 * 60))
      }));
    } catch (error) {
      console.error('Batch cache lookup error:', error);
      return [];
    }
  }

  async forceUpdate(ticker) {
    console.log(`🔄 Force updating ${ticker}...`);
    await this.updateSinglePrice(ticker);
    return await this.getCachedPrice(ticker);
  }

  getStatus() {
    return {
      isUpdating: this.isUpdating,
      updateInterval: this.updateInterval,
      popularStocksCount: this.popularStocks.length,
      lastUpdate: new Date().toISOString()
    };
  }
}

module.exports = new PriceCache();