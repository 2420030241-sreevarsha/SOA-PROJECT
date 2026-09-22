package com.academic.portfolio.controller;

import com.academic.portfolio.dto.HoldingDTO;
import com.academic.portfolio.dto.PortfolioSummaryDTO;
import com.academic.portfolio.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "*")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public ResponseEntity<List<HoldingDTO>> getHoldings(@RequestParam(defaultValue = "usr-default") String userId) {
        return ResponseEntity.ok(portfolioService.getHoldings(userId));
    }

    @GetMapping("/summary")
    public ResponseEntity<PortfolioSummaryDTO> getSummary(@RequestParam(defaultValue = "usr-default") String userId) {
        return ResponseEntity.ok(portfolioService.getSummary(userId));
    }
}
