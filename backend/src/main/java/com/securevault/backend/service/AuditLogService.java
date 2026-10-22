package com.securevault.backend.service;

import com.securevault.backend.entity.AuditLog;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog log(User user, String action, String details, String ipAddress) {
        AuditLog entry = new AuditLog(user, action, details, ipAddress, LocalDateTime.now());
        return auditLogRepository.save(entry);
    }

    public List<AuditLog> getUserLogs(User user) {
        return auditLogRepository.findTop100ByUserOrderByTimestampDesc(user);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
