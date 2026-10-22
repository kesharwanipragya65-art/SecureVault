package com.securevault.backend.service;

import com.securevault.backend.entity.SecurityAlert;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.SecurityAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SecurityAlertService {

    private final SecurityAlertRepository alertRepository;

    public SecurityAlertService(SecurityAlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @Transactional
    public SecurityAlert createAlert(User user, String title, String description, String severity) {
        SecurityAlert alert = new SecurityAlert(
            user,
            title,
            description,
            severity,
            "ACTIVE",
            LocalDateTime.now()
        );
        return alertRepository.save(alert);
    }

    public List<SecurityAlert> getUserAlerts(User user) {
        return alertRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public SecurityAlert resolveAlert(Long alertId, User user) {
        SecurityAlert alert = alertRepository.findById(alertId)
            .orElseThrow(() -> new RuntimeException("Alert not found"));
        if (!alert.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized to resolve this alert");
        }
        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());
        return alertRepository.save(alert);
    }

    @Transactional
    public SecurityAlert dismissAlert(Long alertId, User user) {
        SecurityAlert alert = alertRepository.findById(alertId)
            .orElseThrow(() -> new RuntimeException("Alert not found"));
        if (!alert.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized to dismiss this alert");
        }
        alert.setStatus("DISMISSED");
        return alertRepository.save(alert);
    }
}
