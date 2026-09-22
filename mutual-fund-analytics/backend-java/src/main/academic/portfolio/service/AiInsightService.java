package com.academic.portfolio.service;

import com.academic.portfolio.dto.AIInsightDTO;
import com.academic.portfolio.dto.DiversificationDTO;
import com.academic.portfolio.dto.HoldingDTO;
import com.academic.portfolio.dto.PortfolioSummaryDTO;
import com.academic.portfolio.dto.RiskAnalysisDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

/**
 * SOA Service 6: AI Insight Service
 * Responsibilities:
 * - AI portfolio summaries
 * - Factual performance observations
 * - Volatility & Risk explanations
 * - Conversational MF Portfolio Assistant
 *
 * Strict Rule: Never fabricate NAV or financial data.
 * If data is unavailable: "I don't have enough data to answer that."
 */
@Service
public class AiInsightService {

    private final PortfolioService portfolioService;
    private final AnalysisService analysisService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public AiInsightService(PortfolioService portfolioService, AnalysisService analysisService) {
        this.portfolioService = portfolioService;
        this.analysisService = analysisService;
    }

    public AIInsightDTO generatePortfolioInsights(String userId) {
        PortfolioSummaryDTO summary = portfolioService.getSummary(userId);
        List<HoldingDTO> holdings = portfolioService.getHoldings(userId);
        RiskAnalysisDTO risk = analysisService.analyzePortfolioRisk(userId);
        DiversificationDTO div = analysisService.analyzeDiversification(userId);

        String disclaimer = "AI-generated insights are for educational and informational purposes only and are not financial advice.";

        // Default deterministic grounded analytical observations
        String defaultSummary = String.format("Your portfolio currently contains %d mutual funds with a total invested amount of ₹%,.2f and a current market value of ₹%,.2f (%s%.2f%% overall return).",
                summary.getFundCount(), summary.getTotalInvested(), summary.getCurrentValue(),
                summary.getOverallReturnPercent() >= 0 ? "+" : "", summary.getOverallReturnPercent());

        String defaultPerf = holdings.isEmpty() ? "No active holdings recorded." :
                String.format("Based on available historical data, your portfolio is composed of %d active schemes.", holdings.size());

        String defaultRisk = Boolean.TRUE.equals(risk.getIsInsufficientData()) ?
                "Insufficient historical data to calculate annualized volatility and maximum drawdown." :
                String.format("Your portfolio reflects a risk score of %d/100 (%s risk) with historical volatility of %.2f%% and maximum drawdown of %.2f%%.",
                        risk.getRiskScore(), risk.getRiskLevel(), risk.getVolatility(), risk.getMaxDrawdown());

        String defaultDiv = div.getConcentrationObservation();
        String defaultTrend = "Historical trajectory reflects periodic market fluctuations consistent with the recorded equity/debt asset distribution.";

        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return AIInsightDTO.builder()
                    .summary(defaultSummary)
                    .performanceObservation(defaultPerf)
                    .riskObservation(defaultRisk)
                    .diversificationObservation(defaultDiv)
                    .historicalTrendObservation(defaultTrend)
                    .disclaimer(disclaimer)
                    .build();
        }

        try {
            String promptContext = String.format("Portfolio: %d funds, Invested: Rs.%.2f, Value: Rs.%.2f, Return: %.2f%%. Risk Score: %s, Volatility: %s%%. Diversification: %s",
                    summary.getFundCount(), summary.getTotalInvested(), summary.getCurrentValue(), summary.getOverallReturnPercent(),
                    risk.getRiskScore() != null ? risk.getRiskScore() : "Insufficient data",
                    risk.getVolatility() != null ? risk.getVolatility() : "Insufficient data",
                    div.getConcentrationObservation());

            String systemPrompt = "You are a financial academic analyst. Generate a strictly grounded factual summary using ONLY the numbers provided above. Never invent any values. Never advise to buy or sell.";

            String requestBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + promptContext.replace("\"", "\\\"") + "\\n" + systemPrompt + "\"}]}]}";

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    String aiText = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                    return AIInsightDTO.builder()
                            .summary(aiText.length() > 500 ? aiText.substring(0, 500) + "..." : aiText)
                            .performanceObservation(defaultPerf)
                            .riskObservation(defaultRisk)
                            .diversificationObservation(defaultDiv)
                            .historicalTrendObservation(defaultTrend)
                            .disclaimer(disclaimer)
                            .build();
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini API call failed, using deterministic fallback: " + e.getMessage());
        }

        return AIInsightDTO.builder()
                .summary(defaultSummary)
                .performanceObservation(defaultPerf)
                .riskObservation(defaultRisk)
                .diversificationObservation(defaultDiv)
                .historicalTrendObservation(defaultTrend)
                .disclaimer(disclaimer)
                .build();
    }

    public String chatWithAssistant(String userId, String userQuestion) {
        PortfolioSummaryDTO summary = portfolioService.getSummary(userId);
        RiskAnalysisDTO risk = analysisService.analyzePortfolioRisk(userId);
        DiversificationDTO div = analysisService.analyzeDiversification(userId);

        String q = userQuestion.toLowerCase();
        if (q.contains("performance") || q.contains("return") || q.contains("value") || q.contains("performing")) {
            return String.format("Your portfolio is currently valued at ₹%,.2f with an invested capital of ₹%,.2f, yielding an overall return of %.2f%% (P&L: ₹%,.2f).",
                    summary.getCurrentValue(), summary.getTotalInvested(), summary.getOverallReturnPercent(), summary.getTotalProfitLoss());
        }
        if (q.contains("risk") || q.contains("volatility")) {
            if (Boolean.TRUE.equals(risk.getIsInsufficientData())) {
                return "Insufficient historical data to determine portfolio risk and volatility metrics.";
            }
            return String.format("Your portfolio exhibits a calculated risk score of %d/100 (%s). Historical annualized volatility is %.2f%% with a maximum drawdown of %.2f%%.",
                    risk.getRiskScore(), risk.getRiskLevel(), risk.getVolatility(), risk.getMaxDrawdown());
        }
        if (q.contains("allocation") || q.contains("diversification") || q.contains("category")) {
            return String.format("%s Asset split: Equity %.1f%%, Debt %.1f%%, Cash %.1f%%.",
                    div.getConcentrationObservation(), div.getAssetAllocation().getEquity(),
                    div.getAssetAllocation().getDebt(), div.getAssetAllocation().getCash());
        }

        return "MF Portfolio Assistant: I have verified access to your portfolio metrics, asset allocation, and risk data. Ask me about your returns, risk score, or diversification!";
    }
}
