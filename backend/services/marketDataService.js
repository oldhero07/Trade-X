const YahooFinanceAPI = require('yahoo-finance2').default;
const yahooFinance = new YahooFinanceAPI();

// Indian stocks that require .NS suffix for Yahoo Finance
const INDIAN_STOCKS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 
  'BHARTIARTL', 'ITC', 'SBIN', 'LT', 'HCLTECH',
  'WIPRO', 'MARUTI', 'ASIANPAINT', 'NESTLEIND', 'ULTRACEMCO',
  'KOTAKBANK', 'AXISBANK', 'BAJFINANCE', 'TITAN', 'SUNPHARMA',
  'ADANIENT'
];

class MarketDataService {
  constructor() {
    // No API keys needed for yahoo-finance2
    console.log('MarketDataService initialized with yahoo-finance2');
  }

  /**
   * Check if a ticker symbol is an Indian stock
   * @param {string} ticker - Stock ticker symbol
   * @returns {boolean} - True if Indian stock
   */
  isIndianStock(ticker) {
    return INDIAN_STOCKS.includes(ticker.toUpperCase());
  }

  /**
   * Get stock quote with automatic Indian stock detection
   * @param {string} ticker - Stock ticker symbol (e.g., 'RELIANCE', 'AAPL')
   * @returns {Object} - Standardized quote object
   */
  async getQuote(ticker) {
    try {
      // Determine the symbol to query Yahoo Finance with
      let querySymbol = ticker.toUpperCase();
      
      // Auto-append .NS for Indian stocks
      if (this.isIndianStock(querySymbol)) {
        querySymbol = `${querySymbol}.NS`;
      }

      console.log(`Fetching quote for ${ticker} (querying: ${querySymbol})`);
      
      // Fetch quote from Yahoo Finance
      const quote = await yahooFinance.quote(querySymbol);
      
      if (!quote) {
        throw new Error(`No data found for ${ticker}`);
      }

      // Determine currency based on stock type
      const currency = this.isIndianStock(ticker) ? '₹' : '$';
      
      // Calculate change percentage
      const currentPrice = quote.regularMarketPrice || quote.price || 0;
      const previousClose = quote.regularMarketPreviousClose || quote.previousClose || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;
      
      // Return standardized response (original ticker, not the .NS version)
      return {
        symbol: ticker.toUpperCase(),
        name: quote.displayName || quote.shortName || quote.longName || ticker,
        price: currentPrice,
        currency: currency,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2))
      };

    } catch (error) {
      console.error(`Error fetching quote for ${ticker}:`, error.message);
      
      // Return structured error response
      return {
        error: true,
        message: `Failed to fetch quote for ${ticker}: ${error.message}`,
        symbol: ticker.toUpperCase(),
        timestamp: new Date()
      };
    }
  }

  /**
   * Get Indian market status based on Nifty 50 index
   * @returns {Object} - Market status with Bullish/Bearish indicator
   */
  async getMarketStatus() {
    try {
      console.log('Fetching Nifty 50 index data for market status...');
      
      // Query Nifty 50 index (^NSEI)
      const niftyData = await yahooFinance.quote('^NSEI');
      
      if (!niftyData) {
        throw new Error('No Nifty 50 data available');
      }

      const currentPrice = niftyData.regularMarketPrice;
      const previousClose = niftyData.regularMarketPreviousClose;
      
      if (!currentPrice || !previousClose) {
        throw new Error('Incomplete Nifty 50 price data');
      }

      // Calculate change
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      // Determine market status
      const status = currentPrice > previousClose ? 'Bullish' : 'Bearish';

      return {
        status: status,
        niftyPrice: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2))
      };

    } catch (error) {
      console.error('Error fetching market status:', error.message);
      
      // Return structured error response
      return {
        error: true,
        message: `Failed to fetch market status: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get multiple stock quotes
   * @param {Array} symbols - Array of ticker symbols
   * @returns {Array} - Array of quote objects
   */
  async getMultipleQuotes(symbols) {
    const promises = symbols.map(symbol => this.getQuote(symbol));
    return Promise.all(promises);
  }

  /**
   * Search for stocks (using existing mock data for now)
   * @param {string} query - Search query
   * @returns {Array} - Array of matching stocks
   */
  async searchStocks(query) {
    try {
      const searchQuery = query.toLowerCase();
      
      // Combined database of Indian and US stocks
      const stockDatabase = [
        // Indian Stocks (NSE)
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', currency: '₹' },
        { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', exchange: 'NSE', currency: '₹' },
        { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', currency: '₹' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', currency: '₹' },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', currency: '₹' },
        { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', exchange: 'NSE', currency: '₹' },
        { symbol: 'ITC', name: 'ITC Ltd', exchange: 'NSE', currency: '₹' },
        { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', currency: '₹' },
        { symbol: 'LT', name: 'Larsen & Toubro Ltd', exchange: 'NSE', currency: '₹' },
        { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', exchange: 'NSE', currency: '₹' },
        
        // US Stocks (NASDAQ/NYSE)
        { symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ', currency: '$' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', currency: '$' },
        { symbol: 'GOOGL', name: 'Alphabet Inc Class A', exchange: 'NASDAQ', currency: '$' },
        { symbol: 'AMZN', name: 'Amazon.com Inc', exchange: 'NASDAQ', currency: '$' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', currency: '$' },
        { symbol: 'TSLA', name: 'Tesla Inc', exchange: 'NASDAQ', currency: '$' },
        { symbol: 'META', name: 'Meta Platforms Inc', exchange: 'NASDAQ', currency: '$' }
      ];

      // Filter stocks based on search query
      const results = stockDatabase.filter(stock => 
        stock.symbol.toLowerCase().includes(searchQuery) ||
        stock.name.toLowerCase().includes(searchQuery)
      ).slice(0, 10); // Limit to 10 results

      // Get current prices for the results
      const enrichedResults = await Promise.all(
        results.map(async (stock) => {
          try {
            const quote = await this.getQuote(stock.symbol);
            
            return {
              symbol: stock.symbol,
              name: stock.name,
              exchange: stock.exchange,
              currency: stock.currency,
              price: quote.error ? 0 : quote.price,
              change: 0, // Could be enhanced to include change data
              type: 'stock'
            };
          } catch (error) {
            return {
              symbol: stock.symbol,
              name: stock.name,
              exchange: stock.exchange,
              currency: stock.currency,
              price: 0,
              change: 0,
              type: 'stock'
            };
          }
        })
      );

      return enrichedResults;
    } catch (error) {
      console.error('Stock search error:', error);
      return [];
    }
  }
}

module.exports = new MarketDataService();