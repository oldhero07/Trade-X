# Implementation Plan

- [x] 1. Install yahoo-finance2 dependency and remove old dependencies


  - Add yahoo-finance2 to backend/package.json dependencies
  - Remove any Alpha Vantage or Finnhub related packages if present
  - Run npm install to update dependencies
  - _Requirements: 1.1, 1.3_



- [ ] 2. Implement core MarketDataService refactoring
- [ ] 2.1 Create Indian stock detection utility
  - Define INDIAN_STOCKS constant array with common NSE tickers
  - Implement isIndianStock() helper function
  - _Requirements: 2.1_

- [x]* 2.2 Write property test for Indian stock symbol transformation


  - **Property 1: Indian stock symbol transformation**
  - **Validates: Requirements 2.1, 2.3, 2.5**

- [ ] 2.3 Implement new getQuote function using yahoo-finance2
  - Replace Alpha Vantage/Finnhub logic with yahoo-finance2.quote()
  - Add Indian stock detection and .NS suffix logic
  - Return standardized response object with symbol, name, price, currency
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [ ]* 2.4 Write property test for quote response structure
  - **Property 2: Quote response structure completeness**
  - **Validates: Requirements 2.2, 4.4**



- [ ]* 2.5 Write property test for quote error handling
  - **Property 3: Error handling resilience**
  - **Validates: Requirements 2.4**

- [ ] 2.6 Implement getMarketStatus function
  - Query Nifty 50 index (^NSEI) using yahoo-finance2
  - Compare current price to previous close
  - Return Bullish/Bearish status with price data
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 2.7 Write property test for market status determination
  - **Property 4: Market status determination**




  - **Validates: Requirements 3.2, 3.3, 3.4**

- [ ]* 2.8 Write property test for market status error handling
  - **Property 5: Market status error handling**
  - **Validates: Requirements 3.5**

- [ ] 3. Remove legacy API code and clean up
- [ ] 3.1 Remove Alpha Vantage and Finnhub references
  - Delete all Alpha Vantage API endpoint references
  - Delete all Finnhub API endpoint references
  - Remove API key initialization code
  - Clean up constructor to remove old dependencies
  - _Requirements: 1.2, 4.1_

- [ ] 3.2 Update error handling throughout service
  - Implement structured error response format
  - Add graceful error handling for network failures
  - Add input validation for ticker symbols
  - _Requirements: 2.4, 3.5_

- [ ]* 3.3 Write unit tests for core functionality
  - Test getQuote with known Indian stocks (RELIANCE, TCS, INFY)
  - Test getQuote with known US stocks (AAPL, MSFT, GOOGL)
  - Test getMarketStatus returns expected structure
  - Test service initialization without API keys
  - _Requirements: 4.2_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Verify backward compatibility and integration
- [ ] 5.1 Test existing function signatures
  - Verify all existing callers of getQuote still work
  - Ensure response format matches expected structure
  - Test integration with existing watchlist functionality
  - _Requirements: 4.4_

- [ ] 5.2 Performance and reliability testing
  - Test quote fetching speed compared to old implementation
  - Verify error handling works as expected
  - Test with various ticker symbols (Indian and US)
  - _Requirements: 4.1, 4.3_

- [ ] 6. Final cleanup and documentation
- [ ] 6.1 Update service documentation
  - Add JSDoc comments for new functions
  - Document Indian stock detection logic
  - Document error response format
  - _Requirements: All_

- [ ] 6.2 Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.