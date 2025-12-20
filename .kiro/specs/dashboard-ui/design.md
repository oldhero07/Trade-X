# Design Document: Home Dashboard UI

## Overview

This design outlines the creation of a comprehensive Dashboard UI component that serves as the main landing page for TradeX. The dashboard will feature a three-zone layout with personalized greetings, real-time market data, smart stock picks, and integrated watchlist functionality, all styled with a consistent dark theme and neon green accents.

## Architecture

The Dashboard follows a modular component architecture:

```
Dashboard (Container Component)
├── Zone 1: DashboardHeader
│   ├── PersonalizedGreeting
│   └── MarketPulseBadge
├── Zone 2: SmartPicksSection
│   ├── StockCard (RELIANCE - with "Top Pick" tag)
│   ├── StockCard (NVDA)
│   └── StockCard (BTC-USD)
└── Zone 3: WatchlistPreview
    └── Watchlist (existing component)
```

## Components and Interfaces

### Dashboard Container Component

**File Structure:**
```
src/components/dashboard/
├── Dashboard.tsx          (Main Container)
├── DashboardHeader.tsx    (Zone 1: Greeting + Market Pulse)
├── SmartPicksSection.tsx  (Zone 2: The 3 Cards)
├── StockCard.tsx          (Individual stock card)
└── styles.ts              (Shared Tailwind classes)
```

**State Management:**
```typescript
interface DashboardState {
  marketStatus: MarketStatus | null;
  smartPicks: StockQuote[];
  loading: boolean;
  error: string | null;
}

interface MarketStatus {
  status: 'Bullish' | 'Bearish';
  niftyPrice: number;
  change: number;
  changePercent: number;
}

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change?: number;
  changePercent?: number;
}
```

### Zone 1: Dashboard Header

**Components:**
- **PersonalizedGreeting**: "Good Morning, Alex" (white, bold)
- **MarketPulseBadge**: Dynamic badge based on market status

**Market Badge Logic:**
```typescript
const getMarketBadge = (status: string) => {
  if (status === 'Bullish') {
    return {
      text: 'Market is Up 🚀',
      className: 'bg-green-500 text-white'
    };
  }
  return {
    text: 'Market is Down 📉',
    className: 'bg-red-500 text-white'
  };
};
```

### Zone 2: Smart Picks Section

**Layout:** 3 cards in horizontal row (responsive grid)
**Data Source:** `getQuote()` calls for ['RELIANCE', 'NVDA', 'BTC-USD']

**StockCard Component:**
```typescript
interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  changePercent?: number;
  isTopPick?: boolean;
}
```

**Card Styling:**
- Background: #111111 (dark gray)
- Border: Subtle white border
- Content: Ticker name, large white price, colored change pill
- Special: "Top Pick" tag for RELIANCE card

### Zone 3: Watchlist Preview

**Integration:** Import existing Watchlist component
**Positioning:** Bottom section of dashboard
**Styling:** Maintain existing functionality with dashboard theme integration

## Data Models

### API Integration

**Market Status Fetch:**
```typescript
const fetchMarketStatus = async (): Promise<MarketStatus> => {
  const response = await api.get('/api/market-status');
  return response.data;
};
```

**Smart Picks Fetch:**
```typescript
const fetchSmartPicks = async (): Promise<StockQuote[]> => {
  const tickers = ['RELIANCE', 'NVDA', 'BTC-USD'];
  const promises = tickers.map(ticker => api.get(`/api/quote/${ticker}`));
  const responses = await Promise.all(promises);
  return responses.map(response => response.data);
};
```

## Layout Design

### Responsive Grid System

**Large Screens (lg+):**
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto 1fr;
  gap: 2rem;
}

.header { grid-column: 1 / -1; }
.smart-picks { grid-column: 1 / -1; }
.watchlist { grid-column: 1 / -1; }
```

**Mobile/Tablet:**
```css
.dashboard-grid-mobile {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
```

### Zone Specifications

**Zone 1 (Header):**
- Height: Auto (content-based)
- Layout: Flex row with space-between
- Alignment: Items center

**Zone 2 (Smart Picks):**
- Layout: Grid with 3 equal columns
- Gap: 1.5rem between cards
- Mobile: Single column stack

**Zone 3 (Watchlist):**
- Height: Flexible (remaining space)
- Integration: Full-width component

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, the following properties have been identified and refined to eliminate redundancy:

- Most criteria are specific examples that test exact UI elements and API calls
- Properties 2.4 and 2.6 represent universal behaviors that apply across multiple data inputs

### Core Properties

**Property 1: Stock card content completeness**
*For any* stock card rendered in the smart picks section, the card should display ticker name, price text, and a change pill element.
**Validates: Requirements 2.4**

**Property 2: Change pill color coding**
*For any* change percentage value displayed in a pill, positive values should render with green styling and negative values should render with red styling.
**Validates: Requirements 2.6**

## Error Handling

The dashboard will implement comprehensive error handling:

1. **API Failures**: Graceful degradation when market data or stock quotes fail to load
2. **Network Issues**: Display loading states and retry mechanisms
3. **Invalid Data**: Handle cases where API returns unexpected or incomplete data
4. **Component Errors**: Use error boundaries to prevent dashboard crashes

**Error States:**
```typescript
interface ErrorState {
  marketStatus: string | null;
  smartPicks: string | null;
  watchlist: string | null;
}

// Example error displays
const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
    <p className="text-red-400 text-sm">{error}</p>
  </div>
);
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific UI elements and interactions:

- Test personalized greeting displays correctly
- Test market badge shows correct text and colors for Bullish/Bearish states
- Test 3 stock cards render with correct data
- Test "Top Pick" tag appears on RELIANCE card
- Test API service calls are made with correct parameters
- Test Watchlist component integration

### Property-Based Testing

Property-based tests will verify universal UI behaviors using **@testing-library/react**:

- **Minimum 50 iterations per property test** for UI components
- Each property test will be tagged with: `**Feature: dashboard-ui, Property {number}: {property_text}**`

Property test implementations:

1. **Property 1 Test**: Generate random stock data, verify all cards have required content elements
2. **Property 2 Test**: Generate random change percentages, verify color coding is correct

### Integration Testing

- Test complete dashboard data flow from API to UI
- Test responsive layout behavior at different screen sizes
- Test error handling and loading states
- Test Watchlist component functionality within dashboard context

## Styling Implementation

### Tailwind CSS Classes

**Dashboard Container:**
```css
.dashboard-container {
  @apply min-h-screen bg-gray-900 text-white p-6;
}

.dashboard-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto;
}
```

**Zone 1 - Header:**
```css
.dashboard-header {
  @apply col-span-full flex justify-between items-center mb-8;
}

.greeting {
  @apply text-3xl font-bold text-white;
}

.market-badge {
  @apply px-4 py-2 rounded-full font-semibold flex items-center gap-2;
}

.market-badge.bullish {
  @apply bg-green-500 text-white;
}

.market-badge.bearish {
  @apply bg-red-500 text-white;
}
```

**Zone 2 - Smart Picks:**
```css
.smart-picks-section {
  @apply col-span-full mb-8;
}

.smart-picks-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.stock-card {
  @apply bg-gray-800 border border-gray-700 rounded-xl p-6 relative;
  background-color: #111111;
}

.top-pick-tag {
  @apply absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full;
}

.stock-price {
  @apply text-2xl font-bold text-white mb-2;
}

.change-pill {
  @apply px-3 py-1 rounded-full text-sm font-medium;
}

.change-pill.positive {
  @apply bg-green-500 text-white;
}

.change-pill.negative {
  @apply bg-red-500 text-white;
}
```

**Zone 3 - Watchlist:**
```css
.watchlist-section {
  @apply col-span-full;
}
```

## Performance Considerations

- **Memoization**: Use React.memo for StockCard components to prevent unnecessary re-renders
- **Data Fetching**: Implement concurrent API calls for market status and smart picks
- **Loading States**: Show skeleton loaders while data is being fetched
- **Error Boundaries**: Isolate component failures to prevent full dashboard crashes
- **Lazy Loading**: Consider lazy loading the Watchlist component if it becomes heavy

## Accessibility Considerations

- **Semantic HTML**: Use proper heading hierarchy (h1, h2, h3)
- **ARIA Labels**: Add labels for market status badges and change indicators
- **Color Contrast**: Ensure sufficient contrast for all text elements
- **Keyboard Navigation**: Support tab navigation through interactive elements
- **Screen Readers**: Provide meaningful text alternatives for emoji and visual indicators

## Implementation Notes

### Data Flow

1. **Component Mount**: useEffect triggers concurrent API calls
2. **Market Status**: Fetch from `/api/market-status` endpoint
3. **Smart Picks**: Fetch quotes for RELIANCE, NVDA, BTC-USD
4. **State Updates**: Update component state with fetched data
5. **UI Render**: Render zones with live data

### API Integration

```typescript
// Dashboard data fetching
useEffect(() => {
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [marketStatus, smartPicksData] = await Promise.all([
        api.getMarketStatus(),
        Promise.all([
          api.getQuote('RELIANCE'),
          api.getQuote('NVDA'),
          api.getQuote('BTC-USD')
        ])
      ]);
      
      setMarketStatus(marketStatus);
      setSmartPicks(smartPicksData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, []);
```

### Component Organization

```typescript
// Main Dashboard component structure
const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <DashboardHeader 
          marketStatus={marketStatus}
          loading={loading}
        />
        <SmartPicksSection 
          stocks={smartPicks}
          loading={loading}
        />
        <div className="watchlist-section">
          <Watchlist />
        </div>
      </div>
    </div>
  );
};
```