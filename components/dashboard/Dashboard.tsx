import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import SmartPicksSection from './SmartPicksSection';
import WatchlistComponent from '../Watchlist';
import { DashboardState, MarketStatus, StockQuote } from './types';
import { dashboardStyles } from './styles';
import api from '../../config/api';

// Market data service functions
const marketDataService = {
  async getMarketStatus(): Promise<MarketStatus> {
    try {
      const response = await api.getMarketStatus();
      
      if (response.error) {
        return {
          status: 'Bullish',
          niftyPrice: 0,
          change: 0,
          changePercent: 0,
          error: true,
          message: response.message || 'Market data unavailable'
        };
      }
      
      return {
        status: response.status,
        niftyPrice: response.niftyPrice,
        change: response.change,
        changePercent: response.changePercent
      };
    } catch (error) {
      console.error('Error fetching market status:', error);
      return {
        status: 'Bullish',
        niftyPrice: 0,
        change: 0,
        changePercent: 0,
        error: true,
        message: 'Failed to fetch market status'
      };
    }
  },

  async getQuote(ticker: string): Promise<StockQuote> {
    try {
      const response = await api.getQuote(ticker);
      
      if (response.error) {
        return {
          symbol: ticker,
          name: ticker,
          price: 0,
          currency: ticker === 'RELIANCE' ? '₹' : '$',
          changePercent: 0,
          error: true,
          message: response.message || `Failed to fetch quote for ${ticker}`
        };
      }
      
      return {
        symbol: response.symbol,
        name: response.name,
        price: response.price,
        currency: response.currency,
        changePercent: response.changePercent
      };
    } catch (error) {
      console.error(`Error fetching quote for ${ticker}:`, error);
      return {
        symbol: ticker,
        name: ticker,
        price: 0,
        currency: ticker === 'RELIANCE' ? '₹' : '$',
        changePercent: 0,
        error: true,
        message: `Failed to fetch quote for ${ticker}`
      };
    }
  }
};

const Dashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    marketStatus: null,
    smartPicks: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        // Fetch market status and smart picks concurrently
        const [marketStatus, ...smartPicksData] = await Promise.all([
          marketDataService.getMarketStatus(),
          marketDataService.getQuote('RELIANCE'),
          marketDataService.getQuote('NVDA'),
          marketDataService.getQuote('BTC-USD')
        ]);

        setState({
          marketStatus,
          smartPicks: smartPicksData,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data. Please try again.'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  if (state.error) {
    return (
      <div className={dashboardStyles.container}>
        <div className="max-w-7xl mx-auto">
          <div className={dashboardStyles.errorMessage}>
            <h2 className="text-lg font-semibold mb-2">Market Data Unavailable</h2>
            <p>{state.error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardStyles.container}>
      <div className={dashboardStyles.grid}>
        <DashboardHeader 
          marketStatus={state.marketStatus}
          loading={state.loading}
        />
        
        <SmartPicksSection 
          stocks={state.smartPicks}
          loading={state.loading}
        />
        
        <div className={dashboardStyles.watchlistSection}>
          <WatchlistComponent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;