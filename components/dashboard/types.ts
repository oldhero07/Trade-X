// Dashboard-specific TypeScript interfaces

export interface MarketStatus {
  status: 'Bullish' | 'Bearish';
  niftyPrice: number;
  change: number;
  changePercent: number;
  error?: boolean;
  message?: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change?: number;
  changePercent?: number;
  error?: boolean;
  message?: string;
}

export interface DashboardState {
  marketStatus: MarketStatus | null;
  smartPicks: StockQuote[];
  loading: boolean;
  error: string | null;
}

export interface DashboardHeaderProps {
  marketStatus: MarketStatus | null;
  loading: boolean;
}

export interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  changePercent?: number;
  isTopPick?: boolean;
}

export interface SmartPicksSectionProps {
  stocks: StockQuote[];
  loading: boolean;
}