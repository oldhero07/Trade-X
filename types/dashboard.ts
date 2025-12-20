// Dashboard-specific TypeScript interfaces

export interface PortfolioData {
  totalNetWorth: number;
  todaysPnL: number;
  todaysPnLPercentage: number;
  holdings: Holding[];
  valueHistory: ValuePoint[];
  allocation: AllocationData;
}

export interface Holding {
  ticker: string;
  name: string;
  avgBuyPrice: number;
  currentPrice: number;
  quantity: number;
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  sector?: string;
  assetType: 'stock' | 'crypto' | 'cash';
}

export interface ValuePoint {
  date: string;
  value: number;
  timestamp: number;
}

export interface AllocationData {
  stocks: {
    value: number;
    percentage: number;
  };
  crypto: {
    value: number;
    percentage: number;
  };
  cash: {
    value: number;
    percentage: number;
  };
}

// Market Analysis interfaces
export interface MarketData {
  sectors: SectorPerformance[];
  topGainers: MarketMover[];
  topLosers: MarketMover[];
  news: NewsItem[];
}

export interface SectorPerformance {
  name: string;
  change: number;
  changePercentage: number;
  color: 'green' | 'red' | 'neutral';
  marketCap?: number;
}

export interface MarketMover {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercentage: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  summary?: string;
  timestamp: number;
  source: string;
  url?: string;
}

// Settings interfaces
export interface UserSettings {
  profile: UserProfile;
  preferences: UserPreferences;
  subscription: SubscriptionInfo;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
}

export interface UserPreferences {
  darkMode: boolean;
  realTimeUpdates: boolean;
  defaultCurrency: 'INR' | 'USD';
  language: string;
  timezone: string;
}

export interface SubscriptionInfo {
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  status: 'active' | 'inactive' | 'cancelled';
  expiryDate?: string;
  features: string[];
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  priceAlerts: boolean;
  portfolioUpdates: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  activeSessions: number;
}

// Chart-specific interfaces
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface HeatmapCell {
  id: string;
  name: string;
  value: number;
  color: string;
  row: number;
  col: number;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface ComponentState<T> extends LoadingState {
  data: T | null;
}