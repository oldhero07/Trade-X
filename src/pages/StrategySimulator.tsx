import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { runMonteCarlo, generateBaselineSimulation, generateRiskMetrics, MonteCarloResult } from '../engine/simulation';
import { StrategyDNA, getStandard6040Portfolio } from '../engine/builder';

interface StrategySimulatorProps {
  selectedStrategy?: any;
}

interface ProjectionData {
  year: number;
  baseline: number;
  projected: number;
  optimistic: number;
  pessimistic: number;
}

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

const StrategySimulator: React.FC<StrategySimulatorProps> = ({ selectedStrategy }) => {
  // State for user inputs
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [timeHorizon, setTimeHorizon] = useState(10);
  const [initialInvestment, setInitialInvestment] = useState(10000);
  
  // State for strategy data
  const [currentStrategy, setCurrentStrategy] = useState<StrategyDNA | null>(null);
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // State for calculated data
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);
  const [dynamicAllocation, setDynamicAllocation] = useState<AllocationData[]>([]);

  // Load strategy from localStorage or props
  useEffect(() => {
    const strategyDNA = localStorage.getItem('selectedStrategyDNA');
    if (strategyDNA) {
      const parsedStrategy = JSON.parse(strategyDNA) as StrategyDNA;
      setCurrentStrategy(parsedStrategy);
      setRiskTolerance(parsedStrategy.riskScore);
    } else {
      // Fallback to standard 60/40 portfolio
      const fallbackStrategy = getStandard6040Portfolio();
      setCurrentStrategy(fallbackStrategy);
    }
  }, [selectedStrategy]);

  // Run Monte Carlo simulation when strategy or parameters change
  useEffect(() => {
    if (currentStrategy) {
      setIsSimulating(true);
      
      // Run Monte Carlo simulation
      setTimeout(() => {
        const result = runMonteCarlo(currentStrategy, initialInvestment, timeHorizon, 500);
        setMonteCarloResult(result);
        
        // Generate projection data for chart
        const baselineData = generateBaselineSimulation(initialInvestment, timeHorizon);
        const projectionData: ProjectionData[] = [];
        
        for (let year = 0; year <= timeHorizon; year++) {
          const baseline = baselineData.find(p => p.year === year)?.value || 0;
          const projected = result.percentiles.p50.find(p => p.year === year)?.value || 0;
          const optimistic = result.percentiles.p90.find(p => p.year === year)?.value || 0;
          const pessimistic = result.percentiles.p10.find(p => p.year === year)?.value || 0;
          
          projectionData.push({
            year,
            baseline,
            projected,
            optimistic,
            pessimistic
          });
        }
        
        setProjectionData(projectionData);
        setIsSimulating(false);
      }, 1000); // Simulate processing time
    }
  }, [currentStrategy, initialInvestment, timeHorizon]);

  // Update allocation visualization
  useEffect(() => {
    if (currentStrategy) {
      const allocation: AllocationData[] = [];
      
      if (currentStrategy.allocation.stocks > 0) {
        allocation.push({ 
          name: 'Stocks', 
          value: currentStrategy.allocation.stocks, 
          color: '#22c55e' 
        });
      }
      
      if (currentStrategy.allocation.bonds > 0) {
        allocation.push({ 
          name: 'Bonds', 
          value: currentStrategy.allocation.bonds, 
          color: '#16a34a' 
        });
      }
      
      if (currentStrategy.allocation.crypto > 0) {
        allocation.push({ 
          name: 'Crypto', 
          value: currentStrategy.allocation.crypto, 
          color: '#10b981' 
        });
      }
      
      if (currentStrategy.allocation.etfs > 0) {
        allocation.push({ 
          name: 'ETFs', 
          value: currentStrategy.allocation.etfs, 
          color: '#059669' 
        });
      }
      
      setDynamicAllocation(allocation);
    }
  }, [currentStrategy]);

  // Static conservative baseline allocation for comparison
  const baseAllocation: AllocationData[] = [
    { name: 'Stocks', value: 60, color: '#6B7280' },
    { name: 'Bonds', value: 40, color: '#4B5563' }
  ];

  // Get risk metrics
  const metrics = currentStrategy ? generateRiskMetrics(currentStrategy) : {
    typicalYear: '+7.0%',
    badYear: '-3.0%',
    vibe: 'Balanced 🎯',
    sharpeRatio: '0.70',
    drawdownProb: '15%'
  };

  // Get strategy name
  const strategyName = currentStrategy?.name || 
    selectedStrategy?.title || 
    JSON.parse(localStorage.getItem('selectedStrategy') || '{}')?.title || 
    'Custom Strategy';

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Strategy Simulator</h1>
          <p className="text-gray-400">Fine-tune your investment strategy and see projected outcomes</p>
        </div>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Left Column - Control Panel */}
          <div className="bg-[#111111] border border-white/10 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6">{strategyName}</h2>
            
            {/* Strategy Info */}
            {currentStrategy && (
              <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-300 mb-2">{currentStrategy.narrative}</p>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Intent: <span className="text-[#22c55e]">{currentStrategy.intent}</span></span>
                  <span>Risk: <span className="text-yellow-400">{currentStrategy.riskScore}%</span></span>
                  <span>Regime: <span className="text-blue-400">{currentStrategy.marketRegime}</span></span>
                </div>
              </div>
            )}
            
            {/* Time Horizon Slider */}
            <div className="mb-8">
              <label className="block text-white font-semibold mb-3">Time Horizon</label>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>1 Year</span>
                  <span className="text-[#22c55e] font-semibold">{timeHorizon} Years</span>
                  <span>30 Years</span>
                </div>
              </div>
            </div>

            {/* Initial Investment Input */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-3">Investment Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#22c55e] transition-colors"
                  placeholder="10,000"
                />
              </div>
            </div>

            {/* Final Value Projection */}
            {monteCarloResult && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Projected Final Value ({timeHorizon} years)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conservative (10th %ile):</span>
                    <span className="text-red-400 font-semibold">${monteCarloResult.finalValues.p10.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected (50th %ile):</span>
                    <span className="text-[#22c55e] font-semibold">${monteCarloResult.finalValues.p50.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Optimistic (90th %ile):</span>
                    <span className="text-green-300 font-semibold">${monteCarloResult.finalValues.p90.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Visualization Deck */}
          <div className="space-y-6">
            
            {/* Zone 1: Allocation Comparison */}
            <div className="bg-[#111111] border border-white/10 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation Comparison</h3>
              <div className="grid grid-cols-2 gap-6">
                
                {/* Base Allocation Chart */}
                <div className="text-center">
                  <h4 className="text-sm text-gray-400 mb-3">60/40 Baseline</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={baseAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {baseAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-gray-400 mt-2">
                    {baseAllocation.map((item, index) => (
                      <div key={index} className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span>{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Allocation Chart */}
                <div className="text-center">
                  <h4 className="text-sm text-gray-400 mb-3">Your Strategy</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={dynamicAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {dynamicAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-gray-400 mt-2">
                    {dynamicAllocation.map((item, index) => (
                      <div key={index} className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span>{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Zone 2: Projection Graph */}
            <div className="bg-[#111111] border border-white/10 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Monte Carlo Simulation - Cone of Possibility</h3>
              {currentStrategy && (
                <div className="mb-4 text-sm text-gray-400">
                  <p>Expected Return: <span className="text-[#22c55e] font-semibold">{(currentStrategy.stats.meanReturn * 100).toFixed(1)}%</span> | 
                     Volatility: <span className="text-yellow-400 font-semibold">{(currentStrategy.stats.volatility * 100).toFixed(1)}%</span> |
                     Sharpe Ratio: <span className="text-blue-400 font-semibold">{metrics.sharpeRatio}</span></p>
                </div>
              )}
              
              {isSimulating ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-4xl mb-4">⚡</div>
                    <p className="text-gray-400">Running Monte Carlo simulation...</p>
                    <p className="text-sm text-gray-500 mt-2">Analyzing 500 market scenarios</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                      label={{ value: 'Years', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number, name: string) => {
                        const labels: { [key: string]: string } = {
                          baseline: '60/40 Baseline',
                          projected: 'Your Strategy (Median)',
                          optimistic: '90th Percentile',
                          pessimistic: '10th Percentile'
                        };
                        return [`${value.toLocaleString()}`, labels[name] || name];
                      }}
                    />
                    
                    {/* Baseline (60/40) - Gray line */}
                    <Area
                      type="monotone"
                      dataKey="baseline"
                      stroke="#6B7280"
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    
                    {/* Cone of Possibility - Green shaded area */}
                    <Area
                      type="monotone"
                      dataKey="optimistic"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.1}
                      strokeWidth={1}
                    />
                    
                    <Area
                      type="monotone"
                      dataKey="pessimistic"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.1}
                      strokeWidth={1}
                    />
                    
                    {/* Your Strategy - Main green line */}
                    <Area
                      type="monotone"
                      dataKey="projected"
                      stroke="#10b981"
                      fill="transparent"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              
              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-gray-500 border-dashed"></div>
                  <span className="text-gray-400">60/40 Baseline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-[#10b981]"></div>
                  <span className="text-[#10b981]">Your Strategy (Median)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-2 bg-[#22c55e] opacity-20"></div>
                  <span className="text-[#22c55e]">10th-90th Percentile Range</span>
                </div>
              </div>
            </div>

            {/* Zone 3: Metrics Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#111111] border border-white/10 p-4 rounded-xl text-center">
                <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Typical Year</h4>
                <p className="text-lg font-bold text-[#22c55e]">{metrics.typicalYear}</p>
              </div>
              <div className="bg-[#111111] border border-white/10 p-4 rounded-xl text-center">
                <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Bad Year</h4>
                <p className="text-lg font-bold text-red-400">{metrics.badYear}</p>
              </div>
              <div className="bg-[#111111] border border-white/10 p-4 rounded-xl text-center">
                <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Vibe</h4>
                <p className="text-lg font-bold text-white">{metrics.vibe}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Sticky Action Button */}
        <div className="sticky bottom-6 z-10">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-4">
            <button 
              onClick={() => alert('Strategy activation coming soon!')}
              className="w-full py-4 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Activate This Strategy
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        }
      `}</style>
    </div>
  );
};

export default StrategySimulator;