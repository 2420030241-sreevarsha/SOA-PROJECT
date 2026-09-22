import { MutualFund, Holding, Transaction, SIPRecord, NotificationItem, DatasetSummary } from '../src/types.js';

// Realistic Indian Mutual Funds Initial Demo Dataset
// Clearly marked as Demo Data until real CSV is uploaded
export const INITIAL_DEMO_FUNDS: MutualFund[] = [
  {
    id: 'fund-1',
    name: 'Mirae Asset Large Cap Fund - Direct Plan - Growth',
    schemeName: 'Mirae Asset Large Cap Fund',
    category: 'Large Cap',
    fundHouse: 'Mirae Asset Mutual Fund',
    nav: 118.45,
    navDate: '2026-03-15',
    expenseRatio: 0.54,
    aum: 38250,
    risk: 'Very High',
    returns1y: 18.6,
    returns3y: 15.2,
    returns5y: 16.8,
    assetAllocation: { equity: 97.2, debt: 1.1, cash: 1.7 },
    historicalNav: [
      { date: '2023-03-15', nav: 82.30 },
      { date: '2023-06-15', nav: 86.40 },
      { date: '2023-09-15', nav: 89.10 },
      { date: '2023-12-15', nav: 93.80 },
      { date: '2024-03-15', nav: 96.50 },
      { date: '2024-06-15', nav: 101.20 },
      { date: '2024-09-15', nav: 106.80 },
      { date: '2024-12-15', nav: 110.40 },
      { date: '2025-03-15', nav: 104.20 },
      { date: '2025-06-15', nav: 109.80 },
      { date: '2025-09-15', nav: 114.30 },
      { date: '2025-12-15', nav: 116.10 },
      { date: '2026-03-15', nav: 118.45 },
    ]
  },
  {
    id: 'fund-2',
    name: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
    schemeName: 'Parag Parikh Flexi Cap Fund',
    category: 'Flexi Cap',
    fundHouse: 'PPFAS Mutual Fund',
    nav: 78.92,
    navDate: '2026-03-15',
    expenseRatio: 0.62,
    aum: 65400,
    risk: 'Very High',
    returns1y: 24.8,
    returns3y: 20.4,
    returns5y: 22.1,
    assetAllocation: { equity: 84.5, debt: 10.2, cash: 5.3 },
    historicalNav: [
      { date: '2023-03-15', nav: 49.10 },
      { date: '2023-06-15', nav: 52.80 },
      { date: '2023-09-15', nav: 56.40 },
      { date: '2023-12-15', nav: 61.20 },
      { date: '2024-03-15', nav: 64.90 },
      { date: '2024-06-15', nav: 68.30 },
      { date: '2024-09-15', nav: 72.10 },
      { date: '2024-12-15', nav: 74.80 },
      { date: '2025-03-15', nav: 70.20 },
      { date: '2025-06-15', nav: 74.50 },
      { date: '2025-09-15', nav: 76.80 },
      { date: '2025-12-15', nav: 77.90 },
      { date: '2026-03-15', nav: 78.92 },
    ]
  },
  {
    id: 'fund-3',
    name: 'HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth',
    schemeName: 'HDFC Mid-Cap Opportunities Fund',
    category: 'Mid Cap',
    fundHouse: 'HDFC Mutual Fund',
    nav: 172.60,
    navDate: '2026-03-15',
    expenseRatio: 0.81,
    aum: 68900,
    risk: 'Very High',
    returns1y: 31.2,
    returns3y: 25.6,
    returns5y: 23.4,
    assetAllocation: { equity: 94.8, debt: 0.5, cash: 4.7 },
    historicalNav: [
      { date: '2023-03-15', nav: 98.40 },
      { date: '2023-06-15', nav: 108.20 },
      { date: '2023-09-15', nav: 119.50 },
      { date: '2023-12-15', nav: 130.10 },
      { date: '2024-03-15', nav: 138.60 },
      { date: '2024-06-15', nav: 148.90 },
      { date: '2024-09-15', nav: 159.20 },
      { date: '2024-12-15', nav: 164.70 },
      { date: '2025-03-15', nav: 152.80 },
      { date: '2025-06-15', nav: 161.40 },
      { date: '2025-09-15', nav: 168.10 },
      { date: '2025-12-15', nav: 170.50 },
      { date: '2026-03-15', nav: 172.60 },
    ]
  },
  {
    id: 'fund-4',
    name: 'Nippon India Small Cap Fund - Direct Plan - Growth',
    schemeName: 'Nippon India Small Cap Fund',
    category: 'Small Cap',
    fundHouse: 'Nippon India Mutual Fund',
    nav: 164.15,
    navDate: '2026-03-15',
    expenseRatio: 0.73,
    aum: 52400,
    risk: 'Very High',
    returns1y: 34.5,
    returns3y: 28.1,
    returns5y: 27.8,
    assetAllocation: { equity: 96.1, debt: 0.2, cash: 3.7 },
    historicalNav: [
      { date: '2023-03-15', nav: 88.60 },
      { date: '2023-06-15', nav: 99.40 },
      { date: '2023-09-15', nav: 112.80 },
      { date: '2023-12-15', nav: 125.70 },
      { date: '2024-03-15', nav: 133.20 },
      { date: '2024-06-15', nav: 144.10 },
      { date: '2024-09-15', nav: 155.80 },
      { date: '2024-12-15', nav: 160.20 },
      { date: '2025-03-15', nav: 145.60 },
      { date: '2025-06-15', nav: 153.90 },
      { date: '2025-09-15', nav: 161.40 },
      { date: '2025-12-15', nav: 162.80 },
      { date: '2026-03-15', nav: 164.15 },
    ]
  },
  {
    id: 'fund-5',
    name: 'SBI Balanced Advantage Fund - Direct Plan - Growth',
    schemeName: 'SBI Balanced Advantage Fund',
    category: 'Hybrid',
    fundHouse: 'SBI Mutual Fund',
    nav: 14.85,
    navDate: '2026-03-15',
    expenseRatio: 0.69,
    aum: 31200,
    risk: 'Moderate',
    returns1y: 14.2,
    returns3y: 12.8,
    returns5y: null, // Test "Data not available"
    assetAllocation: { equity: 62.4, debt: 28.6, cash: 9.0 },
    historicalNav: [
      { date: '2023-03-15', nav: 11.50 },
      { date: '2023-06-15', nav: 11.95 },
      { date: '2023-09-15', nav: 12.30 },
      { date: '2023-12-15', nav: 12.75 },
      { date: '2024-03-15', nav: 13.10 },
      { date: '2024-06-15', nav: 13.55 },
      { date: '2024-09-15', nav: 13.90 },
      { date: '2024-12-15', nav: 14.20 },
      { date: '2025-03-15', nav: 13.95 },
      { date: '2025-06-15', nav: 14.30 },
      { date: '2025-09-15', nav: 14.55 },
      { date: '2025-12-15', nav: 14.70 },
      { date: '2026-03-15', nav: 14.85 },
    ]
  },
  {
    id: 'fund-6',
    name: 'ICICI Prudential Corporate Bond Fund - Direct Plan - Growth',
    schemeName: 'ICICI Prudential Corporate Bond Fund',
    category: 'Debt',
    fundHouse: 'ICICI Prudential Mutual Fund',
    nav: 27.42,
    navDate: '2026-03-15',
    expenseRatio: 0.32,
    aum: 24800,
    risk: 'Low',
    returns1y: 7.8,
    returns3y: 7.2,
    returns5y: 7.5,
    assetAllocation: { equity: 0.0, debt: 96.5, cash: 3.5 },
    historicalNav: [
      { date: '2023-03-15', nav: 22.80 },
      { date: '2023-06-15', nav: 23.20 },
      { date: '2023-09-15', nav: 23.65 },
      { date: '2023-12-15', nav: 24.10 },
      { date: '2024-03-15', nav: 24.55 },
      { date: '2024-06-15', nav: 25.00 },
      { date: '2024-09-15', nav: 25.50 },
      { date: '2024-12-15', nav: 26.00 },
      { date: '2025-03-15', nav: 26.40 },
      { date: '2025-06-15', nav: 26.75 },
      { date: '2025-09-15', nav: 27.05 },
      { date: '2025-12-15', nav: 27.25 },
      { date: '2026-03-15', nav: 27.42 },
    ]
  },
  {
    id: 'fund-7',
    name: 'Kotak Emerging Equity Fund - Direct Plan - Growth',
    schemeName: 'Kotak Emerging Equity Fund',
    category: 'Mid Cap',
    fundHouse: 'Kotak Mahindra Mutual Fund',
    nav: 124.30,
    navDate: '2026-03-15',
    expenseRatio: 0.78,
    aum: 44200,
    risk: 'Very High',
    returns1y: 28.4,
    returns3y: 22.1,
    returns5y: 21.0,
    assetAllocation: { equity: 95.5, debt: 0.8, cash: 3.7 },
    historicalNav: [
      { date: '2023-03-15', nav: 72.10 },
      { date: '2023-06-15', nav: 78.40 },
      { date: '2023-09-15', nav: 85.90 },
      { date: '2023-12-15', nav: 94.20 },
      { date: '2024-03-15', nav: 101.50 },
      { date: '2024-06-15', nav: 109.00 },
      { date: '2024-09-15', nav: 116.30 },
      { date: '2024-12-15', nav: 119.80 },
      { date: '2025-03-15', nav: 111.40 },
      { date: '2025-06-15', nav: 117.80 },
      { date: '2025-09-15', nav: 121.50 },
      { date: '2025-12-15', nav: 123.10 },
      { date: '2026-03-15', nav: 124.30 },
    ]
  },
  {
    id: 'fund-8',
    name: 'Axis ELSS Tax Saver Fund - Direct Plan - Growth',
    schemeName: 'Axis ELSS Tax Saver Fund',
    category: 'ELSS',
    fundHouse: 'Axis Mutual Fund',
    nav: 92.15,
    navDate: '2026-03-15',
    expenseRatio: 0.85,
    aum: 33900,
    risk: 'Very High',
    returns1y: 16.2,
    returns3y: 13.9,
    returns5y: 15.1,
    assetAllocation: { equity: 93.8, debt: 1.5, cash: 4.7 },
    historicalNav: [
      { date: '2023-03-15', nav: 61.20 },
      { date: '2023-06-15', nav: 65.40 },
      { date: '2023-09-15', nav: 69.80 },
      { date: '2023-12-15', nav: 74.50 },
      { date: '2024-03-15', nav: 78.20 },
      { date: '2024-06-15', nav: 82.00 },
      { date: '2024-09-15', nav: 86.40 },
      { date: '2024-12-15', nav: 88.90 },
      { date: '2025-03-15', nav: 82.50 },
      { date: '2025-06-15', nav: 86.80 },
      { date: '2025-09-15', nav: 89.90 },
      { date: '2025-12-15', nav: 91.20 },
      { date: '2026-03-15', nav: 92.15 },
    ]
  }
];

export interface InternalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export class InMemoryStore {
  public users: InternalUser[] = [
    {
      id: 'usr-default',
      name: 'Ananya Sharma',
      email: 'ananya.sharma@example.edu',
      passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' // demo hashed
    }
  ];

  public funds: MutualFund[] = [...INITIAL_DEMO_FUNDS];
  public isDatasetDemo: boolean = true;
  public datasetSummary: DatasetSummary = {
    isDemo: true,
    totalRecords: INITIAL_DEMO_FUNDS.length,
    processedRecords: INITIAL_DEMO_FUNDS.length,
    duplicateRecords: 0,
    missingValues: 1, // fund-5 has missing 5y returns
    invalidRecords: 0,
    detectedColumns: {
      scheme_name: 'Fund / Scheme Name',
      category: 'Category',
      fund_house: 'Fund House',
      nav: 'Current NAV',
      nav_date: 'NAV Date',
      expense_ratio: 'Expense Ratio',
      aum: 'AUM (Cr)',
      risk: 'Risk Level',
      returns_1y: '1 Year Return (%)',
      returns_3y: '3 Year Return (%)',
      returns_5y: '5 Year Return (%)'
    },
    columnsList: ['scheme_name', 'category', 'fund_house', 'nav', 'nav_date', 'expense_ratio', 'aum', 'risk', 'returns_1y', 'returns_3y', 'returns_5y'],
    sampleRows: INITIAL_DEMO_FUNDS.slice(0, 5).map(f => ({
      scheme_name: f.name,
      category: f.category,
      fund_house: f.fundHouse,
      nav: f.nav ?? 'Data not available',
      expense_ratio: f.expenseRatio ?? 'Data not available',
      aum: f.aum ?? 'Data not available'
    }))
  };

  // User initial transactions (realistic non-hardcoded programmatic holdings)
  public transactions: Transaction[] = [
    {
      id: 'tx-1',
      userId: 'usr-default',
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
      id: 'tx-2',
      userId: 'usr-default',
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
      id: 'tx-3',
      userId: 'usr-default',
      fundId: 'fund-2',
      fundName: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
      type: 'SIP',
      date: '2024-06-05',
      amount: 15000,
      nav: 68.30,
      units: 219.619,
      notes: 'Monthly SIP installment'
    },
    {
      id: 'tx-4',
      userId: 'usr-default',
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
      id: 'tx-5',
      userId: 'usr-default',
      fundId: 'fund-5',
      fundName: 'SBI Balanced Advantage Fund - Direct Plan - Growth',
      type: 'BUY',
      date: '2024-08-15',
      amount: 25000,
      nav: 13.70,
      units: 1824.818,
      notes: 'Hybrid dynamic asset allocation'
    }
  ];

  public sips: SIPRecord[] = [
    {
      id: 'sip-1',
      userId: 'usr-default',
      fundId: 'fund-2',
      fundName: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
      amount: 15000,
      frequency: 'Monthly',
      startDate: '2024-05-05',
      dayOfMonth: 5,
      active: true,
      totalInvested: 30000,
      unitsAccumulated: 444.17,
      currentValue: 35053.89,
      profitLoss: 5053.89,
      returnPercent: 16.85
    }
  ];

  public notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'usr-default',
      type: 'SYSTEM',
      title: 'SOA Architecture Initialized',
      message: 'All 7 logical services are operational and loosely coupled for educational analysis.',
      createdAt: new Date().toISOString(),
      read: false
    },
    {
      id: 'notif-2',
      userId: 'usr-default',
      type: 'CONCENTRATION',
      title: 'Portfolio Concentration Alert',
      message: 'Notice: Large Cap and Flexi Cap represent over 60% of your current equity holdings.',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      read: false
    },
    {
      id: 'notif-3',
      userId: 'usr-default',
      type: 'SIP_REMINDER',
      title: 'Upcoming Monthly SIP',
      message: 'Your monthly SIP of ₹15,000 for Parag Parikh Flexi Cap Fund is scheduled for the 5th.',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      read: true
    }
  ];

  // Helper to calculate user holdings programmatically
  public getHoldingsForUser(userId: string): Holding[] {
    const userTxs = this.transactions.filter(t => t.userId === userId);
    const fundMap = new Map<string, { units: number; invested: number; fundId: string; fundName: string }>();

    for (const tx of userTxs) {
      const existing = fundMap.get(tx.fundId) || {
        units: 0,
        invested: 0,
        fundId: tx.fundId,
        fundName: tx.fundName
      };

      if (tx.type === 'BUY' || tx.type === 'SIP') {
        existing.units += tx.units;
        existing.invested += tx.amount;
      } else if (tx.type === 'SELL') {
        const avgPrice = existing.units > 0 ? existing.invested / existing.units : 0;
        existing.units = Math.max(0, existing.units - tx.units);
        existing.invested = Math.max(0, existing.invested - (tx.units * avgPrice));
      }
      fundMap.set(tx.fundId, existing);
    }

    const holdings: Holding[] = [];
    for (const [fundId, data] of fundMap.entries()) {
      if (data.units <= 0.0001) continue;

      const fund = this.funds.find(f => f.id === fundId);
      const currentNav = fund?.nav ?? null;
      const avgPrice = data.units > 0 ? data.invested / data.units : 0;
      const currentValue = currentNav !== null ? data.units * currentNav : data.invested;
      const profitLoss = currentValue - data.invested;
      const returnPercent = data.invested > 0 ? (profitLoss / data.invested) * 100 : 0;

      holdings.push({
        id: `hld-${fundId}`,
        userId,
        fundId,
        fundName: fund?.name || data.fundName,
        category: fund?.category || 'General',
        units: Number(data.units.toFixed(4)),
        averagePurchasePrice: Number(avgPrice.toFixed(2)),
        investedAmount: Number(data.invested.toFixed(2)),
        currentNav,
        currentValue: Number(currentValue.toFixed(2)),
        profitLoss: Number(profitLoss.toFixed(2)),
        returnPercent: Number(returnPercent.toFixed(2))
      });
    }

    return holdings;
  }

  // Calculate portfolio summary programmatically
  public getPortfolioSummary(userId: string) {
    const holdings = this.getHoldingsForUser(userId);
    const userTxs = this.transactions.filter(t => t.userId === userId);
    const userSips = this.sips.filter(s => s.userId === userId && s.active);

    const totalInvested = holdings.reduce((sum, h) => sum + h.investedAmount, 0);
    const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalProfitLoss = currentValue - totalInvested;
    const overallReturnPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    const monthlySipAmount = userSips.reduce((sum, s) => sum + s.amount, 0);

    return {
      totalInvested: Number(totalInvested.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
      overallReturnPercent: Number(overallReturnPercent.toFixed(2)),
      fundCount: holdings.length,
      transactionCount: userTxs.length,
      monthlySipAmount,
      isDemo: this.isDatasetDemo
    };
  }
}

export const store = new InMemoryStore();
