package com.academic.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatasetSummaryDTO {
    private Boolean isDemo;
    private Integer totalRecords;
    private Integer processedRecords;
    private Integer duplicateRecords;
    private Integer missingValues;
    private Integer invalidRecords;
    private Map<String, String> detectedColumns;
    private List<String> columnsList;
    private List<Map<String, Object>> sampleRows;
    private String lastUploadedAt;
}
