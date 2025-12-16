export type Page = 'dashboard' | 'strategy-builder' | 'strategy-simulator' | 'market-analysis' | 'portfolio' | 'watchlist' | 'settings';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  trend: number[]; // Array of numbers for simple sparkline
}

export interface PortfolioItem extends Stock {
  quantity: number;
  avgCost: number;
}

export interface Strategy {
  id: string;
  title: string;
  subtitle: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  assetMix: { name: string; percent: number; color: string }[];
  description: string;
  trending?: boolean;
  isNew?: boolean;
}

export interface Notification {
  id: string;
  type: 'alert' | 'news' | 'strategy';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}