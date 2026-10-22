package com.securevault.backend.controller;

import com.securevault.backend.dto.LoginEventResponse;
import com.securevault.backend.entity.AuditLog;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.AuditLogRepository;
import com.securevault.backend.repository.CredentialRepository;
import com.securevault.backend.repository.LoginEventRepository;
import com.securevault.backend.repository.UserRepository;
import com.securevault.backend.service.AuditLogService;
import com.securevault.backend.service.LoginMonitoringService;
import com.securevault.backend.util.RequestMetadataUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepository;
    private final CredentialRepository credentialRepository;
    private final LoginEventRepository loginEventRepository;
    private final AuditLogRepository auditLogRepository;
    private final LoginMonitoringService loginMonitoringService;
    private final AuditLogService auditLogService;

    public AdminController(UserRepository userRepository,
                           CredentialRepository credentialRepository,
                           LoginEventRepository loginEventRepository,
                           AuditLogRepository auditLogRepository,
                           LoginMonitoringService loginMonitoringService,
                           AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.loginEventRepository = loginEventRepository;
        this.auditLogRepository = auditLogRepository;
        this.loginMonitoringService = loginMonitoringService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/users")
    public List<Map<String, Object>> listUsers() {
        return userRepository.findAll().stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("mfaEnabled", u.isMfaEnabled());
            return map;
        }).toList();
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id,
                                            @RequestParam String role,
                                            Authentication auth,
                                            HttpServletRequest request) {
        User target = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        target.setRole(role.trim().toUpperCase());
        userRepository.save(target);

        User adminUser = userRepository.findByEmail(auth.getName()).orElse(null);
        auditLogService.log(adminUser, "ROLE_CHANGE", "Changed role of " + target.getEmail() + " to " + role, RequestMetadataUtil.extractClientIp(request));

        return ResponseEntity.ok("User role updated successfully");
    }

    @GetMapping("/audit-logs")
    public List<AuditLog> allAuditLogs() {
        return auditLogService.getAllLogs();
    }

    @GetMapping("/security-events")
    public List<LoginEventResponse> allSecurityEvents() {
        return loginMonitoringService.getAllSecurityEvents();
    }

    @GetMapping("/system-stats")
    public Map<String, Object> systemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCredentials", credentialRepository.count());
        stats.put("totalLoginEvents", loginEventRepository.count());
        stats.put("totalAuditLogs", auditLogRepository.count());
        return stats;
    }
}
