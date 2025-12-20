# Requirements Document

## Introduction

This specification defines the migration of the TradeX market data service from Alpha Vantage and Finnhub APIs to the yahoo-finance2 library. The migration aims to consolidate all market data operations under a single, reliable data provider while maintaining support for both US and Indian stock markets.

## Glossary

- **Market Data Service**: The backend service responsible for fetching real-time and historical stock market data
- **yahoo-finance2**: A Node.js library that provides programmatic access to Yahoo Finance data
- **NSE**: National Stock Exchange of India
- **Ticker Symbol**: A unique series of letters assigned to a security for trading purposes
- **Indian Stock**: A stock traded on Indian exchanges (NSE/BSE) that requires .NS or .BO suffix for Yahoo Finance queries
- **Market Status**: An indicator showing whether the market is trending Bullish (upward) or Bearish (downward)
- **Nifty 50**: India's benchmark stock market index (symbol: ^NSEI) representing the top 50 companies on NSE

## Requirements

### Requirement 1

**User Story:** As a developer, I want to remove Alpha Vantage and Finnhub dependencies from the project, so that the codebase uses a single, unified market data provider.

#### Acceptance Criteria

1. WHEN the package.json file is updated THEN the system SHALL remove all references to Alpha Vantage API keys and Finnhub API keys
2. WHEN the marketDataService.js file is examined THEN the system SHALL contain no imports or references to Alpha Vantage or Finnhub endpoints
3. WHEN the backend dependencies are installed THEN the system SHALL include yahoo-finance2 as a production dependency

### Requirement 2

**User Story:** As a developer, I want a getQuote function that automatically handles Indian stock symbols, so that users can query Indian stocks without manually appending exchange suffixes.

#### Acceptance Criteria

1. WHEN a user requests a quote for an Indian stock ticker THEN the system SHALL automatically append .NS suffix before querying Yahoo Finance
2. WHEN the getQuote function receives a ticker symbol THEN the system SHALL return an object containing symbol, name, price, and currency fields
3. WHEN the getQuote function processes a US stock ticker THEN the system SHALL query Yahoo Finance without modifying the symbol
4. WHEN the getQuote function encounters an error THEN the system SHALL handle the error gracefully and return appropriate error information
5. WHEN the returned quote object is created THEN the system SHALL include the original ticker symbol without the .NS suffix in the symbol field

### Requirement 3

**User Story:** As a trader, I want to know the current market status for the Indian market, so that I can understand the overall market sentiment.

#### Acceptance Criteria

1. WHEN the getMarketStatus function is called THEN the system SHALL query the Nifty 50 index using symbol ^NSEI
2. WHEN the Nifty 50 data is retrieved THEN the system SHALL compare current price to previous close to determine market direction
3. WHEN the current price is greater than previous close THEN the system SHALL return "Bullish" as the market status
4. WHEN the current price is less than or equal to previous close THEN the system SHALL return "Bearish" as the market status
5. WHEN the getMarketStatus function encounters an error THEN the system SHALL handle the error gracefully and return appropriate error information

### Requirement 4

**User Story:** As a developer, I want the marketDataService to use yahoo-finance2 for all data operations, so that the service has a consistent and maintainable implementation.

#### Acceptance Criteria

1. WHEN any market data function is executed THEN the system SHALL use yahoo-finance2 library methods exclusively
2. WHEN the marketDataService is initialized THEN the system SHALL not require API keys for basic quote operations
3. WHEN the service fetches data THEN the system SHALL use yahoo-finance2's built-in error handling and retry mechanisms
4. WHEN the service is refactored THEN the system SHALL maintain backward compatibility with existing function signatures where possible
