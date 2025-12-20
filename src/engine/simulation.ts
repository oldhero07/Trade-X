import { StrategyDNA } from './builder';

export interface SimulationPath {
  year: number;
  value: number;
}

export interface MonteCarloResult {
  paths: SimulationPath[][];
  percentiles: {
    p10: SimulationPath[];
    p50: SimulationPath[];
    p90: SimulationPath[];
  };
  finalValues: {
    p10: number;
    p50: number;
    p90: number;
    mean: number;
  };
}

/**
 * Generate a single simulation path using Geometric Brownian Motion
 */
export const simulatePath = (
  initialValue: number,
  meanReturn: number,
  volatility: number,
  years: number,
  timeSteps: number = 252 // Daily steps (252 trading days per year)
): SimulationPath[] => {
  const dt = 1 / timeSteps; // Time step (1/252 for daily)
  const path: SimulationPath[] = [];
  let currentValue = initialValue;
  
  // Add initial value
  path.push({ year: 0, value: currentValue });
  
  for (let step = 1; step <= years * timeSteps; step++) {
    // Generate random normal variable (Box-Muller transform)
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    // Geometric Brownian Motion formula
    // dS = S * (μ * dt + σ * sqrt(dt) * Z)
    const drift = meanReturn * dt;
    const diffusion = volatility * Math.sqrt(dt) * z;
    
    currentValue = currentValue * Math.exp(drift + diffusion);
    
    // Only store yearly values for visualization
    if (step % timeSteps === 0) {
      const year = step / timeSteps;
      path.push({ year, value: Math.round(currentValue) });
    }
  }
  
  return path;
};

/**
 * Run Monte Carlo simulation with multiple paths
 */
export const runMonteCarlo = (
  strategy: StrategyDNA,
  initialInvestment: number,
  years: number,
  iterations: number = 500
): MonteCarloResult => {
  const paths: SimulationPath[][] = [];
  
  // Generate multiple simulation paths
  for (let i = 0; i < iterations; i++) {
    const path = simulatePath(
      initialInvestment,
      strategy.stats.meanReturn,
      strategy.stats.volatility,
      years
    );
    paths.push(path);
  }
  
  // Calculate percentiles for each year
  const percentiles = calculatePercentiles(paths, years);
  
  // Calculate final value statistics
  const finalValues = calculateFinalValueStats(paths);
  
  return {
    paths,
    percentiles,
    finalValues
  };
};

/**
 * Calculate 10th, 50th, and 90th percentiles for each year
 */
const calculatePercentiles = (paths: SimulationPath[][], years: number) => {
  const p10: SimulationPath[] = [];
  const p50: SimulationPath[] = [];
  const p90: SimulationPath[] = [];
  
  for (let year = 0; year <= years; year++) {
    // Get all values for this year across all paths
    const yearValues = paths.map(path => 
      path.find(point => point.year === year)?.value || 0
    ).sort((a, b) => a - b);
    
    const p10Index = Math.floor(yearValues.length * 0.1);
    const p50Index = Math.floor(yearValues.length * 0.5);
    const p90Index = Math.floor(yearValues.length * 0.9);
    
    p10.push({ year, value: Math.round(yearValues[p10Index]) });
    p50.push({ year, value: Math.round(yearValues[p50Index]) });
    p90.push({ year, value: Math.round(yearValues[p90Index]) });
  }
  
  return { p10, p50, p90 };
};

/**
 * Calculate final value statistics
 */
const calculateFinalValueStats = (paths: SimulationPath[][]) => {
  const finalValues = paths.map(path => path[path.length - 1].value).sort((a, b) => a - b);
  
  const p10Index = Math.floor(finalValues.length * 0.1);
  const p50Index = Math.floor(finalValues.length * 0.5);
  const p90Index = Math.floor(finalValues.length * 0.9);
  
  const mean = finalValues.reduce((sum, val) => sum + val, 0) / finalValues.length;
  
  return {
    p10: Math.round(finalValues[p10Index]),
    p50: Math.round(finalValues[p50Index]),
    p90: Math.round(finalValues[p90Index]),
    mean: Math.round(mean)
  };
};

/**
 * Generate baseline comparison (60/40 portfolio simulation)
 */
export const generateBaselineSimulation = (
  initialInvestment: number,
  years: number
): SimulationPath[] => {
  // Standard 60/40 portfolio: ~7% return, ~10% volatility
  const baselineReturn = 0.07;
  const baselineVolatility = 0.10;
  
  // Use median path from Monte Carlo for consistency
  const paths = [];
  for (let i = 0; i < 100; i++) {
    const path = simulatePath(initialInvestment, baselineReturn, baselineVolatility, years);
    paths.push(path);
  }
  
  // Return median path
  const medianPath: SimulationPath[] = [];
  for (let year = 0; year <= years; year++) {
    const yearValues = paths.map(path => 
      path.find(point => point.year === year)?.value || 0
    ).sort((a, b) => a - b);
    
    const medianIndex = Math.floor(yearValues.length * 0.5);
    medianPath.push({ year, value: Math.round(yearValues[medianIndex]) });
  }
  
  return medianPath;
};

/**
 * Calculate Sharpe ratio for a strategy
 */
export const calculateSharpeRatio = (strategy: StrategyDNA, riskFreeRate: number = 0.03): number => {
  const excessReturn = strategy.stats.meanReturn - riskFreeRate;
  return excessReturn / strategy.stats.volatility;
};

/**
 * Calculate maximum drawdown probability
 */
export const calculateDrawdownProbability = (strategy: StrategyDNA): number => {
  // Simplified calculation based on volatility and max drawdown
  const volatilityFactor = strategy.stats.volatility;
  const maxDrawdownFactor = strategy.stats.maxDrawdown;
  
  // Higher volatility and max drawdown = higher probability of significant drawdown
  const drawdownProb = Math.min(0.95, (volatilityFactor + maxDrawdownFactor) / 2);
  
  return Math.round(drawdownProb * 100) / 100;
};

/**
 * Generate risk metrics for display
 */
export const generateRiskMetrics = (strategy: StrategyDNA) => {
  const sharpeRatio = calculateSharpeRatio(strategy);
  const drawdownProb = calculateDrawdownProbability(strategy);
  
  // Calculate typical year return (expected)
  const typicalYear = `+${(strategy.stats.meanReturn * 100).toFixed(1)}%`;
  
  // Calculate bad year (2 standard deviations below mean)
  const badYearReturn = strategy.stats.meanReturn - (2 * strategy.stats.volatility);
  const badYear = `${(badYearReturn * 100).toFixed(1)}%`;
  
  // Generate vibe based on risk characteristics
  let vibe = 'Balanced 🎯';
  if (strategy.stats.volatility < 0.15) {
    vibe = 'Defensive Shield 🛡️';
  } else if (strategy.stats.volatility > 0.30) {
    vibe = 'Rocket Fuel 🚀';
  } else if (strategy.intent === 'Growth') {
    vibe = 'Growth Engine ⚡';
  } else if (strategy.intent === 'Income') {
    vibe = 'Income Generator 💰';
  }
  
  return {
    typicalYear,
    badYear,
    vibe,
    sharpeRatio: sharpeRatio.toFixed(2),
    drawdownProb: `${(drawdownProb * 100).toFixed(0)}%`
  };
};