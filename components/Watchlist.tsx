import React, { useState, useEffect } from 'react';
import api from '../config/api';

interface Stock {
  ticker: string;
  added_at: string;
  price?: number;
  change?: number;
  name?: string;
}

interface WatchlistData {
  watchlist_id: number;
  name: string;
  created_at: string;
  stocks: Stock[];
}

export default function Watchlist() {
  const [watchlists, setWatchlists] = useState<WatchlistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [selectedWatchlist, setSelectedWatchlist] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWatchlists();
  }, []);

  const loadWatchlists = async () => {
    try {
      setLoading(true);
      const data = await api.getWatchlists();
      
      // If no watchlists exist, create a default one
      if (data.length === 0) {
        await api.createWatchlist('My Watchlist');
        const updatedData = await api.getWatchlists();
        setWatchlists(updatedData);
      } else {
        setWatchlists(data);
      }
      
      // Load stock prices for all watchlist items
      await loadStockPrices(data);
    } catch (error) {
      console.error('Error loading watchlists:', error);
      setError('Failed to load watchlists');
    } finally {
      setLoading(false);
    }
  };

  const loadStockPrices = async (watchlistData: WatchlistData[]) => {
    const updatedWatchlists = await Promise.all(
      watchlistData.map(async (watchlist) => {
        const updatedStocks = await Promise.all(
          watchlist.stocks.map(async (stock) => {
            try {
              const priceData = await api.getPrice(stock.ticker);
              return {
                ...stock,
                price: priceData.current_price,
                change: priceData.change_percent,
                ageMinutes: priceData.age_minutes
              };
            } catch (error) {
              return stock;
            }
          })
        );
        return { ...watchlist, stocks: updatedStocks };
      })
    );
    setWatchlists(updatedWatchlists);
  };

  const createWatchlist = async () => {
    try {
      if (!newWatchlistName.trim()) return;
      
      await api.createWatchlist(newWatchlistName);
      setNewWatchlistName('');
      setShowCreateModal(false);
      loadWatchlists();
    } catch (error) {
      console.error('Error creating watchlist:', error);
      setError('Failed to create watchlist');
    }
  };

  const addStock = async (ticker: string) => {
    try {
      if (!selectedWatchlist) return;
      
      await api.addToWatchlist(selectedWatchlist, ticker);
      setShowAddModal(false);
      setSearchQuery('');
      setSearchResults([]);
      loadWatchlists();
    } catch (error: any) {
      console.error('Error adding stock:', error);
      setError(error.message || 'Failed to add stock');
    }
  };

  const removeStock = async (watchlistId: number, ticker: string) => {
    try {
      await api.removeFromWatchlist(watchlistId, ticker);
      loadWatchlists();
    } catch (error) {
      console.error('Error removing stock:', error);
      setError('Failed to remove stock');
    }
  };

  const searchStocks = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await api.searchStocks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => searchStocks(searchQuery), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="p-4 lg:p-10 pb-32">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-white">Loading watchlists...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-10 pb-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-border-dark pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Watchlists</h1>
            <p className="text-text-secondary">Track your favorite stocks and monitor their performance.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-surface-dark border border-border-dark hover:border-text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              New List
            </button>
            <button 
              onClick={() => {
                if (watchlists.length > 0) {
                  setSelectedWatchlist(watchlists[0].watchlist_id);
                  setShowAddModal(true);
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-background-dark bg-primary hover:bg-primary-hover transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Add Stock
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-danger-surface border border-danger rounded-lg p-4">
            <p className="text-danger text-sm">{error}</p>
            <button onClick={() => setError('')} className="text-danger text-xs mt-2 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Watchlists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {watchlists.map((watchlist) => (
            <div key={watchlist.watchlist_id} className="bg-surface-dark border border-border-dark rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">{watchlist.name}</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setSelectedWatchlist(watchlist.watchlist_id);
                      setShowAddModal(true);
                    }}
                    className="p-1 text-text-secondary hover:text-white transition-colors"
                    title="Add stock"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {watchlist.stocks.length === 0 ? (
                  <p className="text-text-secondary text-sm text-center py-8">
                    No stocks in this watchlist yet.
                  </p>
                ) : (
                  watchlist.stocks.map((stock) => (
                    <div key={stock.ticker} className="flex items-center justify-between p-3 bg-background-dark rounded-lg hover:bg-white/5 transition-colors group">
                      <div>
                        <p className="text-white font-bold text-sm">{stock.ticker}</p>
                        <p className="text-text-secondary text-xs">
                          Added {new Date(stock.added_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {stock.price && (
                          <div className="text-right">
                            <p className="text-white font-bold text-sm">
                              {stock.ticker.includes('RELIANCE') || stock.ticker.includes('TCS') || stock.ticker.includes('INFY') ? '₹' : '$'}
                              {stock.price.toFixed(2)}
                            </p>
                            {stock.change && (
                              <p className={`text-xs ${stock.change > 0 ? 'text-primary' : 'text-red-500'}`}>
                                {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                              </p>
                            )}
                            {stock.ageMinutes && (
                              <p className="text-xs text-text-secondary opacity-70">
                                {stock.ageMinutes}m ago
                              </p>
                            )}
                          </div>
                        )}
                        <button 
                          onClick={() => removeStock(watchlist.watchlist_id, stock.ticker)}
                          className="p-1 text-text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove stock"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Stock Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add Stock to Watchlist</h2>
                <button onClick={() => setShowAddModal(false)} className="text-text-secondary hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search stocks (e.g., RELIANCE, AAPL, TCS)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              {searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchResults.map((stock, i) => (
                    <button
                      key={i}
                      onClick={() => addStock(stock.symbol)}
                      className="w-full text-left p-3 bg-background-dark hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-bold text-sm">{stock.symbol}</p>
                          <p className="text-text-secondary text-xs">{stock.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm">{stock.currency}{stock.price?.toFixed(2) || 'N/A'}</p>
                          <p className="text-xs text-text-secondary">{stock.exchange}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Watchlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create New Watchlist</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-text-secondary hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Watchlist name"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              <button
                onClick={createWatchlist}
                disabled={!newWatchlistName.trim()}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Watchlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}