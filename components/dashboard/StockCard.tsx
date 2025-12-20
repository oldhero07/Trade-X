import React, { memo } from 'react';
import { StockCardProps } from './types';
import { dashboardStyles } from './styles';

const ChangePill: React.FC<{ changePercent?: number }> = memo(({ changePercent }) => {
  if (changePercent === undefined || changePercent === null) {
    return (
      <div className={`${dashboardStyles.changePill} bg-gray-600 text-white`}>
        N/A
      </div>
    );
  }

  const isPositive = changePercent > 0;
  const isNeutral = changePercent === 0;
  
  let pillClass = dashboardStyles.changePillNegative;
  if (isPositive) {
    pillClass = dashboardStyles.changePillPositive;
  } else if (isNeutral) {
    pillClass = 'bg-gray-500 text-white';
  }
  
  const sign = isPositive ? '+' : '';
  
  return (
    <div className={`${dashboardStyles.changePill} ${pillClass}`}>
      {sign}{changePercent.toFixed(2)}%
    </div>
  );
});

const TopPickTag: React.FC = memo(() => {
  return (
    <div className={dashboardStyles.topPickTag}>
      Top Pick
    </div>
  );
});

const StockCard: React.FC<StockCardProps> = memo(({ 
  symbol, 
  name, 
  price, 
  currency, 
  changePercent, 
  isTopPick = false 
}) => {
  return (
    <div className={dashboardStyles.stockCard}>
      {isTopPick && <TopPickTag />}
      
      <div className={dashboardStyles.stockSymbol}>
        {symbol}
      </div>
      
      <div className={dashboardStyles.stockName}>
        {name}
      </div>
      
      <div className={dashboardStyles.stockPrice}>
        {currency}{price.toLocaleString()}
      </div>
      
      <ChangePill changePercent={changePercent} />
    </div>
  );
});

export default StockCard;