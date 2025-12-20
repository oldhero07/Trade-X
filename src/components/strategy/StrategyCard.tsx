import React from 'react';
import { Strategy } from '../../data/strategies';

interface StrategyCardProps {
  strategy: Strategy;
  onSimulate: (strategy: Strategy) => void;
}

const getRiskEmojis = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'Low': return '🔥';
    case 'Medium': return '🔥🔥';
    case 'High': return '🔥🔥🔥';
    default: return '🔥';
  }
};

const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'Low': return 'bg-green-500';
    case 'Medium': return 'bg-yellow-500';
    case 'High': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onSimulate }) => {
  const formatAllocation = () => {
    const parts = [];
    if (strategy.allocation.stocks) {
      parts.push(`${strategy.allocation.stocks}% Stocks`);
    }
    if (strategy.allocation.bonds) {
      parts.push(`${strategy.allocation.bonds}% Bonds`);
    }
    if (strategy.allocation.crypto) {
      parts.push(`${strategy.allocation.crypto}% Crypto`);
    }
    return parts.join(' • ');
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-[#22c55e] hover:shadow-lg hover:shadow-[#22c55e]/20 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{strategy.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getRiskColor(strategy.riskLevel)}`}>
              {getRiskEmojis(strategy.riskLevel)} {strategy.riskLevel} Risk
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed mb-6">
        {strategy.description}
      </p>

      {/* Allocation */}
      <div className="mb-6">
        <h4 className="text-white font-semibold text-sm mb-2">Asset Allocation</h4>
        <p className="text-[#22c55e] text-sm font-mono">{formatAllocation()}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Expected Return</p>
          <p className="text-white font-semibold text-sm">{strategy.expectedReturn}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Time Horizon</p>
          <p className="text-white font-semibold text-sm">{strategy.timeHorizon}</p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSimulate(strategy)}
        className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl"
      >
        Simulate Strategy
      </button>
    </div>
  );
};

export default StrategyCard;