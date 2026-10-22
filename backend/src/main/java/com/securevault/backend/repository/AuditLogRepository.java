package com.securevault.backend.repository;

import com.securevault.backend.entity.AuditLog;
import com.securevault.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserOrderByTimestampDesc(User user);
    List<AuditLog> findTop100ByUserOrderByTimestampDesc(User user);
    List<AuditLog> findByUserAndTimestampAfterOrderByTimestampDesc(User user, LocalDateTime since);
    List<AuditLog> findAllByOrderByTimestampDesc();
}
