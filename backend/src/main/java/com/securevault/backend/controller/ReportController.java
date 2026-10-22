package com.securevault.backend.controller;

import com.securevault.backend.entity.User;
import com.securevault.backend.repository.UserRepository;
import com.securevault.backend.service.ReportExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final ReportExportService reportExportService;
    private final UserRepository userRepository;

    public ReportController(ReportExportService reportExportService, UserRepository userRepository) {
        this.reportExportService = reportExportService;
        this.userRepository = userRepository;
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> downloadPdf(@RequestParam(defaultValue = "activity") String type,
                                              Authentication authentication) {
        User user = getUser(authentication);
        byte[] pdf = reportExportService.generatePdfReport(user, type);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"securevault-" + type + "-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/excel")
    public ResponseEntity<byte[]> downloadExcel(@RequestParam(defaultValue = "activity") String type,
                                                Authentication authentication) {
        User user = getUser(authentication);
        byte[] data = reportExportService.generateExcelCsvReport(user, type);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"securevault-" + type + "-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(data);
    }
}
