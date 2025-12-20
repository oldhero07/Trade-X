# Dashboard Pages Requirements

## Introduction

This specification covers the development of three core dashboard pages for the TradeX platform: Portfolio Tracker, Market Analysis, and Settings. These pages will provide comprehensive portfolio management, market insights, and user configuration capabilities within a cohesive dark-themed interface.

## Glossary

- **Portfolio Tracker**: A comprehensive view of user's investment holdings with real-time valuations
- **Market Analysis**: Market overview page with sector performance and market movers
- **Settings**: User configuration and preferences management page
- **Net Worth**: Total value of all user holdings across different asset classes
- **P&L**: Profit and Loss calculation showing gains/losses
- **Heatmap**: Visual grid representation of sector performance using color coding
- **Market Movers**: Lists of top gaining and losing stocks in the market

## Requirements

### Requirement 1: Portfolio Tracker Page

**User Story:** As an investor, I want to view my complete portfolio performance and holdings, so that I can track my investment progress and make informed decisions.

#### Acceptance Criteria

1. WHEN a user visits the portfolio tracker page THEN the system SHALL display the total net worth in large, prominent typography
2. WHEN displaying portfolio value THEN the system SHALL show today's profit and loss in a colored pill indicator next to the net worth
3. WHEN rendering the portfolio visualization THEN the system SHALL display an area chart showing portfolio value over time with green gradient fill
4. WHEN showing asset allocation THEN the system SHALL render a donut chart displaying the breakdown of stocks, crypto, and cash holdings
5. WHEN displaying holdings table THEN the system SHALL show columns for Asset, Average Buy Price, Current Price, Quantity, Total Value, and color-coded P&L

### Requirement 2: Market Analysis Page

**User Story:** As a trader, I want to analyze market conditions and identify opportunities, so that I can make strategic investment decisions based on market trends.

#### Acceptance Criteria

1. WHEN a user accesses the market analysis page THEN the system SHALL display a sector performance heatmap with color-coded boxes
2. WHEN rendering sector heatmap THEN the system SHALL use green coloring for sectors with positive performance and red for negative performance
3. WHEN showing market movers THEN the system SHALL display side-by-side lists of top gainers and top losers
4. WHEN displaying market movers THEN the system SHALL fetch real-time data using the marketDataService or display realistic mock data
5. WHEN rendering news feed THEN the system SHALL show a list of recent market headlines with timestamps

### Requirement 3: Settings Page

**User Story:** As a platform user, I want to configure my account preferences and settings, so that I can customize my experience and manage my account security.

#### Acceptance Criteria

1. WHEN a user opens the settings page THEN the system SHALL display a sidebar navigation with Profile, Subscription, Notifications, and Security tabs
2. WHEN viewing the Profile tab THEN the system SHALL provide avatar upload functionality, name input field, and read-only email display
3. WHEN accessing the Subscription tab THEN the system SHALL show current plan status and provide a manage subscription button
4. WHEN configuring preferences THEN the system SHALL provide toggles for dark mode and real-time updates, plus currency selection dropdown
5. WHEN interacting with settings THEN the system SHALL persist user preferences and provide immediate visual feedback

### Requirement 4: Design Consistency

**User Story:** As a user, I want all dashboard pages to have consistent styling and navigation, so that I have a seamless experience across the platform.

#### Acceptance Criteria

1. WHEN rendering any dashboard page THEN the system SHALL apply the dark theme with #050505 background color
2. WHEN displaying numerical values THEN the system SHALL use neon green (#22c55e) color for positive numbers and appropriate contrast colors
3. WHEN showing interactive elements THEN the system SHALL provide hover effects and visual feedback consistent with the platform design
4. WHEN displaying data tables THEN the system SHALL include edit and delete icons that appear on row hover
5. WHEN loading data THEN the system SHALL show appropriate loading states and handle error conditions gracefully