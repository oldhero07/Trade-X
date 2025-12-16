import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Page, Stock, Strategy } from './types';
import { getMarketSummary, getPortfolioInsight, analyzeStock } from './services/geminiService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line 
} from 'recharts';

// --- Shared Components ---

const TradeModal = ({ isOpen, onClose, stock }: { isOpen: boolean, onClose: () => void, stock: Stock }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-1">Trade {stock.symbol}</h2>
                    <p className="text-text-secondary text-sm">Current Price: <span className="text-white font-mono">${stock.price.toFixed(2)}</span></p>
                </div>
                
                <div className="flex gap-2 mb-6 bg-background-dark p-1 rounded-xl">
                    <button className="flex-1 py-2 rounded-lg bg-surface-dark text-white font-bold text-sm shadow-sm">Buy</button>
                    <button className="flex-1 py-2 rounded-lg text-text-secondary hover:text-white font-medium text-sm transition-colors">Sell</button>
                </div>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Quantity</label>
                        <div className="flex items-center gap-4">
                            <input type="number" defaultValue={10} className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-lg font-mono" />
                            <div className="text-right shrink-0">
                                <span className="block text-xs text-text-secondary">Est. Cost</span>
                                <span className="block text-white font-bold">${(stock.price * 10).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={onClose} className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] hover:shadow-[0_0_30px_rgba(70,236,19,0.5)]">
                    Confirm Order
                </button>
            </div>
        </div>
    );
};

// --- Sub-components for specific pages ---

// 1. Dashboard Page
const Dashboard = ({ setActivePage }: { setActivePage: (p: Page) => void }) => {
  const [summary, setSummary] = useState<string>("Tech stocks are rallying due to positive inflation data. Risk appetite is returning to the growth sector.");

  useEffect(() => {
    // Only fetch if we don't have the initial static content, or to refresh
    // keeping the static text initially to match the design EXACTLY as requested
    getMarketSummary().then(text => {
        if(text && text.length > 10) setSummary(text);
    });
  }, []);

  return (
    <div className="p-4 lg:p-10 pb-32">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-dark">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Good Morning, Alex</h1>
                    <div className="flex items-center flex-wrap gap-3 text-text-secondary">
                        <span className="text-sm font-medium">Current Strategy:</span>
                        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                            <span className="material-symbols-outlined text-primary text-[16px] fill-1">rocket_launch</span>
                            <span className="text-primary text-xs font-bold uppercase tracking-wide">Aggressive Growth (Long Term)</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setActivePage('strategy-simulator')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-surface-dark border border-border-dark hover:border-text-secondary transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">tune</span>
                        Tune Profile
                    </button>
                    <button 
                         onClick={() => setActivePage('strategy-simulator')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-background-dark bg-primary hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(70,236,19,0.3)]"
                    >
                        <span className="material-symbols-outlined text-[20px]">science</span>
                        What-If?
                    </button>
                </div>
            </section>

            {/* Market Status Card */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-surface-dark to-background-dark p-6 rounded-2xl border border-border-dark flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="size-20 shrink-0 rounded-2xl bg-surface-dark border border-border-dark shadow-inner flex items-center justify-center relative">
                        <span className="material-symbols-outlined text-primary text-4xl animate-pulse">sunny</span>
                        <div className="absolute bottom-1 right-1 size-3 bg-primary rounded-full border-2 border-surface-dark"></div>
                    </div>
                    <div className="flex flex-col justify-center h-full gap-2 text-center sm:text-left z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-white leading-tight">Market is <span className="text-primary">BULLISH</span> today</h2>
                            <p className="text-text-secondary text-sm mt-1">{summary}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary/70">
                            <span className="material-symbols-outlined text-[14px]">update</span>
                            <span>Updated 15m ago</span>
                        </div>
                    </div>
                </div>
                <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark flex flex-col justify-center h-full">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Asset Pulse</h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_#46ec13]"></div>
                                <span className="text-white font-bold text-sm">Stocks (SPY)</span>
                            </div>
                            <div className="flex items-center gap-1 text-primary text-sm font-mono">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                <span>+1.24%</span>
                            </div>
                        </div>
                        <div className="w-full h-px bg-border-dark/50"></div>
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                                <span className="text-white font-bold text-sm">Gold (GLD)</span>
                            </div>
                            <div className="flex items-center gap-1 text-red-500 text-sm font-mono">
                                <span className="material-symbols-outlined text-[16px]">trending_down</span>
                                <span>-0.42%</span>
                            </div>
                        </div>
                        <div className="w-full h-px bg-border-dark/50"></div>
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_#46ec13]"></div>
                                <span className="text-white font-bold text-sm">Crypto (BTC)</span>
                            </div>
                            <div className="flex items-center gap-1 text-primary text-sm font-mono">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                <span>+5.10%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* Smart Picks */}
             <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
                        Smart Picks
                    </h3>
                    <button onClick={() => setActivePage('watchlist')} className="text-text-secondary text-sm hover:text-white transition-colors flex items-center gap-1">
                        View all recommendations <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Pick 1 */}
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 hover:border-primary/50 transition-all duration-300 group cursor-pointer relative overflow-hidden" onClick={() => setActivePage('watchlist')}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-primary/10 transition-colors"></div>
                        <div className="flex justify-between items-start mb-4 relative">
                            <div className="flex gap-3 items-center">
                                <div className="size-10 bg-white text-black font-bold flex items-center justify-center rounded-lg shadow-sm">N</div>
                                <div>
                                    <h4 className="font-bold text-white leading-none">NVDA</h4>
                                    <span className="text-xs text-text-secondary">NVIDIA Corp</span>
                                </div>
                            </div>
                            <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Top Match</span>
                        </div>
                        <div className="mb-4">
                            <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                                $895.32 
                                <span className="text-sm text-primary font-medium flex items-center">
                                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 2.4%
                                </span>
                            </div>
                        </div>
                         <div className="p-3 bg-background-dark rounded-xl border border-border-dark/50">
                            <p className="text-xs text-text-secondary flex items-start gap-2">
                                <span className="material-symbols-outlined text-[16px] text-primary shrink-0">check_circle</span>
                                Matches your aggressive growth goal with high exposure to AI sector.
                            </p>
                        </div>
                    </div>
                    {/* Pick 2 */}
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 hover:border-white/30 transition-all duration-300 group cursor-pointer relative overflow-hidden" onClick={() => setActivePage('watchlist')}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-white/10 transition-colors"></div>
                        <div className="flex justify-between items-start mb-4 relative">
                            <div className="flex gap-3 items-center">
                                <div className="size-10 bg-red-600 text-white font-bold flex items-center justify-center rounded-lg shadow-sm">K</div>
                                <div>
                                    <h4 className="font-bold text-white leading-none">KO</h4>
                                    <span className="text-xs text-text-secondary">Coca-Cola Co</span>
                                </div>
                            </div>
                            <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">The Hedge</span>
                        </div>
                         <div className="mb-4">
                            <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                                $59.40 
                                <span className="text-sm text-text-secondary font-medium flex items-center">
                                    <span className="material-symbols-outlined text-[14px]">remove</span> 0.0%
                                </span>
                            </div>
                        </div>
                         <div className="p-3 bg-background-dark rounded-xl border border-border-dark/50">
                            <p className="text-xs text-text-secondary flex items-start gap-2">
                                <span className="material-symbols-outlined text-[16px] text-white shrink-0">shield</span>
                                Selected to balance risk and provide dividend consistency.
                            </p>
                        </div>
                    </div>
                    {/* Pick 3 */}
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 hover:border-blue-400/50 transition-all duration-300 group cursor-pointer relative overflow-hidden" onClick={() => setActivePage('watchlist')}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-blue-400/10 transition-colors"></div>
                         <div className="flex justify-between items-start mb-4 relative">
                            <div className="flex gap-3 items-center">
                                <div className="size-10 bg-blue-500 text-white font-bold flex items-center justify-center rounded-lg shadow-sm">Q</div>
                                <div>
                                    <h4 className="font-bold text-white leading-none">QQQ</h4>
                                    <span className="text-xs text-text-secondary">Invesco QQQ</span>
                                </div>
                            </div>
                            <span className="bg-blue-400/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">The ETF</span>
                        </div>
                        <div className="mb-4">
                            <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                                $440.12 
                                <span className="text-sm text-primary font-medium flex items-center">
                                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 1.1%
                                </span>
                            </div>
                        </div>
                         <div className="p-3 bg-background-dark rounded-xl border border-border-dark/50">
                            <p className="text-xs text-text-secondary flex items-start gap-2">
                                <span className="material-symbols-outlined text-[16px] text-blue-400 shrink-0">layers</span>
                                One-click diversification across top 100 non-financial tech companies.
                            </p>
                        </div>
                    </div>
                </div>
             </section>

             {/* Sector Watch & Watchlist Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative bg-surface-dark border border-border-dark rounded-2xl p-8 overflow-hidden group">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-background-dark to-transparent"></div>
                    <div className="relative z-10 flex flex-col items-start h-full justify-center">
                        <div className="mb-4 bg-background-dark p-3 rounded-xl border border-border-dark text-primary shadow-lg">
                            <span className="material-symbols-outlined text-3xl">radar</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Sector Watch</h3>
                        <p className="text-text-secondary mb-6 max-w-xs">See which market sectors are winning today and spot rotating capital.</p>
                        <button onClick={() => setActivePage('market-analysis')} className="px-6 py-3 bg-white text-background-dark font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                            Explore Sectors <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">Your Watchlist</h3>
                        <button onClick={() => setActivePage('watchlist')} className="p-1 hover:bg-white/10 rounded transition-colors text-text-secondary">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center justify-between p-3 hover:bg-background-dark rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></div>
                                <div>
                                    <p className="text-sm font-bold text-white">TSLA</p>
                                    <p className="text-xs text-text-secondary">Tesla Inc</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-white">$175.40</p>
                                <p className="text-xs text-red-400">-1.2%</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 hover:bg-background-dark rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 rounded-full bg-border-dark group-hover:bg-white transition-colors"></div>
                                <div>
                                    <p className="text-sm font-bold text-white">AAPL</p>
                                    <p className="text-xs text-text-secondary">Apple Inc</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-white">$169.10</p>
                                <p className="text-xs text-primary">+0.5%</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 hover:bg-background-dark rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 rounded-full bg-border-dark group-hover:bg-white transition-colors"></div>
                                <div>
                                    <p className="text-sm font-bold text-white">AMD</p>
                                    <p className="text-xs text-text-secondary">Adv Micro Devices</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-white">$180.20</p>
                                <p className="text-xs text-primary">+3.8%</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border-dark/50 text-center">
                        <button onClick={() => setActivePage('watchlist')} className="text-xs font-bold text-text-secondary hover:text-white uppercase tracking-wider">View Full List</button>
                    </div>
                </div>
            </section>
        </div>
    </div>
  );
};

// 2. Market Analysis Page
const MarketAnalysis = () => {
  return (
    <div className="p-4 lg:p-10 pb-32">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-border-dark pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Market Analysis</h1>
                    <p className="text-text-secondary">Global overview, sector rotation, and daily movers.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary/70">
                    <span className="material-symbols-outlined text-[14px]">update</span>
                    <span>Live Data</span>
                </div>
            </div>

            {/* Global Snapshot */}
            <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">public</span>
                    Global Snapshot
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'S&P 500', val: '5,245.12', change: '1.2%', up: true, color: 'text-primary' },
                        { label: 'Nasdaq-100', val: '18,340.50', change: '1.8%', up: true, color: 'text-primary' },
                        { label: 'Dow Jones', val: '39,450.22', change: '0.1%', up: false, color: 'text-red-500' },
                        { label: 'Gold (oz)', val: '$2,380.10', change: '0.5%', up: true, color: 'text-primary' },
                        { label: '10Y Yield', val: '4.21%', change: '1.5%', up: false, color: 'text-red-500' },
                        { label: 'VIX', val: '13.45', change: '4.2%', up: false, color: 'text-red-500' },
                    ].map((item, i) => (
                        <div key={i} className="bg-surface-dark border border-border-dark rounded-xl p-4 hover:border-border-dark/80 transition-colors">
                            <div className="text-xs text-text-secondary font-bold uppercase mb-1">{item.label}</div>
                            <div className="text-xl font-bold text-white mb-1">{item.val}</div>
                            <div className={`flex items-center gap-1 ${item.color} text-xs font-bold`}>
                                <span className="material-symbols-outlined text-[14px]">{item.up ? 'arrow_upward' : 'arrow_downward'}</span> {item.change}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sector Flow */}
            <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">pie_chart</span>
                    Sector Flow
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Winning Sectors */}
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span> Winning Sectors
                        </h3>
                        <div className="flex flex-col gap-4">
                            {[
                                { name: 'Technology (XLK)', change: '+2.1%', width: '80%', opacity: '100%' },
                                { name: 'Comm. Services (XLC)', change: '+1.8%', width: '65%', opacity: '80%' },
                                { name: 'Cons. Discretionary (XLY)', change: '+1.2%', width: '45%', opacity: '60%' },
                            ].map((item, i) => (
                                <div key={i} className="relative">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-medium">{item.name}</span>
                                        <span className="text-primary font-bold">{item.change}</span>
                                    </div>
                                    <div className="h-2 w-full bg-background-dark rounded-full overflow-hidden">
                                        <div className={`h-full bg-primary rounded-full`} style={{ width: item.width, opacity: item.opacity === '100%' ? 1 : item.opacity === '80%' ? 0.8 : 0.6 }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     {/* Losing Sectors */}
                     <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Losing Sectors
                        </h3>
                        <div className="flex flex-col gap-4">
                             {[
                                { name: 'Energy (XLE)', change: '-1.2%', width: '50%', opacity: '100%' },
                                { name: 'Real Estate (XLRE)', change: '-0.8%', width: '30%', opacity: '80%' },
                                { name: 'Utilities (XLU)', change: '-0.5%', width: '20%', opacity: '60%' },
                            ].map((item, i) => (
                                <div key={i} className="relative">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-medium">{item.name}</span>
                                        <span className="text-red-500 font-bold">{item.change}</span>
                                    </div>
                                    <div className="h-2 w-full bg-background-dark rounded-full overflow-hidden">
                                        <div className={`h-full bg-red-500 rounded-full`} style={{ width: item.width, opacity: item.opacity === '100%' ? 1 : item.opacity === '80%' ? 0.8 : 0.6 }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Movers */}
            <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">swap_vert</span>
                    Top Movers
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gainers */}
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-0 overflow-hidden">
                        <div className="p-4 border-b border-border-dark bg-background-dark/50">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">rocket_launch</span> 🚀 Gainers
                            </h3>
                        </div>
                        <div className="p-2">
                            <table className="w-full text-sm text-left">
                                <tbody className="divide-y divide-border-dark">
                                    {[
                                        { sym: 'NVDA', price: '$895.32', change: '+4.2%' },
                                        { sym: 'SMCI', price: '$940.10', change: '+3.8%' },
                                        { sym: 'AMD', price: '$180.20', change: '+3.1%' },
                                        { sym: 'ARM', price: '$125.40', change: '+2.9%' },
                                    ].map((s, i) => (
                                        <tr key={i} className="group hover:bg-background-dark/50 transition-colors">
                                            <td className="p-3 font-bold text-white">{s.sym}</td>
                                            <td className="p-3 text-right text-text-secondary">{s.price}</td>
                                            <td className="p-3 text-right text-primary font-bold">{s.change}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Losers */}
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-0 overflow-hidden">
                        <div className="p-4 border-b border-border-dark bg-background-dark/50">
                            <h3 className="font-bold text-red-500 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">trending_down</span> 📉 Losers
                            </h3>
                        </div>
                        <div className="p-2">
                             <table className="w-full text-sm text-left">
                                <tbody className="divide-y divide-border-dark">
                                    {[
                                        { sym: 'LULU', price: '$350.12', change: '-6.5%' },
                                        { sym: 'TSLA', price: '$170.40', change: '-3.2%' },
                                        { sym: 'NKE', price: '$92.15', change: '-2.8%' },
                                        { sym: 'XOM', price: '$112.30', change: '-1.9%' },
                                    ].map((s, i) => (
                                        <tr key={i} className="group hover:bg-background-dark/50 transition-colors">
                                            <td className="p-3 font-bold text-white">{s.sym}</td>
                                            <td className="p-3 text-right text-text-secondary">{s.price}</td>
                                            <td className="p-3 text-right text-red-500 font-bold">{s.change}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Most Active */}
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-0 overflow-hidden">
                        <div className="p-4 border-b border-border-dark bg-background-dark/50">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">volume_up</span> Most Active
                            </h3>
                        </div>
                        <div className="p-2">
                             <table className="w-full text-sm text-left">
                                <tbody className="divide-y divide-border-dark">
                                    {[
                                        { sym: 'SOFI', vol: '45M Vol', change: '+1.2%', color: 'text-primary' },
                                        { sym: 'PLTR', vol: '32M Vol', change: '+2.4%', color: 'text-primary' },
                                        { sym: 'MARA', vol: '28M Vol', change: '-4.1%', color: 'text-red-500' },
                                        { sym: 'AAPL', vol: '25M Vol', change: '0.0%', color: 'text-text-secondary' },
                                    ].map((s, i) => (
                                        <tr key={i} className="group hover:bg-background-dark/50 transition-colors">
                                            <td className="p-3 font-bold text-white">{s.sym}</td>
                                            <td className="p-3 text-right text-text-secondary">{s.vol}</td>
                                            <td className={`p-3 text-right ${s.color} font-bold`}>{s.change}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

             {/* Market Summary */}
            <section className="bg-gradient-to-br from-surface-dark to-background-dark border border-border-dark rounded-2xl p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Market Summary</h3>
                        <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                            Stocks are rallying today due to <span className="text-primary underline decoration-primary/30 underline-offset-4">unexpectedly low inflation reports</span>, signaling potential rate cuts.
                        </p>
                    </div>
                    <div className="w-px bg-border-dark hidden md:block"></div>
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Key Headlines</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0"></span>
                                <span className="text-sm text-white/80">Fed Chair Powell hints at "dovish pivot" in next meeting minutes.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0"></span>
                                <span className="text-sm text-white/80">Semiconductor sector surges as AI demand forecast doubles for Q3.</span>
                            </li>
                             <li className="flex items-start gap-3">
                                <span className="mt-1.5 size-1.5 rounded-full bg-red-500 shrink-0"></span>
                                <span className="text-sm text-white/80">Oil prices dip below $80/barrel amidst rising global supply concerns.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    </div>
  );
};

// 3. Portfolio Page
const Portfolio = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Using simple mock data to match HTML structure
    const holdings = [
        { sym: 'NVDA', name: 'Nvidia Corp', qty: 10, cost: 400.00, price: 450.00, total: 4500.00, pl: 500.00, plPerc: 12.5, color: 'NV' },
        { sym: 'AAPL', name: 'Apple Inc', qty: 25, cost: 175.00, price: 172.50, total: 4312.50, pl: -62.50, plPerc: -1.4, color: 'AP' },
        { sym: 'VOO', name: 'Vanguard S&P 500', qty: 8, cost: 420.00, price: 454.68, total: 3637.50, pl: 277.44, plPerc: 8.2, color: 'VO' },
    ];

    return (
        <div className="p-4 lg:p-10 pb-32">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-end justify-between border-b border-border-dark pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Portfolio Tracker</h1>
                        <p className="text-text-secondary">Manage your holdings and track performance.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary/70">
                        <span className="material-symbols-outlined text-[14px]">update</span>
                        <span>Last updated: Just now</span>
                    </div>
                </div>

                {/* Hero Section */}
                <section>
                    <div className="bg-gradient-to-br from-surface-dark to-background-dark border border-border-dark rounded-2xl p-6 lg:p-8 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/5 blur-3xl rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                            <div className="flex flex-col gap-2">
                                <span className="text-text-secondary text-sm font-semibold uppercase tracking-wider">Total Portfolio Value</span>
                                <div className="text-5xl md:text-6xl font-bold text-white tracking-tight">$12,450.00</div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                                <div className="flex flex-col gap-1">
                                    <span className="text-text-secondary text-xs font-semibold uppercase">Total Gain/Loss</span>
                                    <div className="text-2xl font-bold text-primary flex items-center gap-2">
                                        +$1,200.00
                                        <span className="text-sm bg-primary/10 px-2 py-0.5 rounded-full">+10.6%</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-text-secondary text-xs font-semibold uppercase">Today's Gain/Loss</span>
                                    <div className="text-2xl font-bold text-primary flex items-center gap-2">
                                        +$150.00
                                        <span className="text-sm bg-primary/10 px-2 py-0.5 rounded-full">Today</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Action & Chart Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Transaction Card */}
                    <div className="lg:col-span-1 bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col justify-center items-start gap-4 h-full min-h-[250px]">
                        <div className="mb-2">
                            <h3 className="text-white text-lg font-bold mb-1">Add New Transaction</h3>
                            <p className="text-text-secondary text-sm">Record a buy or sell order to update your portfolio.</p>
                        </div>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            Add Transaction
                        </button>
                    </div>

                    {/* Allocation Breakdown */}
                    <div className="lg:col-span-2 bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col md:flex-row items-center justify-around gap-8 h-full min-h-[250px]">
                        <div className="relative size-48 shrink-0">
                            {/* Replicating the conic gradient from HTML using inline styles for exact visual match */}
                            <div className="w-full h-full rounded-full" style={{ background: 'conic-gradient(#46ec13 0% 65%, #2c3928 65% 100%)' }}></div>
                            <div className="absolute inset-4 bg-surface-dark rounded-full flex items-center justify-center">
                                <div className="text-center">
                                    <span className="block text-text-secondary text-xs font-bold uppercase">Asset Mix</span>
                                    <span className="block text-white font-bold text-lg">Growth</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            <h3 className="text-white font-bold mb-2">Allocation Breakdown</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                                <div className="flex-1 flex justify-between gap-8 text-sm">
                                    <span className="text-white">Stocks (Growth)</span>
                                    <span className="text-primary font-bold">65%</span>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-border-dark"></div>
                                <div className="flex-1 flex justify-between gap-8 text-sm">
                                    <span className="text-white">ETFs (Stability)</span>
                                    <span className="text-text-secondary font-bold">35%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Holdings Table */}
                <section>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">list_alt</span>
                        Current Holdings
                    </h2>
                    <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-background-dark border-b border-border-dark text-text-secondary uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Ticker / Name</th>
                                        <th className="px-6 py-4 font-bold text-right">Qty</th>
                                        <th className="px-6 py-4 font-bold text-right">Avg Cost</th>
                                        <th className="px-6 py-4 font-bold text-right">Current Price</th>
                                        <th className="px-6 py-4 font-bold text-right">Total Value</th>
                                        <th className="px-6 py-4 font-bold text-right">Profit / Loss</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-dark text-white">
                                    {holdings.map((h, i) => (
                                        <tr key={i} className="group hover:bg-background-dark/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-border-dark flex items-center justify-center text-xs font-bold">{h.color}</div>
                                                    <div>
                                                        <div className="font-bold">{h.sym}</div>
                                                        <div className="text-text-secondary text-xs">{h.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">{h.qty}</td>
                                            <td className="px-6 py-4 text-right text-text-secondary">${h.cost.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-medium">${h.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-medium">${h.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className={`font-bold ${h.pl >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                                    {h.pl >= 0 ? '+' : '-'}${Math.abs(h.pl).toFixed(2)}
                                                </div>
                                                <div className={`text-xs ${h.pl >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                                    {h.pl >= 0 ? '+' : ''}{h.plPerc}%
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div 
                            className="fixed inset-0 bg-black/80 transition-opacity" 
                            aria-hidden="true" 
                            onClick={() => setShowAddModal(false)}
                        ></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-surface-dark border border-border-dark rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-surface-dark px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-bold text-white mb-4" id="modal-title">Add Transaction</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-1">Ticker Symbol</label>
                                                <input className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="text" placeholder="e.g. MSFT" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-text-secondary mb-1">Quantity</label>
                                                    <input className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="number" placeholder="0" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-text-secondary mb-1">Buy Price</label>
                                                    <input className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="number" placeholder="$0.00" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-background-dark px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-border-dark">
                                <button 
                                    type="button" 
                                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-bold text-black hover:bg-primary-hover focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Add Asset
                                </button>
                                <button 
                                    type="button" 
                                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-border-dark shadow-sm px-4 py-2 bg-transparent text-base font-medium text-text-secondary hover:text-white hover:bg-white/5 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// 4. Strategy Simulator Page
const StrategySimulator = () => {
    const [risk, setRisk] = useState(75);
    const [timeHorizon, setTimeHorizon] = useState(60);

    return (
        <div className="flex-1 overflow-hidden relative flex flex-col h-full">
            <style>{`
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #46ec13;
                    cursor: pointer;
                    margin-top: -8px;
                    box-shadow: 0 0 10px rgba(70, 236, 19, 0.5);
                }
                input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 4px;
                    cursor: pointer;
                    background: #2c3928;
                    border-radius: 2px;
                }
                input[type=range]::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border: none;
                    border-radius: 50%;
                    background: #46ec13;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(70, 236, 19, 0.5);
                }
                input[type=range]::-moz-range-track {
                    width: 100%;
                    height: 4px;
                    cursor: pointer;
                    background: #2c3928;
                    border-radius: 2px;
                }
            `}</style>
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-32">
                <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 flex flex-col h-full">
                        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 lg:p-8 flex flex-col gap-8 h-full shadow-sm">
                            <div>
                                <h4 className="text-text-secondary uppercase text-xs font-bold tracking-wider mb-2">Tuning Configuration</h4>
                                <h3 className="text-2xl font-bold text-white">Tech Momentum Titans</h3>
                                <p className="text-sm text-text-secondary mt-1">Adjust parameters to simulate performance.</p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-bold text-white">Risk Tolerance</label>
                                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">High Volatility</span>
                                </div>
                                <div className="relative py-2">
                                    <input 
                                        className="w-full appearance-none bg-transparent focus:outline-none" 
                                        max="100" 
                                        min="0" 
                                        type="range" 
                                        value={risk}
                                        onChange={(e) => setRisk(Number(e.target.value))}
                                    />
                                    <div className="flex justify-between mt-2 text-xs font-medium text-text-secondary">
                                        <span className="flex items-center gap-1">Safe 🛡️</span>
                                        <span className="flex items-center gap-1">Aggressive 🚀</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 bg-background-dark/50 p-3 rounded-lg border border-border-dark">
                                    <span className="material-symbols-outlined text-orange-400 text-sm mt-0.5">warning</span>
                                    <p className="text-xs text-text-secondary">Simulating with <strong>Aggressive</strong> settings. Expect significant price swings and higher standard deviation.</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 border-t border-border-dark pt-8">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-bold text-white">Time Horizon</label>
                                    <span className="text-xs text-white bg-white/10 px-2 py-1 rounded">5+ Years</span>
                                </div>
                                <div className="relative py-2">
                                    <input 
                                        className="w-full appearance-none bg-transparent focus:outline-none" 
                                        max="100" 
                                        min="0" 
                                        type="range" 
                                        value={timeHorizon}
                                        onChange={(e) => setTimeHorizon(Number(e.target.value))}
                                    />
                                    <div className="flex justify-between mt-2 text-xs font-medium text-text-secondary">
                                        <span>Short Term</span>
                                        <span>Long Term</span>
                                    </div>
                                </div>
                                <p className="text-xs text-text-secondary">Longer horizons allow for compounding to recover from short-term drawdowns.</p>
                            </div>
                            <div className="mt-auto pt-8">
                                <button className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-border-dark text-text-secondary hover:text-white hover:bg-white/5 hover:border-text-secondary/30 transition-all text-sm font-medium">
                                    <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                                    Reset to Template Defaults
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 lg:p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-2">Asset Allocation Comparison</h3>
                                    <p className="text-sm text-text-secondary">Visualize how the simulated strategy shifts your exposure compared to your current baseline.</p>
                                </div>
                                <div className="flex gap-8 md:gap-12">
                                    <div className="flex flex-col items-center gap-3 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                                        <div className="relative size-28">
                                            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" fill="none" r="40" stroke="#2c3928" strokeWidth="12"></circle>
                                                <circle cx="50" cy="50" fill="none" r="40" stroke="#a3b99d" strokeDasharray="100 251" strokeWidth="12"></circle>
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-text-secondary">Base</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Current</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="relative size-32">
                                            <svg className="size-full -rotate-90 drop-shadow-[0_0_15px_rgba(70,236,19,0.3)]" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" fill="none" r="40" stroke="#2c3928" strokeWidth="12"></circle>
                                                <circle cx="50" cy="50" fill="none" r="40" stroke="#46ec13" strokeDasharray="210 251" strokeWidth="12"></circle>
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-sm font-bold text-white">New</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Simulated</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 lg:p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Projected Outcomes &amp; Risk Profile</h3>
                                    <p className="text-sm text-text-secondary">5-Year "Cone of Possibility" Forecast</p>
                                </div>
                                <div className="flex gap-4 text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-sm bg-text-secondary/50"></span>
                                        <span className="text-text-secondary">Current Baseline</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-sm bg-primary"></span>
                                        <span className="text-white">Simulated Range</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-[200px] relative mb-8">
                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 300">
                                    <line stroke="#2c3928" strokeDasharray="4" strokeWidth="1" x1="0" x2="800" y1="50" y2="50"></line>
                                    <line stroke="#2c3928" strokeDasharray="4" strokeWidth="1" x1="0" x2="800" y1="150" y2="150"></line>
                                    <line stroke="#2c3928" strokeDasharray="4" strokeWidth="1" x1="0" x2="800" y1="250" y2="250"></line>
                                    <path d="M0,250 C200,240 400,230 800,200" fill="none" stroke="#52525b" strokeDasharray="8" strokeWidth="2"></path>
                                    <path d="M0,250 C200,220 400,100 800,20 L800,280 C400,270 200,260 0,250 Z" fill="rgba(70, 236, 19, 0.1)"></path>
                                    <path d="M0,250 C200,200 400,150 800,80" fill="none" stroke="#46ec13" strokeWidth="3"></path>
                                    <circle cx="800" cy="80" fill="#46ec13" r="4"></circle>
                                    <text fill="#a3b99d" fontSize="12" x="10" y="40">+80%</text>
                                    <text fill="#a3b99d" fontSize="12" x="10" y="140">+30%</text>
                                    <text fill="#a3b99d" fontSize="12" x="10" y="240">0%</text>
                                    <text fill="#a3b99d" fontSize="12" x="750" y="290">Year 5</text>
                                </svg>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-background-dark border border-border-dark rounded-xl p-4 text-center">
                                    <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Typical Year</p>
                                    <p className="text-2xl font-bold text-primary">+12-18%</p>
                                </div>
                                <div className="bg-background-dark border border-border-dark rounded-xl p-4 text-center">
                                    <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Bad Year (Risk)</p>
                                    <p className="text-2xl font-bold text-orange-500">-15%</p>
                                </div>
                                <div className="bg-background-dark border border-border-dark rounded-xl p-4 text-center">
                                    <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Vibe</p>
                                    <p className="text-xl font-bold text-white flex items-center justify-center gap-2">
                                        High Octane <span className="text-lg">⚡</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur border-t border-border-dark p-4 lg:px-10 z-30">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="hidden sm:flex flex-col">
                        <span className="text-sm text-white font-bold">Ready to commit?</span>
                        <span className="text-xs text-text-secondary">Changes will apply to your dashboard immediately.</span>
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-3">
                        <button className="flex-1 sm:flex-none py-3 px-6 rounded-xl border border-transparent text-text-secondary font-bold hover:text-white hover:bg-white/5 transition-colors">
                            Back to Builder
                        </button>
                        <button className="flex-1 sm:flex-none py-3 px-8 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] hover:shadow-[0_0_30px_rgba(70,236,19,0.5)] flex items-center justify-center gap-2">
                            Activate This Strategy
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 5. Watchlist Page
const Watchlist = () => {
    // Enhanced dummy data to include trend for sparklines
    const stocks = [
        { sym: 'NVDA', name: 'Nvidia Corp', price: 884.50, change: 4.25, changeVal: 36.12, trendColor: '#46ec13', trendPath: "M0,35 C10,35 20,30 30,25 C40,20 50,28 60,15 C70,2 80,10 100,5" },
        { sym: 'AAPL', name: 'Apple Inc', price: 172.60, change: -1.12, changeVal: -1.95, trendColor: '#ff4d4d', trendPath: "M0,10 C10,12 20,15 30,18 C40,22 50,20 60,25 C70,30 80,35 100,38" },
        { sym: 'TSLA', name: 'Tesla Inc', price: 175.30, change: 0.85, changeVal: 1.48, trendColor: '#46ec13', trendPath: "M0,20 C10,25 20,15 30,22 C40,28 50,15 60,18 C70,12 80,10 100,5" },
        { sym: 'MSFT', name: 'Microsoft Corp', price: 421.10, change: 1.20, changeVal: 4.99, trendColor: '#46ec13', trendPath: "M0,30 C10,32 30,35 40,25 C50,15 60,18 70,12 80,10 100,2" },
        { sym: 'AMZN', name: 'Amazon.com Inc.', price: 180.25, change: -0.45, changeVal: -0.82, trendColor: '#ff4d4d', trendPath: "M0,15 C20,10 40,25 50,20 60,15 70,30 90,32 100,35" },
    ];

    const [selected, setSelected] = useState(stocks[0]);
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

    return (
        <div className="flex h-full relative">
            <TradeModal isOpen={isTradeModalOpen} onClose={() => setIsTradeModalOpen(false)} stock={selected} />
            <div className="flex-1 flex flex-col">
                <div className="border-b border-border-dark bg-background-dark/50 backdrop-blur-sm z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center px-6 lg:px-8 pt-6 pb-0 gap-4">
                        <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto no-scrollbar">
                            <button className="pb-3 border-b-2 border-primary text-white font-bold text-sm whitespace-nowrap">
                                My First List
                            </button>
                            <button className="pb-3 border-b-2 border-transparent text-text-secondary hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
                                High Dividends
                            </button>
                            <button className="pb-3 border-b-2 border-transparent text-text-secondary hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
                                Tech Growth
                            </button>
                            <button className="flex items-center gap-1 pb-3 text-primary text-sm font-bold hover:text-primary-hover transition-colors whitespace-nowrap pl-2">
                                <span className="material-symbols-outlined text-base">add</span>
                                New List
                            </button>
                        </div>
                        <div className="flex items-center gap-3 mb-3 w-full md:w-auto">
                            <div className="relative group flex-1 md:w-64">
                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary group-focus-within:text-white transition-colors">search</span>
                                <input className="w-full bg-surface-dark border border-border-dark rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-text-secondary/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Search ticker..." type="text"/>
                            </div>
                            <div className="hidden xl:flex items-center gap-2 bg-surface-dark rounded-xl p-1 border border-border-dark">
                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white shadow-sm">All</button>
                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors">Gainers</button>
                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors">Losers</button>
                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors">Vol</button>
                            </div>
                            <button className="xl:hidden p-2.5 bg-surface-dark border border-border-dark rounded-xl text-text-secondary hover:text-white">
                                <span className="material-symbols-outlined">filter_list</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden flex">
                    <div className="flex-1 overflow-y-auto p-0 scroll-smooth">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-surface-dark sticky top-0 z-10 text-xs uppercase text-text-secondary font-bold tracking-wider">
                                <tr>
                                    <th className="py-4 px-6 lg:px-8 border-b border-border-dark">Asset</th>
                                    <th className="py-4 px-6 border-b border-border-dark text-right">Price</th>
                                    <th className="py-4 px-6 border-b border-border-dark text-right">Today's Change</th>
                                    <th className="hidden md:table-cell py-4 px-6 lg:px-8 border-b border-border-dark w-48">Trend (7D)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-dark">
                                {stocks.map(s => (
                                    <tr 
                                        key={s.sym} 
                                        onClick={() => setSelected(s)}
                                        className={`group hover:bg-white/5 transition-colors cursor-pointer ${selected.sym === s.sym ? 'bg-white/[0.05]' : 'bg-white/[0.02]'}`}
                                    >
                                        <td className="py-4 px-6 lg:px-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`size-10 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ${['NVDA', 'MSFT', 'TSLA'].includes(s.sym) ? 'bg-white text-black' : s.sym === 'AMZN' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-black'}`}>
                                                    {s.sym}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-base">{s.sym}</span>
                                                    <span className="text-text-secondary text-xs">{s.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="font-mono text-white font-medium">${s.price.toFixed(2)}</div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="inline-flex flex-col items-end">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold mb-1 ${s.change >= 0 ? 'bg-primary/10 text-primary' : 'bg-danger-surface text-danger'}`}>
                                                    {s.change > 0 ? '+' : ''}{s.change}%
                                                </span>
                                                <span className={`text-xs ${s.change >= 0 ? 'text-primary' : 'text-danger'}`}>
                                                    {s.change > 0 ? '+' : ''}${Math.abs(s.changeVal).toFixed(2)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell py-4 px-6 lg:px-8 relative">
                                            <div className="w-32 h-10 group-hover:hidden transition-all">
                                                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                                                    <path d={s.trendPath} fill="none" stroke={s.trendColor} strokeWidth="2"></path>
                                                </svg>
                                            </div>
                                            <div className="hidden group-hover:flex absolute inset-0 items-center justify-end px-6 lg:px-8 gap-3 bg-gradient-to-l from-background-dark via-background-dark to-transparent">
                                                <button className="size-9 flex items-center justify-center rounded-lg border border-border-dark text-text-secondary hover:text-danger hover:border-danger hover:bg-danger-surface transition-all bg-surface-dark">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); setIsTradeModalOpen(true); }} className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-black font-bold text-sm shadow-[0_0_15px_rgba(70,236,19,0.3)] transition-all flex items-center gap-1">
                                                    Buy
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Detail Panel */}
                    <div className="w-96 border-l border-border-dark bg-surface-dark/50 backdrop-blur-md hidden xl:flex flex-col shrink-0">
                        <div className="p-6 flex flex-col h-full overflow-y-auto">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-white flex items-center justify-center text-black font-bold text-sm shadow-lg">{selected.sym}</div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white leading-none">{selected.sym}</h3>
                                        <p className="text-sm text-text-secondary">{selected.name}</p>
                                    </div>
                                </div>
                                <button className="text-text-secondary hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-bold text-white">${selected.price.toFixed(2)}</span>
                                        <span className={`text-sm font-medium flex items-center gap-1 ${selected.change >= 0 ? 'text-primary' : 'text-danger'}`}>
                                            <span className="material-symbols-outlined text-sm">{selected.change >= 0 ? 'trending_up' : 'trending_down'}</span>
                                            {selected.change > 0 ? '+' : ''}{selected.change}% Today
                                        </span>
                                    </div>
                                    <div className="flex bg-background-dark rounded-lg p-1 border border-border-dark">
                                        <button className="px-2 py-1 text-[10px] font-bold text-black bg-primary rounded">1D</button>
                                        <button className="px-2 py-1 text-[10px] font-bold text-text-secondary hover:text-white">1W</button>
                                        <button className="px-2 py-1 text-[10px] font-bold text-text-secondary hover:text-white">1M</button>
                                    </div>
                                </div>
                                <div className="h-32 w-full relative">
                                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                                <stop offset="0%" style={{stopColor: selected.change >= 0 ? '#46ec13' : '#ff4d4d', stopOpacity: 1}}></stop>
                                                <stop offset="100%" style={{stopColor: selected.change >= 0 ? '#46ec13' : '#ff4d4d', stopOpacity: 0}}></stop>
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,50 L0,40 C10,40 20,35 30,42 C40,48 50,30 60,20 C70,10 80,15 90,5 L100,0 L100,50 Z" fill="url(#gradient)" opacity="0.2"></path>
                                        <path d="M0,40 C10,40 20,35 30,42 C40,48 50,30 60,20 C70,10 80,15 90,5 L100,0" fill="none" stroke={selected.change >= 0 ? '#46ec13' : '#ff4d4d'} strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                                    </svg>
                                </div>
                            </div>
                            <div className="mb-8">
                                <h4 className="text-xs uppercase text-text-secondary font-bold tracking-wider mb-4">Key Vitals</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-background-dark border border-border-dark">
                                        <p className="text-[10px] text-text-secondary uppercase mb-1">Market Cap</p>
                                        <p className="text-sm font-bold text-white">$2.2T</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-background-dark border border-border-dark">
                                        <p className="text-[10px] text-text-secondary uppercase mb-1">P/E Ratio</p>
                                        <p className="text-sm font-bold text-white">72.4</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-background-dark border border-border-dark">
                                        <p className="text-[10px] text-text-secondary uppercase mb-1">Div Yield</p>
                                        <p className="text-sm font-bold text-white">0.02%</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-background-dark border border-border-dark">
                                        <p className="text-[10px] text-text-secondary uppercase mb-1">Vol (Avg)</p>
                                        <p className="text-sm font-bold text-white">45M</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-8 flex-1">
                                <h4 className="text-xs uppercase text-text-secondary font-bold tracking-wider mb-4">Latest News</h4>
                                <div className="group cursor-pointer">
                                    <div className="flex gap-3 mb-2">
                                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">AI &amp; Chips</span>
                                        <span className="text-[10px] text-text-secondary">2h ago</span>
                                    </div>
                                    <p className="text-sm font-medium text-white group-hover:text-primary transition-colors leading-relaxed">
                                        Nvidia unveils new Blackwell GPU architecture, promising 30x performance increase for LLM inference workloads.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-border-dark">
                                <button onClick={() => setIsTradeModalOpen(true)} className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] hover:shadow-[0_0_30px_rgba(70,236,19,0.5)] flex items-center justify-center gap-2">
                                    Trade {selected.sym}
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// 6. Settings Page (Simplified)
const Settings = () => {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="p-4 lg:p-10 pb-32 max-w-3xl mx-auto flex flex-col gap-8">
             <style>{`
                details > summary {
                    list-style: none;
                }
                details > summary::-webkit-details-marker {
                    display: none;
                }
                details[open] summary ~ * {
                    animation: sweep .3s ease-in-out;
                }
                @keyframes sweep {
                    0%    {opacity: 0; transform: translateY(-10px)}
                    100%  {opacity: 1; transform: translateY(0)}
                }
                details[open] summary .accordion-icon {
                    transform: rotate(180deg);
                }
            `}</style>
            
            <section className="flex flex-col gap-6" id="general">
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="h-24 w-24 rounded-full bg-background-dark border-2 border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-3xl font-bold text-primary">AM</span>
                    </div>
                    <div className="flex-1 text-center md:text-left w-full">
                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                            <h2 className="text-2xl font-bold text-white">Alex Morgan</h2>
                            <span className="px-3 py-1 rounded-full bg-primary text-background-dark text-xs font-bold tracking-wide">PRO PLAN</span>
                        </div>
                        <p className="text-text-secondary mb-6">alex@example.com</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-left">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Display Name</label>
                                <input className="bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" type="text" defaultValue="Alex Morgan"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Email</label>
                                <input className="bg-background-dark/50 border border-border-dark/50 rounded-lg px-3 py-2 text-sm text-text-secondary cursor-not-allowed" disabled readOnly type="email" value="alex@example.com"/>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-border-dark">
                            <a className="text-xs text-text-secondary hover:text-primary transition-colors flex items-center gap-1 group" href="#">
                                Looking to change your investment approach? Go to Strategy Lab.
                            </a>
                            <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-primary text-background-dark font-bold text-sm hover:bg-primary-hover transition-colors flex items-center gap-2">
                                {saved && <span className="material-symbols-outlined text-[18px]">check</span>}
                                {saved ? 'Saved' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <details className="group bg-surface-dark border border-border-dark rounded-2xl overflow-hidden transition-all duration-300 open:ring-1 open:ring-primary/20" open>
                <summary className="flex items-center justify-between p-6 cursor-pointer select-none hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">tune</span>
                        <h3 className="text-lg font-bold text-white">Preferences</h3>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary accordion-icon transition-transform duration-300">expand_more</span>
                </summary>
                <div className="px-6 pb-8 pt-2 border-t border-border-dark/50">
                    <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Regional Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white" htmlFor="currency">Base Currency</label>
                            <div className="relative">
                                <select className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none" id="currency">
                                    <option>USD - US Dollar ($)</option>
                                    <option>EUR - Euro (€)</option>
                                    <option>GBP - British Pound (£)</option>
                                    <option>INR - Indian Rupee (₹)</option>
                                    <option>JPY - Japanese Yen (¥)</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-3.5 text-text-secondary pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white" htmlFor="timezone">Time Zone</label>
                            <div className="relative">
                                <select className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none" id="timezone">
                                    <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                                    <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                                    <option>(GMT+00:00) London</option>
                                    <option>(GMT+01:00) Paris</option>
                                    <option>(GMT+09:00) Tokyo</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-3.5 text-text-secondary pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>
            </details>

            <details className="group bg-surface-dark border border-border-dark rounded-2xl overflow-hidden transition-all duration-300 open:ring-1 open:ring-primary/20">
                <summary className="flex items-center justify-between p-6 cursor-pointer select-none hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">security</span>
                        <h3 className="text-lg font-bold text-white">Security</h3>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary accordion-icon transition-transform duration-300">expand_more</span>
                </summary>
                <div className="px-6 pb-8 pt-2 border-t border-border-dark/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col justify-between h-full">
                            <div>
                                <h4 className="text-base font-bold text-white mb-2">Password</h4>
                                <p className="text-sm text-text-secondary mb-4">Update your password to keep your account secure.</p>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border-dark hover:bg-white/5 hover:border-text-secondary/50 transition-colors text-white font-medium">
                                Change Password
                            </button>
                        </div>
                        <div className="flex flex-col justify-between h-full pt-6 md:pt-0 md:border-l border-border-dark md:pl-8">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h4 className="text-base font-bold text-white mb-2">2-Step Verification</h4>
                                    <p className="text-sm text-text-secondary">Add an extra layer of security to your account.</p>
                                </div>
                                <div className="relative inline-flex items-center cursor-not-allowed opacity-70" title="Coming Soon">
                                    <input className="sr-only peer" disabled type="checkbox" value=""/>
                                    <div className="w-11 h-6 bg-border-dark rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-text-secondary after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-auto p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="material-symbols-outlined text-text-secondary text-sm">info</span>
                                <span className="text-xs text-text-secondary font-medium">(Coming Soon) 2FA implementation in progress</span>
                            </div>
                        </div>
                    </div>
                </div>
            </details>

            <details className="group bg-surface-dark border border-border-dark rounded-2xl overflow-hidden transition-all duration-300 open:ring-1 open:ring-primary/20">
                <summary className="flex items-center justify-between p-6 cursor-pointer select-none hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">credit_card</span>
                        <h3 className="text-lg font-bold text-white">Subscription</h3>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary accordion-icon transition-transform duration-300">expand_more</span>
                </summary>
                <div className="px-6 pb-8 pt-2 border-t border-border-dark/50 relative">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-background-dark/50 border border-border-dark">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full hidden sm:block">
                                <span className="material-symbols-outlined text-primary">diamond</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-lg font-bold text-white">Trade X Pro</h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-primary text-primary bg-primary/5">Active</span>
                                </div>
                                <p className="text-sm text-text-secondary">Renews on <span className="text-white">Jan 15, 2026</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-white">$9.99</span>
                                <span className="text-xs text-text-secondary">/ month</span>
                            </div>
                            <button className="px-5 py-2.5 rounded-lg border border-border-dark text-text-secondary hover:text-white hover:border-white/50 bg-surface-dark hover:bg-background-dark transition-all font-medium text-sm whitespace-nowrap shadow-sm">
                                Manage Subscription
                            </button>
                        </div>
                    </div>
                </div>
            </details>
        </div>
    );
};

// 7. Strategy Builder (Simple Selection)
const StrategyBuilder = ({ setActivePage }: { setActivePage: (p: Page) => void }) => (
    <div className="p-4 lg:p-10 pb-32 max-w-7xl mx-auto flex flex-col gap-10">
         <section>
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">What is your main focus right now?</h1>
                <p className="text-text-secondary">Select an intent to filter the best strategies for your goals.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative group cursor-pointer bg-surface-dark border-2 border-primary shadow-[0_0_20px_rgba(70,236,19,0.2)] rounded-2xl p-6 lg:p-8 transition-all hover:-translate-y-1">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Selected</div>
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[32px] fill-1">rocket_launch</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Maximize Growth</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">I'm okay with higher volatility if it means maximizing potential returns in the long run.</p>
                        </div>
                    </div>
                </div>
                <div className="group cursor-pointer bg-surface-dark border border-border-dark hover:border-text-secondary/50 rounded-2xl p-6 lg:p-8 transition-all hover:-translate-y-1 hover:bg-surface-dark/80">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="size-16 rounded-full bg-border-dark group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-text-secondary group-hover:text-primary text-[32px]">savings</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white">Stability & Income</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">I prefer steady returns and dividends with minimal risk to my principal capital.</p>
                        </div>
                    </div>
                </div>
                <div className="group cursor-pointer bg-surface-dark border border-border-dark hover:border-text-secondary/50 rounded-2xl p-6 lg:p-8 transition-all hover:-translate-y-1 hover:bg-surface-dark/80">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="size-16 rounded-full bg-border-dark group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-text-secondary group-hover:text-primary text-[32px]">balance</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white">Balanced Approach</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">I want a healthy mix of growth and safety, adapting to market conditions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="flex flex-col gap-6 pt-6 border-t border-border-dark/50">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Top Strategies for Growth</h2>
                <div className="flex gap-2">
                    <button className="size-10 rounded-full border border-border-dark flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="size-10 rounded-full border border-border-dark flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors group">
                    <div className="p-6 flex flex-col gap-4 flex-1">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Trending</span>
                                <div className="flex items-center gap-0.5" title="Risk Level: High">
                                    <span className="material-symbols-outlined text-orange-500 text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-orange-500 text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-orange-500 text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-orange-500 text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-border-dark text-[18px] fill-1">local_fire_department</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white">Tech Momentum Titans</h3>
                            <p className="text-text-secondary text-sm font-medium">Capture the AI & Semiconductor wave</p>
                        </div>
                        <div className="p-3 bg-background-dark rounded-xl border border-border-dark">
                            <div className="flex justify-between items-center text-xs mb-2 text-text-secondary font-bold uppercase">
                                <span>Asset Mix</span>
                            </div>
                            <div className="flex h-2 w-full rounded-full overflow-hidden mb-2">
                                <div className="bg-primary w-[80%]"></div>
                                <div className="bg-indigo-500 w-[20%]"></div>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary"></span>80% Stocks</span>
                                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-indigo-500"></span>20% Crypto</span>
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Aggressive allocation focusing on large-cap tech companies with high R&D spend and emerging blockchain protocols.
                        </p>
                    </div>
                    <div className="p-6 pt-0 mt-auto">
                        <button 
                            onClick={() => setActivePage('strategy-simulator')}
                            className="w-full py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary/20"
                        >
                            Select & Simulate
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors group">
                    <div className="p-6 flex flex-col gap-4 flex-1">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <span className="inline-block px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">New</span>
                                <div className="flex items-center gap-0.5" title="Risk Level: Medium-High">
                                    <span className="material-symbols-outlined text-orange-500 text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-orange-500 text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-orange-500 text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-border-dark text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-border-dark text-[18px] fill-1">local_fire_department</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white">Green Energy Future</h3>
                            <p className="text-text-secondary text-sm font-medium">Invest in global decarbonization</p>
                        </div>
                        <div className="p-3 bg-background-dark rounded-xl border border-border-dark">
                            <div className="flex justify-between items-center text-xs mb-2 text-text-secondary font-bold uppercase">
                                <span>Asset Mix</span>
                            </div>
                            <div className="flex h-2 w-full rounded-full overflow-hidden mb-2">
                                <div className="bg-teal-400 w-[90%]"></div>
                                <div className="bg-gray-500 w-[10%]"></div>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-teal-400"></span>90% Clean Tech</span>
                                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-gray-500"></span>10% Cash</span>
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Focused on solar, wind, and battery technology companies. High growth potential with moderate regulatory risk.
                        </p>
                    </div>
                    <div className="p-6 pt-0 mt-auto">
                        <button 
                            onClick={() => setActivePage('strategy-simulator')}
                            className="w-full py-3 bg-transparent border border-primary text-primary hover:bg-primary hover:text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            Select & Simulate
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors group">
                    <div className="p-6 flex flex-col gap-4 flex-1">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <span className="inline-block px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider">High Volatility</span>
                                <div className="flex items-center gap-0.5" title="Risk Level: Extreme">
                                    <span className="material-symbols-outlined text-red-500 text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-red-500 text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-red-500 text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-red-500 text-[18px] fill-1">local_fire_department</span>
                                    <span className="material-symbols-outlined text-red-500 text-[18px] fill-1">local_fire_department</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white">Web3 Aggressive</h3>
                            <p className="text-text-secondary text-sm font-medium">High-beta exposure to protocols</p>
                        </div>
                        <div className="p-3 bg-background-dark rounded-xl border border-border-dark">
                            <div className="flex justify-between items-center text-xs mb-2 text-text-secondary font-bold uppercase">
                                <span>Asset Mix</span>
                            </div>
                            <div className="flex h-2 w-full rounded-full overflow-hidden mb-2">
                                <div className="bg-indigo-500 w-[100%]"></div>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-indigo-500"></span>100% Top 10 Crypto</span>
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Pure exposure to the largest Layer-1 blockchains. Expect massive swings in both directions.
                        </p>
                    </div>
                    <div className="p-6 pt-0 mt-auto">
                        <button 
                            onClick={() => setActivePage('strategy-simulator')}
                            className="w-full py-3 bg-transparent border border-primary text-primary hover:bg-primary hover:text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            Select & Simulate
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} />;
      case 'market-analysis': return <MarketAnalysis />;
      case 'portfolio': return <Portfolio />;
      case 'strategy-simulator': return <StrategySimulator />;
      case 'watchlist': return <Watchlist />;
      case 'settings': return <Settings />;
      case 'strategy-builder': return <StrategyBuilder setActivePage={setActivePage} />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </Layout>
  );
};

export default App;