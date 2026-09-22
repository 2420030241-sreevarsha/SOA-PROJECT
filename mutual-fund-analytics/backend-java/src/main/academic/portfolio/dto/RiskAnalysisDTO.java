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
public class RiskAnalysisDTO {
    private Double volatility;
    private Double sharpeRatio;
    private Double maxDrawdown;
    private Integer riskScore; // 0-100
    private String riskLevel; // Low, Moderate, High, Very High, Insufficient historical data
    private List<String> assumptions;
    private Boolean isInsufficientData;
    private Double concentrationScore;
    private String disclaimer;
}
