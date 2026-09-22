import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { store } from './server/store.js';
import { userService } from './server/services/userService.js';
import { fundService } from './server/services/fundService.js';
import { portfolioService } from './server/services/portfolioService.js';
import { transactionService } from './server/services/transactionService.js';
import { analysisService } from './server/services/analysisService.js';
import { aiInsightService } from './server/services/aiInsightService.js';
import { notificationService } from './server/services/notificationService.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// -------------------------------------------------------------
// SOA REST APIs
// -------------------------------------------------------------

// 1. User Service
app.post('/api/users/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = userService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/users/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const result = userService.register(name, email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/users/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = userService.resetPassword(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Mutual Fund Service
app.get('/api/funds', (req: Request, res: Response) => {
  const { search, category, fundHouse, risk, sortBy, sortOrder } = req.query as any;
  const funds = fundService.getAllFunds({ search, category, fundHouse, risk, sortBy, sortOrder });
  res.json(funds);
});

app.get('/api/funds/categories', (req: Request, res: Response) => {
  res.json(fundService.getCategories());
});

app.get('/api/funds/fund-houses', (req: Request, res: Response) => {
  res.json(fundService.getFundHouses());
});

app.get('/api/funds/:id', (req: Request, res: Response) => {
  const fund = fundService.getFundById(req.params.id);
  if (!fund) return res.status(404).json({ error: 'Fund not found' });
  res.json(fund);
});

app.get('/api/funds/:id/history', (req: Request, res: Response) => {
  const history = fundService.getFundHistory(req.params.id);
  if (!history) return res.status(404).json({ error: 'Fund history not found' });
  res.json(history);
});

app.post('/api/funds/compare', (req: Request, res: Response) => {
  try {
    const { fundIds } = req.body;
    const comparison = fundService.compareFunds(fundIds);
    res.json(comparison);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Portfolio Service
app.get('/api/portfolio', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-default';
  res.json(portfolioService.getHoldings(userId));
});

app.get('/api/portfolio/summary', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-default';
  res.json(portfolioService.getSummary(userId));
});

app.get('/api/portfolio/history', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-default';
  res.json(portfolioService.getPortfolioHistory(userId));
});

// 4. Transaction Service
app.get('/api/transactions', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-default';
  const { search, type, page, limit } = req.query as any;
  const result = transactionService.getAllTransactions(userId, {
    search,
    type,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 15
  });
  res.json(result);
});

app.post('/api/transactions', (req: Request, res: Response) => {
  try {
    const { userId = 'usr-default', fundId, type, date, amount, nav, notes } = req.body;
    const tx = transactionService.addTransaction({
      userId,
      fundId,
      type,
      date,
      amount: Number(amount),
      nav: nav ? Number(nav) : undefined,
      notes
    });
    res.status(201).json(tx);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/transactions/:id', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'usr-default';
    const tx = transactionService.updateTransaction(req.params.id, userId, req.body);
    res.json(tx);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'usr-default';
    transactionService.deleteTransaction(req.params.id, userId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// SIP Endpoints
app.get('/api/sip', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-default';
  res.json(transactionService.getSIPs(userId));
});

app.post('/api/sip', (req: Request, res: Response) => {
  try {
    const { userId = 'usr-default', fundId, amount, dayOfMonth } = req.body;
    const sip = transactionService.addSIP(userId, fundId, Number(amount), dayOfMonth ? Number(dayOfMonth) : 5);
    res.status(201).json(sip);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/sip/:id/toggle', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'usr-default';
    const sip = transactionService.toggleSIP(req.params.id, userId);
    res.json(sip);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/sip/:id', (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'usr-default';
    transactionService.deleteSIP(req.params.id, userId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Analysis Service
app.get('/api/analysis/risk', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-default';
  res.json(analysisService.getRiskAnalysis(userId));
});

app.get('/api/analysis/diversification', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-default';
  res.json(analysisService.getDiversification(userId));
});

app.get('/api/analysis/ranking', (req: Request, res: Response) => {
  res.json(analysisService.getFundRankings());
});

// 6. AI Insight Service
app.post('/api/ai/insights', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || 'usr-default';
    const insights = await aiInsightService.generatePortfolioInsights(userId);
    res.json(insights);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { userId = 'usr-default', message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const reply = await aiInsightService.chatWithAssistant(userId, message);
    res.json({ reply });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Notification Service
app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-default';
  res.json(notificationService.getNotifications(userId));
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-default';
  const success = notificationService.markAsRead(req.params.id, userId);
  res.json({ success });
});

app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-default';
  notificationService.markAllAsRead(userId);
  res.json({ success: true });
});

// Dataset Management API
app.get('/api/dataset/summary', (req: Request, res: Response) => {
  res.json(store.datasetSummary);
});

app.post('/api/dataset/upload', (req: Request, res: Response) => {
  try {
    const { csvData, fileName } = req.body;
    if (!csvData) {
      return res.status(400).json({ error: 'No CSV data provided' });
    }

    // Process uploaded CSV data directly
    const lines = csvData.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV file contains insufficient records.' });
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, ''));
    const detectedCols: Record<string, string> = {};

    const findIdx = (names: string[]) => {
      return headers.findIndex((h: string) => {
        const lh = h.toLowerCase();
        return names.some(n => lh.includes(n));
      });
    };

    const nameIdx = findIdx(['scheme_name', 'fund_name', 'scheme name', 'fund name', 'name']);
    const catIdx = findIdx(['category', 'scheme_category', 'sub_category']);
    const fhIdx = findIdx(['fund_house', 'amc_name', 'fund house', 'amc']);
    const navIdx = findIdx(['nav', 'current_nav', 'net_asset_value']);
    const expIdx = findIdx(['expense_ratio', 'ter', 'expense']);
    const aumIdx = findIdx(['aum', 'fund_size', 'aum_cr']);
    const r1Idx = findIdx(['returns_1y', '1y_return', '1y']);
    const r3Idx = findIdx(['returns_3y', '3y_return', '3y']);

    if (nameIdx === -1) {
      return res.status(400).json({ error: 'Required column for Scheme / Fund Name was not detected in CSV.' });
    }

    detectedCols['scheme_name'] = headers[nameIdx];
    if (catIdx !== -1) detectedCols['category'] = headers[catIdx];
    if (fhIdx !== -1) detectedCols['fund_house'] = headers[fhIdx];
    if (navIdx !== -1) detectedCols['nav'] = headers[navIdx];
    if (expIdx !== -1) detectedCols['expense_ratio'] = headers[expIdx];
    if (aumIdx !== -1) detectedCols['aum'] = headers[aumIdx];
    if (r1Idx !== -1) detectedCols['returns_1y'] = headers[r1Idx];
    if (r3Idx !== -1) detectedCols['returns_3y'] = headers[r3Idx];

    const parsedFunds: any[] = [];
    let dupCount = 0;
    let missingCount = 0;
    let invalidCount = 0;
    const seenNames = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((c: string) => c.trim().replace(/^"|"$/g, ''));
      if (row.length <= nameIdx || !row[nameIdx]) {
        invalidCount++;
        continue;
      }

      const name = row[nameIdx];
      if (seenNames.has(name.toLowerCase())) {
        dupCount++;
        continue;
      }
      seenNames.add(name.toLowerCase());

      const navVal = navIdx !== -1 && row[navIdx] ? parseFloat(row[navIdx].replace(/[^0-9.]/g, '')) : null;
      const expVal = expIdx !== -1 && row[expIdx] ? parseFloat(row[expIdx].replace(/[^0-9.]/g, '')) : null;
      const aumVal = aumIdx !== -1 && row[aumIdx] ? parseFloat(row[aumIdx].replace(/[^0-9.]/g, '')) : null;
      const r1Val = r1Idx !== -1 && row[r1Idx] ? parseFloat(row[r1Idx].replace(/[^0-9.-]/g, '')) : null;
      const r3Val = r3Idx !== -1 && row[r3Idx] ? parseFloat(row[r3Idx].replace(/[^0-9.-]/g, '')) : null;

      if (navVal === null || expVal === null) missingCount++;

      parsedFunds.push({
        id: `fund-up-${i}`,
        name,
        schemeName: name,
        category: (catIdx !== -1 && row[catIdx]) ? row[catIdx] : 'Other',
        fundHouse: (fhIdx !== -1 && row[fhIdx]) ? row[fhIdx] : 'Other AMC',
        nav: navVal ?? 100.0,
        navDate: new Date().toISOString().split('T')[0],
        expenseRatio: expVal,
        aum: aumVal,
        risk: (r1Val && r1Val > 22) ? 'Very High' : 'Moderate',
        returns1y: r1Val,
        returns3y: r3Val,
        returns5y: null,
        assetAllocation: { equity: 85, debt: 10, cash: 5 },
        historicalNav: [
          { date: '2025-06-15', nav: navVal ? navVal * 0.88 : 88 },
          { date: '2025-09-15', nav: navVal ? navVal * 0.92 : 92 },
          { date: '2025-12-15', nav: navVal ? navVal * 0.96 : 96 },
          { date: '2026-03-15', nav: navVal ?? 100 }
        ]
      });
    }

    if (parsedFunds.length > 0) {
      store.funds = parsedFunds;
      store.isDatasetDemo = false;
      store.datasetSummary = {
        isDemo: false,
        totalRecords: lines.length - 1,
        processedRecords: parsedFunds.length,
        duplicateRecords: dupCount,
        missingValues: missingCount,
        invalidRecords: invalidCount,
        detectedColumns: detectedCols,
        columnsList: headers,
        lastUploadedAt: new Date().toISOString(),
        sampleRows: parsedFunds.slice(0, 10).map(f => ({
          scheme_name: f.name,
          category: f.category,
          fund_house: f.fundHouse,
          nav: f.nav ?? 'Data not available',
          expense_ratio: f.expenseRatio ?? 'Data not available',
          aum: f.aum ?? 'Data not available'
        }))
      };
    }

    res.json(store.datasetSummary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

  // Java Codebase Inspection API (Allows inspecting & copying all Java files directly from the UI)
  app.get('/api/java/files', (req: Request, res: Response) => {
    const javaDir = path.join(process.cwd(), 'backend-java');
    const getFiles = (dir: string): { path: string; name: string; content: string }[] => {
      let results: { path: string; name: string; content: string }[] = [];
      if (!fs.existsSync(dir)) return results;
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getFiles(fullPath));
        } else if (file.endsWith('.java') || file.endsWith('.xml') || file.endsWith('.properties') || file.endsWith('.md')) {
          const relPath = path.relative(javaDir, fullPath);
          const content = fs.readFileSync(fullPath, 'utf8');
          results.push({ path: relPath, name: file, content });
        }
      });
      return results;
    };

    const files = getFiles(javaDir);
    res.json(files);
  });

  // Vite middleware in development or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mutual Fund Analytics Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
