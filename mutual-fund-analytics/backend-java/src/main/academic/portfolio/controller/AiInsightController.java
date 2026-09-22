package com.academic.portfolio.controller;

import com.academic.portfolio.dto.AIInsightDTO;
import com.academic.portfolio.service.AiInsightService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiInsightController {

    private final AiInsightService aiInsightService;

    public AiInsightController(AiInsightService aiInsightService) {
        this.aiInsightService = aiInsightService;
    }

    @PostMapping("/insights")
    public ResponseEntity<AIInsightDTO> getInsights(@RequestBody Map<String, String> body) {
        String userId = body.getOrDefault("userId", "usr-default");
        return ResponseEntity.ok(aiInsightService.generatePortfolioInsights(userId));
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> body) {
        String userId = body.getOrDefault("userId", "usr-default");
        String message = body.getOrDefault("message", "");
        String reply = aiInsightService.chatWithAssistant(userId, message);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
