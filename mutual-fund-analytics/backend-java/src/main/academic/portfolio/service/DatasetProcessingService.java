package com.academic.portfolio.service;

import com.academic.portfolio.dto.DatasetSummaryDTO;
import com.academic.portfolio.model.MutualFund;
import com.academic.portfolio.repository.MutualFundRepository;
import com.opencsv.CSVReader;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service for Mutual Fund CSV Dataset Ingestion, Column Mapping, and Data Cleaning
 * Handles Kaggle Indian Mutual Fund dataset format with flexible column mappings
 */
@Service
public class DatasetProcessingService {

    private final MutualFundRepository mutualFundRepository;
    private DatasetSummaryDTO currentSummary;

    public DatasetProcessingService(MutualFundRepository mutualFundRepository) {
        this.mutualFundRepository = mutualFundRepository;
        this.currentSummary = DatasetSummaryDTO.builder()
                .isDemo(true)
                .totalRecords(8)
                .processedRecords(8)
                .duplicateRecords(0)
                .missingValues(1)
                .invalidRecords(0)
                .detectedColumns(Map.of(
                        "scheme_name", "Fund / Scheme Name",
                        "category", "Category",
                        "fund_house", "Fund House",
                        "nav", "Current NAV",
                        "expense_ratio", "Expense Ratio",
                        "aum", "AUM (Cr)",
                        "returns_1y", "1 Year Return (%)"
                ))
                .columnsList(List.of("scheme_name", "category", "fund_house", "nav", "expense_ratio", "aum", "returns_1y"))
                .sampleRows(Collections.emptyList())
                .build();
    }

    public DatasetSummaryDTO getDatasetSummary() {
        return currentSummary;
    }

    public DatasetSummaryDTO processUploadedCsv(MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("The uploaded CSV file is empty.");
        }

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<String[]> lines = reader.readAll();
            if (lines.isEmpty()) {
                throw new IllegalArgumentException("CSV file contains no data rows.");
            }

            String[] headers = lines.get(0);
            Map<String, Integer> colIndexMap = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                colIndexMap.put(headers[i].trim().toLowerCase(), i);
            }

            // Detect column positions
            Integer nameCol = findColumn(colIndexMap, "scheme_name", "fund_name", "scheme name", "fund name", "name");
            Integer catCol = findColumn(colIndexMap, "category", "scheme_category", "sub_category");
            Integer fhCol = findColumn(colIndexMap, "fund_house", "amc_name", "fund house", "amc");
            Integer navCol = findColumn(colIndexMap, "nav", "current_nav", "net_asset_value");
            Integer expCol = findColumn(colIndexMap, "expense_ratio", "ter", "expense ratio");
            Integer aumCol = findColumn(colIndexMap, "aum", "fund_size", "aum_cr");
            Integer r1yCol = findColumn(colIndexMap, "returns_1y", "1y_return", "returns 1 year", "1y");
            Integer r3yCol = findColumn(colIndexMap, "returns_3y", "3y_return", "returns 3 year", "3y");

            if (nameCol == null) {
                throw new IllegalArgumentException("Required column for Fund Name / Scheme Name could not be detected in CSV.");
            }

            Map<String, String> detectedCols = new HashMap<>();
            detectedCols.put("scheme_name", headers[nameCol]);
            if (catCol != null) detectedCols.put("category", headers[catCol]);
            if (fhCol != null) detectedCols.put("fund_house", headers[fhCol]);
            if (navCol != null) detectedCols.put("nav", headers[navCol]);
            if (expCol != null) detectedCols.put("expense_ratio", headers[expCol]);
            if (aumCol != null) detectedCols.put("aum", headers[aumCol]);
            if (r1yCol != null) detectedCols.put("returns_1y", headers[r1yCol]);
            if (r3yCol != null) detectedCols.put("returns_3y", headers[r3yCol]);

            int totalRows = lines.size() - 1;
            int duplicateCount = 0;
            int missingCount = 0;
            int invalidCount = 0;
            int processedCount = 0;

            Set<String> seenNames = new HashSet<>();
            List<MutualFund> fundBatch = new ArrayList<>();
            List<Map<String, Object>> samples = new ArrayList<>();

            for (int i = 1; i < lines.size(); i++) {
                String[] row = lines.get(i);
                if (row.length <= nameCol) {
                    invalidCount++;
                    continue;
                }

                String fundName = row[nameCol].trim();
                if (fundName.isBlank()) {
                    invalidCount++;
                    continue;
                }

                if (seenNames.contains(fundName.toLowerCase())) {
                    duplicateCount++;
                    continue;
                }
                seenNames.add(fundName.toLowerCase());

                String category = (catCol != null && row.length > catCol && !row[catCol].isBlank()) ? row[catCol].trim() : "Other";
                String fundHouse = (fhCol != null && row.length > fhCol && !row[fhCol].isBlank()) ? row[fhCol].trim() : "Other AMC";

                Double nav = parseDouble(row, navCol);
                Double expenseRatio = parseDouble(row, expCol);
                Double aum = parseDouble(row, aumCol);
                Double ret1y = parseDouble(row, r1yCol);
                Double ret3y = parseDouble(row, r3yCol);

                if (nav == null || expenseRatio == null || aum == null) {
                    missingCount++;
                }

                MutualFund mf = MutualFund.builder()
                        .id("fund-csv-" + (i))
                        .name(fundName)
                        .schemeName(fundName)
                        .category(category)
                        .fundHouse(fundHouse)
                        .nav(nav != null ? nav : 100.0)
                        .navDate(LocalDateOrNow())
                        .expenseRatio(expenseRatio)
                        .aum(aum)
                        .risk(ret1y != null && ret1y > 20.0 ? "Very High" : "Moderate")
                        .returns1y(ret1y)
                        .returns3y(ret3y)
                        .equityAllocation("Debt".equalsIgnoreCase(category) ? 5.0 : 92.0)
                        .debtAllocation("Debt".equalsIgnoreCase(category) ? 90.0 : 5.0)
                        .cashAllocation(5.0)
                        .build();

                fundBatch.add(mf);
                processedCount++;

                if (samples.size() < 10) {
                    Map<String, Object> sample = new HashMap<>();
                    sample.put("scheme_name", fundName);
                    sample.put("category", category);
                    sample.put("fund_house", fundHouse);
                    sample.put("nav", nav != null ? nav : "Data not available");
                    sample.put("expense_ratio", expenseRatio != null ? expenseRatio : "Data not available");
                    sample.put("aum", aum != null ? aum : "Data not available");
                    samples.add(sample);
                }
            }

            // Save processed entities
            mutualFundRepository.saveAll(fundBatch);

            currentSummary = DatasetSummaryDTO.builder()
                    .isDemo(false)
                    .totalRecords(totalRows)
                    .processedRecords(processedCount)
                    .duplicateRecords(duplicateCount)
                    .missingValues(missingCount)
                    .invalidRecords(invalidCount)
                    .detectedColumns(detectedCols)
                    .columnsList(new ArrayList<>(detectedCols.keySet()))
                    .sampleRows(samples)
                    .lastUploadedAt(LocalDateTime.now().toString())
                    .build();

            return currentSummary;
        }
    }

    private Integer findColumn(Map<String, Integer> map, String... candidates) {
        for (String c : candidates) {
            for (Map.Entry<String, Integer> entry : map.entrySet()) {
                if (entry.getKey().contains(c)) {
                    return entry.getValue();
                }
            }
        }
        return null;
    }

    private Double parseDouble(String[] row, Integer col) {
        if (col == null || row.length <= col) return null;
        try {
            String clean = row[col].replaceAll("[^0-9.-]", "").trim();
            if (clean.isBlank()) return null;
            return Double.parseDouble(clean);
        } catch (Exception e) {
            return null;
        }
    }

    private String LocalDateOrNow() {
        return java.time.LocalDate.now().toString();
    }
}
