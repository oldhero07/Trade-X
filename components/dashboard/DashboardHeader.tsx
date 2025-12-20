import React from 'react';
import { DashboardHeaderProps, MarketStatus } from './types';
import { dashboardStyles } from './styles';

const PersonalizedGreeting: React.FC = () => {
  return (
    <h1 className={dashboardStyles.greeting}>
      Good Morning, Alex
    </h1>
  );
};

const MarketPulseBadge: React.FC<{ marketStatus: MarketStatus | null; loading: boolean }> = ({ 
  marketStatus, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className={dashboardStyles.loadingSpinner}></div>
        <span className="text-gray-400">Loading market status...</span>
      </div>
    );
  }

  if (!marketStatus || marketStatus.error) {
    return (
      <div className={`${dashboardStyles.marketBadge} bg-gray-600 text-white`}>
        <span>Market Data Unavailable</span>
      </div>
    );
  }

  const isBullish = marketStatus.status === 'Bullish';
  const badgeClass = isBullish 
    ? dashboardStyles.marketBadgeBullish 
    : dashboardStyles.marketBadgeBearish;
  
  const badgeText = isBullish 
    ? 'Market is Up 🚀' 
    : 'Market is Down 📉';

  return (
    <div className={`${dashboardStyles.marketBadge} ${badgeClass}`}>
      <span>{badgeText}</span>
      <span className="font-mono">₹{marketStatus.niftyPrice.toLocaleString()}</span>
    </div>
  );
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ marketStatus, loading }) => {
  return (
    <div className={dashboardStyles.header}>
      <PersonalizedGreeting />
      <MarketPulseBadge marketStatus={marketStatus} loading={loading} />
    </div>
  );
};

export default DashboardHeader;