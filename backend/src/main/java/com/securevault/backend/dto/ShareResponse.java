package com.securevault.backend.dto;
import java.time.LocalDateTime;
public record ShareResponse(Long id,Long credentialId,String title,String username,String password,String permission,String status,LocalDateTime expiresAt,String sharedUserEmail) {}
