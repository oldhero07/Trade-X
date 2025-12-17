import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import Auth from './components/Auth';
import WatchlistComponent from './components/Watchlist';
import { Page, Stock, Strategy } from './types';
import { getMarketSummary, getPortfolioInsight, analyzeStock } from './services/geminiService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line 
} from 'recharts';

// --- Shared Components ---

const TradeModal = ({ isOpen, onClose, stock }: { isOpen: boolean, onClose: () => void, stock: Stock }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-1">Trade {stock.symbol}</h2>
                    <p className="text-text-secondary text-sm">Current Price: <span className="text-white font-mono">${stock.price?.toFixed(2)}</span></p>
                </div>
                
                <div className="flex gap-2 mb-6 bg-background-dark p-1 rounded-xl">
                    <button className="flex-1 py-2 rounded-lg bg-surface-dark text-white font-bold text-sm shadow-sm">Buy</button>
                    <button className="flex-1 py-2 rounded-lg text-text-secondary hover:text-white font-medium text-sm transition-colors">Sell</button>
                </div>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Quantity</label>
                        <div className="flex items-center gap-4">
                            <input type="number" defaultValue={10} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-lg font-mono" />
                            <div className="text-right shrink-0">
                                <span className="block text-xs text-text-secondary">Est. Cost</span>
                                <span className="block text-white font-bold">${((stock.price || 0) * 10).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={onClose} className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] hover:shadow-[0_0_30px_rgba(70,236,19,0.5)]">
                    Confirm Order
                </button>
            </div>
        </div>
    );
};

// Simple placeholder components for pages not yet implemented
const Dashboard = ({ setActivePage }: { setActivePage: (p: Page) => void }) => (
  <div className="p-4 lg:p-10 pb-32">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
      <p className="text-text-secondary">Welcome to Trade-X! Your trading dashboard.</p>
    </div>
  </div>
);

const MarketAnalysis = () => (
  <div className="p-4 lg:p-10 pb-32">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-4">Market Analysis</h1>
      <p className="text-text-secondary">Market analysis and insights coming soon.</p>
    </div>
  </div>
);

const Portfolio = () => (
  <div className="p-4 lg:p-10 pb-32">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-4">Portfolio</h1>
      <p className="text-text-secondary">Portfolio tracking coming soon.</p>
    </div>
  </div>
);

const StrategySimulator = () => (
  <div className="p-4 lg:p-10 pb-32">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-4">Strategy Simulator</h1>
      <p className="text-text-secondary">Strategy simulation coming soon.</p>
    </div>
  </div>
);

const Settings = () => (
  <div className="p-4 lg:p-10 pb-32">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
      <p className="text-text-secondary">Settings panel coming soon.</p>
    </div>
  </div>
);

const StrategyBuilder = ({ setActivePage }: { setActivePage: (p: Page) => void }) => (
  <div className="p-4 lg:p-10 pb-32">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-4">Strategy Builder</h1>
      <p className="text-text-secondary">Strategy builder coming soon.</p>
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth token on app load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // In a real app, you'd validate the token with the backend
      // For now, we'll assume it's valid and set a mock user
      setUser({ name: 'Alex', email: 'alex@example.com' });
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setActivePage('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} />;
      case 'market-analysis': return <MarketAnalysis />;
      case 'portfolio': return <Portfolio />;
      case 'strategy-simulator': return <StrategySimulator />;
      case 'watchlist': return <WatchlistComponent />;
      case 'settings': return <Settings />;
      case 'strategy-builder': return <StrategyBuilder setActivePage={setActivePage} />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage} user={user} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
};

export default App;