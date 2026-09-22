package com.academic.portfolio.controller;

import com.academic.portfolio.dto.DatasetSummaryDTO;
import com.academic.portfolio.service.DatasetProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/dataset")
@CrossOrigin(origins = "*")
public class DatasetController {

    private final DatasetProcessingService datasetProcessingService;

    public DatasetController(DatasetProcessingService datasetProcessingService) {
        this.datasetProcessingService = datasetProcessingService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DatasetSummaryDTO> getSummary() {
        return ResponseEntity.ok(datasetProcessingService.getDatasetSummary());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadCsv(@RequestParam("file") MultipartFile file) {
        try {
            DatasetSummaryDTO result = datasetProcessingService.processUploadedCsv(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
