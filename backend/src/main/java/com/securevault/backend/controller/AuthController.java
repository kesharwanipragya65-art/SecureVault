package com.securevault.backend.controller;

import com.securevault.backend.entity.User;
import com.securevault.backend.repository.UserRepository;
import com.securevault.backend.security.JwtService;
import com.securevault.backend.security.MfaService;
import com.securevault.backend.security.TokenBlacklistService;
import com.securevault.backend.service.*;
import com.securevault.backend.util.RequestMetadataUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService auth;
    private final JwtService jwt;
    private final UserRepository users;
    private final LoginMonitoringService loginMonitoring;
    private final UserDeviceService deviceService;
    private final AuditLogService auditLogService;
    private final SecurityAlertService alertService;
    private final NotificationService notificationService;
    private final MfaService mfaService;
    private final TokenBlacklistService blacklistService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService auth,
                          JwtService jwt,
                          UserRepository users,
                          LoginMonitoringService loginMonitoring,
                          UserDeviceService deviceService,
                          AuditLogService auditLogService,
                          SecurityAlertService alertService,
                          NotificationService notificationService,
                          MfaService mfaService,
                          TokenBlacklistService blacklistService,
                          PasswordEncoder passwordEncoder) {
        this.auth = auth;
        this.jwt = jwt;
        this.users = users;
        this.loginMonitoring = loginMonitoring;
        this.deviceService = deviceService;
        this.auditLogService = auditLogService;
        this.alertService = alertService;
        this.notificationService = notificationService;
        this.mfaService = mfaService;
        this.blacklistService = blacklistService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestParam String name,
                                           @RequestParam String email,
                                           @RequestParam String password,
                                           @RequestParam(required = false, defaultValue = "ROLE_USER") String role,
                                           HttpServletRequest request) {
        try {
            User user = auth.register(name, email, password);
            if (role != null && !role.isBlank()) {
                user.setRole(role.trim().toUpperCase());
                users.save(user);
            }
            String ip = RequestMetadataUtil.extractClientIp(request);
            auditLogService.log(user, "USER_REGISTER", "New user account created", ip);
            notificationService.sendNotification(user, "Welcome to SecureVault", "Your vault has been initialized securely.", "SECURITY_ALERT");
            return ResponseEntity.ok("Registration successful");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email,
                                   @RequestParam String password,
                                   HttpServletRequest request) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        Optional<User> userOpt = users.findByEmail(cleanEmail);
        String ip = RequestMetadataUtil.extractClientIp(request);

        try {
            boolean valid = auth.login(cleanEmail, password);
            if (!valid) {
                User user = userOpt.orElse(null);
                var event = loginMonitoring.recordLoginAttempt(cleanEmail, user, false, "Incorrect password", request);
                auditLogService.log(user, "LOGIN_FAILED", "Invalid password attempt from " + ip, ip);

                if (user != null && ("HIGH".equals(event.getRiskLevel()) || "CRITICAL".equals(event.getRiskLevel()))) {
                    alertService.createAlert(user, "Suspicious Login Activity", "Multiple failed login attempts detected from IP: " + ip, event.getRiskLevel());
                    notificationService.sendNotification(user, "Security Alert", "Multiple failed login attempts were recorded on your account.", "LOGIN_ALERT");
                }
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            User user = userOpt.get();

            // Check if MFA is required
            if (user.isMfaEnabled()) {
                String challengeToken = jwt.generateMfaChallenge(cleanEmail);
                auditLogService.log(user, "MFA_CHALLENGE", "MFA code verification requested", ip);
                return ResponseEntity.ok(Map.of(
                    "status", "MFA_REQUIRED",
                    "tempToken", challengeToken,
                    "email", cleanEmail
                ));
            }

            loginMonitoring.recordLoginAttempt(cleanEmail, user, true, null, request);
            deviceService.trackDevice(user, request);
            auditLogService.log(user, "LOGIN_SUCCESS", "Authenticated session from " + ip, ip);

            return ResponseEntity.ok(jwt.generateToken(cleanEmail));
        } catch (RuntimeException e) {
            User user = userOpt.orElse(null);
            loginMonitoring.recordLoginAttempt(cleanEmail, user, false, e.getMessage(), request);
            auditLogService.log(user, "LOGIN_FAILED", "Login failure: " + e.getMessage() + " from " + ip, ip);
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<?> verifyMfa(@RequestParam String tempToken,
                                       @RequestParam String code,
                                       HttpServletRequest request) {
        if (!jwt.isMfaChallenge(tempToken)) {
            return ResponseEntity.status(401).body("Invalid or expired MFA session token");
        }

        String email = jwt.extractEmail(tempToken);
        User user = users.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        String ip = RequestMetadataUtil.extractClientIp(request);

        boolean verified = mfaService.verifyCode(user.getMfaSecret(), code);
        if (!verified) {
            loginMonitoring.recordLoginAttempt(email, user, false, "Invalid MFA Code", request);
            auditLogService.log(user, "MFA_FAILED", "Failed MFA verification attempt from " + ip, ip);
            return ResponseEntity.status(401).body("Invalid MFA verification code");
        }

        loginMonitoring.recordLoginAttempt(email, user, true, "MFA Verified", request);
        deviceService.trackDevice(user, request);
        auditLogService.log(user, "MFA_SUCCESS", "MFA passed from " + ip, ip);

        return ResponseEntity.ok(jwt.generateToken(email));
    }

    @PostMapping("/mfa/setup")
    public ResponseEntity<?> setupMfa(Authentication authentication) {
        User user = users.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String secret = mfaService.generateSecret();
        user.setMfaSecret(secret);
        users.save(user);

        String otpauth = "otpauth://totp/SecureVault:" + user.getEmail() + "?secret=" + secret + "&issuer=SecureVault";
        String currentCode = mfaService.getCurrentCode(secret);
        String qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + java.net.URLEncoder.encode(otpauth, java.nio.charset.StandardCharsets.UTF_8);

        notificationService.sendNotification(user, "Two-Factor Authentication Setup",
                "Your 2FA setup was initialized. Your current 6-digit verification code is: " + currentCode + " (or scan the QR code in Settings)", "SECURITY_ALERT");

        return ResponseEntity.ok(Map.of(
            "secret", secret,
            "qrText", otpauth,
            "qrCodeUrl", qrCodeUrl,
            "sampleCode", currentCode,
            "backupCode", "123456"
        ));
    }

    @PostMapping("/mfa/enable")
    public ResponseEntity<?> enableMfa(@RequestParam String code, Authentication authentication, HttpServletRequest request) {
        User user = users.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (mfaService.verifyCode(user.getMfaSecret(), code)) {
            user.setMfaEnabled(true);
            users.save(user);
            auditLogService.log(user, "MFA_ENABLED", "Two-Factor Authentication enabled", RequestMetadataUtil.extractClientIp(request));
            notificationService.sendNotification(user, "MFA Enabled", "Two-factor authentication has been activated on your account.", "SECURITY_ALERT");
            return ResponseEntity.ok("MFA successfully enabled");
        } else {
            return ResponseEntity.badRequest().body("Invalid verification code");
        }
    }

    @PostMapping("/mfa/disable")
    public ResponseEntity<?> disableMfa(@RequestParam String password, Authentication authentication, HttpServletRequest request) {
        User user = users.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect password");
        }

        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        users.save(user);
        auditLogService.log(user, "MFA_DISABLED", "Two-Factor Authentication disabled", RequestMetadataUtil.extractClientIp(request));
        return ResponseEntity.ok("MFA successfully disabled");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email, HttpServletRequest request) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        Optional<User> userOpt = users.findByEmail(cleanEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
            users.save(user);

            String ip = RequestMetadataUtil.extractClientIp(request);
            auditLogService.log(user, "PASSWORD_RESET_REQUESTED", "Recovery token generated", ip);
            notificationService.sendNotification(user, "Password Reset Request", "A reset token has been issued: " + token, "SECURITY_ALERT");
            return ResponseEntity.ok("Recovery token generated: " + token);
        }
        return ResponseEntity.ok("If that email exists in SecureVault, reset instructions have been generated.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token,
                                                @RequestParam String newPassword,
                                                HttpServletRequest request) {
        if (newPassword == null || newPassword.isBlank() || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("New password must be at least 6 characters");
        }

        User user = users.findAll().stream()
                .filter(u -> token.equals(u.getResetToken()))
                .findFirst()
                .orElse(null);

        if (user == null || user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Invalid or expired password reset token");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        users.save(user);

        String ip = RequestMetadataUtil.extractClientIp(request);
        auditLogService.log(user, "PASSWORD_RESET_SUCCESS", "Password updated via recovery token", ip);
        notificationService.sendNotification(user, "Password Changed", "Your master password was reset successfully.", "SECURITY_ALERT");
        return ResponseEntity.ok("Password reset successfully. You may now login.");
    }

    @PostMapping("/oauth2/callback")
    public ResponseEntity<?> oauthLogin(@RequestParam String provider,
                                        @RequestParam String email,
                                        @RequestParam(defaultValue = "OAuth User") String name,
                                        HttpServletRequest request) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        if (cleanEmail.isBlank()) {
            return ResponseEntity.badRequest().body("OAuth email is required");
        }

        User user = users.findByEmail(cleanEmail).orElseGet(() -> {
            User newUser = new User(name, cleanEmail, passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setOauthProvider(provider);
            return users.save(newUser);
        });

        String ip = RequestMetadataUtil.extractClientIp(request);
        deviceService.trackDevice(user, request);
        auditLogService.log(user, "OAUTH_LOGIN", "Authenticated via " + provider + " from " + ip, ip);

        return ResponseEntity.ok(jwt.generateToken(cleanEmail));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, Authentication authentication) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            blacklistService.blacklistToken(token);
        }
        if (authentication != null) {
            User user = users.findByEmail(authentication.getName()).orElse(null);
            if (user != null) {
                auditLogService.log(user, "LOGOUT", "Session terminated", RequestMetadataUtil.extractClientIp(request));
            }
        }
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthenticated");
        User user = users.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "mfaEnabled", user.isMfaEnabled()
        ));
    }
}
