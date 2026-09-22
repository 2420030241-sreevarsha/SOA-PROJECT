package com.academic.portfolio.controller;

import com.academic.portfolio.dto.DiversificationDTO;
import com.academic.portfolio.dto.FundRankingDTO;
import com.academic.portfolio.dto.RiskAnalysisDTO;
import com.academic.portfolio.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @GetMapping("/risk")
    public ResponseEntity<RiskAnalysisDTO> getRiskAnalysis(@RequestParam(defaultValue = "usr-default") String userId) {
        return ResponseEntity.ok(analysisService.analyzePortfolioRisk(userId));
    }

    @GetMapping("/diversification")
    public ResponseEntity<DiversificationDTO> getDiversification(@RequestParam(defaultValue = "usr-default") String userId) {
        return ResponseEntity.ok(analysisService.analyzeDiversification(userId));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<FundRankingDTO>> getRankings() {
        return ResponseEntity.ok(analysisService.rankFunds());
    }
}
