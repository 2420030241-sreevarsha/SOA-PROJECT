export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  pan: string;
  dob: string;
  investorId: string;
  kycStatus: 'VERIFIED' | 'PENDING' | 'ACTION_REQUIRED';
  ckycNumber: string;
  kraAgency: string;
  riskProfile: 'Conservative' | 'Moderate' | 'Moderately High' | 'Aggressive';
  investmentHorizon: string;
  primaryGoal: string;
  annualIncome: string;
  bankName: string;
  accountNumberMasked: string;
  accountType: string;
  ifsc: string;
  mandateStatus: string;
  mandateLimit: number;
  nomineeName: string;
  nomineeRelation: string;
  nomineeShare: number;
  monthlyTarget: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface NavHistoryPoint {
  date: string;
  nav: number;
}

export interface AssetAllocation {
  equity?: number;
  debt?: number;
  cash?: number;
  other?: number;
}

export interface MutualFund {
  id: string;
  name: string;
  schemeName: string;
  category: string;
  fundHouse: string;
  nav: number | null;
  navDate: string | null;
  expenseRatio: number | null;
  aum: number | null; // in Crores
  risk: string | null; // Low, Moderate, High, Very High
  returns1y: number | null;
  returns3y: number | null;
  returns5y: number | null;
  assetAllocation?: AssetAllocation | null;
  historicalNav?: NavHistoryPoint[];
}

export interface Holding {
  id: string;
  userId: string;
  fundId: string;
  fundName: string;
  category: string;
  units: number;
  averagePurchasePrice: number;
  investedAmount: number;
  currentNav: number | null;
  currentValue: number;
  profitLoss: number;
  returnPercent: number;
}

export type TransactionType = 'BUY' | 'SELL' | 'SIP';

export interface Transaction {
  id: string;
  userId: string;
  fundId: string;
  fundName: string;
  type: TransactionType;
  date: string;
  amount: number;
  nav: number;
  units: number;
  notes?: string;
}

export interface SIPRecord {
  id: string;
  userId: string;
  fundId: string;
  fundName: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly';
  startDate: string;
  dayOfMonth: number;
  active: boolean;
  totalInvested: number;
  unitsAccumulated: number;
  currentValue: number;
  profitLoss: number;
  returnPercent: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  overallReturnPercent: number;
  fundCount: number;
  transactionCount: number;
  monthlySipAmount: number;
  isDemo: boolean;
}

export interface RiskMetrics {
  volatility: number | null;
  sharpeRatio: number | null;
  maxDrawdown: number | null;
  riskScore: number | null; // 0-100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Insufficient historical data';
  assumptions: string[];
  isInsufficientData: boolean;
  concentrationScore: number;
  disclaimer: string;
}

export interface DistributionSlice {
  name: string;
  value: number;
  amount: number;
  percentage: number;
}

export interface DiversificationData {
  fundCount: number;
  categoryDistribution: DistributionSlice[];
  fundHouseDistribution: DistributionSlice[];
  assetAllocation: {
    equity: number;
    debt: number;
    cash: number;
  };
  concentrationObservation: string;
}

export interface FundRankingItem {
  rank: number;
  fundId: string;
  fundName: string;
  category: string;
  fundHouse: string;
  overallScore: number;
  returnScore: number;
  riskAdjustedScore: number;
  consistencyScore: number;
  expenseScore: number;
  metricsUsed: string[];
  currentNav: number | null;
  returns1y: number | null;
  returns3y: number | null;
  expenseRatio: number | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'VALUE_CHANGE' | 'VOLATILITY' | 'CONCENTRATION' | 'DATA_WARNING' | 'SIP_REMINDER' | 'SYSTEM';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DatasetSummary {
  isDemo: boolean;
  totalRecords: number;
  processedRecords: number;
  duplicateRecords: number;
  missingValues: number;
  invalidRecords: number;
  detectedColumns: Record<string, string>;
  lastUploadedAt?: string;
  columnsList: string[];
  sampleRows: Record<string, string | number>[];
}

export interface AIInsightResponse {
  summary: string;
  performanceObservation: string;
  riskObservation: string;
  diversificationObservation: string;
  historicalTrendObservation: string;
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
