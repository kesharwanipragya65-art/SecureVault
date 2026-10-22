package com.securevault.backend.dto;

public record TeamResponse(
    Long id,
    String name,
    Long ownerId,
    String ownerName,
    String ownerEmail,
    String userRole,
    int memberCount
) {}
