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

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
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

  // Market data methods
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
    return this.request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
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