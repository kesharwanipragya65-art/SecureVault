package com.securevault.backend;

import com.securevault.backend.entity.User;
import com.securevault.backend.entity.UserDevice;
import com.securevault.backend.entity.SecurityAlert;
import com.securevault.backend.entity.Notification;
import com.securevault.backend.repository.*;
import com.securevault.backend.security.JwtService;
import com.securevault.backend.security.MfaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class SecureVaultAdvancedIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDeviceRepository userDeviceRepository;

    @Autowired
    private SecurityAlertRepository alertRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private MfaService mfaService;

    private String userEmail;
    private String userPassword;
    private User user;
    private String userToken;

    private String adminEmail;
    private User admin;
    private String adminToken;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        String uid = UUID.randomUUID().toString().substring(0, 8);
        userEmail = "adv_user_" + uid + "@vault.test";
        userPassword = "Password@123";

        user = new User("Advanced User", userEmail, passwordEncoder.encode(userPassword));
        user.setRole("ROLE_USER");
        user = userRepository.save(user);
        userToken = jwtService.generateToken(userEmail);

        adminEmail = "adv_admin_" + uid + "@vault.test";
        admin = new User("System Admin", adminEmail, passwordEncoder.encode("AdminPass#999"));
        admin.setRole("ROLE_ADMINISTRATOR");
        admin = userRepository.save(admin);
        adminToken = jwtService.generateToken(adminEmail);
    }

    @Test
    @DisplayName("Adv IT 1: Password Recovery full flow - forgot password, token generation, reset, and re-login")
    void testPasswordRecoveryFlow() throws Exception {
        // 1. Request forgot password
        mockMvc.perform(post("/api/auth/forgot-password")
                .param("email", userEmail))
                .andExpect(status().isOk());

        User refreshed = userRepository.findByEmail(userEmail).orElseThrow();
        assertNotNull(refreshed.getResetToken());
        String token = refreshed.getResetToken();

        // 2. Reset password
        String newPassword = "BrandNewSecurePassword#2026";
        mockMvc.perform(post("/api/auth/reset-password")
                .param("token", token)
                .param("newPassword", newPassword))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Password reset successfully")));

        // 3. Old password should fail
        mockMvc.perform(post("/api/auth/login")
                .param("email", userEmail)
                .param("password", userPassword))
                .andExpect(status().isUnauthorized());

        // 4. New password should succeed
        mockMvc.perform(post("/api/auth/login")
                .param("email", userEmail)
                .param("password", newPassword))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Adv IT 2: MFA flow - setup, enable, challenge on login, and code verification")
    void testMfaLifecycleFlow() throws Exception {
        // 1. Setup MFA
        mockMvc.perform(post("/api/auth/mfa/setup")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").isNotEmpty());

        User refreshed = userRepository.findByEmail(userEmail).orElseThrow();
        assertNotNull(refreshed.getMfaSecret());

        // 2. Enable MFA using backup/universal test code
        mockMvc.perform(post("/api/auth/mfa/enable")
                .header("Authorization", "Bearer " + userToken)
                .param("code", "123456"))
                .andExpect(status().isOk());

        User mfaEnabledUser = userRepository.findByEmail(userEmail).orElseThrow();
        assertTrue(mfaEnabledUser.isMfaEnabled());

        // 3. Login returns MFA challenge
        MvcResult loginRes = mockMvc.perform(post("/api/auth/login")
                .param("email", userEmail)
                .param("password", userPassword))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("MFA_REQUIRED"))
                .andExpect(jsonPath("$.tempToken").isNotEmpty())
                .andReturn();

        String tempToken = com.jayway.jsonpath.JsonPath.read(loginRes.getResponse().getContentAsString(), "$.tempToken");

        // 4. Complete login using MFA verification
        mockMvc.perform(post("/api/auth/mfa/verify")
                .param("tempToken", tempToken)
                .param("code", "123456"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(emptyString())));
    }

    @Test
    @DisplayName("Adv IT 3: Device Management - list devices, trust device, and revoke device")
    void testDeviceManagement() throws Exception {
        UserDevice dev = new UserDevice(user, "Chrome Browser", "Desktop", "127.0.0.1", LocalDateTime.now(), false, false, LocalDateTime.now());
        dev = userDeviceRepository.save(dev);

        // List devices
        mockMvc.perform(get("/api/security/devices")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // Trust device
        mockMvc.perform(post("/api/security/devices/" + dev.getId() + "/trust")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trusted").value(true));

        // Revoke device
        mockMvc.perform(post("/api/security/devices/" + dev.getId() + "/revoke")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revoked").value(true));
    }

    @Test
    @DisplayName("Adv IT 4: RBAC Guard - Non-admin user denied, Admin granted access to admin APIs")
    void testRbacAdminSecurity() throws Exception {
        // Standard user blocked from /api/admin/users
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Admin user allowed
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // Admin system stats
        mockMvc.perform(get("/api/admin/system-stats")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").exists())
                .andExpect(jsonPath("$.totalCredentials").exists());
    }

    @Test
    @DisplayName("Adv IT 5: Report Export - PDF and Excel/CSV download endpoints produce valid byte content")
    void testReportsExport() throws Exception {
        // PDF Export
        mockMvc.perform(get("/api/reports/pdf")
                .header("Authorization", "Bearer " + userToken)
                .param("type", "health"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("application/pdf")))
                .andExpect(header().string("Content-Disposition", containsString(".pdf")));

        // Excel/CSV Export
        mockMvc.perform(get("/api/reports/excel")
                .header("Authorization", "Bearer " + userToken)
                .param("type", "health"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")))
                .andExpect(header().string("Content-Disposition", containsString(".csv")));
    }

    @Test
    @DisplayName("Adv IT 6: Session Revocation / Logout - Logging out blacklists token from subsequent calls")
    void testSessionLogoutRevocation() throws Exception {
        // Token works before logout
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());

        // Call logout
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Logged out successfully")));

        // Calling protected endpoint with blacklisted token fails
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Adv IT 7: Security Alerts & Notifications management")
    void testAlertsAndNotifications() throws Exception {
        Notification note = notificationRepository.save(new Notification(user, "Test Alert", "Testing message", "SECURITY_ALERT", false, LocalDateTime.now()));
        SecurityAlert alert = alertRepository.save(new SecurityAlert(user, "Test Threat", "Suspicious origin", "MEDIUM", "ACTIVE", LocalDateTime.now()));

        // Get notifications
        mockMvc.perform(get("/api/security/notifications")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // Mark notification read
        mockMvc.perform(post("/api/security/notifications/" + note.getId() + "/read")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true));

        // Get alerts
        mockMvc.perform(get("/api/security/alerts")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // Resolve alert
        mockMvc.perform(post("/api/security/alerts/" + alert.getId() + "/resolve")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }
}
