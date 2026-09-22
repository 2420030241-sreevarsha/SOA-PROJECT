import { GoogleGenAI } from '@google/genai';
import { store } from '../store.js';
import { analysisService } from './analysisService.js';
import { AIInsightResponse } from '../../src/types.js';

export class AIInsightService {
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    if (!this.ai && process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return this.ai;
  }

  public async generatePortfolioInsights(userId: string): Promise<AIInsightResponse> {
    const holdings = store.getHoldingsForUser(userId);
    const summary = store.getPortfolioSummary(userId);
    const risk = analysisService.getRiskAnalysis(userId);
    const div = analysisService.getDiversification(userId);

    const fallbackDisclaimer = 'AI-generated insights are for educational and informational purposes only and are not financial advice.';

    // Construct grounded factual prompt from real application numbers
    const factsContext = `
Portfolio Overview:
- Number of active mutual funds: ${summary.fundCount}
- Total Invested Amount: ₹${summary.totalInvested.toLocaleString('en-IN')}
- Current Portfolio Value: ₹${summary.currentValue.toLocaleString('en-IN')}
- Total Absolute Profit/Loss: ₹${summary.totalProfitLoss.toLocaleString('en-IN')}
- Overall Return: ${summary.overallReturnPercent}%
- Monthly SIP Amount: ₹${summary.monthlySipAmount.toLocaleString('en-IN')}

Holdings:
${holdings.map(h => `- Fund: "${h.fundName}" | Category: ${h.category} | Units: ${h.units} | Invested: ₹${h.investedAmount} | Current Value: ₹${h.currentValue} | Return: ${h.returnPercent}% | Current NAV: ${h.currentNav ? '₹' + h.currentNav : 'Data not available'}`).join('\n')}

Risk & Volatility:
- Volatility: ${risk.volatility !== null ? risk.volatility + '%' : 'Insufficient historical data'}
- Sharpe Ratio: ${risk.sharpeRatio !== null ? risk.sharpeRatio : 'Insufficient historical data'}
- Max Drawdown: ${risk.maxDrawdown !== null ? risk.maxDrawdown + '%' : 'Insufficient historical data'}
- Portfolio Risk Score: ${risk.riskScore !== null ? risk.riskScore + '/100 (' + risk.riskLevel + ')' : 'Insufficient historical data'}

Diversification:
- Asset Allocation: Equity ${div.assetAllocation.equity}%, Debt ${div.assetAllocation.debt}%, Cash ${div.assetAllocation.cash}%
- Category Distribution: ${div.categoryDistribution.map(c => `${c.name}: ${c.percentage}%`).join(', ')}
- Concentration Observation: ${div.concentrationObservation}
`;

    const client = this.getClient();
    if (!client) {
      // Deterministic analytical generation if API key is not yet set
      return {
        summary: `Your portfolio currently contains ${summary.fundCount} mutual funds with a total invested amount of ₹${summary.totalInvested.toLocaleString('en-IN')} and a current market value of ₹${summary.currentValue.toLocaleString('en-IN')} (${summary.overallReturnPercent >= 0 ? '+' : ''}${summary.overallReturnPercent}% overall return).`,
        performanceObservation: holdings.length > 0 
          ? `Based on available historical data, ${holdings.reduce((max, h) => h.returnPercent > max.returnPercent ? h : max, holdings[0]).fundName} has demonstrated the highest return (${Math.max(...holdings.map(h => h.returnPercent))}%) within your holdings.`
          : 'Insufficient transaction data to calculate individual fund performance.',
        riskObservation: risk.riskScore !== null
          ? `Your portfolio shows a composite risk score of ${risk.riskScore}/100 with annualized historical volatility of ${risk.volatility}%.`
          : 'Insufficient historical data to determine annualized volatility and maximum drawdown.',
        diversificationObservation: div.concentrationObservation,
        historicalTrendObservation: 'Historical trajectory reflects periodic market fluctuations consistent with the underlying equity-debt allocation.',
        disclaimer: fallbackDisclaimer
      };
    }

    try {
      const prompt = `
You are an academic financial data analyzer for an educational Service-Oriented Architecture (SOA) project.
Here is the strict factual portfolio data for the user:
${factsContext}

Strict Guidelines:
1. Only use the numbers and data given above.
2. NEVER invent, guess, or hallucinate any NAV, returns, AUM, or prices.
3. NEVER tell the user to buy, sell, or trade any specific fund.
4. If any data is missing or marked "Insufficient historical data", explicitly state "Insufficient historical data" or "Data not available".
5. Use neutral, analytical, objective language (e.g. "Fund A has a higher historical return", "Fund B has shown higher historical volatility").
6. Respond with a JSON object containing:
- summary: (2-3 sentences overview of portfolio size, value, and return)
- performanceObservation: (factual analytical observation of top/bottom performing holding)
- riskObservation: (explanation of the volatility and risk score calculated)
- diversificationObservation: (factual analysis of category/fund house concentration)
- historicalTrendObservation: (analysis of historical trends based only on provided numbers)
- disclaimer: "${fallbackDisclaimer}"
`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          summary: parsed.summary || `Your portfolio contains ${summary.fundCount} funds with total value ₹${summary.currentValue}.`,
          performanceObservation: parsed.performanceObservation || 'Performance calculated from recorded transactions.',
          riskObservation: parsed.riskObservation || 'Risk metrics derived from historical NAV variance.',
          diversificationObservation: parsed.diversificationObservation || div.concentrationObservation,
          historicalTrendObservation: parsed.historicalTrendObservation || 'Historical trends derived from NAV data.',
          disclaimer: fallbackDisclaimer
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, using deterministic analytical output:', err);
    }

    // Reliable fallback
    return {
      summary: `Your portfolio currently contains ${summary.fundCount} mutual funds with a total invested amount of ₹${summary.totalInvested.toLocaleString('en-IN')} and current value of ₹${summary.currentValue.toLocaleString('en-IN')}.`,
      performanceObservation: holdings.length > 0 
        ? `Based on available historical data, your largest current holding is ${holdings[0]?.fundName} with return of ${holdings[0]?.returnPercent}%.`
        : 'Data not available',
      riskObservation: risk.riskScore !== null ? `Calculated risk score is ${risk.riskScore}/100 (${risk.riskLevel}).` : 'Insufficient historical data.',
      diversificationObservation: div.concentrationObservation,
      historicalTrendObservation: 'Calculated from historical NAV records without predictive forecasting.',
      disclaimer: fallbackDisclaimer
    };
  }

  public async chatWithAssistant(userId: string, userMessage: string): Promise<string> {
    const holdings = store.getHoldingsForUser(userId);
    const summary = store.getPortfolioSummary(userId);
    const risk = analysisService.getRiskAnalysis(userId);
    const div = analysisService.getDiversification(userId);
    const rankings = analysisService.getFundRankings().slice(0, 5);

    const context = `
Current User Portfolio State:
- Total Invested: ₹${summary.totalInvested}
- Current Portfolio Value: ₹${summary.currentValue}
- Total Profit/Loss: ₹${summary.totalProfitLoss} (${summary.overallReturnPercent}%)
- Total Funds Held: ${summary.fundCount}
- Monthly Active SIP: ₹${summary.monthlySipAmount}
- Risk Level: ${risk.riskLevel} (Score: ${risk.riskScore ?? 'Insufficient data'}/100)
- Volatility: ${risk.volatility !== null ? risk.volatility + '%' : 'Insufficient historical data'}
- Sharpe Ratio: ${risk.sharpeRatio ?? 'Insufficient historical data'}
- Max Drawdown: ${risk.maxDrawdown !== null ? risk.maxDrawdown + '%' : 'Insufficient historical data'}
- Concentration: ${div.concentrationObservation}
- Asset Allocation: Equity ${div.assetAllocation.equity}%, Debt ${div.assetAllocation.debt}%, Cash ${div.assetAllocation.cash}%

Holdings List:
${holdings.map(h => `- ${h.fundName} (${h.category}): Units=${h.units}, Invested=₹${h.investedAmount}, Value=₹${h.currentValue}, Return=${h.returnPercent}%, NAV=${h.currentNav ?? 'N/A'}`).join('\n')}

Top 5 Ranked Funds in Database:
${rankings.map(r => `- #${r.rank}: ${r.fundName} (Overall Score: ${r.overallScore}, 1Y Return: ${r.returns1y ?? 'N/A'}%, Exp. Ratio: ${r.expenseRatio ?? 'N/A'}%)`).join('\n')}
`;

    const client = this.getClient();
    if (!client) {
      // Rule-based fallback answer if API key is not configured
      const q = userMessage.toLowerCase();
      if (q.includes('performing') || q.includes('performance') || q.includes('return') || q.includes('value')) {
        return `Your portfolio currently stands at ₹${summary.currentValue.toLocaleString('en-IN')} with an overall return of ${summary.overallReturnPercent}% (Profit/Loss: ₹${summary.totalProfitLoss.toLocaleString('en-IN')}). Total invested is ₹${summary.totalInvested.toLocaleString('en-IN')}.`;
      }
      if (q.includes('highest') || q.includes('best') || q.includes('top')) {
        if (holdings.length > 0) {
          const top = holdings.reduce((m, h) => h.returnPercent > m.returnPercent ? h : m, holdings[0]);
          return `Based on available historical data, ${top.fundName} has the highest historical return in your portfolio at ${top.returnPercent}%.`;
        }
        return `Based on available database records, the highest ranked fund is ${rankings[0]?.fundName} with historical 1Y return of ${rankings[0]?.returns1y}%.`;
      }
      if (q.includes('risk') || q.includes('volatility')) {
        if (risk.isInsufficientData) {
          return 'Insufficient historical data to determine portfolio risk and volatility metrics.';
        }
        return `Your portfolio risk score is ${risk.riskScore}/100 (${risk.riskLevel} risk). Annualized volatility is ${risk.volatility}%, and maximum historical drawdown is ${risk.maxDrawdown}%.`;
      }
      if (q.includes('allocation') || q.includes('diversification') || q.includes('category')) {
        return `${div.concentrationObservation} Asset breakdown: Equity ${div.assetAllocation.equity}%, Debt ${div.assetAllocation.debt}%, Cash ${div.assetAllocation.cash}%.`;
      }
      return `MF Portfolio Assistant: I have access to your ${summary.fundCount} funds, ₹${summary.currentValue.toLocaleString('en-IN')} current value, and historical metrics. Please ask about your returns, risk score, asset allocation, or fund comparison!`;
    }

    try {
      const systemPrompt = `
You are "MF Portfolio Assistant", an intelligent conversational assistant for the Mutual Fund Analytics application.
You are built for an educational Service-Oriented Architecture (SOA) project.

Portfolio Context:
${context}

Strict Operational Rules:
1. ONLY use data explicitly stated in the context.
2. NEVER invent, fabricate, or hallucinate NAVs, returns, AUMs, or future predictions.
3. If information is not in the context or data is unavailable, reply exactly: "I don't have enough data to answer that."
4. NEVER instruct or advise users to buy, sell, or trade any specific mutual fund.
5. Use neutral, analytical financial language (e.g., "Fund A has a higher historical return than Fund B").
6. Always keep answers concise (2 to 4 sentences).
7. Conclude answers with: "Note: AI insights are for educational purposes only and do not constitute financial advice."
`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt
        }
      });

      return response.text?.trim() || "I don't have enough data to answer that.";
    } catch (err) {
      console.warn('Gemini chat error, fallback used:', err);
      return "I don't have enough data to answer that. Please ensure your query relates to the active portfolio data.";
    }
  }
}

export const aiInsightService = new AIInsightService();
