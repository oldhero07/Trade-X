import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BuilderState, applyConstraints, getConstraintSummary } from '../engine/constraints';
import { calculateFullPortfolio, generateStrategyDNA, generateFailureMode, CalculationResult } from '../engine/calculator';

interface CustomBuilderProps {
  setActivePage?: (page: string) => void;
}

const CustomBuilder: React.FC<CustomBuilderProps> = ({ setActivePage }) => {
  // Builder state
  const [builderState, setBuilderState] = useState<BuilderState>({
    goal: 'Balance',
    risk: 50,
    factors: [],
    allocation: {
      stocks: 60,
      crypto: 0,
      bonds: 40
    }
  });

  // Calculation results
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Investment parameters
  const [initialInvestment] = useState(10000);
  const [timeHorizon] = useState(10);

  // Recalculate when state changes
  useEffect(() => {
    const calculatePortfolio = async () => {
      setIsCalculating(true);
      
      // Apply constraints first
      const constraintResult = applyConstraints(builderState);
      
      // Update state if constraints were applied
      if (JSON.stringify(constraintResult.allocation) !== JSON.stringify(builderState.allocation)) {
        setBuilderState(prev => ({
          ...prev,
          allocation: constraintResult.allocation
        }));
      }
      
      // Calculate portfolio with a small delay to show loading
      setTimeout(() => {
        try {
          const result = calculateFullPortfolio(builderState, initialInvestment, timeHorizon);
          setCalculationResult(result);
        } catch (error) {
          console.error('Calculation error:', error);
        }
        setIsCalculating(false);
      }, 300);
    };

    calculatePortfolio();
  }, [builderState, initialInvestment, timeHorizon]);

  // Handle goal selection
  const handleGoalSelect = (goal: 'Grow' | 'Balance' | 'Preserve') => {
    setBuilderState(prev => ({ ...prev, goal }));
  };

  // Handle factor toggle
  const handleFactorToggle = (factor: string) => {
    setBuilderState(prev => ({
      ...prev,
      factors: prev.factors.includes(factor)
        ? prev.factors.filter(f => f !== factor)
        : [...prev.factors, factor]
    }));
  };

  // Handle allocation change
  const handleAllocationChange = (type: 'stocks' | 'crypto' | 'bonds', value: number) => {
    setBuilderState(prev => ({
      ...prev,
      allocation: {
        ...prev.allocation,
        [type]: value
      }
    }));
  };

  // Handle risk change
  const handleRiskChange = (risk: number) => {
    setBuilderState(prev => ({ ...prev, risk }));
  };

  // Get projection data for chart
  const getProjectionData = () => {
    if (!calculationResult) return [];
    
    const data = [];
    for (let year = 0; year <= timeHorizon; year++) {
      const projected = calculationResult.monteCarloResult.percentiles.p50.find(p => p.year === year)?.value || 0;
      const optimistic = calculationResult.monteCarloResult.percentiles.p90.find(p => p.year === year)?.value || 0;
      const pessimistic = calculationResult.monteCarloResult.percentiles.p10.find(p => p.year === year)?.value || 0;
      
      data.push({
        year,
        projected,
        optimistic,
        pessimistic
      });
    }
    return data;
  };

  const projectionData = getProjectionData();
  const constraints = getConstraintSummary(builderState);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Custom Strategy Builder</h1>
          <p className="text-gray-400">Design your personalized investment strategy with live simulation</p>
        </div>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Panel - Builder (60% width = 3 columns) */}
          <div className="lg:col-span-3 space-y-8 max-h-screen overflow-y-auto">
            
            {/* Section 1: Goal Selection */}
            <div className="bg-[#111111] border border-white/10 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Investment Goal</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'Grow', label: 'Grow', icon: '🚀', desc: 'Maximize returns' },
                  { key: 'Balance', label: 'Balance', icon: '⚖️', desc: 'Steady growth' },
                  { key: 'Preserve', label: 'Preserve', icon: '🛡️', desc: 'Protect capital' }
                ].map((goal) => (
                  <button
                    key={goal.key}
                    onClick={() => handleGoalSelect(goal.key as any)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      builderState.goal === goal.key
                        ? 'border-[#22c55e] bg-[#22c55e]/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <div className="font-semibold text-white">{goal.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{goal.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Strategy Drivers */}
            <div className="bg-[#111111] border border-white/10 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Strategy Drivers</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'Momentum', label: 'Momentum', icon: '📈', desc: 'Trending assets' },
                  { key: 'Tech', label: 'Tech Focus', icon: '💻', desc: 'Technology sector' },
                  { key: 'Dividends', label: 'Dividends', icon: '💰', desc: 'Income generation' },
                  { key: 'Growth', label: 'Growth', icon: '🌱', desc: 'High growth potential' },
                  { key: 'Value', label: 'Value', icon: '💎', desc: 'Undervalued assets' },
                  { key: 'International', label: 'Global', icon: '🌍', desc: 'International exposure' }
                ].map((factor) => (
                  <button
                    key={factor.key}
                    onClick={() => handleFactorToggle(factor.key)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      builderState.factors.includes(factor.key)
                        ? 'border-[#22c55e] bg-[#22c55e]/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{factor.icon}</span>
                      <span className="font-semibold text-white text-sm">{factor.label}</span>
                    </div>
                    <div className="text-xs text-gray-400">{factor.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Asset Mix */}
            <div className="bg-[#111111] border border-white/10 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Asset Allocation</h2>
              
              {/* Risk Tolerance */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-3">Risk Tolerance: {builderState.risk}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={builderState.risk}
                  onChange={(e) => handleRiskChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>🛡️ Conservative</span>
                  <span>🚀 Aggressive</span>
                </div>
              </div>

              {/* Allocation Sliders */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Stocks: {builderState.allocation.stocks}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={builderState.allocation.stocks}
                    onChange={(e) => handleAllocationChange('stocks', Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Crypto: {builderState.allocation.crypto}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={builderState.allocation.crypto}
                    onChange={(e) => handleAllocationChange('crypto', Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Bonds: {builderState.allocation.bonds}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={builderState.allocation.bonds}
                    onChange={(e) => handleAllocationChange('bonds', Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              {/* Total Allocation Display */}
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Total Allocation:</div>
                <div className="text-lg font-semibold text-white">
                  {builderState.allocation.stocks + builderState.allocation.crypto + builderState.allocation.bonds}%
                </div>
                {(builderState.allocation.stocks + builderState.allocation.crypto + builderState.allocation.bonds) !== 100 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    ⚠️ Allocations will be normalized to 100%
                  </div>
                )}
              </div>
            </div>

            {/* Review & Activate Button */}
            <div className="bg-[#111111] border border-white/10 p-6 rounded-2xl">
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full py-4 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-lg rounded-xl transition-all duration-300"
              >
                Review & Activate Strategy
              </button>
            </div>
          </div>

          {/* Right Panel - Live Simulation (40% width = 2 columns) */}
          <div className="lg:col-span-2 sticky top-6 h-fit">
            <div className="bg-[#111111] border border-white/10 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Live Simulation</h2>
              
              {/* Loading State */}
              {isCalculating ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-4xl mb-4">⚡</div>
                    <p className="text-gray-400">Calculating portfolio...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chart */}
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={projectionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="year" 
                          stroke="#9CA3AF"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                        />
                        
                        {/* Cone of Possibility */}
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
                        
                        {/* Main projection line */}
                        <Area
                          type="monotone"
                          dataKey="projected"
                          stroke="#10b981"
                          fill="transparent"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stats Grid */}
                  {calculationResult && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-400 mb-1">Typical Year</div>
                        <div className="text-sm font-bold text-[#22c55e]">
                          {calculationResult.metrics.typicalYear}
                        </div>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-400 mb-1">Bad Year</div>
                        <div className="text-sm font-bold text-red-400">
                          {calculationResult.metrics.badYear}
                        </div>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-400 mb-1">Yield</div>
                        <div className="text-sm font-bold text-blue-400">
                          {calculationResult.metrics.yield}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Constraints */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-sm font-semibold text-white mb-2">Active Constraints</div>
                    <div className="space-y-1">
                      {constraints.map((constraint, index) => (
                        <div key={index} className="text-xs text-gray-400">
                          {constraint}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && calculationResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Strategy Review</h2>
              
              {/* Strategy DNA */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Strategy DNA</h3>
                <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg">
                  {generateStrategyDNA(builderState)}
                </p>
              </div>

              {/* Reality Check */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">The Reality Check</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#22c55e]">
                    <span>✅</span>
                    <span>Expected: {calculationResult.metrics.typicalYear} / year</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span>⚠️</span>
                    <span>
                      Worst Case: {calculationResult.metrics.badYear} 
                      (Are you okay with losing ${Math.abs(Math.round(initialInvestment * 0.25)).toLocaleString()} of your ${initialInvestment.toLocaleString()}?)
                    </span>
                  </div>
                </div>
              </div>

              {/* Failure Mode */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-3">Failure Mode</h3>
                <p className="text-gray-300 bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                  {generateFailureMode(builderState)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Back to Builder
                </button>
                <button
                  onClick={() => {
                    // Save strategy and redirect
                    localStorage.setItem('customStrategy', JSON.stringify({
                      builderState,
                      calculationResult,
                      timestamp: Date.now()
                    }));
                    alert('Strategy saved! Redirecting to dashboard...');
                    if (setActivePage) {
                      setActivePage('dashboard');
                    }
                  }}
                  className="flex-1 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold rounded-xl transition-colors"
                >
                  Activate Strategy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CustomBuilder;