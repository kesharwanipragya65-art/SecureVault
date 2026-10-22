package com.securevault.backend.controller;

import com.securevault.backend.dto.LoginEventResponse;
import com.securevault.backend.dto.SecurityAnalyticsResponse;
import com.securevault.backend.entity.*;
import com.securevault.backend.repository.UserRepository;
import com.securevault.backend.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/security")
@CrossOrigin(origins = "http://localhost:5173")
public class SecurityController {

    private final LoginMonitoringService loginMonitoringService;
    private final SecurityAnalyticsService analyticsService;
    private final SecurityAlertService alertService;
    private final UserDeviceService deviceService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public SecurityController(LoginMonitoringService loginMonitoringService,
                              SecurityAnalyticsService analyticsService,
                              SecurityAlertService alertService,
                              UserDeviceService deviceService,
                              AuditLogService auditLogService,
                              NotificationService notificationService,
                              UserRepository userRepository) {
        this.loginMonitoringService = loginMonitoringService;
        this.analyticsService = analyticsService;
        this.alertService = alertService;
        this.deviceService = deviceService;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    // Login Activity History
    @GetMapping("/login-history")
    public ResponseEntity<List<LoginEventResponse>> getLoginHistory(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(loginMonitoringService.getUserLoginHistory(user));
    }

    // Security Analytics Dashboard Metrics (Today, 7 Days, 30 Days, 90 Days)
    @GetMapping("/analytics")
    public ResponseEntity<SecurityAnalyticsResponse> getAnalytics(@RequestParam(required = false, defaultValue = "all") String timeRange,
                                                                 Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(analyticsService.getAnalytics(user, timeRange));
    }

    // Security Alerts
    @GetMapping("/alerts")
    public ResponseEntity<List<SecurityAlert>> getAlerts(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(alertService.getUserAlerts(user));
    }

    @PostMapping("/alerts/{id}/resolve")
    public ResponseEntity<?> resolveAlert(@PathVariable Long id, Authentication authentication) {
        User user = getUser(authentication);
        try {
            return ResponseEntity.ok(alertService.resolveAlert(id, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Devices Management
    @GetMapping("/devices")
    public ResponseEntity<List<UserDevice>> getDevices(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(deviceService.getUserDevices(user));
    }

    @PostMapping("/devices/{id}/trust")
    public ResponseEntity<?> trustDevice(@PathVariable Long id, Authentication authentication) {
        User user = getUser(authentication);
        try {
            return ResponseEntity.ok(deviceService.trustDevice(id, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/devices/{id}/revoke")
    public ResponseEntity<?> revokeDevice(@PathVariable Long id, Authentication authentication) {
        User user = getUser(authentication);
        try {
            return ResponseEntity.ok(deviceService.revokeDevice(id, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Audit Logs
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(auditLogService.getUserLogs(user));
    }

    // Notifications
    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(notificationService.getUserNotifications(user));
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable Long id, Authentication authentication) {
        User user = getUser(authentication);
        try {
            return ResponseEntity.ok(notificationService.markAsRead(id, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
