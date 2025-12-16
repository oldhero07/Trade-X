import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Page, Stock, Strategy } from './types';
import { getMarketSummary, getPortfolioInsight } from './services/geminiService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line 
} from 'recharts';

// --- Sub-components for specific pages to keep file distinct ---

// 1. Dashboard Page
const Dashboard = ({ setActivePage }: { setActivePage: (p: Page) => void }) => {
  const [summary, setSummary] = useState<string>("Loading market insights...");

  useEffect(() => {
    getMarketSummary().then(setSummary);
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
                            <h2 className="text-2xl font-bold text-white leading-tight">Market Insight</h2>
                            <p className="text-text-secondary text-sm mt-1">{summary}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary/70">
                            <span className="material-symbols-outlined text-[14px]">update</span>
                            <span>Updated Just now</span>
                        </div>
                    </div>
                </div>
                <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark flex flex-col justify-center h-full">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Asset Pulse</h3>
                    <div className="flex flex-col gap-4">
                        {[
                            { name: 'Stocks (SPY)', val: '+1.24%', color: 'text-primary', icon: 'trending_up', dot: 'bg-primary' },
                            { name: 'Gold (GLD)', val: '-0.42%', color: 'text-danger', icon: 'trending_down', dot: 'bg-danger' },
                            { name: 'Crypto (BTC)', val: '+5.10%', color: 'text-primary', icon: 'trending_up', dot: 'bg-primary' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-2 rounded-full ${item.dot} shadow-[0_0_8px_currentColor]`}></div>
                                        <span className="text-white font-bold text-sm">{item.name}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${item.color} text-sm font-mono`}>
                                        <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                                        <span>{item.val}</span>
                                    </div>
                                </div>
                                {i !== 2 && <div className="w-full h-px bg-border-dark/50 mt-4"></div>}
                            </div>
                        ))}
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
                    <button className="text-text-secondary text-sm hover:text-white transition-colors flex items-center gap-1">
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
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 hover:border-white/30 transition-all duration-300 group cursor-pointer relative overflow-hidden">
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
                    </div>
                    {/* Pick 3 */}
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 hover:border-blue-400/50 transition-all duration-300 group cursor-pointer relative overflow-hidden">
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
                    </div>
                </div>
             </section>
        </div>
    </div>
  );
};

// 2. Market Analysis Page
const MarketAnalysis = () => {
  const sectors = [
    { name: 'Technology (XLK)', val: 80, change: '+2.1%', color: '#46ec13' },
    { name: 'Comm. Services (XLC)', val: 65, change: '+1.8%', color: '#46ec13' },
    { name: 'Cons. Discretionary (XLY)', val: 45, change: '+1.2%', color: '#46ec13' },
  ];

  const losers = [
    { name: 'Energy (XLE)', val: 50, change: '-1.2%', color: '#ef4444' },
    { name: 'Real Estate (XLRE)', val: 30, change: '-0.8%', color: '#ef4444' },
    { name: 'Utilities (XLU)', val: 20, change: '-0.5%', color: '#ef4444' },
  ];

  return (
    <div className="p-4 lg:p-10 pb-32">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
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

            <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">pie_chart</span>
                    Sector Flow
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Winners */}
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span> Winning Sectors
                        </h3>
                        <div className="flex flex-col gap-4">
                            {sectors.map((s, i) => (
                                <div key={i} className="relative">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-medium">{s.name}</span>
                                        <span className="text-primary font-bold">{s.change}</span>
                                    </div>
                                    <div className="h-2 w-full bg-background-dark rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${s.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     {/* Losers */}
                     <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-danger"></span> Losing Sectors
                        </h3>
                        <div className="flex flex-col gap-4">
                             {losers.map((s, i) => (
                                <div key={i} className="relative">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-medium">{s.name}</span>
                                        <span className="text-danger font-bold">{s.change}</span>
                                    </div>
                                    <div className="h-2 w-full bg-background-dark rounded-full overflow-hidden">
                                        <div className="h-full bg-danger rounded-full transition-all duration-1000" style={{ width: `${s.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
  );
};

// 3. Portfolio Page
const Portfolio = () => {
    const [insight, setInsight] = useState("Analyzing portfolio...");
    const data = [
        { name: 'Stocks', value: 65, color: '#46ec13' },
        { name: 'ETFs', value: 35, color: '#2c3928' },
    ];
    
    useEffect(() => {
        getPortfolioInsight(12450).then(setInsight);
    }, []);

    return (
        <div className="p-4 lg:p-10 pb-32">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                <div className="flex items-end justify-between border-b border-border-dark pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Portfolio Tracker</h1>
                        <p className="text-text-secondary">{insight}</p>
                    </div>
                </div>

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
                            </div>
                         </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col md:flex-row items-center justify-around h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e271c', borderColor: '#2c3928', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            <h3 className="text-white font-bold mb-2">Allocation</h3>
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
            </div>
        </div>
    )
}

// 4. Simulator Page
const StrategySimulator = () => {
    const [risk, setRisk] = useState(75);
    const [data, setData] = useState([
        { year: 'Year 0', baseline: 0, simulated: 0 },
        { year: 'Year 1', baseline: 5, simulated: 12 },
        { year: 'Year 2', baseline: 12, simulated: 28 },
        { year: 'Year 3', baseline: 20, simulated: 45 },
        { year: 'Year 4', baseline: 28, simulated: 65 },
        { year: 'Year 5', baseline: 35, simulated: 85 },
    ]);

    useEffect(() => {
        // Simple simulation update
        const multiplier = risk / 50;
        const newData = data.map(d => ({
            ...d,
            simulated: Math.floor(d.baseline * multiplier * (1 + Math.random() * 0.2))
        }));
        // Just purely visual update to show reactivity
    }, [risk]);

    return (
        <div className="p-4 lg:p-8 pb-32 h-full flex flex-col">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                {/* Controls */}
                <div className="lg:col-span-4 flex flex-col h-full">
                     <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 lg:p-8 flex flex-col gap-8 h-full shadow-sm">
                        <div>
                            <h4 className="text-text-secondary uppercase text-xs font-bold tracking-wider mb-2">Tuning Configuration</h4>
                            <h3 className="text-2xl font-bold text-white">Tech Momentum Titans</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <label className="text-sm font-bold text-white">Risk Tolerance</label>
                                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">{risk > 50 ? 'High Volatility' : 'Conservative'}</span>
                            </div>
                            <input 
                                className="w-full h-1 bg-border-dark rounded-lg appearance-none cursor-pointer accent-primary" 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={risk} 
                                onChange={(e) => setRisk(parseInt(e.target.value))}
                            />
                            <div className="flex justify-between mt-2 text-xs font-medium text-text-secondary">
                                <span className="flex items-center gap-1">Safe 🛡️</span>
                                <span className="flex items-center gap-1">Aggressive 🚀</span>
                            </div>
                        </div>
                     </div>
                </div>

                {/* Chart */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 lg:p-8 flex-1 flex flex-col min-h-[400px]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Projected Outcomes</h3>
                                <p className="text-sm text-text-secondary">5-Year Forecast based on current config.</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#46ec13" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#46ec13" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2c3928" vertical={false} />
                                    <XAxis dataKey="year" stroke="#a3b99d" tick={{fontSize: 12}} />
                                    <YAxis stroke="#a3b99d" tick={{fontSize: 12}} tickFormatter={(val) => `+${val}%`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e271c', borderColor: '#2c3928', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="simulated" stroke="#46ec13" fillOpacity={1} fill="url(#colorSim)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="baseline" stroke="#52525b" strokeDasharray="5 5" fill="none" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// 5. Watchlist Page
const Watchlist = () => {
    const stocks = [
        { sym: 'NVDA', name: 'Nvidia Corp', price: 884.50, change: 4.25, data: [10, 15, 12, 18, 25, 30, 40] },
        { sym: 'AAPL', name: 'Apple Inc', price: 172.60, change: -1.12, data: [40, 38, 35, 32, 30, 28, 25] },
        { sym: 'TSLA', name: 'Tesla Inc', price: 175.30, change: 0.85, data: [20, 22, 21, 24, 23, 26, 28] },
    ];

    const [selected, setSelected] = useState(stocks[0]);

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col">
                <div className="border-b border-border-dark bg-background-dark/50 backdrop-blur-sm p-4">
                     <div className="flex items-center gap-6 overflow-x-auto w-full no-scrollbar">
                        <button className="pb-3 border-b-2 border-primary text-white font-bold text-sm whitespace-nowrap">My First List</button>
                        <button className="pb-3 border-b-2 border-transparent text-text-secondary hover:text-white font-medium text-sm transition-colors whitespace-nowrap">High Dividends</button>
                     </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-dark sticky top-0 z-10 text-xs uppercase text-text-secondary font-bold tracking-wider">
                            <tr>
                                <th className="py-4 px-6 border-b border-border-dark">Asset</th>
                                <th className="py-4 px-6 border-b border-border-dark text-right">Price</th>
                                <th className="py-4 px-6 border-b border-border-dark text-right">Change</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark">
                            {stocks.map(s => (
                                <tr 
                                    key={s.sym} 
                                    onClick={() => setSelected(s)}
                                    className={`group hover:bg-white/5 transition-colors cursor-pointer ${selected.sym === s.sym ? 'bg-white/5' : ''}`}
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full bg-white flex items-center justify-center text-black font-bold text-xs shadow-lg">{s.sym[0]}</div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-base">{s.sym}</span>
                                                <span className="text-text-secondary text-xs">{s.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono font-medium">${s.price.toFixed(2)}</td>
                                    <td className="py-4 px-6 text-right">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${s.change >= 0 ? 'bg-primary/10 text-primary' : 'bg-danger-surface text-danger'}`}>
                                            {s.change > 0 ? '+' : ''}{s.change}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Detail Panel */}
            <div className="w-96 border-l border-border-dark bg-surface-dark/50 backdrop-blur-md hidden xl:flex flex-col shrink-0 p-6">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="size-12 rounded-full bg-white flex items-center justify-center text-black font-bold text-sm shadow-lg">{selected.sym[0]}</div>
                    <div>
                        <h3 className="text-2xl font-bold text-white leading-none">{selected.sym}</h3>
                        <p className="text-sm text-text-secondary">{selected.name}</p>
                    </div>
                </div>
                <div className="mb-8 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selected.data.map((d, i) => ({ val: d, i }))}>
                            <Line type="monotone" dataKey="val" stroke={selected.change >= 0 ? "#46ec13" : "#ef4444"} strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <button className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(70,236,19,0.3)] hover:shadow-[0_0_30px_rgba(70,236,19,0.5)] flex items-center justify-center gap-2 mt-auto">
                    Trade {selected.sym}
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
            </div>
        </div>
    )
}

// 6. Settings Page (Simplified)
const Settings = () => (
    <div className="p-4 lg:p-10 pb-32 max-w-3xl mx-auto flex flex-col gap-8">
        <section className="bg-surface-dark border border-border-dark rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-background-dark border-2 border-primary/20 flex items-center justify-center shrink-0 text-3xl font-bold text-primary">AM</div>
            <div className="flex-1 w-full text-center md:text-left">
                <h2 className="text-2xl font-bold text-white">Alex Morgan</h2>
                <p className="text-text-secondary mb-6">alex@example.com</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-medium text-text-secondary uppercase">Display Name</label>
                        <input className="bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50" type="text" defaultValue="Alex Morgan"/>
                    </div>
                </div>
                <div className="flex justify-end mt-6 pt-6 border-t border-border-dark">
                    <button className="px-5 py-2 rounded-lg bg-primary text-background-dark font-bold text-sm hover:bg-primary-hover transition-colors">Save Changes</button>
                </div>
            </div>
        </section>
    </div>
);

// 7. Strategy Builder (Simple Selection)
const StrategyBuilder = ({ setActivePage }: { setActivePage: (p: Page) => void }) => (
    <div className="p-4 lg:p-10 pb-32 max-w-7xl mx-auto flex flex-col gap-10">
         <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">What is your main focus right now?</h1>
            <p className="text-text-secondary">Select an intent to filter the best strategies for your goals.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => setActivePage('strategy-simulator')} className="relative group cursor-pointer bg-surface-dark border-2 border-primary shadow-[0_0_20px_rgba(70,236,19,0.2)] rounded-2xl p-6 lg:p-8 transition-all hover:-translate-y-1 text-center">
                 <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-primary text-[32px] fill-1">rocket_launch</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Maximize Growth</h3>
                <p className="text-sm text-text-secondary leading-relaxed">High volatility, high reward.</p>
            </div>
             <div onClick={() => setActivePage('strategy-simulator')} className="group cursor-pointer bg-surface-dark border border-border-dark hover:border-text-secondary/50 rounded-2xl p-6 lg:p-8 transition-all hover:-translate-y-1 hover:bg-surface-dark/80 text-center">
                <div className="size-16 rounded-full bg-border-dark group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-4 transition-colors">
                    <span className="material-symbols-outlined text-text-secondary group-hover:text-primary text-[32px]">savings</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Stability</h3>
                <p className="text-sm text-text-secondary leading-relaxed">Steady returns, low risk.</p>
            </div>
             <div onClick={() => setActivePage('strategy-simulator')} className="group cursor-pointer bg-surface-dark border border-border-dark hover:border-text-secondary/50 rounded-2xl p-6 lg:p-8 transition-all hover:-translate-y-1 hover:bg-surface-dark/80 text-center">
                <div className="size-16 rounded-full bg-border-dark group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-4 transition-colors">
                    <span className="material-symbols-outlined text-text-secondary group-hover:text-primary text-[32px]">balance</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Balanced</h3>
                <p className="text-sm text-text-secondary leading-relaxed">Mix of growth and safety.</p>
            </div>
        </div>
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