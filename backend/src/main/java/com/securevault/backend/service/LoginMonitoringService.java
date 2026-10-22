package com.securevault.backend.service;

import com.securevault.backend.dto.LoginEventResponse;
import com.securevault.backend.entity.LoginEvent;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.LoginEventRepository;
import com.securevault.backend.util.RequestMetadataUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoginMonitoringService {

    private final LoginEventRepository loginEventRepository;

    public LoginMonitoringService(LoginEventRepository loginEventRepository) {
        this.loginEventRepository = loginEventRepository;
    }

    @Transactional
    public LoginEvent recordLoginAttempt(String email, User user, boolean success, String reason, HttpServletRequest request) {
        String ip = RequestMetadataUtil.extractClientIp(request);
        String device = RequestMetadataUtil.extractDeviceInfo(request);
        String browser = RequestMetadataUtil.extractBrowser(request);

        String eventType = success ? "LOGIN_SUCCESS" : "LOGIN_FAILED";
        String status = success ? "SUCCESS" : "FAILED";
        String riskLevel = "LOW";

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime window = now.minusMinutes(15);

        if (!success) {
            long failedCount = loginEventRepository.countRecentFailedAttempts(email, window);
            if (failedCount >= 4) {
                riskLevel = "CRITICAL";
                eventType = "SUSPICIOUS_LOGIN_BRUTE_FORCE";
            } else if (failedCount >= 2) {
                riskLevel = "HIGH";
                eventType = "SUSPICIOUS_LOGIN_ATTEMPT";
            } else {
                riskLevel = "MEDIUM";
            }
        } else {
            // Successful login check for new IP / device anomaly
            if (user != null) {
                List<LoginEvent> prevSuccess = loginEventRepository.findByUserOrderByTimestampDesc(user);
                boolean knownIp = prevSuccess.stream().anyMatch(e -> "SUCCESS".equals(e.getStatus()) && ip.equals(e.getIpAddress()));
                if (!prevSuccess.isEmpty() && !knownIp) {
                    riskLevel = "MEDIUM"; // New IP address detected
                }
            }
        }

        LoginEvent event = new LoginEvent(
            user,
            email,
            eventType,
            status,
            ip,
            device,
            browser,
            riskLevel,
            reason,
            now
        );

        return loginEventRepository.save(event);
    }

    public List<LoginEventResponse> getUserLoginHistory(User user) {
        return loginEventRepository.findTop50ByUserOrderByTimestampDesc(user)
            .stream()
            .map(LoginEventResponse::fromEntity)
            .collect(Collectors.toList());
    }

    public List<LoginEventResponse> getAllSecurityEvents() {
        return loginEventRepository.findAllByOrderByTimestampDesc()
            .stream()
            .map(LoginEventResponse::fromEntity)
            .collect(Collectors.toList());
    }
}
