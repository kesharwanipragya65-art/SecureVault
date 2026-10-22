package com.securevault.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String action; // e.g. LOGIN, LOGOUT, VAULT_ACCESS, CREDENTIAL_CREATE, CREDENTIAL_UPDATE, CREDENTIAL_DELETE, SHARE_CREATE, SHARE_REVOKE

    @Column(nullable = false, length = 1000)
    private String details;

    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public AuditLog() {}

    public AuditLog(User user, String action, String details, String ipAddress, LocalDateTime timestamp) {
        this.user = user;
        this.action = action;
        this.details = details;
        this.ipAddress = ipAddress;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
