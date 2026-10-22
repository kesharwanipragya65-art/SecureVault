package com.securevault.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final String secret = "SecureVaultSecretKeyForJWTAuthentication123456789";

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .claim("type", "ACCESS")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
                .signWith(key())
                .compact();
    }

    public String generateMfaChallenge(String email) {
        return Jwts.builder()
                .subject(email)
                .claim("type", "MFA_CHALLENGE")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 300000)) // 5 minutes
                .signWith(key())
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isMfaChallenge(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return "MFA_CHALLENGE".equals(claims.get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }
}
