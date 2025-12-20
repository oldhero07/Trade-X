// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'
);

// API client with authentication
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    console.log('Making API request:', { url, method: options.method || 'GET', headers });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
    }
    
    return data;
  }

  async register(email: string, password: string, name: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
    }
    
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Portfolio methods
  async getPortfolio() {
    return this.request('/portfolio');
  }

  async addTransaction(ticker: string, type: 'BUY' | 'SELL', quantity: number, pricePerShare: number) {
    return this.request('/portfolio/transaction', {
      method: 'POST',
      body: JSON.stringify({ ticker, type, quantity, pricePerShare }),
    });
  }

  async getTransactions() {
    return this.request('/portfolio/transactions');
  }

  // Enhanced portfolio methods for dashboard
  async getPortfolioSummary() {
    try {
      const portfolio = await this.getPortfolio();
      const transactions = await this.getTransactions();
      
      // Calculate additional metrics
      let totalNetWorth = portfolio.totalValue || 0;
      let todaysPnL = 0;
      let todaysPnLPercentage = 0;
      
      // Mock calculation for today's P&L (in real app, this would come from backend)
      if (portfolio.holdings && portfolio.holdings.length > 0) {
        todaysPnL = portfolio.holdings.reduce((sum: number, holding: any) => {
          const dailyChange = holding.currentPrice * 0.01; // Mock 1% daily change
          return sum + (dailyChange * holding.quantity);
        }, 0);
        todaysPnLPercentage = (todaysPnL / totalNetWorth) * 100;
      }

      // Generate mock value history (in real app, this would be stored in backend)
      const valueHistory = [];
      const now = Date.now();
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now - (i * 24 * 60 * 60 * 1000));
        const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
        const value = totalNetWorth * (1 + variance);
        valueHistory.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(value),
          timestamp: date.getTime()
        });
      }

      // Calculate asset allocation
      const allocation = {
        stocks: { value: 0, percentage: 0 },
        crypto: { value: 0, percentage: 0 },
        cash: { value: 50000, percentage: 0 } // Mock cash amount
      };

      if (portfolio.holdings) {
        const stockValue = portfolio.holdings.reduce((sum: number, holding: any) => sum + holding.value, 0);
        allocation.stocks.value = stockValue;
        allocation.stocks.percentage = (stockValue / (totalNetWorth + allocation.cash.value)) * 100;
        allocation.cash.percentage = (allocation.cash.value / (totalNetWorth + allocation.cash.value)) * 100;
      }

      return {
        totalNetWorth,
        todaysPnL,
        todaysPnLPercentage,
        holdings: portfolio.holdings || [],
        valueHistory,
        allocation
      };
    } catch (error) {
      console.error('Error getting portfolio summary:', error);
      throw error;
    }
  }

  // Market data methods
  async getMarketStatus() {
    return this.request('/market/status');
  }

  async getQuote(ticker: string) {
    return this.request(`/market/quote/${ticker}`);
  }

  async getMarketOverview() {
    return this.request('/market/overview');
  }

  async getMarketMovers() {
    return this.request('/market/movers');
  }

  async getSectorFlow() {
    return this.request('/market/sector-flow');
  }

  async getPrice(ticker: string) {
    return this.request(`/market/price/${ticker}`);
  }

  // Strategy methods
  async getStrategies(category?: string) {
    const params = category ? `?category=${category}` : '';
    return this.request(`/strategy${params}`);
  }

  async runSimulation(riskTolerance: number, timeHorizon: number, initialInvestment?: number) {
    return this.request('/strategy/simulate', {
      method: 'POST',
      body: JSON.stringify({ riskTolerance, timeHorizon, initialInvestment }),
    });
  }

  // Search methods
  async searchStocks(query: string) {
    return this.request(`/market/search/${encodeURIComponent(query)}`);
  }

  // Cache methods
  async getCacheStatus() {
    return this.request('/market/cache/status');
  }

  async forceUpdatePrice(ticker: string) {
    return this.request(`/market/cache/update/${ticker}`, {
      method: 'POST',
    });
  }

  // Watchlist methods
  async getWatchlists() {
    return this.request('/watchlist');
  }

  async createWatchlist(name: string) {
    try {
      console.log('Creating watchlist with name:', name);
      const response = await this.request('/watchlist', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      console.log('Watchlist created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating watchlist:', error);
      throw error;
    }
  }

  async addToWatchlist(watchlistId: number, ticker: string) {
    return this.request(`/watchlist/${watchlistId}/stocks`, {
      method: 'POST',
      body: JSON.stringify({ ticker }),
    });
  }

  async removeFromWatchlist(watchlistId: number, ticker: string) {
    return this.request(`/watchlist/${watchlistId}/stocks/${ticker}`, {
      method: 'DELETE',
    });
  }

  async deleteWatchlist(watchlistId: number) {
    return this.request(`/watchlist/${watchlistId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;