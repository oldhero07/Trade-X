import React, { useState, useEffect } from 'react';
import IntentSelector, { Intent } from './IntentSelector';
import StrategyCard from './StrategyCard';
import { STRATEGIES, Strategy } from '../../data/strategies';
import { generateStrategy, getStandard6040Portfolio, StrategyDNA, UserIntent } from '../../engine/builder';

interface StrategyBuilderProps {
  setActivePage?: (page: string) => void;
}

const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ setActivePage }) => {
  const [selectedIntent, setSelectedIntent] = useState<Intent>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedStrategies, setGeneratedStrategies] = useState<StrategyDNA[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate dynamic strategies when intent changes
  useEffect(() => {
    if (selectedIntent) {
      setIsGenerating(true);
      
      // Generate 3 strategies with different risk levels for the selected intent
      const strategies: StrategyDNA[] = [];
      const riskLevels = [25, 50, 75]; // Low, Medium, High risk
      
      riskLevels.forEach(riskScore => {
        const strategy = generateStrategy(selectedIntent as UserIntent, riskScore);
        strategies.push(strategy);
      });
      
      // Add standard 60/40 for comparison if Stability is selected
      if (selectedIntent === 'Stability') {
        strategies.push(getStandard6040Portfolio());
      }
      
      setGeneratedStrategies(strategies);
      setIsGenerating(false);
    } else {
      // Show static strategies when no intent is selected
      setGeneratedStrategies([]);
    }
  }, [selectedIntent]);

  // Convert StrategyDNA to Strategy format for compatibility
  const convertToLegacyFormat = (strategyDNA: StrategyDNA): Strategy => ({
    id: strategyDNA.id,
    title: strategyDNA.name,
    description: strategyDNA.narrative,
    category: strategyDNA.intent,
    riskLevel: strategyDNA.riskScore < 40 ? 'Low' : strategyDNA.riskScore > 60 ? 'High' : 'Medium',
    expectedReturn: `${(strategyDNA.stats.meanReturn * 100).toFixed(1)}%`,
    allocation: `${strategyDNA.allocation.stocks}% Stocks, ${strategyDNA.allocation.bonds}% Bonds${strategyDNA.allocation.crypto > 0 ? `, ${strategyDNA.allocation.crypto}% Crypto` : ''}`,
    riskEmojis: strategyDNA.riskScore < 40 ? '🔥' : strategyDNA.riskScore > 60 ? '🔥🔥🔥' : '🔥🔥'
  });

  // Determine which strategies to show
  const strategiesToShow = selectedIntent && generatedStrategies.length > 0 
    ? generatedStrategies.map(convertToLegacyFormat)
    : STRATEGIES;

  // Filter strategies based on search term
  const filteredStrategies = strategiesToShow.filter(strategy => {
    // Enhanced search: check title, description, category, and risk level
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      strategy.title.toLowerCase().includes(searchLower) ||
      strategy.description.toLowerCase().includes(searchLower) ||
      strategy.category.toLowerCase().includes(searchLower) ||
      strategy.riskLevel.toLowerCase().includes(searchLower) ||
      strategy.expectedReturn.toLowerCase().includes(searchLower);
    
    return matchesSearch;
  });

  const handleIntentSelect = (intent: Intent) => {
    setSelectedIntent(intent);
  };

  const handleSimulateStrategy = (strategy: Strategy) => {
    console.log('Navigating to simulator with strategy:', strategy);
    
    // Find the original StrategyDNA if it's a generated strategy
    const originalStrategy = generatedStrategies.find(s => s.id === strategy.id);
    
    if (setActivePage) {
      // Store both formats for the simulator to access
      localStorage.setItem('selectedStrategy', JSON.stringify(strategy));
      if (originalStrategy) {
        localStorage.setItem('selectedStrategyDNA', JSON.stringify(originalStrategy));
      }
      setActivePage('strategy-simulator');
    } else {
      // Fallback alert if navigation isn't available
      alert(`Simulating ${strategy.title} strategy!\n\nStrategy ID: ${strategy.id}\nThis will open the simulation interface.`);
    }
  };

  const handleClearFilter = () => {
    setSelectedIntent(null);
  };

  const handleCustomStrategy = () => {
    if (setActivePage) {
      setActivePage('custom-builder');
    } else {
      alert("Custom AI Builder coming soon!");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Investment Path
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover personalized investment strategies tailored to your goals and risk tolerance. 
            Start building your financial future today.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search strategy templates (e.g., Tech, Growth, Dividend)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-[#111111] border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#22c55e] transition-colors"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Try searching: "Tech", "Growth", "Dividend", "High Risk", "Stable", "Crypto"
            </p>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-6 text-center">
            <p className="text-gray-400 text-sm">
              {filteredStrategies.length === 0 
                ? `No results for "${searchTerm}"`
                : `Found ${filteredStrategies.length} strateg${filteredStrategies.length === 1 ? 'y' : 'ies'} matching "${searchTerm}"`
              }
            </p>
          </div>
        )}

        {/* Zone 1: Intent Selector */}
        <IntentSelector 
          selectedIntent={selectedIntent}
          onIntentSelect={handleIntentSelect}
        />

        {/* Filter Status & Clear Button */}
        {(selectedIntent || searchTerm) && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-400">Filters:</span>
              {selectedIntent && (
                <span className="px-3 py-1 bg-[#22c55e] text-black font-semibold rounded-full text-sm">
                  {selectedIntent}
                </span>
              )}
              {searchTerm && (
                <span className="px-3 py-1 bg-blue-500 text-white font-semibold rounded-full text-sm">
                  "{searchTerm}"
                </span>
              )}
            </div>
            <button
              onClick={() => {
                handleClearFilter();
                setSearchTerm('');
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Zone 2: Strategy Cards Grid */}
        {isGenerating ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Generating AI Strategies...</h3>
            <p className="text-gray-400">Creating personalized {selectedIntent} strategies based on current market conditions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStrategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onSimulate={handleSimulateStrategy}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isGenerating && filteredStrategies.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No strategies found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm && selectedIntent 
                ? `No strategies match "${searchTerm}" in the ${selectedIntent} category.`
                : searchTerm 
                ? `No strategies match "${searchTerm}". Try searching for "Tech", "Growth", or "Dividend".`
                : selectedIntent
                ? `No ${selectedIntent} strategies available.`
                : "Select an investment intent above to see AI-generated strategies, or browse our template collection."
              }
            </p>
            {(searchTerm || selectedIntent) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedIntent(null);
                }}
                className="px-4 py-2 bg-[#22c55e] text-black font-semibold rounded-lg hover:bg-[#16a34a] transition-colors"
              >
                Show All Strategies
              </button>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Need a Custom Strategy?</h3>
            <p className="text-gray-400 mb-6">
              Our AI-powered strategy builder can create a personalized investment plan 
              based on your specific financial situation and goals.
            </p>
            <button 
              onClick={handleCustomStrategy}
              className="px-8 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold rounded-xl transition-colors"
            >
              Build Custom Strategy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyBuilder;