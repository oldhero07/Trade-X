import React from 'react';
import { SectorPerformance } from '../../../types/dashboard';

interface HeatmapProps {
  sectors: SectorPerformance[];
}

export default function Heatmap({ sectors }: HeatmapProps) {
  const getSectorColor = (sector: SectorPerformance) => {
    const absChange = Math.abs(sector.changePercentage);
    
    if (sector.changePercentage > 0) {
      // Green shades for positive performance
      if (absChange >= 3) return 'bg-green-600';
      if (absChange >= 2) return 'bg-green-500';
      if (absChange >= 1) return 'bg-green-400';
      return 'bg-green-300';
    } else if (sector.changePercentage < 0) {
      // Red shades for negative performance
      if (absChange >= 3) return 'bg-red-600';
      if (absChange >= 2) return 'bg-red-500';
      if (absChange >= 1) return 'bg-red-400';
      return 'bg-red-300';
    } else {
      // Neutral gray for no change
      return 'bg-gray-500';
    }
  };

  const getTextColor = (sector: SectorPerformance) => {
    const absChange = Math.abs(sector.changePercentage);
    
    // Use white text for darker backgrounds, black for lighter ones
    if (absChange >= 2) {
      return 'text-white';
    } else {
      return sector.changePercentage >= 0 ? 'text-green-900' : 'text-red-900';
    }
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {sectors.map((sector) => (
        <div
          key={sector.name}
          className={`${getSectorColor(sector)} ${getTextColor(sector)} rounded-lg p-4 transition-all hover:scale-105 cursor-pointer shadow-lg`}
        >
          <div className="text-center">
            <h4 className="font-bold text-sm mb-2 leading-tight">
              {sector.name}
            </h4>
            <p className="text-2xl font-bold mb-1">
              {formatPercentage(sector.changePercentage)}
            </p>
            {sector.marketCap && (
              <p className="text-xs opacity-80">
                Cap: ₹{(sector.marketCap / 1000000).toFixed(1)}T
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}