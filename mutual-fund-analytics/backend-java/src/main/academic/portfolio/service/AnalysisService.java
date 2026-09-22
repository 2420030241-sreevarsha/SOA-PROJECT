package com.academic.portfolio.service;

import com.academic.portfolio.dto.DiversificationDTO;
import com.academic.portfolio.dto.FundRankingDTO;
import com.academic.portfolio.dto.HoldingDTO;
import com.academic.portfolio.dto.RiskAnalysisDTO;
import com.academic.portfolio.model.MutualFund;
import com.academic.portfolio.model.NavHistoryPoint;
import com.academic.portfolio.repository.MutualFundRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * SOA Service 5: Analysis Service
 * Responsibilities:
 * - Volatility (Standard deviation of historical returns)
 * - Sharpe Ratio ((Portfolio Return - Risk Free Rate) / Volatility)
 * - Maximum Drawdown (Peak-to-Trough maximum decline)
 * - Portfolio Risk Score (0-100)
 * - Diversification & Concentration analysis
 * - Fund Ranking
 */
@Service
public class AnalysisService {

    private final PortfolioService portfolioService;
    private final MutualFundRepository mutualFundRepository;

    @Value("${finance.risk-free-rate:6.5}")
    private double riskFreeRate;

    public AnalysisService(PortfolioService portfolioService, MutualFundRepository mutualFundRepository) {
        this.portfolioService = portfolioService;
        this.mutualFundRepository = mutualFundRepository;
    }

    public RiskAnalysisDTO analyzePortfolioRisk(String userId) {
        List<HoldingDTO> holdings = portfolioService.getHoldings(userId);

        List<String> assumptions = List.of(
                "Risk-Free Rate: " + riskFreeRate + "% benchmarked to Indian 10-Year Government Bond yield (G-Sec).",
                "Volatility calculated using sample standard deviation of historical periodic NAV returns.",
                "Portfolio Risk Score (0-100) evaluates volatility (40%), maximum drawdown (30%), and concentration (30%).",
                "Analysis uses active user holdings with verified units held."
        );

        String disclaimer = "This analysis is for educational and informational purposes only and is not financial advice.";

        if (holdings.isEmpty()) {
            return RiskAnalysisDTO.builder()
                    .volatility(null)
                    .sharpeRatio(null)
                    .maxDrawdown(null)
                    .riskScore(null)
                    .riskLevel("Insufficient historical data")
                    .assumptions(assumptions)
                    .isInsufficientData(true)
                    .concentrationScore(0.0)
                    .disclaimer(disclaimer)
                    .build();
        }

        // Aggregate historical NAV points
        Set<String> commonDates = new TreeSet<>();
        boolean allFundsHaveHistory = true;

        for (HoldingDTO h : holdings) {
            Optional<MutualFund> fundOpt = mutualFundRepository.findById(h.getFundId());
            if (fundOpt.isEmpty() || fundOpt.get().getHistoricalNav() == null || fundOpt.get().getHistoricalNav().size() < 4) {
                allFundsHaveHistory = false;
                break;
            }
            fundOpt.get().getHistoricalNav().forEach(p -> commonDates.add(p.getDate()));
        }

        if (!allFundsHaveHistory || commonDates.size() < 4) {
            return RiskAnalysisDTO.builder()
                    .volatility(null)
                    .sharpeRatio(null)
                    .maxDrawdown(null)
                    .riskScore(null)
                    .riskLevel("Insufficient historical data")
                    .assumptions(assumptions)
                    .isInsufficientData(true)
                    .concentrationScore(0.0)
                    .disclaimer(disclaimer)
                    .build();
        }

        List<Double> portfolioSeries = new ArrayList<>();
        for (String date : commonDates) {
            double totalValAtDate = 0;
            boolean valid = true;
            for (HoldingDTO h : holdings) {
                MutualFund f = mutualFundRepository.findById(h.getFundId()).get();
                Optional<NavHistoryPoint> pt = f.getHistoricalNav().stream().filter(p -> p.getDate().equals(date)).findFirst();
                if (pt.isPresent()) {
                    totalValAtDate += h.getUnits() * pt.get().getNav();
                } else {
                    valid = false;
                    break;
                }
            }
            if (valid && totalValAtDate > 0) {
                portfolioSeries.add(totalValAtDate);
            }
        }

        if (portfolioSeries.size() < 4) {
            return RiskAnalysisDTO.builder()
                    .volatility(null)
                    .sharpeRatio(null)
                    .maxDrawdown(null)
                    .riskScore(null)
                    .riskLevel("Insufficient historical data")
                    .assumptions(assumptions)
                    .isInsufficientData(true)
                    .concentrationScore(0.0)
                    .disclaimer(disclaimer)
                    .build();
        }

        // Calculate periodic returns
        List<Double> periodicReturns = new ArrayList<>();
        for (int i = 1; i < portfolioSeries.size(); i++) {
            double prev = portfolioSeries.get(i - 1);
            double curr = portfolioSeries.get(i);
            periodicReturns.add(((curr - prev) / prev) * 100.0);
        }

        // Volatility = Standard Deviation * sqrt(4) (quarterly annualized)
        double mean = periodicReturns.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = periodicReturns.stream().mapToDouble(r -> Math.pow(r - mean, 2)).sum() / (periodicReturns.size() - 1);
        double annualizedVol = Math.round(Math.sqrt(variance) * 2.0 * 100.0) / 100.0;

        // Maximum Drawdown: Max decline from historical peak
        double peak = portfolioSeries.get(0);
        double maxMdd = 0.0;
        for (double val : portfolioSeries) {
            if (val > peak) peak = val;
            double dd = ((peak - val) / peak) * 100.0;
            if (dd > maxMdd) maxMdd = dd;
        }
        double maxDrawdown = Math.round(maxMdd * 100.0) / 100.0;

        // Overall Return and Sharpe Ratio: (Return - RFR) / Volatility
        double overallReturn = portfolioService.getSummary(userId).getOverallReturnPercent();
        double sharpeRatio = annualizedVol > 0 ? Math.round(((overallReturn - riskFreeRate) / annualizedVol) * 100.0) / 100.0 : 0.0;

        // Concentration Score (Herfindahl index)
        double totalVal = portfolioService.getSummary(userId).getCurrentValue();
        double hhi = 0.0;
        for (HoldingDTO h : holdings) {
            double w = totalVal > 0 ? (h.getCurrentValue() / totalVal) : 0.0;
            hhi += Math.pow(w, 2);
        }
        double concentrationScore = Math.round(hhi * 100.0 * 10.0) / 10.0;

        // Risk Score 0-100
        double volScore = Math.min(100.0, (annualizedVol / 25.0) * 100.0);
        double mddScore = Math.min(100.0, (maxDrawdown / 30.0) * 100.0);
        double concScore = Math.min(100.0, concentrationScore * 1.5);
        int finalRiskScore = (int) Math.round(volScore * 0.4 + mddScore * 0.3 + concScore * 0.3);

        String level = "Moderate";
        if (finalRiskScore < 35) level = "Low";
        else if (finalRiskScore < 65) level = "Moderate";
        else if (finalRiskScore < 85) level = "High";
        else level = "Very High";

        return RiskAnalysisDTO.builder()
                .volatility(annualizedVol)
                .sharpeRatio(sharpeRatio)
                .maxDrawdown(maxDrawdown)
                .riskScore(finalRiskScore)
                .riskLevel(level)
                .assumptions(assumptions)
                .isInsufficientData(false)
                .concentrationScore(concentrationScore)
                .disclaimer(disclaimer)
                .build();
    }

    public DiversificationDTO analyzeDiversification(String userId) {
        List<HoldingDTO> holdings = portfolioService.getHoldings(userId);
        double totalValue = portfolioService.getSummary(userId).getCurrentValue();
        if (totalValue <= 0) totalValue = 1.0;

        Map<String, Double> categoryMap = new HashMap<>();
        Map<String, Double> fundHouseMap = new HashMap<>();
        double totalEquity = 0.0;
        double totalDebt = 0.0;
        double totalCash = 0.0;

        for (HoldingDTO h : holdings) {
            categoryMap.put(h.getCategory(), categoryMap.getOrDefault(h.getCategory(), 0.0) + h.getCurrentValue());

            Optional<MutualFund> fundOpt = mutualFundRepository.findById(h.getFundId());
            String fh = fundOpt.map(MutualFund::getFundHouse).orElse("Other");
            fundHouseMap.put(fh, fundHouseMap.getOrDefault(fh, 0.0) + h.getCurrentValue());

            double eq = fundOpt.flatMap(f -> Optional.ofNullable(f.getEquityAllocation())).orElse(85.0);
            double dt = fundOpt.flatMap(f -> Optional.ofNullable(f.getDebtAllocation())).orElse(10.0);
            double cs = fundOpt.flatMap(f -> Optional.ofNullable(f.getCashAllocation())).orElse(5.0);

            double weight = h.getCurrentValue() / totalValue;
            totalEquity += eq * weight;
            totalDebt += dt * weight;
            totalCash += cs * weight;
        }

        final double finalTotal = totalValue;
        List<DiversificationDTO.Slice> categorySlices = categoryMap.entrySet().stream()
                .map(e -> new DiversificationDTO.Slice(e.getKey(), Math.round(e.getValue() * 100.0) / 100.0, Math.round((e.getValue() / finalTotal) * 1000.0) / 10.0))
                .sorted((a, b) -> Double.compare(b.getAmount(), a.getAmount()))
                .collect(Collectors.toList());

        List<DiversificationDTO.Slice> fundHouseSlices = fundHouseMap.entrySet().stream()
                .map(e -> new DiversificationDTO.Slice(e.getKey(), Math.round(e.getValue() * 100.0) / 100.0, Math.round((e.getValue() / finalTotal) * 1000.0) / 10.0))
                .sorted((a, b) -> Double.compare(b.getAmount(), a.getAmount()))
                .collect(Collectors.toList());

        String observation = "No holdings found in the portfolio.";
        if (!categorySlices.isEmpty()) {
            DiversificationDTO.Slice top = categorySlices.get(0);
            if (top.getPercentage() >= 40.0) {
                observation = top.getPercentage() + "% of your portfolio is concentrated in the " + top.getName() + " category.";
            } else {
                observation = "Your portfolio is balanced across " + categorySlices.size() + " categories, with the largest allocation in " + top.getName() + " (" + top.getPercentage() + "%).";
            }
        }

        return DiversificationDTO.builder()
                .fundCount(holdings.size())
                .categoryDistribution(categorySlices)
                .fundHouseDistribution(fundHouseSlices)
                .assetAllocation(new DiversificationDTO.AssetSplit(
                        Math.round(totalEquity * 10.0) / 10.0,
                        Math.round(totalDebt * 10.0) / 10.0,
                        Math.round(Math.max(0.0, 100.0 - totalEquity - totalDebt) * 10.0) / 10.0
                ))
                .concentrationObservation(observation)
                .build();
    }

    public List<FundRankingDTO> rankFunds() {
        List<MutualFund> funds = mutualFundRepository.findAll();
        List<FundRankingDTO> ranked = new ArrayList<>();

        for (MutualFund f : funds) {
            List<String> metricsUsed = new ArrayList<>();
            double totalWeight = 0.0;

            double returnScore = 0.0;
            if (f.getReturns1y() != null) {
                metricsUsed.add("Historical 1Y Return");
                totalWeight += 0.40;
                returnScore = Math.max(0.0, Math.min(100.0, (f.getReturns1y() / 40.0) * 100.0));
            }

            double riskAdjScore = 0.0;
            if (f.getReturns3y() != null) {
                metricsUsed.add("3Y Consistency / Risk Tier");
                totalWeight += 0.25;
                double penalty = "Very High".equalsIgnoreCase(f.getRisk()) ? 0.85 : 0.95;
                riskAdjScore = Math.max(0.0, Math.min(100.0, ((f.getReturns3y() * penalty) / 30.0) * 100.0));
            }

            double consistencyScore = 0.0;
            if (f.getReturns1y() != null && f.getReturns3y() != null) {
                metricsUsed.add("Historical Spread Consistency");
                totalWeight += 0.20;
                double diff = Math.abs(f.getReturns1y() - f.getReturns3y());
                consistencyScore = Math.max(10.0, Math.min(100.0, 100.0 - diff * 2.5));
            }

            double expenseScore = 0.0;
            if (f.getExpenseRatio() != null) {
                metricsUsed.add("Expense Ratio");
                totalWeight += 0.15;
                expenseScore = Math.max(10.0, Math.min(100.0, 100.0 - (f.getExpenseRatio() - 0.2) * 50.0));
            }

            double overall = totalWeight > 0 ? ((returnScore * 0.40) + (riskAdjScore * 0.25) + (consistencyScore * 0.20) + (expenseScore * 0.15)) / totalWeight : 0.0;

            ranked.add(FundRankingDTO.builder()
                    .fundId(f.getId())
                    .fundName(f.getName())
                    .category(f.getCategory())
                    .fundHouse(f.getFundHouse())
                    .overallScore(Math.round(overall * 10.0) / 10.0)
                    .returnScore(Math.round(returnScore * 10.0) / 10.0)
                    .riskAdjustedScore(Math.round(riskAdjScore * 10.0) / 10.0)
                    .consistencyScore(Math.round(consistencyScore * 10.0) / 10.0)
                    .expenseScore(Math.round(expenseScore * 10.0) / 10.0)
                    .metricsUsed(metricsUsed)
                    .currentNav(f.getNav())
                    .returns1y(f.getReturns1y())
                    .returns3y(f.getReturns3y())
                    .expenseRatio(f.getExpenseRatio())
                    .build());
        }

        ranked.sort((a, b) -> Double.compare(b.getOverallScore(), a.getOverallScore()));
        for (int i = 0; i < ranked.size(); i++) {
            ranked.get(i).setRank(i + 1);
        }

        return ranked;
    }
}
