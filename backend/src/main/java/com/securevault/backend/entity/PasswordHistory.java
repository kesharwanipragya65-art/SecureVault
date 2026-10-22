package com.securevault.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_history")
public class PasswordHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "credential_id")
    private Credential credential;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String encryptedOldPassword;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User changedBy;

    public PasswordHistory() {}

    public PasswordHistory(Credential credential, String encryptedOldPassword, LocalDateTime changedAt, User changedBy) {
        this.credential = credential;
        this.encryptedOldPassword = encryptedOldPassword;
        this.changedAt = changedAt;
        this.changedBy = changedBy;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Credential getCredential() { return credential; }
    public void setCredential(Credential credential) { this.credential = credential; }

    public String getEncryptedOldPassword() { return encryptedOldPassword; }
    public void setEncryptedOldPassword(String encryptedOldPassword) { this.encryptedOldPassword = encryptedOldPassword; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }

    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }
}
