package com.securevault.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.securevault.backend.dto.SecurityAnalyticsResponse;
import com.securevault.backend.entity.AuditLog;
import com.securevault.backend.entity.LoginEvent;
import com.securevault.backend.entity.SecurityAlert;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.AuditLogRepository;
import com.securevault.backend.repository.LoginEventRepository;
import com.securevault.backend.repository.SecurityAlertRepository;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportExportService {

    private final SecurityAnalyticsService analyticsService;
    private final AuditLogRepository auditLogRepository;
    private final LoginEventRepository loginEventRepository;
    private final SecurityAlertRepository alertRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public ReportExportService(SecurityAnalyticsService analyticsService,
                               AuditLogRepository auditLogRepository,
                               LoginEventRepository loginEventRepository,
                               SecurityAlertRepository alertRepository) {
        this.analyticsService = analyticsService;
        this.auditLogRepository = auditLogRepository;
        this.loginEventRepository = loginEventRepository;
        this.alertRepository = alertRepository;
    }

    public byte[] generatePdfReport(User user, String reportType) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 40, 40);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Header banner
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.BLACK);
            Paragraph title = new Paragraph("SecureVault Security Assessment Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            doc.add(title);

            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Paragraph meta = new Paragraph("Subject: " + user.getEmail() + " | Generated: " + java.time.LocalDateTime.now().format(FMT) + " | Type: " + reportType.toUpperCase(), metaFont);
            meta.setAlignment(Element.ALIGN_CENTER);
            meta.setSpacingAfter(20);
            doc.add(meta);

            // Summary metrics
            SecurityAnalyticsResponse stats = analyticsService.getAnalytics(user, "all");
            PdfPTable summary = new PdfPTable(4);
            summary.setWidthPercentage(100);
            addHeaderCell(summary, "Health Score");
            addHeaderCell(summary, "Risk Level");
            addHeaderCell(summary, "Total Credentials");
            addHeaderCell(summary, "Active Alerts");

            summary.addCell(stats.getPasswordHealthScore() + "/100");
            summary.addCell(stats.getOverallRiskLevel());
            summary.addCell(String.valueOf(stats.getTotalCredentials()));
            summary.addCell(String.valueOf(stats.getActiveAlerts()));
            summary.setSpacingAfter(20);
            doc.add(summary);

            // Report Specific Content
            if ("audit".equalsIgnoreCase(reportType)) {
                Paragraph section = new Paragraph("Audit Activity Log", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
                section.setSpacingAfter(10);
                doc.add(section);

                PdfPTable table = new PdfPTable(4);
                table.setWidthPercentage(100);
                addHeaderCell(table, "Timestamp");
                addHeaderCell(table, "Action");
                addHeaderCell(table, "Details");
                addHeaderCell(table, "IP Address");

                List<AuditLog> logs = auditLogRepository.findTop100ByUserOrderByTimestampDesc(user);
                for (AuditLog l : logs) {
                    table.addCell(l.getTimestamp().format(FMT));
                    table.addCell(l.getAction());
                    table.addCell(l.getDetails());
                    table.addCell(l.getIpAddress() != null ? l.getIpAddress() : "-");
                }
                doc.add(table);
            } else if ("threat".equalsIgnoreCase(reportType) || "alerts".equalsIgnoreCase(reportType)) {
                Paragraph section = new Paragraph("Threat Monitoring & Security Alerts", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
                section.setSpacingAfter(10);
                doc.add(section);

                PdfPTable table = new PdfPTable(5);
                table.setWidthPercentage(100);
                addHeaderCell(table, "Date");
                addHeaderCell(table, "Title");
                addHeaderCell(table, "Severity");
                addHeaderCell(table, "Status");
                addHeaderCell(table, "Description");

                List<SecurityAlert> alerts = alertRepository.findByUserOrderByCreatedAtDesc(user);
                for (SecurityAlert a : alerts) {
                    table.addCell(a.getCreatedAt().format(FMT));
                    table.addCell(a.getTitle());
                    table.addCell(a.getSeverity());
                    table.addCell(a.getStatus());
                    table.addCell(a.getDescription());
                }
                doc.add(table);
            } else {
                // Default: User Activity / Login Events Report
                Paragraph section = new Paragraph("User Authentication & Login History", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
                section.setSpacingAfter(10);
                doc.add(section);

                PdfPTable table = new PdfPTable(5);
                table.setWidthPercentage(100);
                addHeaderCell(table, "Date & Time");
                addHeaderCell(table, "Status");
                addHeaderCell(table, "Device");
                addHeaderCell(table, "Browser");
                addHeaderCell(table, "Risk Level");

                List<LoginEvent> logins = loginEventRepository.findTop50ByUserOrderByTimestampDesc(user);
                for (LoginEvent le : logins) {
                    table.addCell(le.getTimestamp().format(FMT));
                    table.addCell(le.getStatus());
                    table.addCell(le.getDeviceInfo() != null ? le.getDeviceInfo() : "-");
                    table.addCell(le.getBrowser() != null ? le.getBrowser() : "-");
                    table.addCell(le.getRiskLevel());
                }
                doc.add(table);
            }

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    public byte[] generateExcelCsvReport(User user, String reportType) {
        StringBuilder sb = new StringBuilder();
        if ("audit".equalsIgnoreCase(reportType)) {
            sb.append("Timestamp,Action,Details,IP Address\n");
            List<AuditLog> logs = auditLogRepository.findTop100ByUserOrderByTimestampDesc(user);
            for (AuditLog l : logs) {
                sb.append("\"").append(l.getTimestamp().format(FMT)).append("\",")
                  .append("\"").append(l.getAction()).append("\",")
                  .append("\"").append(l.getDetails().replace("\"", "\"\"")).append("\",")
                  .append("\"").append(l.getIpAddress()).append("\"\n");
            }
        } else if ("threat".equalsIgnoreCase(reportType)) {
            sb.append("Date,Title,Severity,Status,Description\n");
            List<SecurityAlert> alerts = alertRepository.findByUserOrderByCreatedAtDesc(user);
            for (SecurityAlert a : alerts) {
                sb.append("\"").append(a.getCreatedAt().format(FMT)).append("\",")
                  .append("\"").append(a.getTitle()).append("\",")
                  .append("\"").append(a.getSeverity()).append("\",")
                  .append("\"").append(a.getStatus()).append("\",")
                  .append("\"").append(a.getDescription().replace("\"", "\"\"")).append("\"\n");
            }
        } else {
            sb.append("Date,Status,Device,Browser,IP Address,Risk Level\n");
            List<LoginEvent> logins = loginEventRepository.findTop50ByUserOrderByTimestampDesc(user);
            for (LoginEvent le : logins) {
                sb.append("\"").append(le.getTimestamp().format(FMT)).append("\",")
                  .append("\"").append(le.getStatus()).append("\",")
                  .append("\"").append(le.getDeviceInfo()).append("\",")
                  .append("\"").append(le.getBrowser()).append("\",")
                  .append("\"").append(le.getIpAddress()).append("\",")
                  .append("\"").append(le.getRiskLevel()).append("\"\n");
            }
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
        cell.setBackgroundColor(new Color(15, 23, 42)); // Slate 900
        cell.setPadding(6);
        table.addCell(cell);
    }
}
