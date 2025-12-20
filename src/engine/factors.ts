import { QuantAsset, getAssetUniverse } from './assets';

export type MarketRegime = 'Bull' | 'Bear' | 'Sideways';

export interface AssetWeight {
  asset: QuantAsset;
  weight: number; // 0-1 (percentage as decimal)
}

/**
 * Filter assets based on market regime
 */
export const filterByRegime = (assets: QuantAsset[], marketRegime: MarketRegime): QuantAsset[] => {
  switch (marketRegime) {
    case 'Bear':
      // Prioritize Low Volatility & Defensive assets (Gold, Bonds, Utilities)
      return assets
        .filter(asset => 
          asset.metrics.volatility < 0.30 || 
          asset.sector === 'Bonds' || 
          asset.sector === 'ETF' ||
          asset.sector === 'Utilities' ||
          asset.metrics.dividendYield > 0.03
        )
        .sort((a, b) => a.metrics.volatility - b.metrics.volatility);
        
    case 'Bull':
      // Prioritize Momentum & Growth assets
      return assets
        .filter(asset => 
          asset.metrics.momentum12M > 0.20 || 
          asset.sector === 'Technology'
        )
        .sort((a, b) => b.metrics.momentum12M - a.metrics.momentum12M);
        
    case 'Sideways':
      // Balanced approach - dividend stocks and moderate growth
      return assets
        .filter(asset => 
          asset.metrics.dividendYield > 0.02 && asset.metrics.volatility < 0.35
        )
        .sort((a, b) => b.metrics.dividendYield - a.metrics.dividendYield);
        
    default:
      return assets;
  }
};

/**
 * Get top momentum assets
 */
export const getTopMomentum = (assets: QuantAsset[], n: number): QuantAsset[] => {
  return assets
    .sort((a, b) => b.metrics.momentum12M - a.metrics.momentum12M)
    .slice(0, n);
};

/**
 * Get top yield assets
 */
export const getTopYield = (assets: QuantAsset[], n: number): QuantAsset[] => {
  return assets
    .sort((a, b) => b.metrics.dividendYield - a.metrics.dividendYield)
    .slice(0, n);
};

/**
 * Get low volatility assets
 */
export const getLowVolatility = (assets: QuantAsset[], n: number): QuantAsset[] => {
  return assets
    .sort((a, b) => a.metrics.volatility - b.metrics.volatility)
    .slice(0, n);
};

/**
 * Optimize asset mix based on risk score
 */
export const optimizeMix = (assets: QuantAsset[], riskScore: number): AssetWeight[] => {
  const riskFactor = riskScore / 100;
  const weights: AssetWeight[] = [];
  
  if (riskScore < 30) {
    // Low Risk: 60% Bonds + 40% Stable Stocks
    const bonds = assets.filter(a => a.sector === 'Bonds').slice(0, 3);
    const stableStocks = getLowVolatility(
      assets.filter(a => a.sector !== 'Bonds' && a.metrics.dividendYield > 0.02), 
      4
    );
    
    // Allocate bonds (60%)
    bonds.forEach((asset, index) => {
      weights.push({ asset, weight: 0.60 / bonds.length });
    });
    
    // Allocate stable stocks (40%)
    stableStocks.forEach((asset, index) => {
      weights.push({ asset, weight: 0.40 / stableStocks.length });
    });
    
  } else if (riskScore > 70) {
    // High Risk: 70% Growth Stocks + 20% Tech + 10% Bonds
    const growthStocks = getTopMomentum(
      assets.filter(a => a.sector !== 'Bonds' && a.metrics.momentum12M > 0.30), 
      6
    );
    const techStocks = assets.filter(a => a.sector === 'Technology').slice(0, 2);
    const bonds = assets.filter(a => a.sector === 'Bonds').slice(0, 1);
    
    // Allocate growth stocks (70%)
    growthStocks.forEach((asset, index) => {
      weights.push({ asset, weight: 0.70 / growthStocks.length });
    });
    
    // Allocate tech (20%)
    techStocks.forEach((asset, index) => {
      weights.push({ asset, weight: 0.20 / techStocks.length });
    });
    
    // Allocate bonds (10%)
    bonds.forEach((asset, index) => {
      weights.push({ asset, weight: 0.10 / bonds.length });
    });
    
  } else {
    // Medium Risk: Balanced approach
    const balancedStocks = assets
      .filter(a => a.sector !== 'Bonds' && a.metrics.momentum12M > 0.10 && a.metrics.volatility < 0.35)
      .slice(0, 5);
    const bonds = assets.filter(a => a.sector === 'Bonds').slice(0, 2);
    const etfs = assets
      .filter(a => a.sector === 'ETF')
      .slice(0, 2);
    
    // 60% Stocks, 25% Bonds, 15% ETFs
    balancedStocks.forEach((asset, index) => {
      weights.push({ asset, weight: 0.60 / balancedStocks.length });
    });
    
    bonds.forEach((asset, index) => {
      weights.push({ asset, weight: 0.25 / bonds.length });
    });
    
    etfs.forEach((asset, index) => {
      weights.push({ asset, weight: 0.15 / etfs.length });
    });
  }
  
  // Normalize weights to ensure they sum to 1
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  if (totalWeight > 0) {
    weights.forEach(w => w.weight = w.weight / totalWeight);
  }
  
  return weights;
};

/**
 * Calculate portfolio statistics from weighted assets
 */
export const calculatePortfolioStats = (assetWeights: AssetWeight[]) => {
  let portfolioReturn = 0;
  let portfolioVolatility = 0;
  let portfolioMaxDrawdown = 0;
  
  // Calculate weighted average return using momentum12M as proxy for expected return
  assetWeights.forEach(({ asset, weight }) => {
    portfolioReturn += asset.metrics.momentum12M * weight;
    // Use volatility * 2 as rough proxy for max drawdown
    portfolioMaxDrawdown += (asset.metrics.volatility * 2) * weight;
  });
  
  // Calculate portfolio volatility using correlation matrix
  let portfolioVariance = 0;
  for (let i = 0; i < assetWeights.length; i++) {
    for (let j = 0; j < assetWeights.length; j++) {
      const correlation = assetWeights[i].asset.correlations[assetWeights[j].asset.ticker] || 0;
      portfolioVariance += assetWeights[i].weight * assetWeights[j].weight * 
                         assetWeights[i].asset.metrics.volatility * assetWeights[j].asset.metrics.volatility * correlation;
    }
  }
  portfolioVolatility = Math.sqrt(portfolioVariance);
  
  return {
    meanReturn: portfolioReturn,
    volatility: portfolioVolatility,
    maxDrawdown: Math.min(portfolioMaxDrawdown, 0.95) // Cap at 95%
  };
};

/**
 * Get market regime (mock implementation)
 */
export const detectMarketRegime = (): MarketRegime => {
  // Mock implementation - in real app, this would analyze market indicators
  const regimes: MarketRegime[] = ['Bull', 'Bear', 'Sideways'];
  const weights = [0.6, 0.2, 0.2]; // Bull market bias for demo
  
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < regimes.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return regimes[i];
    }
  }
  
  return 'Bull'; // Default fallback
};