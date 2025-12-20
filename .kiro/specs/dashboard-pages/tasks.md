# Implementation Plan

- [ ] 1. Set up project structure and chart dependencies
- [x] 1.1 Install chart libraries and dependencies


  - Install recharts for React chart components
  - Add date-fns for date formatting utilities
  - Set up TypeScript interfaces for all data models
  - _Requirements: 1.1, 2.1, 3.1_



- [ ] 1.2 Create base component files and routing
  - Create PortfolioTracker.tsx component file
  - Create MarketAnalysis.tsx component file  
  - Create Settings.tsx component file
  - Update routing to include new dashboard pages
  - _Requirements: 1.1, 2.1, 3.1_

- [ ]* 1.3 Write unit tests for component structure
  - Test all components render without crashing
  - Test routing navigation works correctly
  - Test TypeScript interfaces are properly defined


  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 2. Implement Portfolio Tracker page
- [x] 2.1 Create portfolio data fetching and state management

  - Implement API calls to fetch portfolio data
  - Set up state management for portfolio holdings
  - Add loading and error states for data fetching
  - _Requirements: 1.1, 1.5_


- [-] 2.2 Build the top zone with net worth display

  - Create large typography display for total net worth
  - Implement today's P&L pill with color coding
  - Add proper formatting for currency values

  - _Requirements: 1.1, 1.2, 4.2_

- [ ] 2.3 Implement portfolio value area chart
  - Create AreaChart component using recharts
  - Add green gradient fill for positive performance


  - Implement responsive chart sizing
  - _Requirements: 1.3_

- [ ] 2.4 Build asset allocation donut chart
  - Create DonutChart component for allocation breakdown
  - Implement stocks vs crypto vs cash visualization
  - Add percentage labels and legend
  - _Requirements: 1.4_

- [ ] 2.5 Create holdings table with live prices
  - Build table with Asset, Avg Buy Price, Current Price, Qty, Total Value, P&L columns
  - Integrate real-time price updates using existing market service
  - Add color coding for P&L values (green/red)
  - Implement hover effects for edit/delete icons
  - _Requirements: 1.5, 4.4_

- [ ]* 2.6 Write property test for portfolio value consistency
  - **Property 1: Portfolio Value Consistency**
  - **Validates: Requirements 1.1**



- [ ]* 2.7 Write property test for P&L color coding
  - **Property 2: P&L Color Coding Accuracy**
  - **Validates: Requirements 1.2, 4.2**


- [ ]* 2.8 Write unit tests for portfolio components
  - Test net worth display formatting
  - Test chart rendering with mock data
  - Test table interactions and hover effects
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


- [ ] 3. Implement Market Analysis page
- [ ] 3.1 Create sector performance heatmap
  - Build Heatmap component with grid layout
  - Implement color coding for sector performance (green/red)
  - Add sector names and percentage change display
  - _Requirements: 2.1, 2.2_

- [ ] 3.2 Build market movers section
  - Create side-by-side layout for top gainers and losers
  - Integrate with marketDataService for real-time data
  - Add fallback mock data for development
  - Style with appropriate icons (🚀 for gainers, 📉 for losers)
  - _Requirements: 2.3, 2.4_

- [ ] 3.3 Implement news feed section
  - Create news list component with headlines and timestamps
  - Add mock news data for UI structure
  - Style with simple text rows and time formatting
  - _Requirements: 2.5_

- [ ]* 3.4 Write property test for sector heatmap color mapping
  - **Property 3: Sector Heatmap Color Mapping**
  - **Validates: Requirements 2.1, 2.2**

- [ ]* 3.5 Write unit tests for market analysis components
  - Test heatmap rendering with various sector data
  - Test market movers lists display correctly
  - Test news feed formatting and timestamps
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4. Implement Settings page
- [ ] 4.1 Create sidebar navigation layout
  - Build sidebar with Profile, Subscription, Notifications, Security tabs
  - Implement tab switching functionality
  - Style with dark theme consistency
  - _Requirements: 3.1_

- [ ] 4.2 Build Profile tab content
  - Add avatar upload functionality
  - Create name input field with validation
  - Display read-only email field
  - _Requirements: 3.2_

- [ ] 4.3 Implement Subscription tab
  - Display current plan status (e.g., "PRO")
  - Add "Manage Subscription" button with green outline styling
  - Create subscription details layout
  - _Requirements: 3.3_

- [ ] 4.4 Create Preferences section
  - Add Dark Mode toggle (locked to On)
  - Implement Real-time Updates toggle
  - Create Default Currency dropdown (INR/USD)
  - _Requirements: 3.4_

- [ ] 4.5 Implement settings persistence
  - Add API integration for saving user preferences


  - Implement immediate UI feedback for setting changes
  - Add localStorage backup for offline persistence
  - _Requirements: 3.5_


- [ ]* 4.6 Write property test for settings persistence
  - **Property 4: Settings Persistence**
  - **Validates: Requirements 3.4, 3.5**

- [x]* 4.7 Write unit tests for settings components


  - Test sidebar navigation and tab switching
  - Test form inputs and validation
  - Test settings save functionality
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Implement consistent dark theme styling
- [ ] 5.1 Apply dark theme across all components
  - Use #050505 background color consistently
  - Apply neon green (#22c55e) for positive numbers
  - Ensure proper contrast ratios for accessibility
  - _Requirements: 4.1, 4.2_

- [ ] 5.2 Add interactive hover effects and animations
  - Implement hover effects for all interactive elements
  - Add smooth transitions for state changes
  - Create consistent button and link styling
  - _Requirements: 4.3_

- [ ] 5.3 Implement responsive design
  - Add mobile-friendly layouts for all components
  - Ensure charts render properly on different screen sizes
  - Test navigation and interactions on mobile devices
  - _Requirements: 4.4_

- [ ]* 5.4 Write unit tests for styling and responsiveness
  - Test dark theme color application
  - Test responsive layout behavior
  - Test hover effects and animations
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Add error handling and loading states
- [ ] 6.1 Implement loading states for all data fetching
  - Add skeleton loaders for charts and tables
  - Create loading spinners for API calls
  - Implement progressive loading for large datasets
  - _Requirements: 4.5_

- [ ] 6.2 Add comprehensive error handling
  - Create error boundaries for component isolation
  - Add retry mechanisms for failed API calls
  - Implement user-friendly error messages
  - _Requirements: 4.5_

- [ ]* 6.3 Write unit tests for error handling
  - Test loading state displays
  - Test error boundary functionality
  - Test retry mechanisms
  - _Requirements: 4.5_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Performance optimization and final integration
- [ ] 8.1 Optimize component performance
  - Add React.memo for expensive chart components
  - Implement debounced real-time updates
  - Memoize expensive calculations
  - _Requirements: All_

- [ ] 8.2 Final integration and testing
  - Test all pages with real backend data
  - Verify real-time updates work correctly
  - Test navigation between all dashboard pages
  - Validate all styling requirements are met
  - _Requirements: All_

- [ ]* 8.3 Write property test for real-time price updates
  - **Property 5: Real-time Price Updates**
  - **Validates: Requirements 1.5, 4.5**

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.