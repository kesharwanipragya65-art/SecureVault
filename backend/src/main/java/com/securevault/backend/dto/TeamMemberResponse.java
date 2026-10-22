package com.securevault.backend.dto;

public record TeamMemberResponse(
    Long id,
    Long userId,
    String name,
    String email,
    String role
) {}
