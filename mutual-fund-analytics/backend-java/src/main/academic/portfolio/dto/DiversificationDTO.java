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
public class DiversificationDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Slice {
        private String name;
        private Double amount;
        private Double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssetSplit {
        private Double equity;
        private Double debt;
        private Double cash;
    }

    private Integer fundCount;
    private List<Slice> categoryDistribution;
    private List<Slice> fundHouseDistribution;
    private AssetSplit assetAllocation;
    private String concentrationObservation;
}
