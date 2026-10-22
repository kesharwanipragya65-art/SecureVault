package com.securevault.backend.dto;

import com.securevault.backend.entity.LoginEvent;
import java.time.LocalDateTime;

public class LoginEventResponse {
    private Long id;
    private String email;
    private String eventType;
    private String status;
    private String ipAddress;
    private String deviceInfo;
    private String browser;
    private String riskLevel;
    private String failureReason;
    private LocalDateTime timestamp;

    public LoginEventResponse() {}

    public static LoginEventResponse fromEntity(LoginEvent event) {
        LoginEventResponse r = new LoginEventResponse();
        r.id = event.getId();
        r.email = event.getEmailAttempted();
        r.eventType = event.getEventType();
        r.status = event.getStatus();
        r.ipAddress = event.getIpAddress();
        r.deviceInfo = event.getDeviceInfo();
        r.browser = event.getBrowser();
        r.riskLevel = event.getRiskLevel();
        r.failureReason = event.getFailureReason();
        r.timestamp = event.getTimestamp();
        return r;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getEventType() { return eventType; }
    public String getStatus() { return status; }
    public String getIpAddress() { return ipAddress; }
    public String getDeviceInfo() { return deviceInfo; }
    public String getBrowser() { return browser; }
    public String getRiskLevel() { return riskLevel; }
    public String getFailureReason() { return failureReason; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
