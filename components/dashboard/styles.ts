// Shared Tailwind CSS classes for dashboard components

export const dashboardStyles = {
  // Container styles
  container: 'min-h-screen bg-[#050505] text-white p-6',
  grid: 'grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto',
  
  // Header styles
  header: 'col-span-full flex justify-between items-center mb-8',
  greeting: 'text-3xl font-bold text-white',
  
  // Market badge styles
  marketBadge: 'px-4 py-2 rounded-full font-semibold flex items-center gap-2',
  marketBadgeBullish: 'bg-[#22c55e] text-white',
  marketBadgeBearish: 'bg-red-500 text-white',
  
  // Smart picks section
  smartPicksSection: 'col-span-full mb-8',
  smartPicksGrid: 'grid grid-cols-1 md:grid-cols-3 gap-6',
  
  // Stock card styles
  stockCard: 'bg-[#111111] border border-white/10 rounded-xl p-6 relative',
  topPickTag: 'absolute top-3 right-3 bg-[#22c55e] text-white text-xs px-2 py-1 rounded-full font-semibold',
  stockSymbol: 'text-lg font-semibold text-white mb-1',
  stockName: 'text-sm text-gray-400 mb-3',
  stockPrice: 'text-2xl font-bold text-white mb-2',
  
  // Change pill styles
  changePill: 'px-3 py-1 rounded-full text-sm font-medium',
  changePillPositive: 'bg-[#22c55e] text-white',
  changePillNegative: 'bg-red-500 text-white',
  
  // Watchlist section
  watchlistSection: 'col-span-full',
  
  // Loading and error states
  loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]',
  errorMessage: 'bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 text-sm'
};