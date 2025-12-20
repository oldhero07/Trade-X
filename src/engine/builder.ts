import { QuantAsset, getAssetUniverse } from './assets';
import { 
  filterByRegime, 
  optimizeMix, 
  calculatePortfolioStats, 
  detectMarketRegime,
  AssetWeight,
  MarketRegime 
} from './factors';

export type UserIntent = 'Growth' | 'Income' | 'Stability';

export interface StrategyDNA {
  id: string;
  name: string;
  intent: UserIntent;
  riskScore: number;
  marketRegime: MarketRegime;
  assets: AssetWeight[];
  stats: {
    meanReturn: number;
    volatility: number;
    maxDrawdown: number;
  };
  narrative: string;
  allocation: {
    stocks: number;
    bonds: number;
    crypto: number;
    etfs: number;
  };
}

/**
 * Generate a dynamic strategy based on user intent and risk score
 */
export const generateStrategy = (userIntent: UserIntent, riskScore: number): StrategyDNA => {
  // 1. Detect Market Regime
  const marketRegime = detectMarketRegime();
  
  // 2. Get asset universe
  const allAssets = getAssetUniverse();
  
  // 3. Filter assets based on regime and intent
  let filteredAssets = filterByRegime(allAssets, marketRegime);
  
  // Further filter based on user intent
  switch (userIntent) {
    case 'Growth':
      filteredAssets = filteredAssets.filter(asset => 
        asset.metrics.momentum12M > 0.25 || 
        asset.sector === 'Technology' ||
        asset.metrics.earningsGrowth > 0.15
      );
      break;
      
    case 'Income':
      filteredAssets = filteredAssets.filter(asset => 
        asset.metrics.dividendYield > 0.02 ||
        asset.sector === 'Bonds' ||
        asset.sector === 'Utilities' ||
        asset.sector === 'Real Estate'
      );
      break;
      
    case 'Stability':
      filteredAssets = filteredAssets.filter(asset => 
        asset.metrics.volatility < 0.30 &&
        asset.metrics.beta < 1.2
      );
      break;
  }
  
  // 4. Optimize asset mix based on risk score
  const assetWeights = optimizeMix(filteredAssets, riskScore);
  
  // 5. Calculate portfolio statistics
  const portfolioStats = calculatePortfolioStats(assetWeights);
  
  // 6. Calculate allocation breakdown
  const allocation = calculateAllocationBreakdown(assetWeights);
  
  // 7. Generate narrative
  const narrative = generateNarrative(userIntent, riskScore, marketRegime, allocation);
  
  // 8. Create strategy name
  const strategyName = generateStrategyName(userIntent, riskScore, marketRegime);
  
  return {
    id: `strategy_${userIntent.toLowerCase()}_${riskScore}_${Date.now()}`,
    name: strategyName,
    intent: userIntent,
    riskScore,
    marketRegime,
    assets: assetWeights,
    stats: portfolioStats,
    narrative,
    allocation
  };
};

/**
 * Calculate allocation breakdown by asset type
 */
const calculateAllocationBreakdown = (assetWeights: AssetWeight[]) => {
  let stocks = 0;
  let bonds = 0;
  let crypto = 0;
  let etfs = 0;
  
  assetWeights.forEach(({ asset, weight }) => {
    if (asset.sector === 'Bonds') {
      bonds += weight;
    } else if (asset.sector === 'ETF') {
      etfs += weight;
    } else if (asset.sector === 'Technology') {
      // Treat high-volatility tech as crypto equivalent
      if (asset.metrics.volatility > 0.40) {
        crypto += weight;
      } else {
        stocks += weight;
      }
    } else {
      stocks += weight;
    }
  });
  
  return {
    stocks: Math.round(stocks * 100),
    bonds: Math.round(bonds * 100),
    crypto: Math.round(crypto * 100),
    etfs: Math.round(etfs * 100)
  };
};

/**
 * Generate strategy name based on parameters
 */
const generateStrategyName = (intent: UserIntent, riskScore: number, regime: MarketRegime): string => {
  const riskLevel = riskScore < 30 ? 'Conservative' : riskScore > 70 ? 'Aggressive' : 'Balanced';
  const regimeAdjective = regime === 'Bull' ? 'Momentum' : regime === 'Bear' ? 'Defensive' : 'Adaptive';
  
  const nameTemplates = {
    Growth: [`${riskLevel} Growth Engine`, `${regimeAdjective} Growth Strategy`, `Tech ${riskLevel} Portfolio`],
    Income: [`${riskLevel} Income Generator`, `Dividend ${regimeAdjective} Strategy`, `Yield ${riskLevel} Portfolio`],
    Stability: [`${riskLevel} Stability Fund`, `${regimeAdjective} Balanced Strategy`, `Core ${riskLevel} Portfolio`]
  };
  
  const templates = nameTemplates[intent];
  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * Generate narrative description
 */
const generateNarrative = (
  intent: UserIntent, 
  riskScore: number, 
  regime: MarketRegime, 
  allocation: { stocks: number; bonds: number; crypto: number; etfs: number }
): string => {
  const riskLevel = riskScore < 30 ? 'conservative' : riskScore > 70 ? 'aggressive' : 'balanced';
  const regimeDescription = regime === 'Bull' ? 'bullish momentum' : regime === 'Bear' ? 'defensive positioning' : 'market-neutral approach';
  
  let narrative = `Optimized for ${regime.toLowerCase()} market conditions using ${regimeDescription} factors. `;
  
  narrative += `This ${riskLevel} ${intent.toLowerCase()} strategy allocates `;
  
  const allocations = [];
  if (allocation.stocks > 0) allocations.push(`${allocation.stocks}% to growth stocks`);
  if (allocation.bonds > 0) allocations.push(`${allocation.bonds}% to bonds`);
  if (allocation.crypto > 0) allocations.push(`${allocation.crypto}% to cryptocurrency`);
  if (allocation.etfs > 0) allocations.push(`${allocation.etfs}% to diversified ETFs`);
  
  narrative += allocations.join(', ') + '. ';
  
  switch (intent) {
    case 'Growth':
      narrative += 'Focuses on high-momentum assets with strong growth potential.';
      break;
    case 'Income':
      narrative += 'Emphasizes dividend-paying assets and yield generation.';
      break;
    case 'Stability':
      narrative += 'Prioritizes capital preservation with moderate growth.';
      break;
  }
  
  return narrative;
};

/**
 * Get standard 60/40 portfolio for comparison
 */
export const getStandard6040Portfolio = (): StrategyDNA => {
  const allAssets = getAssetUniverse();
  
  // Get SPY (60%) and BND (40%)
  const spy = allAssets.find(a => a.ticker === 'SPY')!;
  const bnd = allAssets.find(a => a.ticker === 'BND')!;
  
  const assetWeights: AssetWeight[] = [
    { asset: spy, weight: 0.6 },
    { asset: bnd, weight: 0.4 }
  ];
  
  const portfolioStats = calculatePortfolioStats(assetWeights);
  
  return {
    id: 'standard_60_40',
    name: 'Standard 60/40 Portfolio',
    intent: 'Stability',
    riskScore: 50,
    marketRegime: 'Sideways',
    assets: assetWeights,
    stats: portfolioStats,
    narrative: 'Traditional balanced portfolio with 60% stocks (SPY) and 40% bonds (BND). Provides moderate growth with lower volatility.',
    allocation: {
      stocks: 60,
      bonds: 40,
      crypto: 0,
      etfs: 0
    }
  };
};