package com.academic.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FundRankingDTO {
    private Integer rank;
    private String fundId;
    private String fundName;
    private String category;
    private String fundHouse;
    private Double overallScore;
    private Double returnScore;
    private Double riskAdjustedScore;
    private Double consistencyScore;
    private Double expenseScore;
    private List<String> metricsUsed;
    private Double currentNav;
    private Double returns1y;
    private Double returns3y;
    private Double expenseRatio;
}
