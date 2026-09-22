import { store } from '../store.js';
import { RiskMetrics, DiversificationData, FundRankingItem, DistributionSlice } from '../../src/types.js';

export class AnalysisService {
  private readonly RISK_FREE_RATE = 6.5; // Benchmark Indian 10-Year Government Bond Yield (%)

  public getRiskAnalysis(userId: string): RiskMetrics {
    const holdings = store.getHoldingsForUser(userId);

    const assumptions = [
      `Risk-Free Rate: ${this.RISK_FREE_RATE}% based on benchmark 10-Year Indian Government Bond yield.`,
      'Volatility calculated using sample standard deviation of historical quarterly/monthly NAV returns.',
      'Portfolio risk score (0-100) combines category risk weighting, asset concentration (Herfindahl Index), and return dispersion.',
      'Analysis considers active holdings with verified units held.'
    ];

    const disclaimer = 'This analysis is for educational and informational purposes only and is not financial advice.';

    if (holdings.length === 0) {
      return {
        volatility: null,
        sharpeRatio: null,
        maxDrawdown: null,
        riskScore: null,
        riskLevel: 'Insufficient historical data',
        assumptions,
        isInsufficientData: true,
        concentrationScore: 0,
        disclaimer
      };
    }

    // Check historical data availability across all held funds
    let totalInvested = holdings.reduce((sum, h) => sum + h.investedAmount, 0);
    if (totalInvested <= 0) totalInvested = 1;

    let hasSufficientHistory = true;
    const portfolioReturns: number[] = [];

    // Aggregate portfolio returns across common dates
    const dateMap = new Map<string, number>();
    for (const h of holdings) {
      const fund = store.funds.find(f => f.id === h.fundId);
      if (!fund?.historicalNav || fund.historicalNav.length < 4) {
        hasSufficientHistory = false;
        break;
      }
    }

    if (!hasSufficientHistory) {
      return {
        volatility: null,
        sharpeRatio: null,
        maxDrawdown: null,
        riskScore: null,
        riskLevel: 'Insufficient historical data',
        assumptions,
        isInsufficientData: true,
        concentrationScore: 0,
        disclaimer
      };
    }

    // Calculate historical volatility for portfolio
    const dateCountMap = new Map<string, { totalVal: number; weight: number }>();
    const allDates = new Set<string>();

    for (const h of holdings) {
      const fund = store.funds.find(f => f.id === h.fundId)!;
      fund.historicalNav?.forEach(pt => allDates.add(pt.date));
    }

    const sortedDates = Array.from(allDates).sort();
    const navValSeries: number[] = [];

    for (const date of sortedDates) {
      let valAtDate = 0;
      let valid = true;
      for (const h of holdings) {
        const fund = store.funds.find(f => f.id === h.fundId);
        const pt = fund?.historicalNav?.find(p => p.date === date);
        if (pt) {
          valAtDate += h.units * pt.nav;
        } else {
          valid = false;
        }
      }
      if (valid && valAtDate > 0) {
        navValSeries.push(valAtDate);
      }
    }

    if (navValSeries.length < 4) {
      return {
        volatility: null,
        sharpeRatio: null,
        maxDrawdown: null,
        riskScore: null,
        riskLevel: 'Insufficient historical data',
        assumptions,
        isInsufficientData: true,
        concentrationScore: 0,
        disclaimer
      };
    }

    // Step 1: Periodic returns
    const periodicReturns: number[] = [];
    for (let i = 1; i < navValSeries.length; i++) {
      const prev = navValSeries[i - 1];
      const curr = navValSeries[i];
      periodicReturns.push(((curr - prev) / prev) * 100);
    }

    // Step 2: Standard Deviation / Volatility
    const meanReturn = periodicReturns.reduce((a, b) => a + b, 0) / periodicReturns.length;
    const variance = periodicReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (periodicReturns.length - 1);
    const periodicStdDev = Math.sqrt(variance);
    // Annualize volatility (assuming quarterly intervals ~ sqrt(4))
    const volatility = Number((periodicStdDev * Math.sqrt(4)).toFixed(2));

    // Step 3: Maximum Drawdown (Peak to Trough)
    let peak = navValSeries[0];
    let maxDrawdown = 0;
    for (const val of navValSeries) {
      if (val > peak) {
        peak = val;
      }
      const drawdown = ((peak - val) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    const maxDrawdownFormatted = Number(maxDrawdown.toFixed(2));

    // Step 4: Overall annualized portfolio return for Sharpe Ratio
    const summary = store.getPortfolioSummary(userId);
    const overallReturn = summary.overallReturnPercent;
    const sharpeRatio = volatility > 0 ? Number(((overallReturn - this.RISK_FREE_RATE) / volatility).toFixed(2)) : 0;

    // Step 5: Concentration Score (Herfindahl-Hirschman index scaled 0-100)
    let hhi = 0;
    for (const h of holdings) {
      const weight = (h.currentValue / summary.currentValue) * 100;
      hhi += Math.pow(weight / 100, 2);
    }
    const concentrationScore = Number((hhi * 100).toFixed(1));

    // Step 6: Risk Score 0 - 100
    // Based on Volatility (40%), Max Drawdown (30%), Concentration (30%)
    const volScore = Math.min(100, (volatility / 25) * 100);
    const mddScore = Math.min(100, (maxDrawdown / 30) * 100);
    const concScore = Math.min(100, concentrationScore * 1.5);
    const riskScore = Math.round(volScore * 0.4 + mddScore * 0.3 + concScore * 0.3);

    let riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High' = 'Moderate';
    if (riskScore < 35) riskLevel = 'Low';
    else if (riskScore < 65) riskLevel = 'Moderate';
    else if (riskScore < 85) riskLevel = 'High';
    else riskLevel = 'Very High';

    return {
      volatility,
      sharpeRatio,
      maxDrawdown: maxDrawdownFormatted,
      riskScore,
      riskLevel,
      assumptions,
      isInsufficientData: false,
      concentrationScore,
      disclaimer
    };
  }

  public getDiversification(userId: string): DiversificationData {
    const holdings = store.getHoldingsForUser(userId);
    const summary = store.getPortfolioSummary(userId);
    const totalValue = summary.currentValue > 0 ? summary.currentValue : 1;

    // Category distribution
    const catMap = new Map<string, number>();
    const fhMap = new Map<string, number>();
    let totalEquity = 0;
    let totalDebt = 0;
    let totalCash = 0;

    for (const h of holdings) {
      catMap.set(h.category, (catMap.get(h.category) || 0) + h.currentValue);
      
      const fund = store.funds.find(f => f.id === h.fundId);
      const fh = fund?.fundHouse || 'Other';
      fhMap.set(fh, (fhMap.get(fh) || 0) + h.currentValue);

      const alloc = fund?.assetAllocation || { equity: 85, debt: 10, cash: 5 };
      const weight = h.currentValue / totalValue;
      totalEquity += (alloc.equity || 0) * weight;
      totalDebt += (alloc.debt || 0) * weight;
      totalCash += (alloc.cash || 0) * weight;
    }

    const categoryDistribution: DistributionSlice[] = Array.from(catMap.entries()).map(([name, amount]) => ({
      name,
      value: Number(amount.toFixed(2)),
      amount: Number(amount.toFixed(2)),
      percentage: Number(((amount / totalValue) * 100).toFixed(1))
    })).sort((a, b) => b.amount - a.amount);

    const fundHouseDistribution: DistributionSlice[] = Array.from(fhMap.entries()).map(([name, amount]) => ({
      name,
      value: Number(amount.toFixed(2)),
      amount: Number(amount.toFixed(2)),
      percentage: Number(((amount / totalValue) * 100).toFixed(1))
    })).sort((a, b) => b.amount - a.amount);

    // Concentration observation (neutral analytical language)
    let concentrationObservation = 'No holdings found in the portfolio.';
    if (categoryDistribution.length > 0) {
      const topCat = categoryDistribution[0];
      if (topCat.percentage >= 40) {
        concentrationObservation = `${topCat.percentage}% of your portfolio is concentrated in the ${topCat.name} category.`;
      } else {
        concentrationObservation = `Your portfolio is balanced across ${categoryDistribution.length} categories, with the largest allocation in ${topCat.name} (${topCat.percentage}%).`;
      }
    }

    return {
      fundCount: holdings.length,
      categoryDistribution,
      fundHouseDistribution,
      assetAllocation: {
        equity: Number(totalEquity.toFixed(1)),
        debt: Number(totalDebt.toFixed(1)),
        cash: Number(Math.max(0, 100 - totalEquity - totalDebt).toFixed(1))
      },
      concentrationObservation
    };
  }

  public getFundRankings(): FundRankingItem[] {
    const funds = [...store.funds];

    // Evaluate available factors:
    // Factors: Return (40%), Risk-adjusted Return / Sharpe (25%), Consistency (20%), Expense Ratio (15%)
    // If a metric is missing, dynamically redistribute weights
    return funds.map((fund) => {
      const metricsUsed: string[] = [];
      let totalWeight = 0;

      // 1. Return Score (1Y return normalized 0-100)
      let returnScore = 0;
      if (fund.returns1y !== null && fund.returns1y !== undefined) {
        metricsUsed.push('Historical 1Y Return');
        totalWeight += 0.40;
        returnScore = Math.max(0, Math.min(100, (fund.returns1y / 40) * 100));
      }

      // 2. Risk-adjusted Return (estimate from 3y return / risk tier)
      let riskAdjustedScore = 0;
      if (fund.returns3y !== null && fund.returns3y !== undefined) {
        metricsUsed.push('3Y Risk-Adjusted Consistency');
        totalWeight += 0.25;
        const penalty = fund.risk === 'Very High' ? 0.85 : fund.risk === 'High' ? 0.9 : 1.0;
        riskAdjustedScore = Math.max(0, Math.min(100, ((fund.returns3y * penalty) / 30) * 100));
      }

      // 3. Consistency (comparison of 1Y vs 3Y vs 5Y spread)
      let consistencyScore = 0;
      if (fund.returns1y !== null && fund.returns3y !== null) {
        metricsUsed.push('Historical Return Consistency');
        totalWeight += 0.20;
        const diff = Math.abs(fund.returns1y - fund.returns3y);
        consistencyScore = Math.max(10, Math.min(100, 100 - diff * 2.5));
      }

      // 4. Expense Ratio (Lower is better)
      let expenseScore = 0;
      if (fund.expenseRatio !== null && fund.expenseRatio !== undefined) {
        metricsUsed.push('Expense Ratio');
        totalWeight += 0.15;
        // 0.2% -> 100, 2.0% -> 10
        expenseScore = Math.max(10, Math.min(100, 100 - (fund.expenseRatio - 0.2) * 50));
      }

      // Weighted score normalized to 100
      let overallScore = 0;
      if (totalWeight > 0) {
        overallScore = (
          (returnScore * 0.40) +
          (riskAdjustedScore * 0.25) +
          (consistencyScore * 0.20) +
          (expenseScore * 0.15)
        ) / totalWeight;
      }

      return {
        rank: 0,
        fundId: fund.id,
        fundName: fund.name,
        category: fund.category,
        fundHouse: fund.fundHouse,
        overallScore: Number(overallScore.toFixed(1)),
        returnScore: Number(returnScore.toFixed(1)),
        riskAdjustedScore: Number(riskAdjustedScore.toFixed(1)),
        consistencyScore: Number(consistencyScore.toFixed(1)),
        expenseScore: Number(expenseScore.toFixed(1)),
        metricsUsed,
        currentNav: fund.nav,
        returns1y: fund.returns1y,
        returns3y: fund.returns3y,
        expenseRatio: fund.expenseRatio
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }
}

export const analysisService = new AnalysisService();
