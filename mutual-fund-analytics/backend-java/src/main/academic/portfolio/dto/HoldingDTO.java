package com.academic.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoldingDTO {
    private String id;
    private String userId;
    private String fundId;
    private String fundName;
    private String category;
    private Double units;
    private Double averagePurchasePrice;
    private Double investedAmount;
    private Double currentNav;
    private Double currentValue;
    private Double profitLoss;
    private Double returnPercent;
}
