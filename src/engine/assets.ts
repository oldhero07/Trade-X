export interface QuantAsset {
  ticker: string;           // Asset symbol (e.g., "AAPL")
  name: string;            // Full company/asset name
  sector: string;          // Industry classification
  price: number;           // Current market price in USD
  
  // Quantitative Factors
  metrics: {
    momentum12M: number;     // 12-month return percentage (decimal)
    earningsGrowth: number;  // Year-over-year earnings growth (decimal)
    volatility: number;      // Annualized standard deviation (decimal)
    beta: number;           // Market sensitivity coefficient
    dividendYield: number;   // Annual dividend yield (decimal)
  };
  
  // Pre-calculated correlation coefficients
  correlations: { [ticker: string]: number };
}

// Predefined correlation matrix for consistency and symmetry
const CORRELATION_MATRIX: { [key: string]: { [key: string]: number } } = {};

// Initialize correlation matrix with symmetric values
const initializeCorrelationMatrix = () => {
  const tickers = ['NVDA', 'AMD', 'MSFT', 'GOOGL', 'META', 'AMZN', 'TSLA', 'AAPL', 'JNJ', 'UNH', 'PFE', 'JPM', 'BAC', 'V', 'XOM', 'CVX', 'KO', 'PG', 'WMT', 'HD', 'NEE', 'SO', 'VNO', 'VNQ', 'BND', 'SPY', 'QQQ', 'GLD', 'TLT', 'VYM'];
  
  // Define sector correlations
  const sectorCorrelations = {
    'Technology-Technology': 0.8,
    'Healthcare-Healthcare': 0.75,
    'Financial-Financial': 0.85,
    'Energy-Energy': 0.9,
    'Consumer-Consumer': 0.7,
    'Utilities-Utilities': 0.8,
    'Real Estate-Real Estate': 0.85,
    'Bonds-Bonds': 0.9,
    'ETF-ETF': 0.6,
    'Technology-Healthcare': 0.2,
    'Technology-Financial': 0.3,
    'Technology-Energy': 0.1,
    'Technology-Consumer': 0.25,
    'Technology-Utilities': 0.15,
    'Technology-Real Estate': 0.2,
    'Technology-Bonds': -0.2,
    'Technology-ETF': 0.4,
    'Healthcare-Financial': 0.25,
    'Healthcare-Energy': 0.15,
    'Healthcare-Consumer': 0.3,
    'Healthcare-Utilities': 0.2,
    'Healthcare-Real Estate': 0.15,
    'Healthcare-Bonds': -0.1,
    'Healthcare-ETF': 0.3,
    'Financial-Energy': 0.4,
    'Financial-Consumer': 0.35,
    'Financial-Utilities': 0.25,
    'Financial-Real Estate': 0.5,
    'Financial-Bonds': -0.3,
    'Financial-ETF': 0.45,
    'Energy-Consumer': 0.2,
    'Energy-Utilities': 0.3,
    'Energy-Real Estate': 0.25,
    'Energy-Bonds': -0.2,
    'Energy-ETF': 0.3,
    'Consumer-Utilities': 0.4,
    'Consumer-Real Estate': 0.3,
    'Consumer-Bonds': -0.1,
    'Consumer-ETF': 0.35,
    'Utilities-Real Estate': 0.4,
    'Utilities-Bonds': 0.1,
    'Utilities-ETF': 0.25,
    'Real Estate-Bonds': 0.05,
    'Real Estate-ETF': 0.4,
    'Bonds-ETF': -0.15
  };
  
  tickers.forEach(ticker1 => {
    CORRELATION_MATRIX[ticker1] = {};
    tickers.forEach(ticker2 => {
      if (ticker1 === ticker2) {
        CORRELATION_MATRIX[ticker1][ticker2] = 1.0;
      } else {
        const sector1 = getSectorForTicker(ticker1);
        const sector2 = getSectorForTicker(ticker2);
        const key1 = `${sector1}-${sector2}`;
        const key2 = `${sector2}-${sector1}`;
        
        let correlation = sectorCorrelations[key1] || sectorCorrelations[key2] || 0.2;
        
        // Ensure symmetry
        if (CORRELATION_MATRIX[ticker2] && CORRELATION_MATRIX[ticker2][ticker1] !== undefined) {
          correlation = CORRELATION_MATRIX[ticker2][ticker1];
        }
        
        // Clamp to valid range
        correlation = Math.max(-1.0, Math.min(1.0, correlation));
        CORRELATION_MATRIX[ticker1][ticker2] = correlation;
      }
    });
  });
};

// Helper function to generate correlation matrix
const generateCorrelations = (ticker: string, sector: string): { [ticker: string]: number } => {
  if (Object.keys(CORRELATION_MATRIX).length === 0) {
    initializeCorrelationMatrix();
  }
  
  return { ...CORRELATION_MATRIX[ticker] };
};

// Helper function to get sector for ticker
const getSectorForTicker = (ticker: string): string => {
  const sectorMap: { [key: string]: string } = {
    'NVDA': 'Technology', 'AMD': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology',
    'META': 'Technology', 'AMZN': 'Technology', 'TSLA': 'Technology', 'AAPL': 'Technology',
    'JNJ': 'Healthcare', 'UNH': 'Healthcare', 'PFE': 'Healthcare',
    'JPM': 'Financial', 'BAC': 'Financial', 'V': 'Financial',
    'XOM': 'Energy', 'CVX': 'Energy',
    'KO': 'Consumer', 'PG': 'Consumer', 'WMT': 'Consumer', 'HD': 'Consumer',
    'NEE': 'Utilities', 'SO': 'Utilities',
    'VNO': 'Real Estate', 'VNQ': 'Real Estate',
    'BND': 'Bonds', 'SPY': 'ETF', 'QQQ': 'ETF', 'GLD': 'ETF', 'TLT': 'Bonds', 'VYM': 'ETF'
  };
  return sectorMap[ticker] || 'Other';
};

export const getAssetUniverse = (): QuantAsset[] => [
  // Technology Stocks (8 assets) - High Growth, High Volatility
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    price: 875.28,
    metrics: {
      momentum12M: 1.89,      // 189% return
      earningsGrowth: 1.26,   // 126% earnings growth
      volatility: 0.45,       // 45% volatility
      beta: 1.68,             // High beta
      dividendYield: 0.003    // 0.3% dividend yield
    },
    correlations: generateCorrelations('NVDA', 'Technology')
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    sector: 'Technology',
    price: 142.56,
    metrics: {
      momentum12M: 0.75,      // 75% return
      earningsGrowth: 0.89,   // 89% earnings growth
      volatility: 0.42,       // 42% volatility
      beta: 1.55,             // High beta
      dividendYield: 0.0      // No dividend
    },
    correlations: generateCorrelations('AMD', 'Technology')
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    price: 415.26,
    metrics: {
      momentum12M: 0.28,      // 28% return
      earningsGrowth: 0.15,   // 15% earnings growth
      volatility: 0.22,       // 22% volatility
      beta: 0.89,             // Moderate beta
      dividendYield: 0.007    // 0.7% dividend yield
    },
    correlations: generateCorrelations('MSFT', 'Technology')
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc Class A',
    sector: 'Technology',
    price: 175.32,
    metrics: {
      momentum12M: 0.31,      // 31% return
      earningsGrowth: 0.42,   // 42% earnings growth
      volatility: 0.25,       // 25% volatility
      beta: 1.05,             // Market beta
      dividendYield: 0.0      // No dividend
    },
    correlations: generateCorrelations('GOOGL', 'Technology')
  },
  {
    ticker: 'META',
    name: 'Meta Platforms Inc',
    sector: 'Technology',
    price: 563.92,
    metrics: {
      momentum12M: 0.73,      // 73% return
      earningsGrowth: 0.35,   // 35% earnings growth
      volatility: 0.35,       // 35% volatility
      beta: 1.18,             // Above market beta
      dividendYield: 0.004    // 0.4% dividend yield
    },
    correlations: generateCorrelations('META', 'Technology')
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc',
    sector: 'Technology',
    price: 195.12,
    metrics: {
      momentum12M: 0.44,      // 44% return
      earningsGrowth: 0.52,   // 52% earnings growth
      volatility: 0.30,       // 30% volatility
      beta: 1.15,             // Above market beta
      dividendYield: 0.0      // No dividend
    },
    correlations: generateCorrelations('AMZN', 'Technology')
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc',
    sector: 'Technology',
    price: 248.98,
    metrics: {
      momentum12M: -0.15,     // -15% return (volatile year)
      earningsGrowth: 0.25,   // 25% earnings growth
      volatility: 0.55,       // 55% volatility (very high)
      beta: 2.31,             // Very high beta
      dividendYield: 0.0      // No dividend
    },
    correlations: generateCorrelations('TSLA', 'Technology')
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc',
    sector: 'Technology',
    price: 229.87,
    metrics: {
      momentum12M: 0.22,      // 22% return
      earningsGrowth: 0.11,   // 11% earnings growth
      volatility: 0.25,       // 25% volatility
      beta: 1.24,             // Above market beta
      dividendYield: 0.004    // 0.4% dividend yield
    },
    correlations: generateCorrelations('AAPL', 'Technology')
  },

  // Healthcare Stocks (3 assets) - Defensive Growth
  {
    ticker: 'JNJ',
    name: 'Johnson & Johnson',
    sector: 'Healthcare',
    price: 155.43,
    metrics: {
      momentum12M: 0.08,      // 8% return
      earningsGrowth: 0.06,   // 6% earnings growth
      volatility: 0.16,       // 16% volatility
      beta: 0.68,             // Defensive beta
      dividendYield: 0.029    // 2.9% dividend yield
    },
    correlations: generateCorrelations('JNJ', 'Healthcare')
  },
  {
    ticker: 'UNH',
    name: 'UnitedHealth Group Inc',
    sector: 'Healthcare',
    price: 595.21,
    metrics: {
      momentum12M: 0.18,      // 18% return
      earningsGrowth: 0.14,   // 14% earnings growth
      volatility: 0.20,       // 20% volatility
      beta: 0.75,             // Defensive beta
      dividendYield: 0.013    // 1.3% dividend yield
    },
    correlations: generateCorrelations('UNH', 'Healthcare')
  },
  {
    ticker: 'PFE',
    name: 'Pfizer Inc',
    sector: 'Healthcare',
    price: 25.89,
    metrics: {
      momentum12M: -0.12,     // -12% return
      earningsGrowth: -0.25,  // -25% earnings decline
      volatility: 0.22,       // 22% volatility
      beta: 0.52,             // Very defensive beta
      dividendYield: 0.061    // 6.1% dividend yield
    },
    correlations: generateCorrelations('PFE', 'Healthcare')
  },

  // Financial Stocks (3 assets) - Cyclical Value
  {
    ticker: 'JPM',
    name: 'JPMorgan Chase & Co',
    sector: 'Financial',
    price: 231.52,
    metrics: {
      momentum12M: 0.35,      // 35% return
      earningsGrowth: 0.22,   // 22% earnings growth
      volatility: 0.28,       // 28% volatility
      beta: 1.15,             // Above market beta
      dividendYield: 0.021    // 2.1% dividend yield
    },
    correlations: generateCorrelations('JPM', 'Financial')
  },
  {
    ticker: 'BAC',
    name: 'Bank of America Corp',
    sector: 'Financial',
    price: 45.67,
    metrics: {
      momentum12M: 0.41,      // 41% return
      earningsGrowth: 0.18,   // 18% earnings growth
      volatility: 0.32,       // 32% volatility
      beta: 1.28,             // High beta
      dividendYield: 0.024    // 2.4% dividend yield
    },
    correlations: generateCorrelations('BAC', 'Financial')
  },
  {
    ticker: 'V',
    name: 'Visa Inc',
    sector: 'Financial',
    price: 312.45,
    metrics: {
      momentum12M: 0.19,      // 19% return
      earningsGrowth: 0.12,   // 12% earnings growth
      volatility: 0.20,       // 20% volatility
      beta: 0.98,             // Market beta
      dividendYield: 0.007    // 0.7% dividend yield
    },
    correlations: generateCorrelations('V', 'Financial')
  },

  // Energy Stocks (2 assets) - Value/Cyclical
  {
    ticker: 'XOM',
    name: 'Exxon Mobil Corporation',
    sector: 'Energy',
    price: 118.92,
    metrics: {
      momentum12M: 0.12,      // 12% return
      earningsGrowth: 0.45,   // 45% earnings growth
      volatility: 0.35,       // 35% volatility
      beta: 1.42,             // High beta
      dividendYield: 0.034    // 3.4% dividend yield
    },
    correlations: generateCorrelations('XOM', 'Energy')
  },
  {
    ticker: 'CVX',
    name: 'Chevron Corporation',
    sector: 'Energy',
    price: 158.73,
    metrics: {
      momentum12M: 0.08,      // 8% return
      earningsGrowth: 0.38,   // 38% earnings growth
      volatility: 0.30,       // 30% volatility
      beta: 1.25,             // Above market beta
      dividendYield: 0.031    // 3.1% dividend yield
    },
    correlations: generateCorrelations('CVX', 'Energy')
  },

  // Consumer Stocks (4 assets) - Defensive/Staples
  {
    ticker: 'KO',
    name: 'The Coca-Cola Company',
    sector: 'Consumer',
    price: 62.84,
    metrics: {
      momentum12M: 0.15,      // 15% return
      earningsGrowth: 0.08,   // 8% earnings growth
      volatility: 0.15,       // 15% volatility
      beta: 0.58,             // Defensive beta
      dividendYield: 0.030    // 3.0% dividend yield
    },
    correlations: generateCorrelations('KO', 'Consumer')
  },
  {
    ticker: 'PG',
    name: 'Procter & Gamble',
    sector: 'Consumer',
    price: 165.23,
    metrics: {
      momentum12M: 0.12,      // 12% return
      earningsGrowth: 0.05,   // 5% earnings growth
      volatility: 0.14,       // 14% volatility
      beta: 0.45,             // Very defensive beta
      dividendYield: 0.024    // 2.4% dividend yield
    },
    correlations: generateCorrelations('PG', 'Consumer')
  },
  {
    ticker: 'WMT',
    name: 'Walmart Inc',
    sector: 'Consumer',
    price: 95.12,
    metrics: {
      momentum12M: 0.58,      // 58% return
      earningsGrowth: 0.07,   // 7% earnings growth
      volatility: 0.17,       // 17% volatility
      beta: 0.52,             // Defensive beta
      dividendYield: 0.023    // 2.3% dividend yield
    },
    correlations: generateCorrelations('WMT', 'Consumer')
  },
  {
    ticker: 'HD',
    name: 'The Home Depot Inc',
    sector: 'Consumer',
    price: 412.67,
    metrics: {
      momentum12M: 0.24,      // 24% return
      earningsGrowth: 0.09,   // 9% earnings growth
      volatility: 0.22,       // 22% volatility
      beta: 0.98,             // Market beta
      dividendYield: 0.024    // 2.4% dividend yield
    },
    correlations: generateCorrelations('HD', 'Consumer')
  },

  // Utilities Stocks (2 assets) - Defensive/Income
  {
    ticker: 'NEE',
    name: 'NextEra Energy Inc',
    sector: 'Utilities',
    price: 78.45,
    metrics: {
      momentum12M: 0.22,      // 22% return
      earningsGrowth: 0.08,   // 8% earnings growth
      volatility: 0.18,       // 18% volatility
      beta: 0.68,             // Defensive beta
      dividendYield: 0.028    // 2.8% dividend yield
    },
    correlations: generateCorrelations('NEE', 'Utilities')
  },
  {
    ticker: 'SO',
    name: 'The Southern Company',
    sector: 'Utilities',
    price: 89.23,
    metrics: {
      momentum12M: 0.31,      // 31% return
      earningsGrowth: 0.06,   // 6% earnings growth
      volatility: 0.15,       // 15% volatility
      beta: 0.42,             // Very defensive beta
      dividendYield: 0.038    // 3.8% dividend yield
    },
    correlations: generateCorrelations('SO', 'Utilities')
  },

  // Real Estate (2 assets) - Income/REIT
  {
    ticker: 'VNO',
    name: 'Vornado Realty Trust',
    sector: 'Real Estate',
    price: 28.67,
    metrics: {
      momentum12M: -0.08,     // -8% return
      earningsGrowth: -0.15,  // -15% earnings decline
      volatility: 0.25,       // 25% volatility
      beta: 1.12,             // Above market beta
      dividendYield: 0.065    // 6.5% dividend yield
    },
    correlations: generateCorrelations('VNO', 'Real Estate')
  },
  {
    ticker: 'VNQ',
    name: 'Vanguard Real Estate ETF',
    sector: 'Real Estate',
    price: 92.34,
    metrics: {
      momentum12M: 0.18,      // 18% return
      earningsGrowth: 0.12,   // 12% earnings growth
      volatility: 0.22,       // 22% volatility
      beta: 0.95,             // Near market beta
      dividendYield: 0.035    // 3.5% dividend yield
    },
    correlations: generateCorrelations('VNQ', 'Real Estate')
  },

  // Bonds/ETFs (6 assets) - Defensive/Diversified
  {
    ticker: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    sector: 'Bonds',
    price: 72.45,
    metrics: {
      momentum12M: 0.05,      // 5% return
      earningsGrowth: 0.0,    // No earnings growth for bonds
      volatility: 0.05,       // 5% volatility (very low)
      beta: -0.15,            // Negative beta (inverse to stocks)
      dividendYield: 0.042    // 4.2% dividend yield
    },
    correlations: generateCorrelations('BND', 'Bonds')
  },
  {
    ticker: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    sector: 'ETF',
    price: 589.67,
    metrics: {
      momentum12M: 0.26,      // 26% return
      earningsGrowth: 0.12,   // 12% earnings growth
      volatility: 0.16,       // 16% volatility
      beta: 1.0,              // Perfect market beta
      dividendYield: 0.013    // 1.3% dividend yield
    },
    correlations: generateCorrelations('SPY', 'ETF')
  },
  {
    ticker: 'QQQ',
    name: 'Invesco QQQ Trust',
    sector: 'ETF',
    price: 512.89,
    metrics: {
      momentum12M: 0.29,      // 29% return
      earningsGrowth: 0.18,   // 18% earnings growth
      volatility: 0.22,       // 22% volatility
      beta: 1.15,             // Above market beta
      dividendYield: 0.006    // 0.6% dividend yield
    },
    correlations: generateCorrelations('QQQ', 'ETF')
  },
  {
    ticker: 'GLD',
    name: 'SPDR Gold Trust',
    sector: 'ETF',
    price: 245.12,
    metrics: {
      momentum12M: 0.28,      // 28% return
      earningsGrowth: 0.0,    // No earnings for gold
      volatility: 0.18,       // 18% volatility
      beta: -0.05,            // Slightly negative beta
      dividendYield: 0.0      // No dividend
    },
    correlations: generateCorrelations('GLD', 'ETF')
  },
  {
    ticker: 'TLT',
    name: 'iShares 20+ Year Treasury Bond ETF',
    sector: 'Bonds',
    price: 89.23,
    metrics: {
      momentum12M: 0.02,      // 2% return
      earningsGrowth: 0.0,    // No earnings growth for bonds
      volatility: 0.12,       // 12% volatility
      beta: -0.25,            // Negative beta (inverse to stocks)
      dividendYield: 0.038    // 3.8% dividend yield
    },
    correlations: generateCorrelations('TLT', 'Bonds')
  },
  {
    ticker: 'VYM',
    name: 'Vanguard High Dividend Yield ETF',
    sector: 'ETF',
    price: 125.67,
    metrics: {
      momentum12M: 0.14,      // 14% return
      earningsGrowth: 0.08,   // 8% earnings growth
      volatility: 0.15,       // 15% volatility
      beta: 0.85,             // Defensive beta
      dividendYield: 0.029    // 2.9% dividend yield
    },
    correlations: generateCorrelations('VYM', 'ETF')
  }
];

export const getAssetByTicker = (ticker: string): QuantAsset | undefined => {
  return getAssetUniverse().find(asset => asset.ticker === ticker);
};

export const getAssetsBySector = (sector: string): QuantAsset[] => {
  return getAssetUniverse().filter(asset => asset.sector === sector);
};
// Utility Functions

/**
 * Generates a full correlation matrix for all assets in the universe
 * @returns 30x30 correlation matrix as a 2D array
 */
export const getCorrelationMatrix = (): number[][] => {
  const assets = getAssetUniverse();
  const tickers = assets.map(asset => asset.ticker);
  const matrix: number[][] = [];
  
  assets.forEach((asset, i) => {
    matrix[i] = [];
    tickers.forEach((ticker, j) => {
      matrix[i][j] = asset.correlations[ticker] || 0.0;
    });
  });
  
  return matrix;
};

/**
 * Validates that an asset's correlations are mathematically valid
 * @param asset The asset to validate
 * @returns true if correlations are valid, false otherwise
 */
export const validateCorrelations = (asset: QuantAsset): boolean => {
  // Check self-correlation is 1.0
  if (Math.abs(asset.correlations[asset.ticker] - 1.0) > 0.001) {
    return false;
  }
  
  // Check all correlations are within [-1.0, 1.0]
  for (const correlation of Object.values(asset.correlations)) {
    if (correlation < -1.0 || correlation > 1.0) {
      return false;
    }
  }
  
  return true;
};

/**
 * Portfolio metrics interface for analysis
 */
export interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  beta: number;
  dividendYield: number;
}

/**
 * Calculates portfolio-level metrics for a given set of tickers with equal weights
 * @param tickers Array of asset tickers
 * @returns Portfolio metrics
 */
export const calculatePortfolioMetrics = (tickers: string[]): PortfolioMetrics => {
  const assets = tickers.map(ticker => getAssetByTicker(ticker)).filter(Boolean) as QuantAsset[];
  
  if (assets.length === 0) {
    return {
      expectedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      beta: 0,
      dividendYield: 0
    };
  }
  
  const weight = 1 / assets.length; // Equal weights
  
  // Calculate weighted metrics
  const expectedReturn = assets.reduce((sum, asset) => sum + weight * asset.metrics.momentum12M, 0);
  const beta = assets.reduce((sum, asset) => sum + weight * asset.metrics.beta, 0);
  const dividendYield = assets.reduce((sum, asset) => sum + weight * asset.metrics.dividendYield, 0);
  
  // Calculate portfolio volatility using correlation matrix
  let portfolioVariance = 0;
  for (let i = 0; i < assets.length; i++) {
    for (let j = 0; j < assets.length; j++) {
      const correlation = assets[i].correlations[assets[j].ticker] || 0;
      portfolioVariance += weight * weight * assets[i].metrics.volatility * assets[j].metrics.volatility * correlation;
    }
  }
  
  const volatility = Math.sqrt(portfolioVariance);
  const riskFreeRate = 0.04; // 4% risk-free rate
  const sharpeRatio = volatility > 0 ? (expectedReturn - riskFreeRate) / volatility : 0;
  
  return {
    expectedReturn,
    volatility,
    sharpeRatio,
    beta,
    dividendYield
  };
};

/**
 * Validates and cleans quantitative metrics for an asset
 * @param asset The asset to validate
 * @returns Validated asset with corrected metrics
 */
export const validateAndCleanAsset = (asset: QuantAsset): QuantAsset => {
  const cleanedAsset = { ...asset };
  
  // Ensure volatility is non-negative
  if (cleanedAsset.metrics.volatility < 0) {
    cleanedAsset.metrics.volatility = 0;
  }
  
  // Ensure dividend yield is non-negative
  if (cleanedAsset.metrics.dividendYield < 0) {
    cleanedAsset.metrics.dividendYield = 0;
  }
  
  // Ensure price is positive
  if (cleanedAsset.price <= 0) {
    cleanedAsset.price = 1.0;
  }
  
  // Clamp correlation values to [-1.0, 1.0]
  Object.keys(cleanedAsset.correlations).forEach(ticker => {
    const correlation = cleanedAsset.correlations[ticker];
    cleanedAsset.correlations[ticker] = Math.max(-1.0, Math.min(1.0, correlation));
  });
  
  return cleanedAsset;
};

/**
 * Gets correlation between two assets, with default fallback
 * @param ticker1 First asset ticker
 * @param ticker2 Second asset ticker
 * @returns Correlation coefficient or 0.0 if not found
 */
export const getAssetCorrelation = (ticker1: string, ticker2: string): number => {
  const asset1 = getAssetByTicker(ticker1);
  if (!asset1) return 0.0;
  
  return asset1.correlations[ticker2] ?? 0.0;
};