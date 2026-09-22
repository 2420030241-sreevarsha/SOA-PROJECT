import { store } from '../store.js';
import { MutualFund } from '../../src/types.js';

export interface FundQueryParams {
  search?: string;
  category?: string;
  fundHouse?: string;
  risk?: string;
  sortBy?: 'name' | 'nav' | 'returns1y' | 'returns3y' | 'returns5y' | 'expenseRatio' | 'aum';
  sortOrder?: 'asc' | 'desc';
}

export class FundService {
  public getAllFunds(params: FundQueryParams = {}): MutualFund[] {
    let list = [...store.funds];

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(f => 
        f.name.toLowerCase().includes(q) ||
        f.schemeName.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.fundHouse.toLowerCase().includes(q)
      );
    }

    if (params.category && params.category !== 'All') {
      list = list.filter(f => f.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params.fundHouse && params.fundHouse !== 'All') {
      list = list.filter(f => f.fundHouse.toLowerCase() === params.fundHouse!.toLowerCase());
    }

    if (params.risk && params.risk !== 'All') {
      list = list.filter(f => f.risk?.toLowerCase() === params.risk!.toLowerCase());
    }

    if (params.sortBy) {
      const key = params.sortBy;
      const order = params.sortOrder === 'asc' ? 1 : -1;
      list.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * order;
        }
        return ((valA as number) - (valB as number)) * order;
      });
    }

    return list;
  }

  public getFundById(id: string): MutualFund | null {
    return store.funds.find(f => f.id === id) || null;
  }

  public getFundHistory(id: string) {
    const fund = this.getFundById(id);
    if (!fund) return null;
    return {
      fundId: fund.id,
      fundName: fund.name,
      historicalNav: fund.historicalNav || []
    };
  }

  public getCategories(): string[] {
    const set = new Set<string>();
    for (const f of store.funds) {
      if (f.category) set.add(f.category);
    }
    return Array.from(set).sort();
  }

  public getFundHouses(): string[] {
    const set = new Set<string>();
    for (const f of store.funds) {
      if (f.fundHouse) set.add(f.fundHouse);
    }
    return Array.from(set).sort();
  }

  public compareFunds(fundIds: string[]) {
    if (!fundIds || fundIds.length < 2) {
      throw new Error('Please provide at least 2 fund IDs to compare.');
    }
    const funds = fundIds
      .map(id => this.getFundById(id))
      .filter((f): f is MutualFund => f !== null);

    return funds.map(f => {
      // Calculate volatility from historical NAV if available
      let calculatedVolatility: number | null = null;
      let calculatedSharpe: number | null = null;

      if (f.historicalNav && f.historicalNav.length >= 4) {
        const returns: number[] = [];
        for (let i = 1; i < f.historicalNav.length; i++) {
          const prev = f.historicalNav[i - 1].nav;
          const curr = f.historicalNav[i].nav;
          if (prev > 0) {
            returns.push(((curr - prev) / prev) * 100);
          }
        }

        if (returns.length > 2) {
          const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
          const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
          calculatedVolatility = Number(Math.sqrt(variance).toFixed(2));

          const rfr = 6.5; // Indian Risk-Free rate assumption (10Y G-Sec)
          const annualizedReturn = f.returns1y ?? mean;
          if (calculatedVolatility > 0) {
            calculatedSharpe = Number(((annualizedReturn - rfr) / calculatedVolatility).toFixed(2));
          }
        }
      }

      return {
        ...f,
        calculatedVolatility,
        calculatedSharpe,
        volatilityDisplay: calculatedVolatility !== null ? `${calculatedVolatility}%` : 'Insufficient historical data.',
        sharpeDisplay: calculatedSharpe !== null ? `${calculatedSharpe}` : 'Insufficient historical data.'
      };
    });
  }
}

export const fundService = new FundService();
