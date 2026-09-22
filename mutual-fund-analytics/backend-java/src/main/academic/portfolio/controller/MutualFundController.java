package com.academic.portfolio.controller;

import com.academic.portfolio.model.MutualFund;
import com.academic.portfolio.service.MutualFundService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/funds")
@CrossOrigin(origins = "*")
public class MutualFundController {

    private final MutualFundService mutualFundService;

    public MutualFundController(MutualFundService mutualFundService) {
        this.mutualFundService = mutualFundService;
    }

    @GetMapping
    public ResponseEntity<List<MutualFund>> getFunds(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String fundHouse,
            @RequestParam(required = false) String risk,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortOrder) {
        return ResponseEntity.ok(mutualFundService.getAllFunds(search, category, fundHouse, risk, sortBy, sortOrder));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFundById(@PathVariable String id) {
        return mutualFundService.getFundById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(mutualFundService.getCategories());
    }

    @GetMapping("/fund-houses")
    public ResponseEntity<List<String>> getFundHouses() {
        return ResponseEntity.ok(mutualFundService.getFundHouses());
    }

    @PostMapping("/compare")
    public ResponseEntity<?> compareFunds(@RequestBody Map<String, List<String>> body) {
        try {
            List<String> fundIds = body.get("fundIds");
            return ResponseEntity.ok(mutualFundService.compareFunds(fundIds));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
