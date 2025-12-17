import React, { useState, useEffect, useRef } from 'react';
import { Page, Notification } from '../types';
import api from '../config/api';

interface LayoutProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  children: React.ReactNode;
  user?: any;
  onLogout?: () => void;
}

const NavItem = ({ 
  page, 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  page: Page; 
  icon: string; 
  label: string; 
  active: boolean; 
  onClick: (p: Page) => void 
}) => (
  <button 
    onClick={() => onClick(page)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${
      active 
        ? 'bg-surface-dark border border-border-dark shadow-sm' 
        : 'hover:bg-white/5'
    }`}
  >
    <span className={`material-symbols-outlined ${active ? 'text-primary fill-1' : 'text-text-secondary group-hover:text-white'}`}>
      {icon}
    </span>
    <span className={`font-medium ${active ? 'text-white font-bold' : 'text-text-secondary group-hover:text-white'}`}>
      {label}
    </span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ activePage, setActivePage, children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{label: string, page: Page, type: 'page' | 'asset' | 'stock', symbol?: string, price?: number, currency?: string}[]>([]);
  
  // Mock Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'alert', title: 'Price Alert: NVDA', message: 'Nvidia crossed $900.00 threshold. Take profit suggested.', timestamp: '2m ago', read: false },
    { id: '2', type: 'strategy', title: 'Rebalance Due', message: 'Aggressive Growth strategy has drifted >5%.', timestamp: '1h ago', read: false },
    { id: '3', type: 'news', title: 'Market Rally', message: 'Tech sector leading gains on AI infrastructure news.', timestamp: '3h ago', read: false },
    { id: '4', type: 'alert', title: 'Stop Loss Hit', message: 'AMD dipped below $160.00 support level.', timestamp: '5h ago', read: true },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
          setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search Logic
  useEffect(() => {
    if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
    }
    
    const searchStocks = async () => {
      try {
        const q = searchQuery.toLowerCase();
        
        // Search pages first
        const pages: {label: string, page: Page}[] = [
            { label: 'Dashboard', page: 'dashboard' },
            { label: 'Strategy Builder', page: 'strategy-builder' },
            { label: 'Simulator', page: 'strategy-simulator' },
            { label: 'Market Analysis', page: 'market-analysis' },
            { label: 'Portfolio', page: 'portfolio' },
            { label: 'Watchlist', page: 'watchlist' },
            { label: 'Settings', page: 'settings' },
        ];
        
        const matchedPages = pages.filter(p => p.label.toLowerCase().includes(q)).map(p => ({...p, type: 'page' as const}));
        
        // Search stocks via API
        const stockResults = await api.searchStocks(searchQuery);
        const matchedStocks = stockResults.map((stock: any) => ({
          label: `${stock.symbol} - ${stock.name}`,
          page: 'watchlist' as Page,
          type: 'stock' as const,
          symbol: stock.symbol,
          price: stock.price,
          currency: stock.currency
        }));
        
        setSearchResults([...matchedPages, ...matchedStocks]);
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to page search only
        const q = searchQuery.toLowerCase();
        const pages: {label: string, page: Page}[] = [
            { label: 'Dashboard', page: 'dashboard' },
            { label: 'Strategy Builder', page: 'strategy-builder' },
            { label: 'Simulator', page: 'strategy-simulator' },
            { label: 'Market Analysis', page: 'market-analysis' },
            { label: 'Portfolio', page: 'portfolio' },
            { label: 'Watchlist', page: 'watchlist' },
            { label: 'Settings', page: 'settings' },
        ];
        const matchedPages = pages.filter(p => p.label.toLowerCase().includes(q)).map(p => ({...p, type: 'page' as const}));
        setSearchResults(matchedPages);
      }
    };

    const timeoutId = setTimeout(searchStocks, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchSelect = (page: Page) => {
      setActivePage(page);
      setSearchQuery("");
      setSearchResults([]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setIsNotifOpen(false);
  };

  const getIconForType = (type: Notification['type']) => {
    switch (type) {
        case 'alert': return 'warning';
        case 'strategy': return 'tune';
        case 'news': return 'newspaper';
        default: return 'notifications';
    }
  };

  const getColorForType = (type: Notification['type']) => {
      switch (type) {
          case 'alert': return 'bg-danger/10 text-danger';
          case 'strategy': return 'bg-primary/10 text-primary';
          case 'news': return 'bg-blue-500/10 text-blue-500';
          default: return 'bg-surface-dark text-text-secondary';
      }
  };

  const getSearchPlaceholder = () => {
      if (activePage === 'market-analysis') return "Search for ticker, sector or news...";
      if (activePage === 'portfolio') return "Search portfolio...";
      if (activePage === 'strategy-builder') return "Search strategies...";
      return "Search for ticker, symbol or asset...";
  };

  const renderHeaderContent = () => {
      if (['dashboard', 'market-analysis', 'portfolio', 'strategy-builder'].includes(activePage)) {
          return (
            <div className="relative w-96" ref={searchRef}>
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary text-[20px]">search</span>
                <input 
                  className="w-full bg-surface-dark border border-border-dark rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-text-secondary/50" 
                  placeholder={getSearchPlaceholder()}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark border border-border-dark rounded-xl shadow-xl overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                        <div className="p-2 text-xs font-bold text-text-secondary uppercase tracking-wider bg-background-dark/50 border-b border-border-dark">Results</div>
                        {searchResults.map((res, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSearchSelect(res.page)}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center justify-between group transition-colors"
                            >
                                <div className="flex flex-col">
                                  <span className="text-white font-medium text-sm">{res.label}</span>
                                  {res.type === 'stock' && res.price && (
                                    <span className="text-xs text-text-secondary">{res.currency}{res.price.toFixed(2)}</span>
                                  )}
                                </div>
                                <span className="text-xs text-text-secondary bg-background-dark px-2 py-1 rounded group-hover:bg-background-dark/80 capitalize">{res.type}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
          );
      }
      if (activePage === 'watchlist') {
          return (
              <h2 className="text-xl font-bold text-white">Watchlist</h2>
          );
      }
      if (activePage === 'strategy-simulator') {
          return (
              <h2 className="text-xl font-bold text-white">Strategy Simulator</h2>
          );
      }
      if (activePage === 'settings') {
          return (
              <h2 className="text-xl font-bold text-white">Settings</h2>
          );
      }
      return null;
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background-dark">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-background-dark border-r border-border-dark p-6 overflow-y-auto z-50 transition-transform duration-300 shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full justify-between">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div 
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 shadow-lg shadow-primary/10" 
                data-alt="Abstract green geometric logo representing growth"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCl7ujQm8IiMQ1p7FPSza9qw0RKErASCgJZ1TMVS01X1i1Ynqvf6d83Z3WnxA0rwJ3ck3ICdZFvJxqkQcPxOFI1VhRDAx5QAsEsPOWqxTkFOqf1TaXuUUyr8XFBnIReWspy_paV4w2EzOOHQI-GnbYx2z4hu1z-bIJZAbpNwdCF3UgVNrfOqY-CTyNXmJQ1WmyCuXhWtIh7DEo5hG6JdHNJqlDLqwWTKVIZvcB_YISOdgG_AxjL5_XgmxTftxpdc2lWO6pjHuM4Lmwh")' }}
              ></div>
              <h1 className="text-white text-xl font-bold tracking-tight">InvestApply</h1>
            </div>
            
            <nav className="flex flex-col gap-2">
              <NavItem page="dashboard" icon="grid_view" label="Dashboard" active={activePage === 'dashboard'} onClick={setActivePage} />
              <NavItem page="strategy-builder" icon="auto_fix_high" label="Strategy Builder" active={activePage === 'strategy-builder'} onClick={setActivePage} />
              <NavItem page="strategy-simulator" icon="science" label="Strategy Simulator" active={activePage === 'strategy-simulator'} onClick={setActivePage} />
              <NavItem page="market-analysis" icon="monitoring" label="Market Analysis" active={activePage === 'market-analysis'} onClick={setActivePage} />
              <NavItem page="portfolio" icon="pie_chart" label="Portfolio Tracker" active={activePage === 'portfolio'} onClick={setActivePage} />
              <NavItem page="watchlist" icon="bookmarks" label="Watchlist" active={activePage === 'watchlist'} onClick={setActivePage} />
            </nav>
          </div>

          <div className="flex flex-col gap-2">
            <NavItem page="settings" icon="settings" label="Settings" active={activePage === 'settings'} onClick={setActivePage} />
            
            <div className="flex items-center gap-3 px-4 py-3 mt-4 border-t border-border-dark pt-6">
              <div 
                className="size-10 rounded-full bg-cover bg-center bg-primary flex items-center justify-center text-black font-bold" 
                data-alt="User profile picture"
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-sm font-bold text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-text-secondary">Pro Plan</p>
              </div>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="p-1 text-text-secondary hover:text-white transition-colors"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-border-dark flex items-center justify-between px-6 lg:px-10 shrink-0 bg-background-dark/95 backdrop-blur z-20 relative">
          <div className="lg:hidden flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}>
                <span className="material-symbols-outlined text-white">menu</span>
            </button>
            <h2 className="text-lg font-bold capitalize">{activePage.replace('-', ' ')}</h2>
          </div>
          
          <div className="hidden lg:block z-50">
            {renderHeaderContent()}
          </div>
          
          <div className="flex items-center gap-4" ref={notifRef}>
            {activePage === 'watchlist' && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-dark border border-border-dark rounded-full">
                    <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-xs font-bold text-primary">Market Open</span>
                </div>
            )}
            {/* Notification Bell */}
            <div className="relative">
                <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`flex items-center gap-2 px-2 py-2 relative transition-colors ${isNotifOpen ? 'text-white' : 'text-text-secondary hover:text-white'}`}
                >
                    <span className="material-symbols-outlined fill-1">notifications</span>
                    {notifications.length > 0 && (
                        <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-background-dark animate-pulse"></span>
                    )}
                </button>

                {/* Notification Dropdown */}
                {isNotifOpen && (
                    <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-surface-dark border border-border-dark rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10 origin-top-right animate-[fadeIn_0.1s_ease-out]">
                        <div className="p-4 border-b border-border-dark flex items-center justify-between bg-background-dark/50 backdrop-blur-sm">
                            <h3 className="font-bold text-white text-sm">Notifications</h3>
                            {notifications.length > 0 && (
                                <button onClick={clearAllNotifications} className="text-xs text-primary hover:text-primary-hover font-bold uppercase tracking-wider transition-colors">
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-text-secondary flex flex-col items-center">
                                    <div className="bg-background-dark p-4 rounded-full mb-3">
                                        <span className="material-symbols-outlined text-4xl opacity-50">notifications_off</span>
                                    </div>
                                    <p className="text-sm font-medium">All caught up!</p>
                                    <p className="text-xs opacity-70 mt-1">No new alerts to display.</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className="p-4 border-b border-border-dark hover:bg-white/5 transition-colors relative group">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                                            className="absolute top-3 right-3 text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-white/10 rounded"
                                            title="Dismiss"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                        <div className="flex gap-4">
                                            <div className={`shrink-0 size-10 rounded-full flex items-center justify-center ${getColorForType(n.type)}`}>
                                                <span className="material-symbols-outlined text-[20px]">{getIconForType(n.type)}</span>
                                            </div>
                                            <div className="flex-1 pr-6">
                                                <div className="flex items-baseline justify-between mb-1">
                                                    <h4 className="text-sm font-bold text-white leading-tight">{n.title}</h4>
                                                    <span className="text-[10px] font-bold text-text-secondary/60 uppercase tracking-wider shrink-0 ml-2">{n.timestamp}</span>
                                                </div>
                                                <p className="text-xs text-text-secondary leading-relaxed">{n.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                         {notifications.length > 0 && (
                             <div className="p-3 bg-background-dark/50 border-t border-border-dark text-center">
                                 <button onClick={() => { setActivePage('market-analysis'); setIsNotifOpen(false); }} className="text-xs font-bold text-white hover:text-primary transition-colors flex items-center justify-center gap-1">
                                    View Activity Log <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                 </button>
                             </div>
                         )}
                    </div>
                )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};