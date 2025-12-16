import React from 'react';
import { Page } from '../types';

interface LayoutProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  children: React.ReactNode;
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

export const Layout: React.FC<LayoutProps> = ({ activePage, setActivePage, children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

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
        fixed lg:static inset-y-0 left-0 w-72 bg-background-dark border-r border-border-dark p-6 overflow-y-auto z-50 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full justify-between">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div 
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 shadow-lg shadow-primary/10" 
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
            
            <div className="flex items-center gap-3 px-4 py-3 mt-4 border-t border-border-dark pt-6 cursor-pointer hover:bg-white/5 rounded-xl transition-colors">
              <div 
                className="size-10 rounded-full bg-cover bg-center" 
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAgATd7_k3R6lguI15n82_S8CYk5edFTTG-MrxXAtIzJI4AV_KOak5lUjAemUFBEHoPJWjVJB17regkNuXpBakRfAyx6yvMeoAAuiWp4sV8cbWpKfaiQyysBzbKoR9ycXY_DoDlklOBoPo3W-9aWNPAw57eyyZv6Jsfx4nhgHA271vTeUsYMuQ11Dna0vQQlpVzUJIuVpos7Qb49gUXZoQcpghJO9mSIkfPTMHHmyQp9AcUoZFeeHaunUYt4-jJd8wRYRnvRnjb41v_")' }}
              ></div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-white">Alex Morgan</p>
                <p className="text-xs text-text-secondary">Pro Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-border-dark flex items-center justify-between px-6 lg:px-10 shrink-0 bg-background-dark/95 backdrop-blur z-20">
          <div className="lg:hidden flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}>
                <span className="material-symbols-outlined text-white">menu</span>
            </button>
            <h2 className="text-lg font-bold capitalize">{activePage.replace('-', ' ')}</h2>
          </div>
          
          <div className="hidden lg:block">
            {activePage !== 'settings' && (
              <div className="relative w-96">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary text-[20px]">search</span>
                <input 
                  className="w-full bg-surface-dark border border-border-dark rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-text-secondary/50" 
                  placeholder="Search for ticker, symbol or asset..." 
                  type="text" 
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-2 py-2 text-text-secondary hover:text-white relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-background-dark"></span>
            </button>
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