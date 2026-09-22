package com.academic.portfolio.controller;

import com.academic.portfolio.model.SIPRecord;
import com.academic.portfolio.model.Transaction;
import com.academic.portfolio.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@RequestParam(defaultValue = "usr-default") String userId) {
        return ResponseEntity.ok(transactionService.getUserTransactions(userId));
    }

    @PostMapping("/transactions")
    public ResponseEntity<?> addTransaction(@RequestBody Map<String, Object> body) {
        try {
            String userId = (String) body.getOrDefault("userId", "usr-default");
            String fundId = (String) body.get("fundId");
            String type = (String) body.get("type");
            Double amount = Double.valueOf(body.get("amount").toString());
            Double nav = body.get("nav") != null ? Double.valueOf(body.get("nav").toString()) : null;
            String notes = (String) body.get("notes");
            String date = (String) body.get("date");

            Transaction tx = transactionService.addTransaction(userId, fundId, type, amount, nav, notes, date);
            return ResponseEntity.ok(tx);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable String id, @RequestParam(defaultValue = "usr-default") String userId) {
        try {
            transactionService.deleteTransaction(id, userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/sip")
    public ResponseEntity<List<SIPRecord>> getSips(@RequestParam(defaultValue = "usr-default") String userId) {
        return ResponseEntity.ok(transactionService.getUserSIPs(userId));
    }

    @PostMapping("/sip")
    public ResponseEntity<?> addSip(@RequestBody Map<String, Object> body) {
        try {
            String userId = (String) body.getOrDefault("userId", "usr-default");
            String fundId = (String) body.get("fundId");
            Double amount = Double.valueOf(body.get("amount").toString());
            Integer dayOfMonth = body.get("dayOfMonth") != null ? Integer.valueOf(body.get("dayOfMonth").toString()) : 5;

            SIPRecord sip = transactionService.registerSIP(userId, fundId, amount, dayOfMonth);
            return ResponseEntity.ok(sip);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sip/{id}/toggle")
    public ResponseEntity<?> toggleSip(@PathVariable String id, @RequestParam(defaultValue = "usr-default") String userId) {
        try {
            return ResponseEntity.ok(transactionService.toggleSIP(id, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/sip/{id}")
    public ResponseEntity<?> deleteSip(@PathVariable String id, @RequestParam(defaultValue = "usr-default") String userId) {
        try {
            transactionService.deleteSIP(id, userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
