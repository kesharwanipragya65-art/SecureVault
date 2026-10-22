package com.securevault.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_devices")
public class UserDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String deviceName;

    private String deviceType; // Desktop, Mobile, Tablet, Browser

    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime lastActive;

    private boolean trusted;

    private boolean revoked;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public UserDevice() {}

    public UserDevice(User user, String deviceName, String deviceType, String ipAddress,
                      LocalDateTime lastActive, boolean trusted, boolean revoked, LocalDateTime createdAt) {
        this.user = user;
        this.deviceName = deviceName;
        this.deviceType = deviceType;
        this.ipAddress = ipAddress;
        this.lastActive = lastActive;
        this.trusted = trusted;
        this.revoked = revoked;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public String getDeviceType() { return deviceType; }
    public void setDeviceType(String deviceType) { this.deviceType = deviceType; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getLastActive() { return lastActive; }
    public void setLastActive(LocalDateTime lastActive) { this.lastActive = lastActive; }

    public boolean isTrusted() { return trusted; }
    public void setTrusted(boolean trusted) { this.trusted = trusted; }

    public boolean isRevoked() { return revoked; }
    public void setRevoked(boolean revoked) { this.revoked = revoked; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
