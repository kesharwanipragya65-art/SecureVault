package com.securevault.backend.dto;

import java.util.List;

public class SecurityAnalyticsResponse {
    private long totalCredentials;
    private long strongPasswords;
    private long mediumPasswords;
    private long weakPasswords;
    private long reusedPasswords;
    private int passwordHealthScore;
    private long successfulLogins;
    private long failedLogins;
    private long suspiciousEvents;
    private long activeAlerts;
    private long totalDevices;
    private String overallRiskLevel;
    private List<LoginEventResponse> recentEvents;

    public SecurityAnalyticsResponse() {}

    public long getTotalCredentials() { return totalCredentials; }
    public void setTotalCredentials(long totalCredentials) { this.totalCredentials = totalCredentials; }

    public long getStrongPasswords() { return strongPasswords; }
    public void setStrongPasswords(long strongPasswords) { this.strongPasswords = strongPasswords; }

    public long getMediumPasswords() { return mediumPasswords; }
    public void setMediumPasswords(long mediumPasswords) { this.mediumPasswords = mediumPasswords; }

    public long getWeakPasswords() { return weakPasswords; }
    public void setWeakPasswords(long weakPasswords) { this.weakPasswords = weakPasswords; }

    public long getReusedPasswords() { return reusedPasswords; }
    public void setReusedPasswords(long reusedPasswords) { this.reusedPasswords = reusedPasswords; }

    public int getPasswordHealthScore() { return passwordHealthScore; }
    public void setPasswordHealthScore(int passwordHealthScore) { this.passwordHealthScore = passwordHealthScore; }

    public long getSuccessfulLogins() { return successfulLogins; }
    public void setSuccessfulLogins(long successfulLogins) { this.successfulLogins = successfulLogins; }

    public long getFailedLogins() { return failedLogins; }
    public void setFailedLogins(long failedLogins) { this.failedLogins = failedLogins; }

    public long getSuspiciousEvents() { return suspiciousEvents; }
    public void setSuspiciousEvents(long suspiciousEvents) { this.suspiciousEvents = suspiciousEvents; }

    public long getActiveAlerts() { return activeAlerts; }
    public void setActiveAlerts(long activeAlerts) { this.activeAlerts = activeAlerts; }

    public long getTotalDevices() { return totalDevices; }
    public void setTotalDevices(long totalDevices) { this.totalDevices = totalDevices; }

    public String getOverallRiskLevel() { return overallRiskLevel; }
    public void setOverallRiskLevel(String overallRiskLevel) { this.overallRiskLevel = overallRiskLevel; }

    public List<LoginEventResponse> getRecentEvents() { return recentEvents; }
    public void setRecentEvents(List<LoginEventResponse> recentEvents) { this.recentEvents = recentEvents; }
}
