package com.academic.portfolio.service;

import com.academic.portfolio.dto.HoldingDTO;
import com.academic.portfolio.dto.PortfolioSummaryDTO;
import com.academic.portfolio.model.MutualFund;
import com.academic.portfolio.model.SIPRecord;
import com.academic.portfolio.model.Transaction;
import com.academic.portfolio.repository.MutualFundRepository;
import com.academic.portfolio.repository.SIPRepository;
import com.academic.portfolio.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * SOA Service 3: Portfolio Service
 * Responsibilities:
 * - Current portfolio value (Sum of Units Held * Current NAV)
 * - Invested amount
 * - Profit/loss (Current Value - Invested Amount)
 * - Returns % (((Current Value - Invested Amount) / Invested Amount) * 100)
 */
@Service
public class PortfolioService {

    private final TransactionRepository transactionRepository;
    private final MutualFundRepository mutualFundRepository;
    private final SIPRepository sipRepository;

    public PortfolioService(TransactionRepository transactionRepository,
                            MutualFundRepository mutualFundRepository,
                            SIPRepository sipRepository) {
        this.transactionRepository = transactionRepository;
        this.mutualFundRepository = mutualFundRepository;
        this.sipRepository = sipRepository;
    }

    public List<HoldingDTO> getHoldings(String userId) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);

        Map<String, FundPosition> positionMap = new HashMap<>();

        for (Transaction tx : transactions) {
            FundPosition pos = positionMap.computeIfAbsent(tx.getFundId(), k -> new FundPosition(tx.getFundId(), tx.getFundName()));
            if ("BUY".equalsIgnoreCase(tx.getType()) || "SIP".equalsIgnoreCase(tx.getType())) {
                pos.units += tx.getUnits();
                pos.invested += tx.getAmount();
            } else if ("SELL".equalsIgnoreCase(tx.getType())) {
                double avgCost = pos.units > 0 ? (pos.invested / pos.units) : 0.0;
                pos.units = Math.max(0.0, pos.units - tx.getUnits());
                pos.invested = Math.max(0.0, pos.invested - (tx.getUnits() * avgCost));
            }
        }

        List<HoldingDTO> holdings = new ArrayList<>();
        for (FundPosition pos : positionMap.values()) {
            if (pos.units <= 0.0001) continue;

            Optional<MutualFund> fundOpt = mutualFundRepository.findById(pos.fundId);
            Double currentNav = fundOpt.flatMap(f -> Optional.ofNullable(f.getNav())).orElse(null);
            String category = fundOpt.map(MutualFund::getCategory).orElse("General");

            double avgPrice = pos.units > 0 ? (pos.invested / pos.units) : 0.0;
            double currentValue = currentNav != null ? (pos.units * currentNav) : pos.invested;
            double profitLoss = currentValue - pos.invested;
            double returnPercent = pos.invested > 0 ? ((profitLoss / pos.invested) * 100.0) : 0.0;

            holdings.add(HoldingDTO.builder()
                    .id("hld-" + pos.fundId)
                    .userId(userId)
                    .fundId(pos.fundId)
                    .fundName(pos.fundName)
                    .category(category)
                    .units(Math.round(pos.units * 10000.0) / 10000.0)
                    .averagePurchasePrice(Math.round(avgPrice * 100.0) / 100.0)
                    .investedAmount(Math.round(pos.invested * 100.0) / 100.0)
                    .currentNav(currentNav)
                    .currentValue(Math.round(currentValue * 100.0) / 100.0)
                    .profitLoss(Math.round(profitLoss * 100.0) / 100.0)
                    .returnPercent(Math.round(returnPercent * 100.0) / 100.0)
                    .build());
        }

        return holdings;
    }

    public PortfolioSummaryDTO getSummary(String userId) {
        List<HoldingDTO> holdings = getHoldings(userId);
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);
        List<SIPRecord> sips = sipRepository.findByUserIdAndActiveTrue(userId);

        double totalInvested = holdings.stream().mapToDouble(HoldingDTO::getInvestedAmount).sum();
        double currentValue = holdings.stream().mapToDouble(HoldingDTO::getCurrentValue).sum();
        double totalProfitLoss = currentValue - totalInvested;
        double overallReturnPercent = totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100.0) : 0.0;
        double monthlySip = sips.stream().mapToDouble(SIPRecord::getAmount).sum();

        return PortfolioSummaryDTO.builder()
                .totalInvested(Math.round(totalInvested * 100.0) / 100.0)
                .currentValue(Math.round(currentValue * 100.0) / 100.0)
                .totalProfitLoss(Math.round(totalProfitLoss * 100.0) / 100.0)
                .overallReturnPercent(Math.round(overallReturnPercent * 100.0) / 100.0)
                .fundCount(holdings.size())
                .transactionCount(transactions.size())
                .monthlySipAmount(monthlySip)
                .isDemo(false)
                .build();
    }

    private static class FundPosition {
        String fundId;
        String fundName;
        double units = 0.0;
        double invested = 0.0;

        FundPosition(String fundId, String fundName) {
            this.fundId = fundId;
            this.fundName = fundName;
        }
    }
}
