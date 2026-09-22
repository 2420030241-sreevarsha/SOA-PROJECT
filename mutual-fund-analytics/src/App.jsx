import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Wallet,
  TrendingUp,
  Activity,
  Layers,
  BarChart3,
  Calendar,
  Clock,
  Sparkles,
  Bot,
  Database,
  User,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  Filter,
  X,
  RefreshCw,
  Send,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Scale,
  LogOut,
  Globe,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { storeClient } from './services/storeClient.js';
import { ProfileView } from './components/ProfileView.jsx';
import { LoginPage } from './components/LoginPage.jsx';
import {
  formatCurrency,
  formatCurrencyWithSign,
  getCurrencyMeta,
  SUPPORTED_CURRENCIES,
  SUPPORTED_COUNTRIES
} from './utils/currencyUtils.js';

// Original Financial Chart Palette
const THEME_CHART_COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#F43F5E'  // Rose
];

export default function App() {
  // Authentication & Current User State
  const [currentUser, setCurrentUser] = useState(() => storeClient.currentUser);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFundId, setSelectedFundId] = useState(null);

  // Modals
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showAddSipModal, setShowAddSipModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [compareFundIds, setCompareFundIds] = useState(['fund-1', 'fund-2']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Transaction form state
  const [txType, setTxType] = useState('BUY');
  const [txFundId, setTxFundId] = useState('fund-1');
  const [txAmount, setTxAmount] = useState('25000');
  const [txCustomNav, setTxCustomNav] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [txError, setTxError] = useState('');

  // SIP form state
  const [sipFundId, setSipFundId] = useState('fund-1');
  const [sipAmount, setSipAmount] = useState('5000');
  const [sipDay, setSipDay] = useState(5);

  // Chat state
  const [chatInput, setChatInput] = useState('');

  // Reactive state trigger
  const [storeVersion, setStoreVersion] = useState(0);
  const triggerUpdate = () => {
    // Refresh current user reference in case country/currency or profile changed
    if (storeClient.currentUser) {
      setCurrentUser({ ...storeClient.currentUser });
    }
    setStoreVersion((v) => v + 1);
  };

  // Filtered funds state
  const [catalogCategory, setCatalogCategory] = useState('All');
  const [catalogRisk, setCatalogRisk] = useState('All');

  // Currency & Country access
  const activeCurrency = currentUser?.currency || 'INR';
  const activeCurrencySymbol = currentUser?.currencySymbol || getCurrencyMeta(activeCurrency).symbol;
  const activeCountry = currentUser?.country || 'India';
  const isDemo = Boolean(currentUser?.isDemo);

  const summary = useMemo(() => storeClient.getSummary(), [storeVersion, currentUser]);
  const holdings = useMemo(() => storeClient.getHoldings(), [storeVersion, currentUser]);
  const riskAnalysis = useMemo(() => storeClient.getRiskAnalysis(), [storeVersion, currentUser]);
  const diversification = useMemo(() => storeClient.getDiversification(), [storeVersion, currentUser]);
  const rankings = useMemo(() => storeClient.getRankings(), [storeVersion]);
  const funds = useMemo(() => storeClient.funds, [storeVersion]);
  const transactions = useMemo(() => storeClient.transactions, [storeVersion, currentUser]);
  const sips = useMemo(() => storeClient.sips, [storeVersion, currentUser]);
  const notifications = useMemo(() => storeClient.notifications, [storeVersion, currentUser]);
  const profile = useMemo(() => storeClient.userProfile, [storeVersion, currentUser]);
  const chatMessages = useMemo(() => storeClient.chatMessages, [storeVersion, currentUser]);

  // Handle Logout
  const handleLogout = () => {
    storeClient.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Handle Add Transaction
  const handleExecuteTransaction = (e) => {
    e.preventDefault();
    setTxError('');
    const amt = parseFloat(txAmount);
    if (!amt || amt <= 0) {
      setTxError('Please enter a valid investment amount greater than zero.');
      return;
    }

    const fund = funds.find((f) => f.id === txFundId);
    if (!fund) {
      setTxError('Selected mutual fund was not found.');
      return;
    }

    const nav = txCustomNav ? parseFloat(txCustomNav) : fund.nav || 100;
    const units = parseFloat((amt / nav).toFixed(4));

    if (txType === 'SELL') {
      const existingHolding = holdings.find((h) => h.fundId === txFundId);
      if (!existingHolding || existingHolding.units < units) {
        setTxError(
          `Insufficient units to sell. You currently hold ${
            existingHolding ? existingHolding.units.toFixed(4) : 0
          } units.`
        );
        return;
      }
    }

    const newTx = {
      fundId: fund.id,
      fundName: fund.name,
      type: txType,
      date: new Date().toISOString().split('T')[0],
      amount: amt,
      nav: nav,
      units: units,
      notes: txNotes || undefined
    };

    storeClient.addTransaction(newTx);
    triggerUpdate();
    setShowAddTxModal(false);
    setTxNotes('');
    setTxCustomNav('');
  };

  // Handle Add SIP
  const handleExecuteAddSip = (e) => {
    e.preventDefault();
    const amt = parseFloat(sipAmount);
    if (!amt || amt <= 0) return;
    const fund = funds.find((f) => f.id === sipFundId);
    if (!fund) return;

    const nav = fund.nav || 100;
    const units = parseFloat((amt / nav).toFixed(4));

    const newSip = {
      fundId: fund.id,
      fundName: fund.name,
      amount: amt,
      frequency: 'Monthly',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth: sipDay,
      active: true,
      totalInvested: amt,
      unitsAccumulated: units,
      currentValue: amt,
      profitLoss: 0,
      returnPercent: 0
    };

    storeClient.addSip(newSip);
    storeClient.addTransaction({
      fundId: fund.id,
      fundName: fund.name,
      type: 'SIP',
      date: new Date().toISOString().split('T')[0],
      amount: amt,
      nav,
      units,
      notes: 'First monthly installment'
    });

    triggerUpdate();
    setShowAddSipModal(false);
  };

  const handleToggleSip = (sipId) => {
    storeClient.toggleSip(sipId);
    triggerUpdate();
  };

  const handleDeleteSip = (sipId) => {
    storeClient.deleteSip(sipId);
    triggerUpdate();
  };

  const handleDeleteTx = (txId) => {
    storeClient.deleteTransaction(txId);
    triggerUpdate();
  };

  // Chat message send
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    storeClient.addChatMessage({ role: 'user', text: userMsg, time: 'Just now' });
    triggerUpdate();

    setTimeout(() => {
      const q = userMsg.toLowerCase();
      let reply = '';
      if (
        q.includes('performance') ||
        q.includes('return') ||
        q.includes('value') ||
        q.includes('profit')
      ) {
        if (holdings.length === 0) {
          reply = `Your portfolio is currently empty with ${formatCurrency(
            0,
            activeCurrency,
            activeCurrencySymbol
          )} valuation. Add transactions to begin tracking returns!`;
        } else {
          reply = `Your portfolio has a current valuation of ${formatCurrency(
            summary.currentValue,
            activeCurrency,
            activeCurrencySymbol
          )} with an invested capital of ${formatCurrency(
            summary.totalInvested,
            activeCurrency,
            activeCurrencySymbol
          )}, generating a net return of ${
            summary.overallReturnPercent >= 0 ? '+' : ''
          }${summary.overallReturnPercent.toFixed(2)}% (P&L: ${formatCurrencyWithSign(
            summary.totalProfitLoss,
            activeCurrency,
            activeCurrencySymbol
          )}).`;
        }
      } else if (q.includes('risk') || q.includes('volatility') || q.includes('drawdown')) {
        if (riskAnalysis.isInsufficientData) {
          reply =
            'Insufficient historical data or active holdings to calculate portfolio volatility and risk metrics. Add fund positions to analyze.';
        } else {
          reply = `Your calculated risk score is ${riskAnalysis.riskScore}/100 (${riskAnalysis.riskLevel} tier). Annualized volatility is ${riskAnalysis.volatility}%, with a maximum historical drawdown of ${riskAnalysis.maxDrawdown}%. Sharpe Ratio stands at ${riskAnalysis.sharpeRatio} benchmarked against the 6.5% G-Sec risk-free rate.`;
        }
      } else if (
        q.includes('diversification') ||
        q.includes('category') ||
        q.includes('allocation')
      ) {
        reply = `${diversification.concentrationObservation} The estimated overall asset allocation is ${diversification.assetAllocation.equity}% Equity, ${diversification.assetAllocation.debt}% Debt, and ${diversification.assetAllocation.cash}% Cash.`;
      } else if (q.includes('sip')) {
        reply = `You have ${
          sips.filter((s) => s.active).length
        } active SIPs totaling ${formatCurrency(
          summary.monthlySipAmount,
          activeCurrency,
          activeCurrencySymbol
        )} per month. Regular disciplined contributions help average NAV costs over market cycles.`;
      } else {
        reply = `MF Portfolio Assistant: I have real-time access to your ${
          summary.fundCount
        } portfolio funds, transactions, currency (${activeCurrency}), Sharpe ratio, and asset allocation. Feel free to ask about your returns, risk score, or category weights.`;
      }

      storeClient.addChatMessage({ role: 'assistant', text: reply, time: 'Just now' });
      triggerUpdate();
    }, 350);
  };

  const filteredFunds = useMemo(() => {
    return funds.filter((f) => {
      const matchesSearch =
        !searchQuery ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.fundHouse.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = catalogCategory === 'All' || f.category === catalogCategory;
      const matchesRisk = catalogRisk === 'All' || f.risk === catalogRisk;
      return matchesSearch && matchesCat && matchesRisk;
    });
  }, [funds, searchQuery, catalogCategory, catalogRisk]);

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          triggerUpdate();
        }}
      />
    );
  }

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* ORIGINAL INDIGO & SLATE TOP NAVIGATION BAR                                */}
      {/* ========================================================================= */}
      <header
        id="top-navbar"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between shadow-2xs"
      >
        <div className="flex items-center gap-3">
          <button
            id="mobile-nav-toggle"
            aria-label="Navigation Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition md:hidden cursor-pointer"
          >
            <span className="text-xl font-bold">☰</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 block leading-tight">
                  Mutual Fund Tracker
                </span>
                {isDemo && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200 uppercase tracking-wider">
                    Demo Account
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide block">
                Portfolio Analytics & Risk Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search mutual funds, categories, AMCs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Notification, Country/Currency, Add Tx, and User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Country & Currency Badge */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            title="Click to change Country or Currency in Profile Settings"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              {activeCurrency} ({activeCurrencySymbol})
            </span>
          </button>

          <button
            id="quick-add-tx-btn"
            onClick={() => setShowAddTxModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notifications-toggle"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div
                id="notifications-panel"
                className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-xs font-semibold text-slate-900">Notifications</span>
                  <button
                    onClick={() => {
                      storeClient.markAllNotificationsRead();
                      triggerUpdate();
                    }}
                    className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs border ${
                        n.read
                          ? 'bg-slate-50 border-slate-200 text-slate-600'
                          : 'bg-indigo-50/70 border-indigo-200 text-slate-900'
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{n.title}</p>
                      <p className="mt-0.5 text-slate-600 text-xs">{n.message}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">{n.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Sign Out Action */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <button
              id="user-avatar-pill"
              onClick={() => setActiveTab('profile')}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold select-none cursor-pointer transition shadow-xs ring-2 ${
                activeTab === 'profile'
                  ? 'bg-indigo-700 text-white ring-indigo-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white ring-slate-200'
              }`}
              title={`View Investor Profile (${currentUser.name})`}
            >
              {currentUser.name
                ? currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'U'}
            </button>

            <button
              id="btn-sign-out"
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Sign Out / Switch Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN APPLICATION LAYOUT: SIDEBAR + CONTENT                                */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          id="app-sidebar"
          className={`${
            mobileMenuOpen ? 'block fixed inset-0 z-40 bg-white w-64 shadow-xl' : 'hidden'
          } md:flex md:static w-64 bg-white border-r border-slate-200 p-4 flex-col justify-between shrink-0 overflow-y-auto`}
        >
          <div className="space-y-5">
            {/* Core Section */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Portfolio Core
              </div>
              <nav className="space-y-1 text-xs">
                <button
                  id="nav-dashboard"
                  onClick={() => {
                    setActiveTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <PieChart className="w-4 h-4 text-indigo-600" />
                  <span>Dashboard</span>
                </button>
                <button
                  id="nav-portfolio"
                  onClick={() => {
                    setActiveTab('portfolio');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    activeTab === 'portfolio'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-indigo-600" />
                  <span>Holdings ({holdings.length})</span>
                </button>
                <button
                  id="nav-transactions"
                  onClick={() => {
                    setActiveTab('transactions');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    activeTab === 'transactions'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Transactions ({transactions.length})</span>
                </button>
                <button
                  id="nav-sip"
                  onClick={() => {
                    setActiveTab('sip');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    activeTab === 'sip'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>SIP Manager ({sips.length})</span>
                </button>
              </nav>
            </div>

            {/* Analytics Section */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Risk & Valuation
              </div>
              <nav className="space-y-1 text-xs">
                <button
                  id="nav-risk"
                  onClick={() => {
                    setActiveTab('risk');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    activeTab === 'risk'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Risk Metrics (Sharpe)</span>
                </button>
                <button
                  id="nav-ranking"
                  onClick={() => {
                    setActiveTab('ranking');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    activeTab === 'ranking'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Fund Rankings</span>
                </button>
                <button
                  id="nav-compare"
                  onClick={() => {
                    setActiveTab('compare');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    activeTab === 'compare'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <span>Compare Funds</span>
                </button>
              </nav>
            </div>

            {/* Market & Data */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Market Catalog & Data
              </div>
              <nav className="space-y-1 text-xs">
                <button
                  id="nav-funds"
                  onClick={() => {
                    setActiveTab('funds');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    activeTab === 'funds'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>All Funds ({funds.length})</span>
                </button>
                <button
                  id="nav-dataset"
                  onClick={() => {
                    setActiveTab('dataset');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    activeTab === 'dataset'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>Dataset Schema</span>
                </button>
              </nav>
            </div>

            {/* Intelligence & Profile */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Account & Insights
              </div>
              <nav className="space-y-1 text-xs">
                <button
                  id="nav-ai-chat"
                  onClick={() => {
                    setActiveTab('ai-chat');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    activeTab === 'ai-chat'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Portfolio Assistant</span>
                </button>
                <button
                  id="nav-profile"
                  onClick={() => {
                    setActiveTab('profile');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Profile & Settings</span>
                </button>
              </nav>
            </div>
          </div>

          {/* User profile preview in footer */}
          <div className="pt-4 border-t border-slate-200">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {currentUser.name ? currentUser.name[0] : 'U'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {activeCountry} • {activeCurrency}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main View Area */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD                                                          */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div id="view-dashboard" className="space-y-6 max-w-7xl mx-auto">
              {/* Demo Notice Banner (if Demo Account) */}
              {isDemo && (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3 text-xs text-indigo-900">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px] uppercase">
                      DEMO ACCOUNT
                    </span>
                    <span>
                      You are viewing <strong>Ananya’s ₹1.1L Portfolio</strong>. This is realistic sample data for exploration. Changes remain strictly isolated.
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline shrink-0 cursor-pointer"
                  >
                    Sign in to your own account →
                  </button>
                </div>
              )}

              {/* Welcome Banner */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold mb-1.5 border border-indigo-200">
                    <TrendingUp className="w-3 h-3 text-indigo-600" />
                    <span>Portfolio Overview</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Welcome, {currentUser.name.split(' ')[0]}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {holdings.length > 0
                      ? `Your portfolio holds ${summary.fundCount} funds evaluated in ${activeCurrency} (${activeCurrencySymbol}).`
                      : `Your portfolio is ready in ${activeCurrency} (${activeCurrencySymbol}). Add your investments to begin tracking.`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddTxModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Transaction</span>
                  </button>
                  <button
                    onClick={() => setShowAddSipModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Start SIP</span>
                  </button>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Current Value */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Current Valuation</span>
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {formatCurrency(summary.currentValue, activeCurrency, activeCurrencySymbol)}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>Invested Capital:</span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(summary.totalInvested, activeCurrency, activeCurrencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Overall P&L */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Profit / Loss</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-bold tracking-tight ${
                      summary.totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrencyWithSign(
                      summary.totalProfitLoss,
                      activeCurrency,
                      activeCurrencySymbol
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold ${
                        summary.overallReturnPercent >= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {summary.overallReturnPercent >= 0 ? '+' : ''}
                      {summary.overallReturnPercent.toFixed(2)}%
                    </span>
                    <span className="text-slate-400">all-time returns</span>
                  </div>
                </div>

                {/* Active Monthly SIP */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Monthly SIP Outflow</span>
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {formatCurrency(summary.monthlySipAmount, activeCurrency, activeCurrencySymbol)}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>{sips.filter((s) => s.active).length} Active Mandates</span>
                    <button
                      onClick={() => setActiveTab('sip')}
                      className="text-indigo-600 hover:underline cursor-pointer font-medium"
                    >
                      View schedule →
                    </button>
                  </div>
                </div>

                {/* Calculated Risk Tier */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Calculated Risk Tier</span>
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {riskAnalysis.riskLevel}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>
                      Score: <strong>{riskAnalysis.riskScore ? `${riskAnalysis.riskScore}/100` : 'N/A'}</strong>
                    </span>
                    <span>
                      Sharpe: <strong>{riskAnalysis.sharpeRatio ?? 'N/A'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* NEW USER EMPTY STATE ONBOARDING CARD */}
              {holdings.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900">
                      Your Portfolio is Empty ({activeCurrencySymbol}0)
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      As a new user, your account starts with a clean slate and no pre-loaded sample investments. Add your mutual fund investments or set up a recurring SIP to begin tracking real-time valuations.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setShowAddTxModal(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record First Investment</span>
                    </button>
                    <button
                      onClick={() => setShowAddSipModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Start an SIP Plan</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('funds')}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Browse Top Mutual Funds</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Charts & Allocation Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Asset Allocation Chart */}
                <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-900">Category Allocation</h3>
                    <span className="text-[11px] text-slate-500">
                      {diversification.categoryDistribution.length} Segments
                    </span>
                  </div>

                  {diversification.categoryDistribution.length > 0 ? (
                    <>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={diversification.categoryDistribution}
                              dataKey="amount"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              innerRadius={50}
                              paddingAngle={3}
                            >
                              {diversification.categoryDistribution.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={THEME_CHART_COLORS[index % THEME_CHART_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(val) =>
                                formatCurrency(val, activeCurrency, activeCurrencySymbol)
                              }
                              contentStyle={{
                                backgroundColor: '#FFFFFF',
                                borderColor: '#E2E8F0',
                                borderRadius: '12px',
                                fontSize: '12px'
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        {diversification.categoryDistribution.slice(0, 4).map((cat, idx) => (
                          <div key={cat.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    THEME_CHART_COLORS[idx % THEME_CHART_COLORS.length]
                                }}
                              />
                              <span className="text-slate-700">{cat.name}</span>
                            </div>
                            <span className="font-semibold text-slate-900">
                              {cat.percentage}% (
                              {formatCurrency(cat.amount, activeCurrency, activeCurrencySymbol)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-56 flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                      <PieChart className="w-8 h-8 text-slate-300" />
                      <p className="text-xs text-slate-500">
                        No investment categories logged yet. Add your first mutual fund transaction to generate an allocation pie chart.
                      </p>
                    </div>
                  )}
                </div>

                {/* Top Holdings Table */}
                <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-900">Active Mutual Fund Holdings</h3>
                    <button
                      onClick={() => setActiveTab('portfolio')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                    >
                      View all holdings →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    {holdings.length > 0 ? (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-500">
                            <th className="pb-2 font-medium">Scheme Name</th>
                            <th className="pb-2 font-medium">Units Held</th>
                            <th className="pb-2 font-medium">Current NAV</th>
                            <th className="pb-2 font-medium">Valuation</th>
                            <th className="pb-2 font-medium text-right">Returns</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {holdings.map((h) => (
                            <tr key={h.id} className="hover:bg-slate-50 transition">
                              <td className="py-2.5 pr-2">
                                <div className="font-semibold text-slate-900 line-clamp-1">
                                  {h.fundName}
                                </div>
                                <span className="text-[10px] text-slate-400">{h.category}</span>
                              </td>
                              <td className="py-2.5 pr-2 font-mono text-slate-700">{h.units}</td>
                              <td className="py-2.5 pr-2 font-mono text-slate-700">
                                {h.currentNav !== null
                                  ? formatCurrency(h.currentNav, activeCurrency, activeCurrencySymbol)
                                  : 'N/A'}
                              </td>
                              <td className="py-2.5 pr-2 font-semibold text-slate-900">
                                {formatCurrency(h.currentValue, activeCurrency, activeCurrencySymbol)}
                              </td>
                              <td className="py-2.5 text-right font-medium">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[11px] ${
                                    h.returnPercent >= 0
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {h.returnPercent >= 0 ? '+' : ''}
                                  {h.returnPercent}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-12 text-center text-slate-400 space-y-2">
                        <Wallet className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-500">
                          No active fund holdings yet. Click "Add Transaction" above to add your first fund.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PORTFOLIO HOLDINGS BREAKDOWN                                       */}
          {/* ========================================================================= */}
          {activeTab === 'portfolio' && (
            <div id="view-portfolio" className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Portfolio Holdings</h2>
                  <p className="text-xs text-slate-500">
                    Detailed overview of active mutual fund positions in {activeCurrency}.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddTxModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Transaction</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  {holdings.length > 0 ? (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <th className="p-3.5 font-semibold">Scheme & Category</th>
                          <th className="p-3.5 font-semibold">Units Accumulated</th>
                          <th className="p-3.5 font-semibold">Average Purchase Price</th>
                          <th className="p-3.5 font-semibold">Current NAV</th>
                          <th className="p-3.5 font-semibold">Invested Capital</th>
                          <th className="p-3.5 font-semibold">Current Valuation</th>
                          <th className="p-3.5 font-semibold text-right">P&L (% Returns)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {holdings.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50 transition">
                            <td className="p-3.5">
                              <div className="font-semibold text-slate-900">{h.fundName}</div>
                              <span className="text-[11px] text-slate-400">{h.category}</span>
                            </td>
                            <td className="p-3.5 font-mono text-slate-700">{h.units}</td>
                            <td className="p-3.5 font-mono text-slate-700">
                              {formatCurrency(h.averagePurchasePrice, activeCurrency, activeCurrencySymbol)}
                            </td>
                            <td className="p-3.5 font-mono text-slate-700">
                              {h.currentNav !== null
                                ? formatCurrency(h.currentNav, activeCurrency, activeCurrencySymbol)
                                : 'N/A'}
                            </td>
                            <td className="p-3.5 text-slate-900">
                              {formatCurrency(h.investedAmount, activeCurrency, activeCurrencySymbol)}
                            </td>
                            <td className="p-3.5 font-bold text-slate-900">
                              {formatCurrency(h.currentValue, activeCurrency, activeCurrencySymbol)}
                            </td>
                            <td className="p-3.5 text-right font-medium">
                              <div
                                className={h.profitLoss >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}
                              >
                                {formatCurrencyWithSign(h.profitLoss, activeCurrency, activeCurrencySymbol)}
                              </div>
                              <span
                                className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                  h.returnPercent >= 0
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {h.returnPercent >= 0 ? '+' : ''}
                                {h.returnPercent}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                      <Wallet className="w-10 h-10 text-slate-300 mx-auto" />
                      <div className="text-sm font-semibold text-slate-700">No Holdings Found</div>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Your portfolio does not contain any active investments. Click below to add your first transaction.
                      </p>
                      <button
                        onClick={() => setShowAddTxModal(true)}
                        className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Holding</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: TRANSACTIONS LEDGER                                                */}
          {/* ========================================================================= */}
          {activeTab === 'transactions' && (
            <div id="view-transactions" className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
                  <p className="text-xs text-slate-500">
                    Audit ledger of mutual fund purchases, SIPs, and redemptions.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddTxModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Transaction</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  {transactions.length > 0 ? (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <th className="p-3.5 font-semibold">Date</th>
                          <th className="p-3.5 font-semibold">Scheme</th>
                          <th className="p-3.5 font-semibold">Type</th>
                          <th className="p-3.5 font-semibold">Amount</th>
                          <th className="p-3.5 font-semibold">NAV</th>
                          <th className="p-3.5 font-semibold">Units Credited</th>
                          <th className="p-3.5 font-semibold">Notes</th>
                          <th className="p-3.5 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50 transition">
                            <td className="p-3.5 font-mono text-slate-600">{tx.date}</td>
                            <td className="p-3.5 font-semibold text-slate-900">{tx.fundName}</td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                  tx.type === 'BUY'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : tx.type === 'SIP'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-slate-900">
                              {formatCurrency(tx.amount, activeCurrency, activeCurrencySymbol)}
                            </td>
                            <td className="p-3.5 font-mono text-slate-700">
                              {formatCurrency(tx.nav, activeCurrency, activeCurrencySymbol)}
                            </td>
                            <td className="p-3.5 font-mono text-slate-700">{tx.units}</td>
                            <td className="p-3.5 text-slate-500 italic">{tx.notes || '-'}</td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleDeleteTx(tx.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition cursor-pointer"
                                title="Delete Transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                      <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                      <div className="text-sm font-semibold text-slate-700">No Transactions Logged</div>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Your transaction ledger is currently empty. Record a lumpsum investment or start a monthly SIP schedule.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SIP MANAGER                                                        */}
          {/* ========================================================================= */}
          {activeTab === 'sip' && (
            <div id="view-sip" className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Systematic Investment Plans (SIP)</h2>
                  <p className="text-xs text-slate-500">
                    Automate disciplined monthly contributions in {activeCurrency} to rupee-cost average market cycles.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSipModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New SIP</span>
                </button>
              </div>

              {sips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sips.map((sip) => (
                    <div
                      key={sip.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            sip.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {sip.active ? '● Active Mandate' : '○ Paused'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleSip(sip.id)}
                            className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            {sip.active ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            onClick={() => handleDeleteSip(sip.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{sip.fundName}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Debits on the {sip.dayOfMonth}th of each month
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-500 block">Monthly Installment</span>
                          <span className="text-base font-bold text-slate-900">
                            {formatCurrency(sip.amount, activeCurrency, activeCurrencySymbol)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 block">Total Invested</span>
                          <span className="font-semibold text-slate-700">
                            {formatCurrency(sip.totalInvested, activeCurrency, activeCurrencySymbol)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-3">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-semibold text-slate-800">No Active SIPs</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You have not registered any monthly SIP contributions. Setting up recurring investments enforces dollar/rupee cost averaging.
                  </p>
                  <button
                    onClick={() => setShowAddSipModal(true)}
                    className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Setup First Monthly SIP</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: RISK & SHARPE RATIO                                                */}
          {/* ========================================================================= */}
          {activeTab === 'risk' && (
            <div id="view-risk" className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Risk & Quantitative Metrics</h2>
                <p className="text-xs text-slate-500">
                  Mathematical evaluation of portfolio volatility, Sharpe ratio, and historical drawdown benchmarked against 10Y G-Sec yield (6.5%).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 block">Portfolio Risk Score</span>
                  <div className="text-3xl font-bold text-slate-900">
                    {riskAnalysis.riskScore ? `${riskAnalysis.riskScore}/100` : 'N/A'}
                  </div>
                  <span className="text-xs text-indigo-600 block font-medium">
                    Tier: {riskAnalysis.riskLevel}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 block">Annualized Volatility (σ)</span>
                  <div className="text-3xl font-bold text-slate-900">
                    {riskAnalysis.volatility !== null ? `${riskAnalysis.volatility}%` : 'N/A'}
                  </div>
                  <span className="text-xs text-slate-400 block">Historical NAV sample stdev</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 block">Sharpe Ratio</span>
                  <div className="text-3xl font-bold text-slate-900">
                    {riskAnalysis.sharpeRatio ?? 'N/A'}
                  </div>
                  <span className="text-xs text-slate-400 block">Benchmarked to 6.5% risk-free rate</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 block">Maximum Drawdown</span>
                  <div className="text-3xl font-bold text-rose-600">
                    {riskAnalysis.maxDrawdown !== null ? `-${riskAnalysis.maxDrawdown}%` : 'N/A'}
                  </div>
                  <span className="text-xs text-slate-400 block">Peak-to-trough historical dip</span>
                </div>
              </div>

              {/* Assumptions & Disclaimers */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-900">Quantitative Assumptions & Methodology</h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside">
                  {riskAnalysis.assumptions.map((assump, idx) => (
                    <li key={idx}>{assump}</li>
                  ))}
                </ul>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 italic border border-slate-200">
                  {riskAnalysis.disclaimer}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: MUTUAL FUNDS CATALOG                                               */}
          {/* ========================================================================= */}
          {activeTab === 'funds' && (
            <div id="view-funds" className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Mutual Funds Catalog</h2>
                  <p className="text-xs text-slate-500">
                    Browse top-rated mutual funds across categories, AMCs, and historical return profiles.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={catalogCategory}
                    onChange={(e) => setCatalogCategory(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  >
                    <option value="All">All Categories</option>
                    <option value="Large Cap">Large Cap</option>
                    <option value="Flexi Cap">Flexi Cap</option>
                    <option value="Mid Cap">Mid Cap</option>
                    <option value="Small Cap">Small Cap</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Debt">Debt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFunds.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-200 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {f.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{f.fundHouse}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{f.name}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">NAV</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(f.nav, activeCurrency, activeCurrencySymbol)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">1Y Return</span>
                        <span className="font-bold text-emerald-600">
                          {f.returns1y ? `+${f.returns1y}%` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Expense</span>
                        <span className="font-bold text-slate-900">{f.expenseRatio}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        Risk: <strong className="text-slate-700">{f.risk}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setTxFundId(f.id);
                          setShowAddTxModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                      >
                        Invest Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: COMPARE FUNDS                                                      */}
          {/* ========================================================================= */}
          {activeTab === 'compare' && (
            <div id="view-compare" className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Compare Mutual Funds</h2>
                <p className="text-xs text-slate-500">
                  Side-by-side performance, expense ratio, and risk comparison.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-700 self-center">Select Funds to Compare:</span>
                {funds.map((f) => {
                  const selected = compareFundIds.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        if (selected) {
                          if (compareFundIds.length > 1) {
                            setCompareFundIds(compareFundIds.filter((id) => id !== f.id));
                          }
                        } else {
                          if (compareFundIds.length < 3) {
                            setCompareFundIds([...compareFundIds, f.id]);
                          }
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {f.name.split('-')[0]}
                    </button>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {compareFundIds.map((id) => {
                    const f = funds.find((x) => x.id === id);
                    if (!f) return null;
                    return (
                      <div key={f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="font-bold text-sm text-slate-900">{f.name}</div>
                        <div className="space-y-2 text-xs text-slate-700">
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>Category:</span>
                            <strong className="text-slate-900">{f.category}</strong>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>Fund House:</span>
                            <strong className="text-slate-900">{f.fundHouse}</strong>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>Current NAV:</span>
                            <strong className="text-slate-900">
                              {formatCurrency(f.nav, activeCurrency, activeCurrencySymbol)}
                            </strong>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>Expense Ratio:</span>
                            <strong className="text-slate-900">{f.expenseRatio}%</strong>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>1 Year Return:</span>
                            <strong className="text-emerald-600">
                              {f.returns1y ? `+${f.returns1y}%` : 'N/A'}
                            </strong>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span>3 Year Return:</span>
                            <strong className="text-emerald-600">
                              {f.returns3y ? `+${f.returns3y}%` : 'N/A'}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Risk Tier:</span>
                            <strong className="text-slate-900">{f.risk}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: FUND RANKING SCORECARD                                             */}
          {/* ========================================================================= */}
          {activeTab === 'ranking' && (
            <div id="view-ranking" className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Fund Consistency Rankings</h2>
                <p className="text-xs text-slate-500">
                  Weighted quantitative model: Historical 1Y Returns (40%), 3Y Consistency (25%), Return Spread (20%), and Expense Efficiency (15%).
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="p-3.5 font-semibold">Rank</th>
                        <th className="p-3.5 font-semibold">Fund Name</th>
                        <th className="p-3.5 font-semibold">Category</th>
                        <th className="p-3.5 font-semibold">Overall Score</th>
                        <th className="p-3.5 font-semibold">Return Score</th>
                        <th className="p-3.5 font-semibold">Consistency</th>
                        <th className="p-3.5 font-semibold text-right">Expense Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rankings.map((r) => (
                        <tr key={r.fundId} className="hover:bg-slate-50 transition">
                          <td className="p-3.5">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                              #{r.rank}
                            </span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-900">{r.fundName}</td>
                          <td className="p-3.5 text-slate-600">{r.category}</td>
                          <td className="p-3.5 font-bold text-indigo-700">{r.overallScore} / 100</td>
                          <td className="p-3.5 text-slate-600">{r.returnScore}</td>
                          <td className="p-3.5 text-slate-600">{r.consistencyScore}</td>
                          <td className="p-3.5 text-right font-mono text-slate-900">{r.expenseRatio}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: CSV DATASET SCHEMA                                                 */}
          {/* ========================================================================= */}
          {activeTab === 'dataset' && (
            <div id="view-dataset" className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Mutual Fund Dataset Schema</h2>
                <p className="text-xs text-slate-500">Inspect the verified fund database schema and attributes.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs text-slate-500">Total Funds Indexed</span>
                  <div className="text-2xl font-bold text-slate-900">{funds.length} Schemes</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs text-slate-500">Unique Categories</span>
                  <div className="text-2xl font-bold text-slate-900">6 Major Asset Classes</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-xs text-slate-500">Database Status</span>
                  <div className="text-2xl font-bold text-emerald-600">Verified & Synchronized</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Available Data Attributes</h3>
                <div className="flex flex-wrap gap-2">
                  {['fundId', 'schemeName', 'category', 'fundHouse', 'nav', 'returns1y', 'returns3y', 'expenseRatio', 'riskTier', 'aumCrores'].map((col) => (
                    <span
                      key={col}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 10: PORTFOLIO ASSISTANT (CHAT)                                        */}
          {/* ========================================================================= */}
          {activeTab === 'ai-chat' && (
            <div id="view-ai-chat" className="max-w-4xl mx-auto space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Portfolio Assistant</h2>
                <p className="text-xs text-slate-500">
                  Ask grounded questions about your returns, active funds, asset allocation, or risk score.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-[520px]">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-lg p-3.5 rounded-2xl text-xs ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                            : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <span
                          className={`text-[10px] block mt-1 ${
                            msg.role === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your risk, returns, or diversification..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 11: INVESTOR PROFILE & SETTINGS                                       */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              summary={summary}
              currentUser={currentUser}
              onProfileUpdate={triggerUpdate}
              onNavigateToSip={() => setActiveTab('sip')}
              onNavigateToHoldings={() => setActiveTab('portfolio')}
            />
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* ADD TRANSACTION MODAL                                                     */}
      {/* ========================================================================= */}
      {showAddTxModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">Record Mutual Fund Investment</h3>
              <button
                onClick={() => setShowAddTxModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {txError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {txError}
              </div>
            )}

            <form onSubmit={handleExecuteTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType('BUY')}
                    className={`py-2 rounded-xl font-semibold border cursor-pointer ${
                      txType === 'BUY'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Lumpsum Purchase
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('SELL')}
                    className={`py-2 rounded-xl font-semibold border cursor-pointer ${
                      txType === 'SELL'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Redemption / Sell
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Scheme</label>
                <select
                  value={txFundId}
                  onChange={(e) => setTxFundId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {funds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (NAV: {formatCurrency(f.nav, activeCurrency, activeCurrencySymbol)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Investment Amount ({activeCurrencySymbol})
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Custom NAV ({activeCurrencySymbol}, Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Defaults to current NAV if left blank"
                  value={txCustomNav}
                  onChange={(e) => setTxCustomNav(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Notes / Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Tax-saving allocation or Retirement portfolio"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Confirm & Update Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD SIP MODAL                                                             */}
      {/* ========================================================================= */}
      {showAddSipModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">Setup Monthly SIP Schedule</h3>
              <button
                onClick={() => setShowAddSipModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteAddSip} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Scheme for SIP</label>
                <select
                  value={sipFundId}
                  onChange={(e) => setSipFundId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {funds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (NAV: {formatCurrency(f.nav, activeCurrency, activeCurrencySymbol)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Monthly Installment Amount ({activeCurrencySymbol})
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Monthly Debit Day</label>
                <select
                  value={sipDay}
                  onChange={(e) => setSipDay(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[1, 5, 10, 15, 20, 25].map((day) => (
                    <option key={day} value={day}>
                      {day}th of every month
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSipModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Activate SIP Mandate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
