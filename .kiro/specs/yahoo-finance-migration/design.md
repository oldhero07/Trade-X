# Design Document: Yahoo Finance Migration

## Overview

This design outlines the complete migration of the TradeX market data service from Alpha Vantage and Finnhub APIs to the yahoo-finance2 library. The migration will consolidate all market data operations under a single provider while maintaining support for both US and Indian stock markets with enhanced functionality.

## Architecture

The refactored MarketDataService will follow a simplified architecture:

```
MarketDataService
├── yahoo-finance2 (single dependency)
├── getQuote() - Universal quote fetching with auto-detection
├── getMarketStatus() - Indian market sentiment analysis
└── Error Handling - Graceful fallbacks and logging
```

The service will eliminate the need for API keys and external HTTP requests by leveraging yahoo-finance2's built-in capabilities.

## Components and Interfaces

### MarketDataService Class

**Constructor:**
- Remove Alpha Vantage and Finnhub API key initialization
- Initialize yahoo-finance2 library (no configuration required)

**Core Methods:**

1. **getQuote(ticker: string)**
   - Input: Stock ticker symbol (e.g., "RELIANCE", "AAPL")
   - Output: `{ symbol: string, name: string, price: number, currency: string }`
   - Logic: Auto-detect Indian stocks and append .NS suffix

2. **getMarketStatus()**
   - Input: None
   - Output: `{ status: "Bullish" | "Bearish", niftyPrice: number, change: number }`
   - Logic: Query ^NSEI index and compare current vs previous close

### Indian Stock Detection Logic

The service will identify Indian stocks using a predefined list of common NSE tickers:
- Major stocks: RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, etc.
- Auto-append .NS suffix for Yahoo Finance compatibility
- Return original symbol (without .NS) in response

## Data Models

### Quote Response Object
```typescript
interface QuoteResponse {
  symbol: string;        // Original ticker (e.g., "RELIANCE")
  name: string;          // Company name
  price: number;         // Current price
  currency: string;      // Currency symbol (₹, $)
}
```

### Market Status Response Object
```typescript
interface MarketStatusResponse {
  status: "Bullish" | "Bearish";
  niftyPrice: number;
  change: number;
  changePercent: number;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, the following properties have been identified and refined to eliminate redundancy:

- Properties 2.1, 2.3, and 2.5 all relate to symbol handling and can be combined into a comprehensive symbol transformation property
- Properties 3.3 and 3.4 are specific examples of property 3.2 and can be consolidated
- Properties 2.2 and 4.4 both verify response structure and can be combined

### Core Properties

**Property 1: Indian stock symbol transformation**
*For any* Indian stock ticker symbol, when passed to getQuote, the system should query Yahoo Finance with the .NS suffix appended, but return the original symbol (without .NS) in the response object.
**Validates: Requirements 2.1, 2.3, 2.5**

**Property 2: Quote response structure completeness**
*For any* valid ticker symbol, the getQuote function should return an object containing all required fields: symbol, name, price, and currency.
**Validates: Requirements 2.2, 4.4**

**Property 3: Error handling resilience**
*For any* invalid or malformed ticker symbol, the getQuote function should handle errors gracefully without throwing unhandled exceptions and return appropriate error information.
**Validates: Requirements 2.4**

**Property 4: Market status determination**
*For any* Nifty 50 price data, when current price is compared to previous close, the market status should be "Bullish" if current > previous, and "Bearish" otherwise.
**Validates: Requirements 3.2, 3.3, 3.4**

**Property 5: Market status error handling**
*For any* error condition when fetching Nifty 50 data, the getMarketStatus function should handle errors gracefully without throwing unhandled exceptions.
**Validates: Requirements 3.5**

## Error Handling

The refactored service will implement comprehensive error handling:

1. **Network Errors**: Catch and log connection failures, return structured error objects
2. **Invalid Symbols**: Validate ticker format before querying, return meaningful error messages
3. **Rate Limiting**: Leverage yahoo-finance2's built-in rate limiting (no additional implementation needed)
4. **Data Parsing Errors**: Handle cases where Yahoo Finance returns unexpected data structures
5. **Graceful Degradation**: Return error objects instead of throwing exceptions to prevent service crashes

Error Response Format:
```javascript
{
  error: true,
  message: "Description of error",
  symbol: "TICKER",
  timestamp: Date
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and integration points:

- Test getQuote with known Indian stock symbols (RELIANCE, TCS, INFY)
- Test getQuote with known US stock symbols (AAPL, MSFT, GOOGL)
- Test getMarketStatus returns expected structure
- Test error handling with invalid symbols
- Test service initialization without API keys

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using **fast-check** (JavaScript property testing library):

- **Minimum 100 iterations per property test** to ensure comprehensive coverage
- Each property test will be tagged with: `**Feature: yahoo-finance-migration, Property {number}: {property_text}**`
- Each correctness property will be implemented by a SINGLE property-based test

Property test implementations:

1. **Property 1 Test**: Generate random Indian stock symbols, verify .NS handling
2. **Property 2 Test**: Generate random valid ticker symbols, verify response structure
3. **Property 3 Test**: Generate invalid/malformed symbols, verify error handling
4. **Property 4 Test**: Generate random price scenarios, verify market status logic
5. **Property 5 Test**: Simulate error conditions, verify graceful handling

### Test Organization

- Unit tests: `backend/services/__tests__/marketDataService.test.js`
- Property tests: `backend/services/__tests__/marketDataService.properties.test.js`
- Test utilities: `backend/services/__tests__/helpers/generators.js` (for property test data generation)

## Implementation Notes

### Indian Stock Detection

The service will maintain a list of common Indian stock symbols:
```javascript
const INDIAN_STOCKS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 
  'BHARTIARTL', 'ITC', 'SBIN', 'LT', 'HCLTECH',
  'WIPRO', 'MARUTI', 'ASIANPAINT', 'NESTLEIND', 'ULTRACEMCO',
  // ... additional stocks
];
```

### yahoo-finance2 API Usage

Key methods from yahoo-finance2:
- `yahooFinance.quote(symbol)` - Fetch real-time quote data
- `yahooFinance.quoteSummary(symbol)` - Fetch detailed company information
- Built-in error handling and retry logic

### Migration Path

1. Install yahoo-finance2 dependency
2. Rewrite getQuote() function
3. Implement getMarketStatus() function
4. Remove Alpha Vantage and Finnhub code
5. Update error handling
6. Write and run tests
7. Verify all existing functionality works

## Performance Considerations

- yahoo-finance2 has no rate limiting for basic quote operations (unlike Alpha Vantage free tier)
- Responses are typically faster due to direct Yahoo Finance API access
- No API key management overhead
- Consider implementing caching for frequently requested symbols (future enhancement)

## Security Considerations

- No API keys to manage or expose
- No sensitive credentials in environment variables
- yahoo-finance2 uses HTTPS by default
- Input validation to prevent injection attacks through ticker symbols
