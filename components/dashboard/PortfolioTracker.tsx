import React, { useState, useEffect } from 'react';
import { PortfolioData, Holding, ComponentState } from '../../types/dashboard';
import api from '../../config/api';
import PortfolioAreaChart from './charts/AreaChart';
import DonutChart from './charts/DonutChart';

export default function PortfolioTracker() {
  const [portfolioState, setPortfolioState] = useState<ComponentState<PortfolioData>>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  useEffect(() => {
    loadPortfolioData();
    
    // Set up real-time price updates every 30 seconds
    const interval = setInterval(() => {
      updateLivePrices();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateLivePrices = async () => {
    if (!portfolioState.data?.holdings) return;

    try {
      const updatedHoldings = await Promise.all(
        portfolioState.data.holdings.map(async (holding) => {
          try {
            const priceData = await api.getPrice(holding.ticker);
            const newPrice = priceData.current_price;
            const newTotalValue = newPrice * holding.quantity;
            const newPnL = newTotalValue - (holding.avgBuyPrice * holding.quantity);
            const newPnLPercentage = ((newPrice - holding.avgBuyPrice) / holding.avgBuyPrice) * 100;

            return {
              ...holding,
              currentPrice: newPrice,
              totalValue: newTotalValue,
              pnl: newPnL,
              pnlPercentage: newPnLPercentage
            };
          } catch (error) {
            console.error(`Failed to update price for ${holding.ticker}:`, error);
            return holding; // Return unchanged if price update fails
          }
        })
      );

      // Recalculate total net worth
      const newTotalNetWorth = updatedHoldings.reduce((sum, holding) => sum + holding.totalValue, 0);
      const oldTotalNetWorth = portfolioState.data.totalNetWorth;
      const newTodaysPnL = newTotalNetWorth - oldTotalNetWorth;
      const newTodaysPnLPercentage = (newTodaysPnL / oldTotalNetWorth) * 100;

      setPortfolioState(prev => ({
        ...prev,
        data: prev.data ? {
          ...prev.data,
          totalNetWorth: newTotalNetWorth,
          todaysPnL: newTodaysPnL,
          todaysPnLPercentage: newTodaysPnLPercentage,
          holdings: updatedHoldings
        } : null,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.error('Error updating live prices:', error);
    }
  };

  const loadPortfolioData = async () => {
    try {
      setPortfolioState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Try to get real portfolio data first
      try {
        const portfolioSummary = await api.getPortfolioSummary();
        
        // Transform backend data to match our interface
        const transformedData: PortfolioData = {
          totalNetWorth: portfolioSummary.totalNetWorth,
          todaysPnL: portfolioSummary.todaysPnL,
          todaysPnLPercentage: portfolioSummary.todaysPnLPercentage,
          holdings: portfolioSummary.holdings.map((holding: any) => ({
            ticker: holding.ticker,
            name: holding.ticker, // Backend doesn't provide name, use ticker for now
            avgBuyPrice: holding.avgBuyPrice,
            currentPrice: holding.currentPrice,
            quantity: holding.quantity,
            totalValue: holding.value,
            pnl: holding.value - (holding.avgBuyPrice * holding.quantity),
            pnlPercentage: holding.gainLossPercent,
            assetType: 'stock' as const
          })),
          valueHistory: portfolioSummary.valueHistory,
          allocation: portfolioSummary.allocation
        };

        setPortfolioState({
          data: transformedData,
          isLoading: false,
          error: null,
          lastUpdated: Date.now()
        });
      } catch (apiError) {
        console.log('No portfolio data available, using mock data');
        
        // Fall back to mock data if no real portfolio exists
        const mockPortfolioData: PortfolioData = {
          totalNetWorth: 1245000,
          todaysPnL: 12000,
          todaysPnLPercentage: 0.97,
          holdings: [
            {
              ticker: 'NVDA',
              name: 'NVIDIA Corporation',
              avgBuyPrice: 450.00,
              currentPrice: 875.28,
              quantity: 10,
              totalValue: 8752.80,
              pnl: 4252.80,
              pnlPercentage: 94.51,
              assetType: 'stock'
            },
            {
              ticker: 'AAPL',
              name: 'Apple Inc',
              avgBuyPrice: 180.00,
              currentPrice: 229.87,
              quantity: 50,
              totalValue: 11493.50,
              pnl: 2493.50,
              pnlPercentage: 27.71,
              assetType: 'stock'
            }
          ],
          valueHistory: [
            { date: '2024-01-01', value: 1000000, timestamp: Date.now() - 86400000 * 30 },
            { date: '2024-01-15', value: 1100000, timestamp: Date.now() - 86400000 * 15 },
            { date: '2024-01-30', value: 1245000, timestamp: Date.now() }
          ],
          allocation: {
            stocks: { value: 1000000, percentage: 80.3 },
            crypto: { value: 200000, percentage: 16.1 },
            cash: { value: 45000, percentage: 3.6 }
          }
        };

        setPortfolioState({
          data: mockPortfolioData,
          isLoading: false,
          error: null,
          lastUpdated: Date.now()
        });
      }
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      setPortfolioState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load portfolio data'
      }));
    }
  };

  const handleEditHolding = (ticker: string) => {
    // TODO: Implement edit modal
    console.log('Edit holding:', ticker);
  };

  const handleDeleteHolding = async (ticker: string) => {
    if (!confirm(`Are you sure you want to remove ${ticker} from your portfolio?`)) {
      return;
    }

    try {
      // TODO: Implement delete functionality
      // This would involve selling all shares or removing the holding
      console.log('Delete holding:', ticker);
    } catch (error) {
      console.error('Error deleting holding:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  };

  const formatPnL = (pnl: number, percentage: number) => {
    const sign = pnl >= 0 ? '+' : '';
    const color = pnl >= 0 ? 'text-[#22c55e]' : 'text-red-500';
    const arrow = pnl >= 0 ? '▲' : '▼';
    
    return (
      <span className={`${color} font-bold`}>
        {sign}{formatCurrency(pnl)} ({sign}{percentage.toFixed(2)}%) {arrow}
      </span>
    );
  };

  if (portfolioState.isLoading) {
    return (
      <div className="p-4 lg:p-10 pb-32">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-white">Loading portfolio...</div>
        </div>
      </div>
    );
  }

  if (portfolioState.error) {
    return (
      <div className="p-4 lg:p-10 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{portfolioState.error}</p>
            <button 
              onClick={loadPortfolioData}
              className="mt-2 text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const portfolio = portfolioState.data!;

  return (
    <div className="p-4 lg:p-10 pb-32" style={{ backgroundColor: '#050505' }}>
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Top Zone - Big Numbers */}
        <div className="flex items-end justify-between border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              {formatCurrency(portfolio.totalNetWorth)}
            </h1>
            <p className="text-gray-400 text-lg">Total Net Worth</p>
            {portfolioState.lastUpdated && (
              <p className="text-gray-500 text-sm mt-1">
                Last updated: {new Date(portfolioState.lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-900 rounded-full px-6 py-3 border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Today's P&L</p>
              <div className="text-lg">
                {formatPnL(portfolio.todaysPnL, portfolio.todaysPnLPercentage)}
              </div>
            </div>
            <button
              onClick={updateLivePrices}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-600 transition-colors"
              title="Refresh prices"
            >
              <span className="material-symbols-outlined text-gray-400">refresh</span>
            </button>
          </div>
        </div>

        {/* Middle Zone - Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Portfolio Value Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">Portfolio Value Over Time</h3>
            <PortfolioAreaChart data={portfolio.valueHistory} height={280} />
          </div>

          {/* Asset Allocation Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">Asset Allocation</h3>
            <DonutChart data={portfolio.allocation} height={280} />
          </div>
        </div>

        {/* Bottom Zone - Holdings Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-6">Holdings</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-medium py-3">Asset</th>
                  <th className="text-right text-gray-400 font-medium py-3">Avg Buy Price</th>
                  <th className="text-right text-gray-400 font-medium py-3">Current Price</th>
                  <th className="text-right text-gray-400 font-medium py-3">Qty</th>
                  <th className="text-right text-gray-400 font-medium py-3">Total Value</th>
                  <th className="text-right text-gray-400 font-medium py-3">P&L</th>
                  <th className="text-right text-gray-400 font-medium py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((holding) => (
                  <tr key={holding.ticker} className="border-b border-gray-800 hover:bg-gray-800/50 group">
                    <td className="py-4">
                      <div>
                        <p className="text-white font-bold">{holding.ticker}</p>
                        <p className="text-gray-400 text-sm">{holding.name}</p>
                      </div>
                    </td>
                    <td className="text-right text-white py-4">
                      {formatCurrency(holding.avgBuyPrice)}
                    </td>
                    <td className="text-right text-white py-4">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="text-right text-white py-4">
                      {holding.quantity}
                    </td>
                    <td className="text-right text-white py-4">
                      {formatCurrency(holding.totalValue)}
                    </td>
                    <td className="text-right py-4">
                      {formatPnL(holding.pnl, holding.pnlPercentage)}
                    </td>
                    <td className="text-right py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditHolding(holding.ticker)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          title="Edit holding"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteHolding(holding.ticker)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove holding"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}