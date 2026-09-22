import { store } from '../store.js';
import { Transaction, TransactionType, SIPRecord } from '../../src/types.js';

export interface CreateTransactionDTO {
  userId: string;
  fundId: string;
  type: TransactionType;
  date: string;
  amount: number;
  nav?: number;
  notes?: string;
}

export class TransactionService {
  public getAllTransactions(userId: string, options: { search?: string; type?: string; page?: number; limit?: number } = {}) {
    let list = store.transactions.filter(t => t.userId === userId);

    if (options.type && options.type !== 'ALL') {
      list = list.filter(t => t.type === options.type);
    }

    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(t => t.fundName.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const page = options.page || 1;
    const limit = options.limit || 15;
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    // Enrich with current value & profit/loss for that lot
    const enriched = paginated.map(tx => {
      const fund = store.funds.find(f => f.id === tx.fundId);
      const currentNav = fund?.nav ?? tx.nav;
      const currentValue = tx.units * currentNav;
      const profitLoss = currentValue - tx.amount;
      return {
        ...tx,
        currentNav,
        currentValue: Number(currentValue.toFixed(2)),
        profitLoss: Number(profitLoss.toFixed(2))
      };
    });

    return {
      data: enriched,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  public addTransaction(dto: CreateTransactionDTO): Transaction {
    const fund = store.funds.find(f => f.id === dto.fundId);
    if (!fund) {
      throw new Error('Specified mutual fund was not found.');
    }

    const nav = dto.nav || fund.nav;
    if (!nav || nav <= 0) {
      throw new Error('A valid NAV is required to calculate units.');
    }

    if (!dto.amount || dto.amount <= 0) {
      throw new Error('Transaction amount must be a positive number.');
    }

    // Units = Investment Amount / NAV
    const units = Number((dto.amount / nav).toFixed(4));

    if (dto.type === 'SELL') {
      const currentHoldings = store.getHoldingsForUser(dto.userId);
      const existing = currentHoldings.find(h => h.fundId === dto.fundId);
      if (!existing || existing.units < units) {
        throw new Error(`Insufficient units held. Available units: ${existing ? existing.units : 0}`);
      }
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: dto.userId,
      fundId: dto.fundId,
      fundName: fund.name,
      type: dto.type,
      date: dto.date || new Date().toISOString().split('T')[0],
      amount: dto.amount,
      nav,
      units,
      notes: dto.notes
    };

    store.transactions.push(newTx);
    return newTx;
  }

  public updateTransaction(id: string, userId: string, update: Partial<CreateTransactionDTO>): Transaction {
    const index = store.transactions.findIndex(t => t.id === id && t.userId === userId);
    if (index === -1) {
      throw new Error('Transaction not found.');
    }

    const existing = store.transactions[index];
    const fundId = update.fundId || existing.fundId;
    const fund = store.funds.find(f => f.id === fundId);
    const nav = update.nav || (fund ? fund.nav : existing.nav) || existing.nav;
    const amount = update.amount !== undefined ? update.amount : existing.amount;
    const units = Number((amount / nav).toFixed(4));

    const updated: Transaction = {
      ...existing,
      fundId,
      fundName: fund ? fund.name : existing.fundName,
      type: update.type || existing.type,
      date: update.date || existing.date,
      amount,
      nav,
      units,
      notes: update.notes !== undefined ? update.notes : existing.notes
    };

    store.transactions[index] = updated;
    return updated;
  }

  public deleteTransaction(id: string, userId: string): boolean {
    const index = store.transactions.findIndex(t => t.id === id && t.userId === userId);
    if (index === -1) {
      throw new Error('Transaction not found.');
    }
    store.transactions.splice(index, 1);
    return true;
  }

  // SIP Sub-services
  public getSIPs(userId: string): SIPRecord[] {
    return store.sips.filter(s => s.userId === userId).map(s => {
      const fund = store.funds.find(f => f.id === s.fundId);
      const currentNav = fund?.nav ?? null;
      const currentValue = currentNav ? Number((s.unitsAccumulated * currentNav).toFixed(2)) : s.totalInvested;
      const profitLoss = Number((currentValue - s.totalInvested).toFixed(2));
      const returnPercent = s.totalInvested > 0 ? Number(((profitLoss / s.totalInvested) * 100).toFixed(2)) : 0;

      return {
        ...s,
        currentValue,
        profitLoss,
        returnPercent
      };
    });
  }

  public addSIP(userId: string, fundId: string, amount: number, dayOfMonth: number = 5): SIPRecord {
    const fund = store.funds.find(f => f.id === fundId);
    if (!fund) {
      throw new Error('Mutual fund not found.');
    }

    if (amount <= 0) {
      throw new Error('SIP amount must be greater than zero.');
    }

    const nav = fund.nav || 100;
    const units = Number((amount / nav).toFixed(4));

    const newSip: SIPRecord = {
      id: `sip-${Date.now()}`,
      userId,
      fundId,
      fundName: fund.name,
      amount,
      frequency: 'Monthly',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth,
      active: true,
      totalInvested: amount,
      unitsAccumulated: units,
      currentValue: amount,
      profitLoss: 0,
      returnPercent: 0
    };

    store.sips.push(newSip);

    // Also register first SIP transaction
    this.addTransaction({
      userId,
      fundId,
      type: 'SIP',
      date: newSip.startDate,
      amount,
      nav,
      notes: `First installment for monthly SIP`
    });

    return newSip;
  }

  public toggleSIP(id: string, userId: string): SIPRecord {
    const sip = store.sips.find(s => s.id === id && s.userId === userId);
    if (!sip) throw new Error('SIP not found.');
    sip.active = !sip.active;
    return sip;
  }

  public deleteSIP(id: string, userId: string): boolean {
    const index = store.sips.findIndex(s => s.id === id && s.userId === userId);
    if (index === -1) throw new Error('SIP not found.');
    store.sips.splice(index, 1);
    return true;
  }
}

export const transactionService = new TransactionService();
