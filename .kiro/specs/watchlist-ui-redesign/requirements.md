# Requirements Document

## Introduction

This specification defines the redesign of the Watchlist UI component to match a specific dark theme design with improved visual hierarchy and user experience. The component will display stock data in a clean table format with color-coded change indicators.

## Glossary

- **Watchlist Component**: A React component that displays a user's tracked stocks in a table format
- **Dark Theme**: A color scheme using dark backgrounds (#111111) with white text for better readability
- **Change Pill**: A rounded visual indicator showing stock price changes with color coding (green for positive, red for negative)
- **Ticker Symbol**: The abbreviated name used to identify a stock (e.g., AAPL, RELIANCE)
- **Stock Change**: The percentage or absolute change in stock price, displayed with appropriate color coding

## Requirements

### Requirement 1

**User Story:** As a user, I want a visually appealing watchlist component that matches the dark theme, so that it integrates seamlessly with the overall application design.

#### Acceptance Criteria

1. WHEN the watchlist component is rendered THEN the system SHALL use a dark gray background with hex color #111111
2. WHEN the component border is displayed THEN the system SHALL use a subtle white border around the component
3. WHEN the title is shown THEN the system SHALL display "Your Watchlist" in white text
4. WHEN the component is viewed THEN the system SHALL maintain consistent dark theme styling throughout all elements

### Requirement 2

**User Story:** As a user, I want to see my stocks organized in a clear table layout, so that I can quickly scan and compare stock information.

#### Acceptance Criteria

1. WHEN the stock data is displayed THEN the system SHALL present it in a table format with columns for Ticker, Name, Price, and Change
2. WHEN the table headers are rendered THEN the system SHALL clearly label each column with appropriate text styling
3. WHEN stock rows are displayed THEN the system SHALL maintain consistent spacing and alignment across all columns
4. WHEN the table is viewed THEN the system SHALL ensure readability with proper contrast between text and background

### Requirement 3

**User Story:** As a trader, I want to quickly identify positive and negative stock changes through visual indicators, so that I can make informed decisions at a glance.

#### Acceptance Criteria

1. WHEN a stock has a positive change THEN the system SHALL display the change value in a green pill-shaped indicator
2. WHEN a stock has a negative change THEN the system SHALL display the change value in a red pill-shaped indicator
3. WHEN the change pill is rendered THEN the system SHALL use rounded corners to create a pill-like appearance
4. WHEN change values are displayed THEN the system SHALL include appropriate positive (+) or negative (-) signs
5. WHEN the change indicators are viewed THEN the system SHALL ensure sufficient contrast for accessibility

### Requirement 4

**User Story:** As a user, I want to easily add new stocks to my watchlist, so that I can expand my portfolio tracking without navigating away from the current view.

#### Acceptance Criteria

1. WHEN the watchlist component is displayed THEN the system SHALL show an "Add Stock" button in the top right corner of the card
2. WHEN the Add Stock button is rendered THEN the system SHALL style it consistently with the dark theme
3. WHEN the button is positioned THEN the system SHALL place it prominently but not interfere with the table content
4. WHEN the button is clicked THEN the system SHALL provide appropriate functionality for adding stocks to the watchlist