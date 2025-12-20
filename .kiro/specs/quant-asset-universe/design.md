# Design Document: Quantitative Asset Universe

## Overview

This design refactors the existing Asset Universe system to support advanced quantitative analysis by introducing comprehensive financial metrics and correlation matrices. The system will provide 30 carefully selected assets with standardized quantitative factors including momentum, earnings growth, volatility, beta, and dividend yield, along with pre-calculated correlation data for portfolio optimization and risk analysis.

## Architecture

The quantitative asset universe follows a data-centric architecture that extends the existing asset system:

```
┌─────────────────────────────────────────────────────────────┐
│                    Asset Universe Layer                      │
├─────────────────────────────────────────────────────────────┤
│  QuantAsset Interface                                       │
│  ├── Basic Info (ticker, name, sector, price)              │
│  ├── Quantitative Metrics (momentum, growth, volatility)   │
│  └── Correlation Matrix (cross-asset relationships)        │
├─────────────────────────────────────────────────────────────┤
│  Asset Universe Functions                                   │
│  ├── getAssetUniverse() → QuantAsset[]                    │
│  ├── getAssetByTicker() → QuantAsset | undefined          │
│  ├── getCorrelationMatrix() → number[][]                  │
│  └── getAssetsBySector() → QuantAsset[]                   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### QuantAsset Interface

The core interface that defines the structure for quantitative asset data:

```typescript
interface QuantAsset {
  ticker: string;           // Asset symbol (e.g., "AAPL")
  name: string;            // Full company/asset name
  sector: string;          // Industry classification
  price: number;           // Current market price in USD
  
  // Quantitative Factors
  metrics: {
    momentum12M: number;     // 12-month return percentage (decimal)
    earningsGrowth: number;  // Year-over-year earnings growth (decimal)
    volatility: number;      // Annualized standard deviation (decimal)
    beta: number;           // Market sensitivity coefficient
    dividendYield: number;   // Annual dividend yield (decimal)
  };
  
  // Pre-calculated correlation coefficients
  correlations: { [ticker: string]: number };
}
```

### Asset Universe Functions

**Primary Functions:**
- `getAssetUniverse(): QuantAsset[]` - Returns all 30 quantitative assets
- `getAssetByTicker(ticker: string): QuantAsset | undefined` - Retrieves specific asset
- `getCorrelationMatrix(): number[][]` - Generates full correlation matrix
- `getAssetsBySector(sector: string): QuantAsset[]` - Filters by sector

**Utility Functions:**
- `validateCorrelations(asset: QuantAsset): boolean` - Ensures correlation validity
- `calculatePortfolioMetrics(tickers: string[]): PortfolioMetrics` - Portfolio analysis

## Data Models

### Asset Selection Criteria

The 30 assets are selected to provide:
- **Sector Diversification**: Technology (8), Healthcare (3), Financial (3), Energy (2), Consumer (4), Utilities (2), Real Estate (2), Bonds/ETFs (6)
- **Risk Spectrum**: Low volatility (0.05-0.15), Medium volatility (0.16-0.30), High volatility (0.31+)
- **Market Cap Coverage**: Large cap (20), Mid cap (6), Small cap/ETF (4)
- **Geographic Exposure**: US (24), International (4), Emerging Markets (2)

### Quantitative Metrics Specifications

**Momentum (12M)**: Trailing 12-month return
- Range: -0.80 to +2.50 (decimal format)
- Calculation: (Current Price - Price 12M Ago) / Price 12M Ago

**Earnings Growth**: Year-over-year earnings per share growth
- Range: -0.50 to +1.50 (decimal format)
- Calculation: (Current EPS - Prior Year EPS) / Prior Year EPS

**Volatility**: Annualized standard deviation of daily returns
- Range: 0.05 to 0.90 (decimal format)
- Calculation: Standard deviation of daily returns × √252

**Beta**: Market sensitivity relative to S&P 500
- Range: -0.50 to +2.50
- Calculation: Covariance(Asset, Market) / Variance(Market)

**Dividend Yield**: Annual dividend as percentage of price
- Range: 0.00 to 0.12 (decimal format)
- Calculation: Annual Dividends Per Share / Current Price

### Correlation Matrix Structure

The correlation matrix provides symmetric relationships between all asset pairs:
- Diagonal elements = 1.0 (perfect self-correlation)
- Off-diagonal elements between -1.0 and +1.0
- Matrix is symmetric: corr(A,B) = corr(B,A)
- Realistic correlations based on sector and asset type relationships
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After reviewing the acceptance criteria, several properties can be consolidated to eliminate redundancy:

**Property Reflection:**
- Requirements 1.5 and 3.4 both test correlation value ranges - these are identical and can be combined
- Requirements 2.1-2.5 all test metric field existence and types - these can be combined into a comprehensive metrics validation property
- Requirements 3.1 and 3.3 both relate to correlation completeness and can be combined

**Property 1: Asset universe completeness**
*For any* call to getAssetUniverse(), the result should contain exactly 30 assets, each with all required fields (ticker, name, sector, price, metrics object, correlations object) properly populated
**Validates: Requirements 1.1, 1.2, 1.3**

**Property 2: Quantitative metrics validity**
*For any* asset in the universe, all metrics fields (momentum12M, earningsGrowth, volatility, beta, dividendYield) should exist as numeric values with volatility and dividendYield being non-negative
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

**Property 3: Correlation matrix completeness and symmetry**
*For any* two assets A and B in the universe, correlation data should exist in both directions with corr(A,B) = corr(B,A), and each asset should have correlation 1.0 with itself
**Validates: Requirements 3.1, 3.2, 3.3**

**Property 4: Correlation value constraints**
*For any* correlation value in any asset's correlation data, the value should be between -1.0 and 1.0 inclusive
**Validates: Requirements 1.5, 3.4**

**Property 5: Correlation data completeness with defaults**
*For any* asset in the universe, if correlation data is missing for another asset, a default correlation value of 0.0 should be provided
**Validates: Requirements 3.5**

**Property 6: Serialization round-trip consistency**
*For any* asset from the universe, serializing to JSON and deserializing back should produce an equivalent asset with all numeric fields maintaining their numeric types
**Validates: Requirements 4.2**

## Error Handling

The quantitative asset universe implements robust error handling:

**Data Validation:**
- Correlation values are clamped to [-1.0, 1.0] range if invalid values are detected
- Missing correlation data defaults to 0.0 (no correlation)
- Negative volatility or dividend yield values are set to 0.0
- Invalid or missing price data defaults to 1.0

**Runtime Errors:**
- `getAssetByTicker()` returns `undefined` for non-existent tickers rather than throwing
- Correlation matrix generation handles missing data gracefully
- Type validation ensures all numeric fields are properly typed

**Boundary Conditions:**
- Empty ticker searches return `undefined`
- Sector filtering with non-existent sectors returns empty arrays
- Correlation lookups for non-existent assets return 0.0

## Testing Strategy

The quantitative asset universe requires comprehensive testing using both unit tests and property-based tests to ensure correctness across all scenarios.

**Property-Based Testing Framework:**
- **Library**: fast-check (for TypeScript/JavaScript)
- **Configuration**: Minimum 100 iterations per property test
- **Generators**: Custom generators for asset data, tickers, and correlation matrices

**Unit Testing Approach:**
Unit tests will verify specific examples and edge cases:
- Specific asset retrieval by known tickers
- Sector filtering with known sectors
- Correlation matrix generation for small subsets
- Error handling with invalid inputs
- Boundary conditions (empty inputs, non-existent data)

**Property-Based Testing Approach:**
Property tests will verify universal properties across all inputs:
- **Property 1**: Asset universe completeness - generates random calls and verifies 30 assets with complete data
- **Property 2**: Metrics validity - generates random asset indices and verifies all metrics are properly typed
- **Property 3**: Correlation symmetry - generates random asset pairs and verifies symmetric correlations
- **Property 4**: Correlation constraints - generates all correlation values and verifies [-1.0, 1.0] range
- **Property 5**: Default correlation handling - tests missing correlation scenarios
- **Property 6**: Serialization consistency - generates random assets and tests JSON round-trip

**Test Requirements:**
- Each property-based test MUST run a minimum of 100 iterations
- Each property-based test MUST be tagged with format: '**Feature: quant-asset-universe, Property {number}: {property_text}**'
- Each correctness property MUST be implemented by a SINGLE property-based test
- Unit tests and property tests are complementary - unit tests catch concrete bugs, property tests verify general correctness

**Integration Testing:**
- Verify compatibility with existing portfolio optimization functions
- Test performance with full 30-asset correlation matrix operations
- Validate data consistency across multiple function calls