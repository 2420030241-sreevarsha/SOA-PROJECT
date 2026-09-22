// Multi-User Persistent Store and Mutual Fund Business Logic Engine
// Features complete data isolation per user, persistent localStorage backing,
// dedicated isolated Demo Account (Ananya - ₹1.1L Portfolio), and zero-initialization for new users.

import { INITIAL_DEMO_FUNDS, INITIAL_USER_PROFILE } from '../data/initialData.js';
import { getCurrencyMeta, SUPPORTED_CURRENCIES } from '../utils/currencyUtils.js';

const STORAGE_KEY_USERS = 'mf_app_v2_users';
const STORAGE_KEY_ACTIVE_USER = 'mf_app_v2_active_user_id';

// Base demo dataset for Ananya Sharma
function createInitialDemoAccount() {
  const currencyMeta = getCurrencyMeta('INR');
  return {
    id: 'usr-demo-ananya',
    name: 'Ananya Sharma',
    email: 'demo.ananya@portfolio.in',
    password: 'password123',
    role: 'Retail Investor (Demo)',
    isDemo: true,
    country: 'India',
    currency: 'INR',
    currencySymbol: currencyMeta.symbol,
    profile: {
      ...INITIAL_USER_PROFILE,
      id: 'usr-demo-ananya',
      name: 'Ananya Sharma',
      email: 'demo.ananya@portfolio.in',
      investorId: 'INV-DEMO-110K',
      isDemo: true,
      country: 'India',
      currency: 'INR',
      currencySymbol: currencyMeta.symbol
    },
    transactions: [
      {
        id: 'tx-demo-1',
        userId: 'usr-demo-ananya',
        fundId: 'fund-1',
        fundName: 'Mirae Asset Large Cap Fund - Direct Plan - Growth',
        type: 'BUY',
        date: '2024-04-10',
        amount: 40000,
        nav: 97.50,
        units: 410.256,
        notes: 'Initial lumpsum allocation'
      },
      {
        id: 'tx-demo-2',
        userId: 'usr-demo-ananya',
        fundId: 'fund-2',
        fundName: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
        type: 'SIP',
        date: '2024-05-05',
        amount: 15000,
        nav: 66.80,
        units: 224.551,
        notes: 'Monthly SIP installment'
      },
      {
        id: 'tx-demo-3',
        userId: 'usr-demo-ananya',
        fundId: 'fund-3',
        fundName: 'HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth',
        type: 'BUY',
        date: '2024-07-20',
        amount: 30000,
        nav: 151.20,
        units: 198.413,
        notes: 'Mid-cap equity allocation'
      },
      {
        id: 'tx-demo-4',
        userId: 'usr-demo-ananya',
        fundId: 'fund-5',
        fundName: 'SBI Balanced Advantage Fund - Direct Plan - Growth',
        type: 'BUY',
        date: '2024-09-12',
        amount: 25000,
        nav: 13.90,
        units: 1798.561,
        notes: 'Hybrid dynamic asset allocation'
      }
    ],
    sips: [
      {
        id: 'sip-demo-1',
        userId: 'usr-demo-ananya',
        fundId: 'fund-2',
        fundName: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
        amount: 15000,
        frequency: 'Monthly',
        startDate: '2024-05-05',
        dayOfMonth: 5,
        active: true,
        totalInvested: 45000,
        unitsAccumulated: 638.12,
        currentValue: 50360,
        profitLoss: 5360,
        returnPercent: 11.91
      }
    ],
    notifications: [
      {
        id: 'n-demo-1',
        userId: 'usr-demo-ananya',
        type: 'SIP_REMINDER',
        title: 'Upcoming Monthly SIP (Demo)',
        message: 'Your monthly SIP of ₹15,000 for Parag Parikh Flexi Cap Fund is scheduled for 5th of this month.',
        createdAt: '2026-03-20',
        read: false
      },
      {
        id: 'n-demo-2',
        userId: 'usr-demo-ananya',
        type: 'CONCENTRATION',
        title: 'Equity Allocation Check',
        message: 'Flexi Cap & Large Cap represent >60% of your total equity portfolio weight.',
        createdAt: '2026-03-18',
        read: false
      }
    ],
    chatMessages: [
      {
        role: 'assistant',
        text: 'Hello Ananya! This is your ₹1.1L demo portfolio with 4 core mutual funds and 1 active monthly SIP. Ask me anything about your asset allocation or risk metrics!',
        time: '10:00 AM'
      }
    ]
  };
}

class StoreClient {
  constructor() {
    this.funds = [...INITIAL_DEMO_FUNDS];
    this.riskFreeRate = 6.5;

    // Load or initialize all users database
    this.users = this.loadUsersFromStorage();

    // Check active session
    const savedActiveUserId = this.getActiveUserIdFromStorage();
    if (savedActiveUserId && this.users[savedActiveUserId]) {
      this.currentUser = this.users[savedActiveUserId];
    } else {
      // Default to null (requiring login or demo click)
      this.currentUser = null;
    }
  }

  // --- Storage Persistence Helpers ---

  loadUsersFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY_USERS);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Always ensure the demo account is present
          if (!parsed['usr-demo-ananya']) {
            parsed['usr-demo-ananya'] = createInitialDemoAccount();
            this.persistUsers(parsed);
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to load users from localStorage:', err);
    }

    // Default initial users dictionary containing the isolated demo account
    const initialDict = {
      'usr-demo-ananya': createInitialDemoAccount()
    };
    this.persistUsers(initialDict);
    return initialDict;
  }

  persistUsers(usersDict = this.users) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(usersDict));
      }
    } catch (err) {
      console.warn('Failed to persist users to localStorage:', err);
    }
  }

  getActiveUserIdFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
      }
    } catch {
      return null;
    }
    return null;
  }

  setActiveUserIdInStorage(userId) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (userId) {
          window.localStorage.setItem(STORAGE_KEY_ACTIVE_USER, userId);
        } else {
          window.localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
        }
      }
    } catch (err) {
      console.warn('Failed to update active session in localStorage:', err);
    }
  }

  saveCurrentUserData() {
    if (!this.currentUser) return;
    this.users[this.currentUser.id] = { ...this.currentUser };
    this.persistUsers();
  }

  // --- Authentication Methods ---

  // One-Click Demo Access: "Demo: Ananya – ₹1.1L Portfolio"
  loginDemo() {
    if (!this.users['usr-demo-ananya']) {
      this.users['usr-demo-ananya'] = createInitialDemoAccount();
      this.persistUsers();
    }
    this.currentUser = this.users['usr-demo-ananya'];
    this.setActiveUserIdInStorage(this.currentUser.id);
    return this.currentUser;
  }

  // Regular login for registered users
  login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    // Check if demo email
    if (cleanEmail === 'demo.ananya@portfolio.in' || cleanEmail === 'ananya.sharma@investor.in') {
      return this.loginDemo();
    }

    // Search existing users
    const matchedUser = Object.values(this.users).find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!matchedUser) {
      throw new Error(
        'No account found with this email. Please register as a new user or use the One-Click Demo Access.'
      );
    }

    if (matchedUser.password && matchedUser.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    this.currentUser = matchedUser;
    this.setActiveUserIdInStorage(this.currentUser.id);
    return this.currentUser;
  }

  // Register brand new user with 100% EMPTY portfolio (₹0)
  register(name, email, password, country = 'India', currency = 'INR') {
    if (!name || !email || !password) {
      throw new Error('Full name, email, and password are required.');
    }
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate
    const exists = Object.values(this.users).some(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (exists) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const newUserId = `usr-${Date.now()}`;
    const currencyMeta = getCurrencyMeta(currency);

    const newUser = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: 'Individual Investor',
      isDemo: false,
      country: country,
      currency: currency,
      currencySymbol: currencyMeta.symbol,
      profile: {
        ...INITIAL_USER_PROFILE,
        id: newUserId,
        name: name.trim(),
        email: cleanEmail,
        investorId: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        kycStatus: 'NOT_STARTED',
        pan: '',
        phone: '',
        isDemo: false,
        country: country,
        currency: currency,
        currencySymbol: currencyMeta.symbol,
        riskProfile: 'Moderate',
        investmentHorizon: '5 - 10 Years',
        primaryGoal: 'Long-term Wealth Creation',
        annualIncome: '₹10,00,000 - ₹15,00,000',
        monthlyTarget: 10000,
        bankName: '',
        accountNumberMasked: '',
        accountType: 'Savings Account',
        ifsc: '',
        mandateStatus: 'Inactive',
        mandateLimit: 0,
        nomineeName: '',
        nomineeRelation: '',
        nomineeShare: 100,
        address: '',
        city: '',
        state: '',
        pincode: ''
      },
      // STRICTLY EMPTY FOR NEW USERS:
      transactions: [],
      sips: [],
      notifications: [
        {
          id: `n-${Date.now()}`,
          userId: newUserId,
          type: 'WELCOME',
          title: 'Welcome to your Portfolio!',
          message: `Your account is set up with ${currency} currency. Click "Add Transaction" to log your first investment.`,
          createdAt: new Date().toISOString().split('T')[0],
          read: false
        }
      ],
      chatMessages: [
        {
          role: 'assistant',
          text: `Welcome ${name.trim()}! Your portfolio is clean and ready. Add transactions or explore top mutual funds in the catalog to begin tracking your net worth.`,
          time: 'Just now'
        }
      ]
    };

    this.users[newUserId] = newUser;
    this.persistUsers();

    this.currentUser = newUser;
    this.setActiveUserIdInStorage(newUserId);
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    this.setActiveUserIdInStorage(null);
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  // --- Profile & Preferences Methods ---

  get userProfile() {
    if (!this.currentUser) return INITIAL_USER_PROFILE;
    return this.currentUser.profile;
  }

  set userProfile(newProfile) {
    if (!this.currentUser) return;
    this.currentUser.profile = { ...this.currentUser.profile, ...newProfile };
    if (newProfile.name) this.currentUser.name = newProfile.name;
    if (newProfile.country) this.currentUser.country = newProfile.country;
    if (newProfile.currency) {
      this.currentUser.currency = newProfile.currency;
      this.currentUser.currencySymbol = getCurrencyMeta(newProfile.currency).symbol;
      this.currentUser.profile.currencySymbol = this.currentUser.currencySymbol;
    }
    this.saveCurrentUserData();
  }

  updateCountryAndCurrency(country, currency) {
    if (!this.currentUser) return;
    const meta = getCurrencyMeta(currency);
    this.currentUser.country = country;
    this.currentUser.currency = currency;
    this.currentUser.currencySymbol = meta.symbol;

    if (!this.currentUser.profile) {
      this.currentUser.profile = {};
    }
    this.currentUser.profile.country = country;
    this.currentUser.profile.currency = currency;
    this.currentUser.profile.currencySymbol = meta.symbol;

    this.saveCurrentUserData();
  }

  // --- Transactions & SIPs (Per-User Isolated) ---

  get transactions() {
    if (!this.currentUser) return [];
    return this.currentUser.transactions || [];
  }

  set transactions(newTxs) {
    if (!this.currentUser) return;
    this.currentUser.transactions = newTxs;
    this.saveCurrentUserData();
  }

  get sips() {
    if (!this.currentUser) return [];
    return this.currentUser.sips || [];
  }

  set sips(newSips) {
    if (!this.currentUser) return;
    this.currentUser.sips = newSips;
    this.saveCurrentUserData();
  }

  get notifications() {
    if (!this.currentUser) return [];
    return this.currentUser.notifications || [];
  }

  set notifications(newNotifs) {
    if (!this.currentUser) return;
    this.currentUser.notifications = newNotifs;
    this.saveCurrentUserData();
  }

  get chatMessages() {
    if (!this.currentUser) return [];
    return this.currentUser.chatMessages || [];
  }

  set chatMessages(newMsgs) {
    if (!this.currentUser) return;
    this.currentUser.chatMessages = newMsgs;
    this.saveCurrentUserData();
  }

  addTransaction(txData) {
    if (!this.currentUser) return;
    const tx = {
      ...txData,
      id: txData.id || `tx-${Date.now()}`,
      userId: this.currentUser.id,
      date: txData.date || new Date().toISOString().split('T')[0]
    };
    this.currentUser.transactions.unshift(tx);
    this.saveCurrentUserData();
    return tx;
  }

  deleteTransaction(txId) {
    if (!this.currentUser) return;
    this.currentUser.transactions = this.currentUser.transactions.filter(
      (t) => t.id !== txId
    );
    this.saveCurrentUserData();
  }

  addSip(sipData) {
    if (!this.currentUser) return;
    const sip = {
      ...sipData,
      id: sipData.id || `sip-${Date.now()}`,
      userId: this.currentUser.id,
      startDate: sipData.startDate || new Date().toISOString().split('T')[0],
      active: true
    };
    this.currentUser.sips.push(sip);
    this.saveCurrentUserData();
    return sip;
  }

  toggleSip(sipId) {
    if (!this.currentUser) return;
    const s = this.currentUser.sips.find((i) => i.id === sipId);
    if (s) {
      s.active = !s.active;
      this.saveCurrentUserData();
    }
  }

  deleteSip(sipId) {
    if (!this.currentUser) return;
    this.currentUser.sips = this.currentUser.sips.filter((s) => s.id !== sipId);
    this.saveCurrentUserData();
  }

  addChatMessage(msg) {
    if (!this.currentUser) return;
    if (!this.currentUser.chatMessages) this.currentUser.chatMessages = [];
    this.currentUser.chatMessages.push(msg);
    this.saveCurrentUserData();
  }

  markAllNotificationsRead() {
    if (!this.currentUser) return;
    if (this.currentUser.notifications) {
      this.currentUser.notifications = this.currentUser.notifications.map((n) => ({
        ...n,
        read: true
      }));
      this.saveCurrentUserData();
    }
  }

  // --- Portfolio Calculation Engine ---

  getHoldings() {
    if (!this.currentUser) return [];
    const userTxs = this.currentUser.transactions || [];
    const posMap = new Map();

    for (const tx of userTxs) {
      if (!posMap.has(tx.fundId)) {
        posMap.set(tx.fundId, { fundName: tx.fundName, units: 0, invested: 0 });
      }
      const pos = posMap.get(tx.fundId);
      if (tx.type === 'BUY' || tx.type === 'SIP') {
        pos.units += tx.units;
        pos.invested += tx.amount;
      } else if (tx.type === 'SELL') {
        const avgCost = pos.units > 0 ? pos.invested / pos.units : 0;
        pos.units = Math.max(0, pos.units - tx.units);
        pos.invested = Math.max(0, pos.invested - tx.units * avgCost);
      }
    }

    const holdings = [];
    posMap.forEach((pos, fundId) => {
      if (pos.units <= 0.0001) return;
      const fund = this.funds.find((f) => f.id === fundId);
      const currentNav = fund?.nav ?? null;
      const avgPrice = pos.units > 0 ? pos.invested / pos.units : 0;
      const currentValue = currentNav !== null ? pos.units * currentNav : pos.invested;
      const profitLoss = currentValue - pos.invested;
      const returnPercent = pos.invested > 0 ? (profitLoss / pos.invested) * 100 : 0;

      holdings.push({
        id: `hld-${fundId}`,
        userId: this.currentUser.id,
        fundId,
        fundName: pos.fundName,
        category: fund?.category ?? 'Other',
        units: Number(pos.units.toFixed(4)),
        averagePurchasePrice: Number(avgPrice.toFixed(2)),
        investedAmount: Number(pos.invested.toFixed(2)),
        currentNav,
        currentValue: Number(currentValue.toFixed(2)),
        profitLoss: Number(profitLoss.toFixed(2)),
        returnPercent: Number(returnPercent.toFixed(2))
      });
    });

    return holdings;
  }

  getSummary() {
    if (!this.currentUser) {
      return {
        totalInvested: 0,
        currentValue: 0,
        totalProfitLoss: 0,
        overallReturnPercent: 0,
        fundCount: 0,
        transactionCount: 0,
        monthlySipAmount: 0,
        isDemo: false
      };
    }

    const holdings = this.getHoldings();
    const userTxs = this.currentUser.transactions || [];
    const activeSips = (this.currentUser.sips || []).filter((s) => s.active);

    const totalInvested = holdings.reduce((sum, h) => sum + h.investedAmount, 0);
    const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalProfitLoss = currentValue - totalInvested;
    const overallReturnPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    const monthlySipAmount = activeSips.reduce((sum, s) => sum + s.amount, 0);

    return {
      totalInvested: Number(totalInvested.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
      overallReturnPercent: Number(overallReturnPercent.toFixed(2)),
      fundCount: holdings.length,
      transactionCount: userTxs.length,
      monthlySipAmount,
      isDemo: Boolean(this.currentUser.isDemo)
    };
  }

  getRiskAnalysis() {
    const holdings = this.getHoldings();
    const assumptions = [
      `Risk-Free Rate: ${this.riskFreeRate}% benchmarked to 10-Year Government Securities yield.`,
      'Volatility calculated as annualized sample standard deviation of historical NAV returns.',
      'Maximum Drawdown computed from peak historical portfolio value to subsequent lowest trough.',
      'Portfolio Risk Score (0-100) incorporates Volatility (40%), Max Drawdown (30%), and Concentration Risk (30%).'
    ];
    const disclaimer =
      'This analysis is for educational and informational purposes only and is not financial advice.';

    if (holdings.length === 0) {
      return {
        volatility: null,
        sharpeRatio: null,
        maxDrawdown: null,
        riskScore: null,
        riskLevel: 'No Active Holdings',
        assumptions,
        isInsufficientData: true,
        concentrationScore: 0,
        disclaimer
      };
    }

    const dates = [
      '2024-03-15',
      '2024-06-15',
      '2024-09-15',
      '2024-12-15',
      '2025-03-15',
      '2025-06-15',
      '2025-09-15',
      '2025-12-15',
      '2026-03-15'
    ];
    const portfolioValues = [];

    dates.forEach((d) => {
      let totalVal = 0;
      let valid = true;
      holdings.forEach((h) => {
        const fund = this.funds.find((f) => f.id === h.fundId);
        const pt = fund?.historicalNav?.find((p) => p.date === d);
        if (pt) {
          totalVal += h.units * pt.nav;
        } else {
          valid = false;
        }
      });
      if (valid && totalVal > 0) portfolioValues.push(totalVal);
    });

    if (portfolioValues.length < 4) {
      return {
        volatility: null,
        sharpeRatio: null,
        maxDrawdown: null,
        riskScore: null,
        riskLevel: 'Building Historical Track Record',
        assumptions,
        isInsufficientData: true,
        concentrationScore: 0,
        disclaimer
      };
    }

    const returns = [];
    for (let i = 1; i < portfolioValues.length; i++) {
      const prev = portfolioValues[i - 1];
      const curr = portfolioValues[i];
      returns.push(((curr - prev) / prev) * 100);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    const vol = Math.sqrt(variance) * 2;

    let peak = portfolioValues[0];
    let maxDd = 0;
    portfolioValues.forEach((val) => {
      if (val > peak) peak = val;
      const dd = ((peak - val) / peak) * 100;
      if (dd > maxDd) maxDd = dd;
    });

    const summary = this.getSummary();
    const sharpe = vol > 0 ? (summary.overallReturnPercent - this.riskFreeRate) / vol : 0;

    let hhi = 0;
    holdings.forEach((h) => {
      const weight = summary.currentValue > 0 ? h.currentValue / summary.currentValue : 0;
      hhi += Math.pow(weight, 2);
    });
    const concentrationScore = hhi * 100;

    const volScore = Math.min(100, (vol / 25) * 100);
    const mddScore = Math.min(100, (maxDd / 30) * 100);
    const concScore = Math.min(100, concentrationScore * 1.5);
    const finalRiskScore = Math.round(volScore * 0.4 + mddScore * 0.3 + concScore * 0.3);

    let level = 'Moderate';
    if (finalRiskScore < 35) level = 'Low';
    else if (finalRiskScore < 65) level = 'Moderate';
    else if (finalRiskScore < 85) level = 'High';
    else level = 'Very High';

    return {
      volatility: Number(vol.toFixed(2)),
      sharpeRatio: Number(sharpe.toFixed(2)),
      maxDrawdown: Number(maxDd.toFixed(2)),
      riskScore: finalRiskScore,
      riskLevel: level,
      assumptions,
      isInsufficientData: false,
      concentrationScore: Number(concentrationScore.toFixed(1)),
      disclaimer
    };
  }

  getDiversification() {
    const holdings = this.getHoldings();
    const summary = this.getSummary();
    const totalVal = summary.currentValue > 0 ? summary.currentValue : 1;

    if (holdings.length === 0) {
      return {
        fundCount: 0,
        categoryDistribution: [],
        fundHouseDistribution: [],
        assetAllocation: { equity: 0, debt: 0, cash: 0 },
        concentrationObservation: 'No investments logged yet. Add your first fund to view allocation insights.'
      };
    }

    const catMap = new Map();
    const fhMap = new Map();
    let eq = 0;
    let dt = 0;
    let cs = 0;

    holdings.forEach((h) => {
      catMap.set(h.category, (catMap.get(h.category) || 0) + h.currentValue);
      const fund = this.funds.find((f) => f.id === h.fundId);
      const fh = fund?.fundHouse || 'Other';
      fhMap.set(fh, (fhMap.get(fh) || 0) + h.currentValue);

      const weight = h.currentValue / totalVal;
      eq += (fund?.assetAllocation?.equity ?? 85) * weight;
      dt += (fund?.assetAllocation?.debt ?? 10) * weight;
      cs += (fund?.assetAllocation?.cash ?? 5) * weight;
    });

    const categoryDistribution = Array.from(catMap.entries())
      .map(([name, amount]) => ({
        name,
        value: Number(amount.toFixed(2)),
        amount: Number(amount.toFixed(2)),
        percentage: Number(((amount / totalVal) * 100).toFixed(1))
      }))
      .sort((a, b) => b.amount - a.amount);

    const fundHouseDistribution = Array.from(fhMap.entries())
      .map(([name, amount]) => ({
        name,
        value: Number(amount.toFixed(2)),
        amount: Number(amount.toFixed(2)),
        percentage: Number(((amount / totalVal) * 100).toFixed(1))
      }))
      .sort((a, b) => b.amount - a.amount);

    let concentrationObservation = 'Diversified allocation.';
    if (categoryDistribution.length > 0) {
      const top = categoryDistribution[0];
      if (top.percentage >= 40) {
        concentrationObservation = `${top.percentage}% of your portfolio is concentrated in ${top.name}.`;
      } else {
        concentrationObservation = `Your portfolio is spread across ${categoryDistribution.length} categories, led by ${top.name} (${top.percentage}%).`;
      }
    }

    return {
      fundCount: holdings.length,
      categoryDistribution,
      fundHouseDistribution,
      assetAllocation: {
        equity: Number(eq.toFixed(1)),
        debt: Number(dt.toFixed(1)),
        cash: Number(Math.max(0, 100 - eq - dt).toFixed(1))
      },
      concentrationObservation
    };
  }

  getRankings() {
    const ranked = this.funds.map((f) => {
      const metricsUsed = [];
      let totalW = 0;

      let rScore = 0;
      if (f.returns1y !== null && f.returns1y !== undefined) {
        metricsUsed.push('1Y Historical Return');
        totalW += 0.4;
        rScore = Math.max(0, Math.min(100, (f.returns1y / 40) * 100));
      }

      let raScore = 0;
      if (f.returns3y !== null && f.returns3y !== undefined) {
        metricsUsed.push('3Y Risk Adjusted');
        totalW += 0.25;
        const penalty = f.risk === 'Very High' ? 0.85 : 0.95;
        raScore = Math.max(0, Math.min(100, ((f.returns3y * penalty) / 30) * 100));
      }

      let cScore = 0;
      if (
        f.returns1y !== null &&
        f.returns3y !== null &&
        f.returns1y !== undefined &&
        f.returns3y !== undefined
      ) {
        metricsUsed.push('Consistency');
        totalW += 0.2;
        const diff = Math.abs(f.returns1y - f.returns3y);
        cScore = Math.max(10, Math.min(100, 100 - diff * 2.5));
      }

      let eScore = 0;
      if (f.expenseRatio !== null && f.expenseRatio !== undefined) {
        metricsUsed.push('Low Expense Ratio');
        totalW += 0.15;
        eScore = Math.max(10, Math.min(100, 100 - (f.expenseRatio - 0.2) * 50));
      }

      const overall =
        totalW > 0
          ? (rScore * 0.4 + raScore * 0.25 + cScore * 0.2 + eScore * 0.15) / totalW
          : 0;

      return {
        rank: 0,
        fundId: f.id,
        fundName: f.name,
        category: f.category,
        fundHouse: f.fundHouse,
        overallScore: Number(overall.toFixed(1)),
        returnScore: Number(rScore.toFixed(1)),
        riskAdjustedScore: Number(raScore.toFixed(1)),
        consistencyScore: Number(cScore.toFixed(1)),
        expenseScore: Number(eScore.toFixed(1)),
        metricsUsed,
        currentNav: f.nav,
        returns1y: f.returns1y,
        returns3y: f.returns3y,
        expenseRatio: f.expenseRatio
      };
    });

    ranked.sort((a, b) => b.overallScore - a.overallScore);
    ranked.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return ranked;
  }
}

export const storeClient = new StoreClient();
