package com.securevault.backend.dto;

import java.time.LocalDateTime;

public record CredentialResponse(
    Long id,
    String title,
    String username,
    String password,
    String credentialType,
    String category,
    boolean favorite,
    String notes,
    String websiteUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public CredentialResponse(Long id, String title, String username, String password) {
        this(id, title, username, password, "WEBSITE", "General", false, null, null, null, null);
    }
}
