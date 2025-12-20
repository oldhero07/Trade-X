import { getAssetUniverse, QuantAsset } from './assets';
import { AssetWeight, calculatePortfolioStats } from './factors';
import { runMonteCarlo, MonteCarloResult } from './simulation';
import { BuilderState } from './constraints';

export interface PortfolioStats {
  meanReturn: number;
  volatility: number;
  maxDrawdown: number;
  sharpeRatio: number;
  assets: AssetWeight[];
}

export interface CalculationResult {
  stats: PortfolioStats;
  monteCarloResult: MonteCarloResult;
  metrics: {
    typicalYear: string;
    badYear: string;
    yield: string;
  };
}

/**
 * Calculate portfolio statistics based on allocation and selected factors
 */
export const calculatePortfolioStats = (
  allocation: { stocks: number; crypto: number; bonds: number },
  selectedFactors: string[]
): PortfolioStats => {
  const allAssets = getAssetUniverse();
  const selectedAssets: AssetWeight[] = [];
  
  // Filter assets based on selected factors
  let filteredAssets = allAssets;
  
  if (selectedFactors.includes('Momentum')) {
    // Prioritize high momentum assets
    filteredAssets = filteredAssets.filter(asset => asset.metrics.momentum12M > 0.30);
  }
  
  if (selectedFactors.includes('Tech')) {
    // Focus on technology sector
    filteredAssets = filteredAssets.filter(asset => 
      asset.sector === 'Technology' || asset.ticker === 'QQQ'
    );
  }
  
  if (selectedFactors.includes('Dividends')) {
    // Focus on high yield assets
    filteredAssets = filteredAssets.filter(asset => asset.metrics.dividendYield > 0.025);
  }
  
  if (selectedFactors.includes('Growth')) {
    // Focus on growth assets
    filteredAssets = filteredAssets.filter(asset => 
      asset.metrics.momentum12M > 0.15 || asset.metrics.earningsGrowth > 0.10
    );
  }
  
  if (selectedFactors.includes('Value')) {
    // Focus on value/stable assets
    filteredAssets = filteredAssets.filter(asset => 
      asset.metrics.volatility < 0.25 && asset.metrics.dividendYield > 0.02
    );
  }
  
  if (selectedFactors.includes('International')) {
    // Focus on international exposure
    filteredAssets = filteredAssets.filter(asset => 
      asset.sector === 'International' || asset.ticker === 'VEA' || asset.ticker === 'VWO'
    );
  }
  
  // If no factors selected or no assets match, use default selection
  if (filteredAssets.length === 0) {
    filteredAssets = allAssets;
  }
  
  // Allocate stocks
  if (allocation.stocks > 0) {
    const stockAssets = filteredAssets.filter(asset => 
      asset.sector !== 'Bonds'
    );
    
    // Select top assets by momentum or yield based on factors
    let sortedStocks = stockAssets;
    if (selectedFactors.includes('Momentum')) {
      sortedStocks = stockAssets.sort((a, b) => b.metrics.momentum12M - a.metrics.momentum12M);
    } else if (selectedFactors.includes('Dividends')) {
      sortedStocks = stockAssets.sort((a, b) => b.metrics.dividendYield - a.metrics.dividendYield);
    } else {
      // Default: sort by momentum
      sortedStocks = stockAssets.sort((a, b) => b.metrics.momentum12M - a.metrics.momentum12M);
    }
    
    const numStocks = Math.min(8, sortedStocks.length);
    const stockWeight = (allocation.stocks / 100) / numStocks;
    
    for (let i = 0; i < numStocks; i++) {
      selectedAssets.push({
        asset: sortedStocks[i],
        weight: stockWeight
      });
    }
  }
  
  // Allocate crypto (skip for now since we don't have crypto in new dataset)
  if (allocation.crypto > 0) {
    // Add crypto allocation to stocks instead
    const techAssets = filteredAssets.filter(asset => asset.sector === 'Technology');
    const numTech = Math.min(2, techAssets.length);
    const cryptoWeight = (allocation.crypto / 100) / numTech;
    
    for (let i = 0; i < numTech; i++) {
      selectedAssets.push({
        asset: techAssets[i],
        weight: cryptoWeight
      });
    }
  }
  
  // Allocate bonds
  if (allocation.bonds > 0) {
    const bondAssets = filteredAssets.filter(asset => 
      asset.sector === 'Bonds' || asset.ticker === 'BND' || asset.ticker === 'TLT'
    );
    const numBonds = Math.min(3, bondAssets.length);
    const bondWeight = (allocation.bonds / 100) / numBonds;
    
    for (let i = 0; i < numBonds; i++) {
      selectedAssets.push({
        asset: bondAssets[i],
        weight: bondWeight
      });
    }
  }
  
  // Calculate portfolio statistics
  const portfolioStats = calculatePortfolioStats(selectedAssets);
  
  // Apply diversification benefit (reduce volatility)
  const diversificationFactor = 0.8; // 20% volatility reduction from diversification
  const adjustedVolatility = portfolioStats.volatility * diversificationFactor;
  
  // Calculate Sharpe ratio (assuming 3% risk-free rate)
  const riskFreeRate = 0.03;
  const sharpeRatio = (portfolioStats.meanReturn - riskFreeRate) / adjustedVolatility;
  
  return {
    meanReturn: portfolioStats.meanReturn,
    volatility: adjustedVolatility,
    maxDrawdown: portfolioStats.maxDrawdown,
    sharpeRatio,
    assets: selectedAssets
  };
};

/**
 * Run full calculation including Monte Carlo simulation
 */
export const calculateFullPortfolio = (
  state: BuilderState,
  initialInvestment: number = 10000,
  timeHorizon: number = 10
): CalculationResult => {
  // Calculate portfolio stats
  const stats = calculatePortfolioStats(state.allocation, state.factors);
  
  // Create a mock StrategyDNA for Monte Carlo simulation
  const mockStrategy = {
    id: 'custom-strategy',
    name: 'Custom Strategy',
    intent: state.goal === 'Grow' ? 'Growth' as const : 
            state.goal === 'Balance' ? 'Stability' as const : 'Income' as const,
    riskScore: state.risk,
    marketRegime: 'Bull' as const,
    assets: stats.assets,
    stats: {
      meanReturn: stats.meanReturn,
      volatility: stats.volatility,
      maxDrawdown: stats.maxDrawdown
    },
    narrative: 'Custom built strategy',
    allocation: state.allocation
  };
  
  // Run Monte Carlo simulation
  const monteCarloResult = runMonteCarlo(mockStrategy, initialInvestment, timeHorizon, 500);
  
  // Calculate display metrics
  const typicalYear = `+${(stats.meanReturn * 100).toFixed(1)}%`;
  const badYearReturn = stats.meanReturn - (2 * stats.volatility);
  const badYear = `${(badYearReturn * 100).toFixed(1)}%`;
  
  // Calculate yield (weighted average of dividend yields)
  let portfolioYield = 0;
  stats.assets.forEach(({ asset, weight }) => {
    portfolioYield += asset.metrics.dividendYield * weight;
  });
  const yieldPercent = `${(portfolioYield * 100).toFixed(1)}%`;
  
  return {
    stats,
    monteCarloResult,
    metrics: {
      typicalYear,
      badYear,
      yield: yieldPercent
    }
  };
};

/**
 * Generate strategy DNA description based on state
 */
export const generateStrategyDNA = (state: BuilderState): string => {
  const { goal, factors, allocation } = state;
  
  let description = '';
  
  // Goal-based description
  if (goal === 'Grow') {
    description += 'Aggressive Growth Strategy';
  } else if (goal === 'Balance') {
    description += 'Balanced Growth Strategy';
  } else {
    description += 'Conservative Preservation Strategy';
  }
  
  // Factor-based description
  if (factors.length > 0) {
    description += ' focused on ' + factors.join(', ');
  }
  
  // Allocation description
  const allocParts = [];
  if (allocation.stocks > 0) allocParts.push(`${allocation.stocks}% Stocks`);
  if (allocation.crypto > 0) allocParts.push(`${allocation.crypto}% Crypto`);
  if (allocation.bonds > 0) allocParts.push(`${allocation.bonds}% Bonds`);
  
  if (allocParts.length > 0) {
    description += ` with ${allocParts.join(', ')} allocation`;
  }
  
  return description + '.';
};

/**
 * Generate failure mode analysis
 */
export const generateFailureMode = (state: BuilderState): string => {
  const { factors, allocation } = state;
  
  const risks = [];
  
  if (allocation.crypto > 15) {
    risks.push('high cryptocurrency volatility');
  }
  
  if (factors.includes('Tech')) {
    risks.push('technology sector concentration');
  }
  
  if (factors.includes('Momentum')) {
    risks.push('momentum reversals in bear markets');
  }
  
  if (allocation.bonds < 20) {
    risks.push('lack of defensive assets during market stress');
  }
  
  if (factors.includes('Growth') && allocation.bonds < 30) {
    risks.push('growth stock underperformance during rising interest rates');
  }
  
  if (risks.length === 0) {
    return 'This balanced strategy has moderate risk across multiple scenarios.';
  }
  
  return `This strategy may underperform due to ${risks.join(', ')}.`;
};