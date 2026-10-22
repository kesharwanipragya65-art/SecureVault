package com.securevault.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_events")
public class LoginEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String emailAttempted;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private String status;

    private String ipAddress;

    private String deviceInfo;

    private String browser;

    private String riskLevel;

    private String failureReason;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public LoginEvent() {}

    public LoginEvent(User user, String emailAttempted, String eventType, String status,
                      String ipAddress, String deviceInfo, String browser,
                      String riskLevel, String failureReason, LocalDateTime timestamp) {
        this.user = user;
        this.emailAttempted = emailAttempted;
        this.eventType = eventType;
        this.status = status;
        this.ipAddress = ipAddress;
        this.deviceInfo = deviceInfo;
        this.browser = browser;
        this.riskLevel = riskLevel;
        this.failureReason = failureReason;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEmailAttempted() { return emailAttempted; }
    public void setEmailAttempted(String emailAttempted) { this.emailAttempted = emailAttempted; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getBrowser() { return browser; }
    public void setBrowser(String browser) { this.browser = browser; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
