export interface Strategy {
  id: string;
  title: string;
  description: string;
  category: 'Growth' | 'Income' | 'Stability';
  riskLevel: 'Low' | 'Medium' | 'High';
  allocation: {
    stocks: number;
    bonds?: number;
    crypto?: number;
  };
  expectedReturn: string;
  timeHorizon: string;
}

export const STRATEGIES: Strategy[] = [
  {
    id: 'tech-titans',
    title: 'Tech Titans',
    description: 'High-growth technology stocks with cryptocurrency exposure for maximum growth potential. Perfect for aggressive investors seeking substantial returns.',
    category: 'Growth',
    riskLevel: 'High',
    allocation: {
      stocks: 80,
      crypto: 20
    },
    expectedReturn: '12-18% annually',
    timeHorizon: '5+ years'
  },
  {
    id: 'dividend-kings',
    title: 'Dividend Kings',
    description: 'Established dividend-paying companies combined with stable bonds for consistent income generation. Ideal for retirement planning.',
    category: 'Income',
    riskLevel: 'Low',
    allocation: {
      stocks: 60,
      bonds: 40
    },
    expectedReturn: '6-9% annually',
    timeHorizon: '3+ years'
  },
  {
    id: 'balanced-core',
    title: 'Balanced Core',
    description: 'Equal mix of growth stocks and stable bonds providing moderate growth with reduced volatility. Great for first-time investors.',
    category: 'Stability',
    riskLevel: 'Medium',
    allocation: {
      stocks: 50,
      bonds: 50
    },
    expectedReturn: '8-12% annually',
    timeHorizon: '3-7 years'
  }
];