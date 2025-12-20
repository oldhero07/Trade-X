# Requirements Document

## Introduction

This specification defines the creation of a comprehensive Dashboard UI component that serves as the main landing page for the TradeX application. The dashboard will provide users with a personalized overview of market conditions, smart stock picks, and their watchlist in a visually appealing dark theme with neon green accents.

## Glossary

- **Dashboard Component**: The main landing page React component that displays market overview and user data
- **Market Pulse**: A real-time indicator showing overall market sentiment (Bullish/Bearish)
- **Smart Picks**: A curated selection of 3 recommended stocks with live data
- **Market Badge**: A visual indicator showing market status with appropriate color coding
- **Change Pill**: A rounded visual element displaying percentage change with color coding
- **Grid System**: A responsive layout system that adapts to different screen sizes
- **Nifty 50**: India's benchmark stock market index used for market status determination

## Requirements

### Requirement 1

**User Story:** As a user, I want a personalized greeting and market overview at the top of my dashboard, so that I can quickly understand the current market conditions when I log in.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display a personalized greeting "Good Morning, Alex" in white, bold text
2. WHEN the market status is fetched THEN the system SHALL call marketDataService.getMarketStatus() to get current market conditions
3. WHEN the market status is "Bullish" THEN the system SHALL display a green badge with text "Market is Up 🚀"
4. WHEN the market status is "Bearish" THEN the system SHALL display a red badge with text "Market is Down 📉"
5. WHEN the market badge is displayed THEN the system SHALL show the current Nifty 50 price next to the status indicator

### Requirement 2

**User Story:** As a trader, I want to see smart stock picks with live data prominently displayed, so that I can quickly identify potential investment opportunities.

#### Acceptance Criteria

1. WHEN the smart picks section loads THEN the system SHALL display exactly 3 cards in a horizontal row layout
2. WHEN fetching smart picks data THEN the system SHALL call getQuote() for tickers ['RELIANCE', 'NVDA', 'BTC-USD']
3. WHEN each card is rendered THEN the system SHALL use dark gray background (#111111) with subtle white border
4. WHEN displaying card content THEN the system SHALL show ticker name, large white price text, and colored change pill
5. WHEN the RELIANCE card is displayed THEN the system SHALL include a "Top Pick" tag to highlight it as featured
6. WHEN change percentages are shown THEN the system SHALL use green pills for positive changes and red pills for negative changes

### Requirement 3

**User Story:** As a user, I want to see my watchlist integrated into the dashboard, so that I can monitor my tracked stocks without navigating to a separate page.

#### Acceptance Criteria

1. WHEN the dashboard renders THEN the system SHALL import and display the existing Watchlist component
2. WHEN the watchlist is positioned THEN the system SHALL place it in the bottom section of the dashboard
3. WHEN the watchlist is displayed THEN the system SHALL maintain all existing functionality from the original component
4. WHEN the layout is viewed THEN the system SHALL ensure the watchlist integrates seamlessly with the overall dashboard design

### Requirement 4

**User Story:** As a developer, I want the dashboard to use the new yahoo-finance2 service exclusively and implement responsive design, so that the application is maintainable and works across different devices.

#### Acceptance Criteria

1. WHEN data is fetched THEN the system SHALL use only the yahoo-finance2 marketDataService for all API calls
2. WHEN the component mounts THEN the system SHALL use useEffect to fetch all required data on initial load
3. WHEN the layout is displayed THEN the system SHALL implement a responsive grid system with 2 columns on large screens
4. WHEN viewed on different screen sizes THEN the system SHALL adapt the layout appropriately for mobile and tablet devices
5. WHEN the component is rendered THEN the system SHALL maintain consistent dark theme styling throughout all sections