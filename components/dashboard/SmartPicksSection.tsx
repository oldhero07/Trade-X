import React from 'react';
import StockCard from './StockCard';
import { SmartPicksSectionProps } from './types';
import { dashboardStyles } from './styles';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className={dashboardStyles.stockCard}>
      <div className="animate-pulse">
        <div className="h-6 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded mb-3 w-3/4"></div>
        <div className="h-8 bg-gray-700 rounded mb-2 w-1/2"></div>
        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
      </div>
    </div>
  );
};

const SmartPicksSection: React.FC<SmartPicksSectionProps> = ({ stocks, loading }) => {
  return (
    <div className={dashboardStyles.smartPicksSection}>
      <h2 className="text-2xl font-bold text-white mb-6">Smart Picks</h2>
      
      <div className={dashboardStyles.smartPicksGrid}>
        {loading ? (
          // Show loading skeletons for 3 cards
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : (
          stocks.map((stock, index) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              name={stock.name}
              price={stock.price}
              currency={stock.currency}
              changePercent={stock.changePercent}
              isTopPick={stock.symbol === 'RELIANCE'} // RELIANCE is marked as top pick
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SmartPicksSection;