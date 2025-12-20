import React, { useState, useEffect } from 'react';
import { MarketData, SectorPerformance, MarketMover, NewsItem, ComponentState } from '../../types/dashboard';
import api from '../../config/api';
import Heatmap from './charts/Heatmap';

export default function MarketAnalysis() {
  const [marketState, setMarketState] = useState<ComponentState<MarketData>>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setMarketState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Try to get real market data first
      try {
        const [movers, sectorData] = await Promise.all([
          api.getMarketMovers().catch(() => null),
          api.getSectorFlow().catch(() => null)
        ]);

        // Use real data if available, otherwise fall back to mock data
        const mockMarketData: MarketData = {
          sectors: sectorData || [
            { name: 'Technology', change: 2.45, changePercentage: 2.45, color: 'green', marketCap: 15000000 },
            { name: 'Healthcare', change: 1.23, changePercentage: 1.23, color: 'green', marketCap: 8500000 },
            { name: 'Financial', change: -0.87, changePercentage: -0.87, color: 'red', marketCap: 12000000 },
            { name: 'Energy', change: 3.21, changePercentage: 3.21, color: 'green', marketCap: 6500000 },
            { name: 'Consumer', change: 0.45, changePercentage: 0.45, color: 'green', marketCap: 9200000 },
            { name: 'Utilities', change: -1.12, changePercentage: -1.12, color: 'red', marketCap: 4800000 },
            { name: 'Real Estate', change: 1.87, changePercentage: 1.87, color: 'green', marketCap: 3200000 },
            { name: 'Materials', change: -2.34, changePercentage: -2.34, color: 'red', marketCap: 5100000 }
          ],
          topGainers: movers?.gainers || [
            { ticker: 'NVDA', name: 'NVIDIA Corp', price: 875.28, change: 45.23, changePercentage: 5.45, volume: 2500000 },
            { ticker: 'AMD', name: 'Advanced Micro Devices', price: 142.56, change: 8.90, changePercentage: 6.67, volume: 1800000 },
            { ticker: 'META', name: 'Meta Platforms', price: 563.92, change: 23.45, changePercentage: 4.34, volume: 1200000 }
          ],
          topLosers: movers?.losers || [
            { ticker: 'PFE', name: 'Pfizer Inc', price: 25.89, change: -2.45, changePercentage: -8.64, volume: 3200000 },
            { ticker: 'VNO', name: 'Vornado Realty Trust', price: 28.67, change: -1.87, changePercentage: -6.12, volume: 890000 },
            { ticker: 'XOM', name: 'Exxon Mobil', price: 118.92, change: -4.23, changePercentage: -3.43, volume: 1500000 }
          ],
          news: [
            {
              id: '1',
              headline: 'Tech Stocks Rally on AI Optimism',
              timestamp: Date.now() - 7200000, // 2 hours ago
              source: 'MarketWatch'
            },
            {
              id: '2',
              headline: 'Federal Reserve Hints at Rate Cuts',
              timestamp: Date.now() - 14400000, // 4 hours ago
              source: 'Reuters'
            },
            {
              id: '3',
              headline: 'Energy Sector Sees Mixed Results',
              timestamp: Date.now() - 21600000, // 6 hours ago
              source: 'Bloomberg'
            },
            {
              id: '4',
              headline: 'Cryptocurrency Market Shows Volatility',
              timestamp: Date.now() - 28800000, // 8 hours ago
              source: 'CoinDesk'
            },
            {
              id: '5',
              headline: 'Healthcare Stocks Gain on Drug Approvals',
              timestamp: Date.now() - 36000000, // 10 hours ago
              source: 'BioPharma Dive'
            }
          ]
        };

        setMarketState({
          data: mockMarketData,
          isLoading: false,
          error: null,
          lastUpdated: Date.now()
        });
      } catch (apiError) {
        console.error('Error fetching market data:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Error loading market data:', error);
      setMarketState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load market data'
      }));
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return `${minutes}m ago`;
    }
  };

  if (marketState.isLoading) {
    return (
      <div className="p-4 lg:p-10 pb-32">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-white">Loading market data...</div>
        </div>
      </div>
    );
  }

  if (marketState.error) {
    return (
      <div className="p-4 lg:p-10 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{marketState.error}</p>
            <button 
              onClick={loadMarketData}
              className="mt-2 text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const market = marketState.data!;

  return (
    <div className="p-4 lg:p-10 pb-32" style={{ backgroundColor: '#050505' }}>
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Market Analysis</h1>
          <p className="text-gray-400">Real-time market insights and sector performance</p>
        </div>

        {/* Zone 1: Sector Heatmap */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg">Sector Performance</h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Negative</span>
              </div>
            </div>
          </div>
          
          <Heatmap sectors={market.sectors} />
        </div>

        {/* Zone 2: Market Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Gainers */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span>Top Gainers</span>
              <span className="text-2xl">🚀</span>
            </h3>
            
            <div className="space-y-4">
              {market.topGainers.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <div>
                    <p className="text-white font-bold">{stock.ticker}</p>
                    <p className="text-gray-400 text-sm">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${stock.price.toFixed(2)}</p>
                    <p className="text-[#22c55e] text-sm">
                      +{stock.changePercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span>Top Losers</span>
              <span className="text-2xl">📉</span>
            </h3>
            
            <div className="space-y-4">
              {market.topLosers.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <div>
                    <p className="text-white font-bold">{stock.ticker}</p>
                    <p className="text-gray-400 text-sm">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${stock.price.toFixed(2)}</p>
                    <p className="text-red-500 text-sm">
                      {stock.changePercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone 3: News Feed */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-6">Market News</h3>
          
          <div className="space-y-4">
            {market.news.map((newsItem) => (
              <div key={newsItem.id} className="flex items-start justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-2">{newsItem.headline}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{newsItem.source}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(newsItem.timestamp)}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors ml-4">
                  <span className="material-symbols-outlined">arrow_outward</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}