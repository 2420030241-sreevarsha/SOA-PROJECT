import { store } from '../store.js';
import { Holding, PortfolioSummary } from '../../src/types.js';

export class PortfolioService {
  public getHoldings(userId: string): Holding[] {
    return store.getHoldingsForUser(userId);
  }

  public getSummary(userId: string): PortfolioSummary {
    return store.getPortfolioSummary(userId);
  }

  public getPortfolioHistory(userId: string) {
    // Generate programmatic trend points from user holdings and fund historical NAVs
    const holdings = store.getHoldingsForUser(userId);
    if (holdings.length === 0) {
      return [];
    }

    const dateSet = new Set<string>();
    for (const h of holdings) {
      const fund = store.funds.find(f => f.id === h.fundId);
      if (fund?.historicalNav) {
        fund.historicalNav.forEach(pt => dateSet.add(pt.date));
      }
    }

    const sortedDates = Array.from(dateSet).sort();
    if (sortedDates.length === 0) {
      return [];
    }

    return sortedDates.map(date => {
      let totalVal = 0;
      let totalInv = 0;

      for (const h of holdings) {
        const fund = store.funds.find(f => f.id === h.fundId);
        const navPoint = fund?.historicalNav?.find(p => p.date === date);
        const navAtDate = navPoint ? navPoint.nav : (fund?.nav || h.averagePurchasePrice);
        totalVal += h.units * navAtDate;
        totalInv += h.investedAmount;
      }

      return {
        date,
        portfolioValue: Number(totalVal.toFixed(2)),
        investedAmount: Number(totalInv.toFixed(2)),
        profit: Number((totalVal - totalInv).toFixed(2))
      };
    });
  }
}

export const portfolioService = new PortfolioService();
