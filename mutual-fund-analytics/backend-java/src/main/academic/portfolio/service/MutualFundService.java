package com.academic.portfolio.service;

import com.academic.portfolio.model.MutualFund;
import com.academic.portfolio.model.NavHistoryPoint;
import com.academic.portfolio.repository.MutualFundRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * SOA Service 2: Mutual Fund Service
 * Responsibilities: Fund Catalog, Search, Filtering, NAV, Historical NAV, Categories, Comparison
 */
@Service
public class MutualFundService {

    private final MutualFundRepository mutualFundRepository;

    public MutualFundService(MutualFundRepository mutualFundRepository) {
        this.mutualFundRepository = mutualFundRepository;
    }

    public List<MutualFund> getAllFunds(String search, String category, String fundHouse, String risk, String sortBy, String sortOrder) {
        List<MutualFund> list = mutualFundRepository.findAll();

        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            list = list.stream()
                    .filter(f -> (f.getName() != null && f.getName().toLowerCase().contains(q)) ||
                            (f.getSchemeName() != null && f.getSchemeName().toLowerCase().contains(q)) ||
                            (f.getCategory() != null && f.getCategory().toLowerCase().contains(q)) ||
                            (f.getFundHouse() != null && f.getFundHouse().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        if (category != null && !category.equalsIgnoreCase("All")) {
            list = list.stream()
                    .filter(f -> f.getCategory() != null && f.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        if (fundHouse != null && !fundHouse.equalsIgnoreCase("All")) {
            list = list.stream()
                    .filter(f -> f.getFundHouse() != null && f.getFundHouse().equalsIgnoreCase(fundHouse))
                    .collect(Collectors.toList());
        }

        if (risk != null && !risk.equalsIgnoreCase("All")) {
            list = list.stream()
                    .filter(f -> f.getRisk() != null && f.getRisk().equalsIgnoreCase(risk))
                    .collect(Collectors.toList());
        }

        if (sortBy != null && !sortBy.isBlank()) {
            boolean asc = "asc".equalsIgnoreCase(sortOrder);
            list.sort((a, b) -> {
                int cmp = 0;
                switch (sortBy) {
                    case "name":
                        cmp = Objects.toString(a.getName(), "").compareToIgnoreCase(Objects.toString(b.getName(), ""));
                        break;
                    case "nav":
                        cmp = Double.compare(a.getNav() != null ? a.getNav() : 0.0, b.getNav() != null ? b.getNav() : 0.0);
                        break;
                    case "returns1y":
                        cmp = Double.compare(a.getReturns1y() != null ? a.getReturns1y() : -999.0, b.getReturns1y() != null ? b.getReturns1y() : -999.0);
                        break;
                    case "returns3y":
                        cmp = Double.compare(a.getReturns3y() != null ? a.getReturns3y() : -999.0, b.getReturns3y() != null ? b.getReturns3y() : -999.0);
                        break;
                    case "expenseRatio":
                        cmp = Double.compare(a.getExpenseRatio() != null ? a.getExpenseRatio() : 999.0, b.getExpenseRatio() != null ? b.getExpenseRatio() : 999.0);
                        break;
                    case "aum":
                        cmp = Double.compare(a.getAum() != null ? a.getAum() : 0.0, b.getAum() != null ? b.getAum() : 0.0);
                        break;
                    default:
                        break;
                }
                return asc ? cmp : -cmp;
            });
        }

        return list;
    }

    public Optional<MutualFund> getFundById(String id) {
        return mutualFundRepository.findById(id);
    }

    public List<String> getCategories() {
        return mutualFundRepository.findDistinctCategories();
    }

    public List<String> getFundHouses() {
        return mutualFundRepository.findDistinctFundHouses();
    }

    public Map<String, Object> compareFunds(List<String> fundIds) {
        if (fundIds == null || fundIds.size() < 2) {
            throw new IllegalArgumentException("At least 2 mutual funds must be selected for comparison.");
        }

        List<Map<String, Object>> comparisonResults = new ArrayList<>();

        for (String id : fundIds) {
            Optional<MutualFund> opt = mutualFundRepository.findById(id);
            if (opt.isEmpty()) continue;
            MutualFund f = opt.get();

            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("name", f.getName());
            map.put("schemeName", f.getSchemeName());
            map.put("category", f.getCategory() != null ? f.getCategory() : "Data not available");
            map.put("fundHouse", f.getFundHouse() != null ? f.getFundHouse() : "Data not available");
            map.put("nav", f.getNav() != null ? f.getNav() : "Data not available");
            map.put("expenseRatio", f.getExpenseRatio() != null ? f.getExpenseRatio() : "Data not available");
            map.put("aum", f.getAum() != null ? f.getAum() : "Data not available");
            map.put("risk", f.getRisk() != null ? f.getRisk() : "Data not available");
            map.put("returns1y", f.getReturns1y() != null ? f.getReturns1y() : "Data not available");
            map.put("returns3y", f.getReturns3y() != null ? f.getReturns3y() : "Data not available");
            map.put("returns5y", f.getReturns5y() != null ? f.getReturns5y() : "Data not available");

            // Calculate historical volatility if historical nav points exist
            List<NavHistoryPoint> history = f.getHistoricalNav();
            if (history != null && history.size() >= 4) {
                List<Double> returns = new ArrayList<>();
                for (int i = 1; i < history.size(); i++) {
                    double prev = history.get(i - 1).getNav();
                    double curr = history.get(i).getNav();
                    if (prev > 0) {
                        returns.add(((curr - prev) / prev) * 100);
                    }
                }
                if (returns.size() > 2) {
                    double mean = returns.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                    double variance = returns.stream().mapToDouble(r -> Math.pow(r - mean, 2)).sum() / (returns.size() - 1);
                    double vol = Math.round(Math.sqrt(variance) * 100.0) / 100.0;
                    map.put("volatilityDisplay", vol + "%");

                    double rfr = 6.5;
                    double ret = f.getReturns1y() != null ? f.getReturns1y() : mean;
                    double sharpe = Math.round(((ret - rfr) / vol) * 100.0) / 100.0;
                    map.put("sharpeDisplay", String.valueOf(sharpe));
                } else {
                    map.put("volatilityDisplay", "Insufficient historical data.");
                    map.put("sharpeDisplay", "Insufficient historical data.");
                }
            } else {
                map.put("volatilityDisplay", "Insufficient historical data.");
                map.put("sharpeDisplay", "Insufficient historical data.");
            }

            comparisonResults.add(map);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("comparison", comparisonResults);
        response.put("note", "Use neutral analytical metrics for comparison. Past returns do not predict future performance.");
        return response;
    }
}
