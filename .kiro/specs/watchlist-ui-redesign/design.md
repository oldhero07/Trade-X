# Design Document: Watchlist UI Redesign

## Overview

This design outlines the complete redesign of the Watchlist UI component to implement a clean, dark-themed table layout with improved visual hierarchy and user experience. The component will feature a consistent dark color scheme, organized table structure, and intuitive visual indicators for stock performance.

## Architecture

The redesigned Watchlist component will follow a clean, structured layout:

```
WatchlistCard
├── Header Section
│   ├── Title: "Your Watchlist" (white text)
│   └── Add Stock Button (top-right corner)
├── Table Layout
│   ├── Headers: Ticker | Name | Price | Change
│   └── Stock Rows with consistent styling
└── Change Pills (green/red indicators)
```

## Components and Interfaces

### WatchlistCard Component

**Styling:**
- Background: #111111 (dark gray)
- Border: Subtle white border
- Padding: Consistent spacing for readability
- Border radius: Rounded corners for modern appearance

**Layout Structure:**

1. **Header Section**
   - Title: "Your Watchlist" in white text
   - Add Stock button positioned in top-right corner
   - Flexbox layout for proper alignment

2. **Table Layout**
   - Four columns: Ticker, Name, Price, Change
   - Consistent column widths and alignment
   - Header row with clear labels
   - Data rows with proper spacing

3. **Change Pills**
   - Pill-shaped indicators for change values
   - Green background for positive changes
   - Red background for negative changes
   - Rounded corners (border-radius)
   - Centered text with appropriate padding

## Data Models

### Stock Data Interface
```typescript
interface StockData {
  ticker: string;        // Stock symbol (e.g., "AAPL")
  name: string;          // Company name (e.g., "Apple Inc.")
  price: number;         // Current stock price
  change: number;        // Price change (positive or negative)
  changePercent: number; // Percentage change
}
```

### Watchlist Props Interface
```typescript
interface WatchlistProps {
  stocks: StockData[];
  onAddStock?: () => void;
  className?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, the following properties have been identified and refined to eliminate redundancy:

- Properties 3.1 and 3.2 can be combined into a comprehensive change indicator color property
- Properties 3.4 covers sign display which is related to change formatting

### Core Properties

**Property 1: Change indicator color coding**
*For any* stock data with a change value, when the change is positive, the system should render a green indicator, and when the change is negative, the system should render a red indicator.
**Validates: Requirements 3.1, 3.2**

**Property 2: Change value sign display**
*For any* stock change value, the displayed text should include a positive (+) sign for positive values and a negative (-) sign for negative values.
**Validates: Requirements 3.4**

## Error Handling

The component will implement robust error handling:

1. **Missing Data**: Handle cases where stock data is incomplete or missing
2. **Invalid Props**: Validate props and provide fallback displays
3. **Rendering Errors**: Use error boundaries to prevent component crashes
4. **Empty States**: Display appropriate messages when no stocks are available

Error Display Patterns:
```typescript
// Missing price data
{ ticker: "AAPL", name: "Apple Inc.", price: null, change: null }
// Display: "Price unavailable"

// Empty watchlist
stocks: []
// Display: "No stocks in your watchlist"
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific UI elements and interactions:

- Test component renders with correct background color (#111111)
- Test "Your Watchlist" title displays in white text
- Test table structure with correct column headers
- Test "Add Stock" button renders in top-right position
- Test button click handler functionality
- Test pill styling with rounded corners

### Property-Based Testing

Property-based tests will verify universal UI behaviors using **@testing-library/react** and **jest**:

- **Minimum 50 iterations per property test** for UI components
- Each property test will be tagged with: `**Feature: watchlist-ui-redesign, Property {number}: {property_text}**`

Property test implementations:

1. **Property 1 Test**: Generate random stock data with various change values, verify color coding
2. **Property 2 Test**: Generate random change values, verify sign display

### Test Organization

- Component tests: `components/__tests__/Watchlist.test.tsx`
- Property tests: `components/__tests__/Watchlist.properties.test.tsx`
- Test utilities: `components/__tests__/helpers/mockData.ts`

## Styling Implementation

### CSS Classes and Styling

```css
/* Main container */
.watchlist-container {
  background-color: #111111;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
}

/* Title styling */
.watchlist-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
}

/* Table styling */
.watchlist-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-align: left;
  padding: 12px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.table-row {
  color: white;
  padding: 12px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Change pill styling */
.change-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.change-pill.positive {
  background-color: #10b981;
  color: white;
}

.change-pill.negative {
  background-color: #ef4444;
  color: white;
}

/* Add button styling */
.add-stock-button {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-stock-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}
```

## Implementation Notes

### Component Structure

```typescript
const Watchlist: React.FC<WatchlistProps> = ({ stocks, onAddStock }) => {
  return (
    <div className="watchlist-container">
      <div className="header-section">
        <h2 className="watchlist-title">Your Watchlist</h2>
        <button className="add-stock-button" onClick={onAddStock}>
          Add Stock
        </button>
      </div>
      
      <table className="watchlist-table">
        <thead>
          <tr>
            <th className="table-header">Ticker</th>
            <th className="table-header">Name</th>
            <th className="table-header">Price</th>
            <th className="table-header">Change</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map(stock => (
            <WatchlistRow key={stock.ticker} stock={stock} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Responsive Design

- Mobile: Stack table columns vertically on small screens
- Tablet: Maintain table layout with adjusted column widths
- Desktop: Full table layout with optimal spacing

## Accessibility Considerations

- Proper color contrast ratios for text readability
- Semantic HTML structure with table elements
- ARIA labels for interactive elements
- Keyboard navigation support for the Add Stock button
- Screen reader friendly change indicators

## Performance Considerations

- Memoize component to prevent unnecessary re-renders
- Use React.memo for individual stock rows
- Optimize change pill rendering with CSS-in-JS or styled-components
- Consider virtualization for large watchlists (future enhancement)