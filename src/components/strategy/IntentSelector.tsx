import React from 'react';

export type Intent = 'Growth' | 'Income' | 'Stability' | null;

interface IntentSelectorProps {
  selectedIntent: Intent;
  onIntentSelect: (intent: Intent) => void;
}

interface IntentOption {
  id: Intent;
  title: string;
  emoji: string;
  description: string;
  color: string;
}

const intentOptions: IntentOption[] = [
  {
    id: 'Growth',
    title: 'Growth',
    emoji: '🚀',
    description: 'Maximize returns with high-growth investments',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'Income',
    title: 'Income',
    emoji: '💰',
    description: 'Generate steady income through dividends',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'Stability',
    title: 'Stability',
    emoji: '🛡️',
    description: 'Balance growth and security for peace of mind',
    color: 'from-orange-500 to-red-600'
  }
];

const IntentSelector: React.FC<IntentSelectorProps> = ({ selectedIntent, onIntentSelect }) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">What's your investment goal?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {intentOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onIntentSelect(option.id)}
            className={`
              relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105
              ${selectedIntent === option.id 
                ? 'border-[#22c55e] bg-[#22c55e]/10 shadow-lg shadow-[#22c55e]/20' 
                : 'border-white/20 bg-[#111111] hover:border-[#22c55e]/50'
              }
            `}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{option.emoji}</div>
              <h3 className="text-xl font-bold text-white mb-2">{option.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{option.description}</p>
            </div>
            
            {selectedIntent === option.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-[#22c55e] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IntentSelector;