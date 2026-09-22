package com.academic.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioSummaryDTO {
    private Double totalInvested;
    private Double currentValue;
    private Double totalProfitLoss;
    private Double overallReturnPercent;
    private Integer fundCount;
    private Integer transactionCount;
    private Double monthlySipAmount;
    private Boolean isDemo;
}
