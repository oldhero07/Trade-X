const axios = require('axios');

class MarketDataService {
  constructor() {
    // Free API key for Alpha Vantage - you should get your own
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    this.finnhubKey = process.env.FINNHUB_API_KEY || 'demo';
    this.baseURL = 'https://www.alphavantage.co/query';
    this.finnhubURL = 'https://finnhub.io/api/v1';
  }

  async getQuote(symbol) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.alphaVantageKey
        }
      });

      const quote = response.data['Global Quote'];
      if (!quote) {
        throw new Error('No data found');
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      // Fallback to mock data if API fails
      return this.getMockQuote(symbol);
    }
  }

  async getMultipleQuotes(symbols) {
    const promises = symbols.map(symbol => this.getQuote(symbol));
    return Promise.all(promises);
  }

  async getMarketNews() {
    try {
      const response = await axios.get(`${this.finnhubURL}/news`, {
        params: {
          category: 'general',
          token: this.finnhubKey
        }
      });

      return response.data.slice(0, 10).map(article => ({
        id: article.id,
        headline: article.headline,
        summary: article.summary,
        url: article.url,
        source: article.source,
        publishedAt: new Date(article.datetime * 1000),
        image: article.image
      }));
    } catch (error) {
      console.error('Error fetching news:', error.message);
      return this.getMockNews();
    }
  }

  async getSectorPerformance() {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          function: 'SECTOR',
          apikey: this.alphaVantageKey
        }
      });

      const sectors = response.data['Rank A: Real-Time Performance'];
      if (!sectors) {
        throw new Error('No sector data found');
      }

      return Object.entries(sectors).map(([name, performance]) => ({
        name: name.replace(/\s+/g, ' ').trim(),
        performance: parseFloat(performance.replace('%', '')),
        color: parseFloat(performance.replace('%', '')) > 0 ? '#46ec13' : '#ff4d4d'
      }));
    } catch (error) {
      console.error('Error fetching sector data:', error.message);
      return this.getMockSectorData();
    }
  }

  async getTopMovers() {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          function: 'TOP_GAINERS_LOSERS',
          apikey: this.alphaVantageKey
        }
      });

      const data = response.data;
      return {
        gainers: data.top_gainers?.slice(0, 5).map(stock => ({
          ticker: stock.ticker,
          price: `$${parseFloat(stock.price).toFixed(2)}`,
          change: `+${stock.change_percentage}`,
          volume: this.formatVolume(stock.volume)
        })) || this.getMockGainers(),
        losers: data.top_losers?.slice(0, 5).map(stock => ({
          ticker: stock.ticker,
          price: `$${parseFloat(stock.price).toFixed(2)}`,
          change: stock.change_percentage,
          volume: this.formatVolume(stock.volume)
        })) || this.getMockLosers()
      };
    } catch (error) {
      console.error('Error fetching top movers:', error.message);
      return {
        gainers: this.getMockGainers(),
        losers: this.getMockLosers()
      };
    }
  }

  formatVolume(volume) {
    const num = parseInt(volume);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  // Indian Stock Market Integration
  async getIndianQuote(symbol) {
    try {
      // Using Yahoo Finance API for Indian stocks (NSE/BSE)
      const nseSymbol = symbol.includes('.NS') ? symbol : `${symbol}.NS`;
      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${nseSymbol}`);
      
      const result = response.data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];
      
      return {
        symbol: symbol,
        price: parseFloat(meta.regularMarketPrice.toFixed(2)),
        change: parseFloat((meta.regularMarketPrice - meta.previousClose).toFixed(2)),
        changePercent: parseFloat(((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2)),
        volume: meta.regularMarketVolume || 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`Error fetching Indian quote for ${symbol}:`, error.message);
      return this.getMockIndianQuote(symbol);
    }
  }

  async getIndianIndices() {
    const indices = ['NIFTY', 'SENSEX', 'BANKNIFTY'];
    const promises = indices.map(async (index) => {
      try {
        const symbol = index === 'NIFTY' ? '^NSEI' : 
                     index === 'SENSEX' ? '^BSESN' : 
                     '^NSEBANK';
        
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
        const result = response.data.chart.result[0];
        const meta = result.meta;
        
        return {
          name: index,
          price: parseFloat(meta.regularMarketPrice.toFixed(2)),
          change: parseFloat(((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2)),
          trend: meta.regularMarketPrice > meta.previousClose ? 'up' : 'down'
        };
      } catch (error) {
        return this.getMockIndianIndex(index);
      }
    });
    
    return Promise.all(promises);
  }

  // Fallback mock data methods
  getMockQuote(symbol) {
    // Combined US and Indian stocks
    const mockPrices = {
      // US Stocks
      'SPY': 478.50,
      'QQQ': 412.30,
      'AAPL': 195.20,
      'NVDA': 875.50,
      'TSLA': 248.90,
      'MSFT': 415.80,
      'GOOGL': 168.90,
      'AMZN': 178.50,
      'META': 512.30,
      'BTC-USD': 42150.00,
      'GLD': 198.90,
      
      // Indian Stocks (NSE)
      'RELIANCE': 2850.75,
      'TCS': 4125.30,
      'INFY': 1789.45,
      'HDFCBANK': 1654.20,
      'ICICIBANK': 1198.85,
      'BHARTIARTL': 1589.60,
      'ITC': 456.75,
      'SBIN': 825.40,
      'LT': 3654.90,
      'HCLTECH': 1845.25,
      'WIPRO': 578.35,
      'MARUTI': 12456.80,
      'ASIANPAINT': 2987.65,
      'NESTLEIND': 2234.50,
      'ULTRACEMCO': 11245.75
    };

    const basePrice = mockPrices[symbol] || 100 + Math.random() * 400;
    const changePercent = (Math.random() - 0.5) * 10;
    const change = basePrice * (changePercent / 100);

    return {
      symbol,
      price: parseFloat((basePrice + change).toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 100000000),
      lastUpdated: new Date()
    };
  }

  getMockNews() {
    return [
      {
        id: '1',
        headline: 'Fed Signals Potential Rate Cuts Amid Inflation Concerns',
        summary: 'Federal Reserve officials hint at dovish pivot in upcoming policy meetings as inflation shows signs of cooling.',
        source: 'Reuters',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        url: '#'
      },
      {
        id: '2',
        headline: 'Tech Stocks Rally on AI Infrastructure Spending',
        summary: 'Major technology companies see significant gains as AI infrastructure investments continue to drive growth.',
        source: 'Bloomberg',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        url: '#'
      },
      {
        id: '3',
        headline: 'Oil Prices Dip Below $80 on Supply Concerns',
        summary: 'Crude oil futures decline as global supply concerns outweigh geopolitical tensions.',
        source: 'CNBC',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        url: '#'
      }
    ];
  }

  getMockSectorData() {
    return [
      { name: 'Technology', performance: 2.8, color: '#46ec13' },
      { name: 'Healthcare', performance: 1.5, color: '#46ec13' },
      { name: 'Financial Services', performance: 0.9, color: '#46ec13' },
      { name: 'Consumer Discretionary', performance: -0.3, color: '#ff4d4d' },
      { name: 'Energy', performance: -1.2, color: '#ff4d4d' },
      { name: 'Utilities', performance: -1.8, color: '#ff4d4d' }
    ];
  }

  getMockIndianQuote(symbol) {
    const indianPrices = {
      'RELIANCE': 2850.75,
      'TCS': 4125.30,
      'INFY': 1789.45,
      'HDFCBANK': 1654.20,
      'ICICIBANK': 1198.85,
      'BHARTIARTL': 1589.60,
      'ITC': 456.75,
      'SBIN': 825.40,
      'LT': 3654.90,
      'HCLTECH': 1845.25
    };

    const basePrice = indianPrices[symbol] || 1000 + Math.random() * 2000;
    const changePercent = (Math.random() - 0.5) * 8; // Indian market volatility
    const change = basePrice * (changePercent / 100);

    return {
      symbol,
      price: parseFloat((basePrice + change).toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      lastUpdated: new Date()
    };
  }

  getMockIndianIndex(index) {
    const indices = {
      'NIFTY': { price: 21737.60, change: 1.2 },
      'SENSEX': { price: 71595.50, change: 0.8 },
      'BANKNIFTY': { price: 46825.30, change: 2.1 }
    };

    const data = indices[index] || { price: 20000, change: 0.5 };
    return {
      name: index,
      price: data.price,
      change: data.change,
      trend: data.change > 0 ? 'up' : 'down'
    };
  }

  getMockGainers() {
    return [
      // Mix of Indian and US stocks
      { ticker: 'RELIANCE', price: '₹2,850.75', change: '+3.2%', volume: '12.5M' },
      { ticker: 'TCS', price: '₹4,125.30', change: '+2.8%', volume: '8.9M' },
      { ticker: 'NVDA', price: '$895.32', change: '+4.2%', volume: '45.2M' },
      { ticker: 'INFY', price: '₹1,789.45', change: '+2.1%', volume: '15.6M' },
      { ticker: 'HDFCBANK', price: '₹1,654.20', change: '+1.9%', volume: '22.3M' }
    ];
  }

  getMockLosers() {
    return [
      { ticker: 'ITC', price: '₹456.75', change: '-1.8%', volume: '18.7M' },
      { ticker: 'META', price: '$512.30', change: '-2.1%', volume: '15.7M' },
      { ticker: 'SBIN', price: '₹825.40', change: '-1.5%', volume: '25.4M' },
      { ticker: 'GOOGL', price: '$168.90', change: '-1.8%', volume: '22.4M' },
      { ticker: 'BHARTIARTL', price: '₹1,589.60', change: '-0.9%', volume: '11.2M' }
    ];
  }
}

module.exports = new MarketDataService();