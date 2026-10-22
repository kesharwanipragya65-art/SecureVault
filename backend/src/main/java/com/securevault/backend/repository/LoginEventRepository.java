package com.securevault.backend.repository;

import com.securevault.backend.entity.LoginEvent;
import com.securevault.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LoginEventRepository extends JpaRepository<LoginEvent, Long> {

    List<LoginEvent> findByUserOrderByTimestampDesc(User user);

    List<LoginEvent> findTop50ByUserOrderByTimestampDesc(User user);

    List<LoginEvent> findByEmailAttemptedOrderByTimestampDesc(String email);

    long countByUserAndStatus(User user, String status);

    long countByUserAndRiskLevel(User user, String riskLevel);

    long countByUserAndTimestampAfter(User user, LocalDateTime since);

    long countByUserAndStatusAndTimestampAfter(User user, String status, LocalDateTime since);

    @Query("SELECT COUNT(e) FROM LoginEvent e WHERE e.emailAttempted = :email AND e.status = 'FAILED' AND e.timestamp > :since")
    long countRecentFailedAttempts(@Param("email") String email, @Param("since") LocalDateTime since);

    List<LoginEvent> findAllByOrderByTimestampDesc();
}
