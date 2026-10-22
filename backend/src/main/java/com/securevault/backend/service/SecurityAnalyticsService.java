package com.securevault.backend.service;

import com.securevault.backend.dto.LoginEventResponse;
import com.securevault.backend.dto.SecurityAnalyticsResponse;
import com.securevault.backend.entity.Credential;
import com.securevault.backend.entity.LoginEvent;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.CredentialRepository;
import com.securevault.backend.repository.LoginEventRepository;
import com.securevault.backend.repository.SecurityAlertRepository;
import com.securevault.backend.repository.UserDeviceRepository;
import com.securevault.backend.security.EncryptionService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class SecurityAnalyticsService {

    private final CredentialRepository credentialRepository;
    private final LoginEventRepository loginEventRepository;
    private final SecurityAlertRepository alertRepository;
    private final UserDeviceRepository deviceRepository;
    private final EncryptionService encryptionService;

    // Cache structure with 60-second TTL
    private static class CacheEntry {
        final SecurityAnalyticsResponse response;
        final long expiresAt;
        CacheEntry(SecurityAnalyticsResponse response, long ttlMs) {
            this.response = response;
            this.expiresAt = System.currentTimeMillis() + ttlMs;
        }
        boolean isExpired() { return System.currentTimeMillis() > expiresAt; }
    }

    private final Map<String, CacheEntry> analyticsCache = new ConcurrentHashMap<>();

    public SecurityAnalyticsService(CredentialRepository credentialRepository,
                                    LoginEventRepository loginEventRepository,
                                    SecurityAlertRepository alertRepository,
                                    UserDeviceRepository deviceRepository,
                                    EncryptionService encryptionService) {
        this.credentialRepository = credentialRepository;
        this.loginEventRepository = loginEventRepository;
        this.alertRepository = alertRepository;
        this.deviceRepository = deviceRepository;
        this.encryptionService = encryptionService;
    }

    public SecurityAnalyticsResponse getAnalytics(User user, String timeRange) {
        String cacheKey = user.getId() + ":" + (timeRange == null ? "all" : timeRange.toLowerCase());
        CacheEntry cached = analyticsCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return cached.response;
        }

        SecurityAnalyticsResponse res = calculateAnalytics(user, timeRange);
        analyticsCache.put(cacheKey, new CacheEntry(res, 60_000)); // 60s TTL
        return res;
    }

    public void invalidateCache(User user) {
        if (user != null) {
            analyticsCache.keySet().removeIf(k -> k.startsWith(user.getId() + ":"));
        }
    }

    private SecurityAnalyticsResponse calculateAnalytics(User user, String timeRange) {
        SecurityAnalyticsResponse resp = new SecurityAnalyticsResponse();

        // 1. Credential & Password Health Analysis
        List<Credential> credentials = credentialRepository.findByUser(user);
        resp.setTotalCredentials(credentials.size());

        long strong = 0;
        long medium = 0;
        long weak = 0;
        Map<String, Integer> passwordFrequencies = new HashMap<>();

        for (Credential c : credentials) {
            String plain = encryptionService.decrypt(c.getPassword());
            int score = scorePassword(plain);
            if (score >= 4) strong++;
            else if (score >= 3) medium++;
            else weak++;

            passwordFrequencies.put(plain, passwordFrequencies.getOrDefault(plain, 0) + 1);
        }

        long reused = passwordFrequencies.values().stream().filter(count -> count > 1).count();
        resp.setStrongPasswords(strong);
        resp.setMediumPasswords(medium);
        resp.setWeakPasswords(weak);
        resp.setReusedPasswords(reused);

        int healthScore = 100;
        if (credentials.isEmpty()) {
            healthScore = 100;
        } else {
            healthScore -= (int) (weak * 25.0 / credentials.size());
            healthScore -= (int) (medium * 10.0 / credentials.size());
            healthScore -= (int) (reused * 20.0 / credentials.size());
            healthScore = Math.max(0, Math.min(100, healthScore));
        }
        resp.setPasswordHealthScore(healthScore);

        // 2. Login Monitoring & Time Range Filtering
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime filterDate = switch (timeRange != null ? timeRange.toLowerCase() : "all") {
            case "today", "1d" -> now.minusDays(1);
            case "7days", "7d" -> now.minusDays(7);
            case "30days", "30d" -> now.minusDays(30);
            case "90days", "90d" -> now.minusDays(90);
            default -> LocalDateTime.of(2000, 1, 1, 0, 0);
        };

        List<LoginEvent> userEvents = loginEventRepository.findByUserOrderByTimestampDesc(user);
        List<LoginEvent> filteredEvents = userEvents.stream()
            .filter(e -> e.getTimestamp().isAfter(filterDate))
            .collect(Collectors.toList());

        long successLogins = filteredEvents.stream().filter(e -> "SUCCESS".equalsIgnoreCase(e.getStatus())).count();
        long failedLogins = filteredEvents.stream().filter(e -> "FAILED".equalsIgnoreCase(e.getStatus())).count();
        long suspiciousEvents = filteredEvents.stream().filter(e -> "HIGH".equalsIgnoreCase(e.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(e.getRiskLevel())).count();

        resp.setSuccessfulLogins(successLogins);
        resp.setFailedLogins(failedLogins);
        resp.setSuspiciousEvents(suspiciousEvents);

        // 3. Active Security Alerts
        long activeAlerts = alertRepository.countByUserAndStatus(user, "ACTIVE");
        resp.setActiveAlerts(activeAlerts);

        // 4. Device Tracking
        long devicesCount = deviceRepository.countByUser(user);
        resp.setTotalDevices(devicesCount);

        // 5. Overall Risk Level Assessment
        String overallRisk = "LOW";
        if (suspiciousEvents >= 3 || activeAlerts >= 3 || healthScore < 40) {
            overallRisk = "CRITICAL";
        } else if (suspiciousEvents >= 1 || activeAlerts >= 1 || failedLogins >= 3 || healthScore < 70) {
            overallRisk = "HIGH";
        } else if (failedLogins >= 1 || reused > 0 || healthScore < 85) {
            overallRisk = "MEDIUM";
        }
        resp.setOverallRiskLevel(overallRisk);

        // 6. Recent Security Events
        List<LoginEventResponse> recentResponses = userEvents.stream()
            .limit(10)
            .map(LoginEventResponse::fromEntity)
            .collect(Collectors.toList());
        resp.setRecentEvents(recentResponses);

        return resp;
    }

    private int scorePassword(String p) {
        if (p == null) return 0;
        int s = 0;
        if (p.length() >= 8) s++;
        if (p.length() >= 14) s++;
        if (p.matches(".*[A-Z].*")) s++;
        if (p.matches(".*[a-z].*")) s++;
        if (p.matches(".*[0-9].*")) s++;
        if (p.matches(".*[^A-Za-z0-9].*")) s++;
        return Math.min(5, s);
    }
}
