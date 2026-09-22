package com.academic.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIInsightDTO {
    private String summary;
    private String performanceObservation;
    private String riskObservation;
    private String diversificationObservation;
    private String historicalTrendObservation;
    private String disclaimer;
}
