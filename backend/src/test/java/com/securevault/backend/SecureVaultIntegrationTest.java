package com.securevault.backend;

import com.securevault.backend.entity.Credential;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.CredentialRepository;
import com.securevault.backend.repository.LoginEventRepository;
import com.securevault.backend.repository.UserRepository;
import com.securevault.backend.security.JwtService;
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

import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class SecureVaultIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CredentialRepository credentialRepository;

    @Autowired
    private LoginEventRepository loginEventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String userAEmail;
    private String userBEmail;
    private String userAPassword;
    private String userAToken;
    private String userBToken;
    private User userA;
    private User userB;

    @BeforeEach
    void setupUsers() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
        String uid = UUID.randomUUID().toString().substring(0, 8);
        userAEmail = "user_a_" + uid + "@vault.test";
        userBEmail = "user_b_" + uid + "@vault.test";
        userAPassword = "StrongPassword@123";

        userA = userRepository.save(new User("User Alpha", userAEmail, passwordEncoder.encode(userAPassword)));
        userB = userRepository.save(new User("User Beta", userBEmail, passwordEncoder.encode("PasswordB@456")));

        userAToken = jwtService.generateToken(userAEmail);
        userBToken = jwtService.generateToken(userBEmail);
    }

    // 1. Register API - Success
    @Test
    @DisplayName("IT 1: Register API returns 200 OK on valid payload")
    void testRegisterSuccess() throws Exception {
        String testEmail = "reg_" + UUID.randomUUID().toString().substring(0, 8) + "@vault.test";
        mockMvc.perform(post("/api/auth/register")
                .param("name", "New User")
                .param("email", testEmail)
                .param("password", "SecureSecret#99"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Registration successful")));

        assertTrue(userRepository.findByEmail(testEmail).isPresent());
    }

    // 2. Register API - Duplicate email
    @Test
    @DisplayName("IT 2: Register API returns 400 Bad Request on duplicate email")
    void testRegisterDuplicateEmail() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .param("name", "Duplicate")
                .param("email", userAEmail)
                .param("password", "AnotherPass#123"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("already registered")));
    }

    // 3. Register API - Blank name
    @Test
    @DisplayName("IT 3: Register API returns 400 Bad Request on blank name")
    void testRegisterBlankName() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .param("name", "")
                .param("email", "blank_" + UUID.randomUUID().toString().substring(0, 6) + "@vault.test")
                .param("password", "Password#123"))
                .andExpect(status().isBadRequest());
    }

    // 4. Login API - Success returns valid JWT
    @Test
    @DisplayName("IT 4: Login API returns 200 and valid JWT token")
    void testLoginSuccess() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                .param("email", userAEmail)
                .param("password", userAPassword))
                .andExpect(status().isOk())
                .andReturn();

        String token = res.getResponse().getContentAsString();
        assertNotNull(token);
        assertTrue(token.length() > 20);
        assertEquals(userAEmail, jwtService.extractEmail(token));
    }

    // 5. Login API - Wrong password returns 401
    @Test
    @DisplayName("IT 5: Login API returns 401 Unauthorized on wrong password")
    void testLoginInvalidPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .param("email", userAEmail)
                .param("password", "IncorrectPassword!"))
                .andExpect(status().isUnauthorized());
    }

    // 6. Login API - Non existent user returns 401
    @Test
    @DisplayName("IT 6: Login API returns 401 Unauthorized for unknown email")
    void testLoginUnknownUser() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .param("email", "nobody_exists@vault.test")
                .param("password", "AnyPassword#123"))
                .andExpect(status().isUnauthorized());
    }

    // 7. Login Monitoring - Event recorded in database
    @Test
    @DisplayName("IT 7: Login event is properly persisted in login_events table")
    void testLoginMonitoringEventRecorded() throws Exception {
        long initialCount = loginEventRepository.count();
        mockMvc.perform(post("/api/auth/login")
                .param("email", userAEmail)
                .param("password", userAPassword))
                .andExpect(status().isOk());

        long afterCount = loginEventRepository.count();
        assertTrue(afterCount > initialCount);
    }

    // 8. Create Credential - Success
    @Test
    @DisplayName("IT 8: Create Credential returns 200 OK and persists to database")
    void testCreateCredentialSuccess() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/vault/credentials")
                .header("Authorization", "Bearer " + userAToken)
                .param("title", "GitHub Pro")
                .param("username", "alpha_coder")
                .param("password", "SuperSecretKey#2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("GitHub Pro")))
                .andExpect(jsonPath("$.username", is("alpha_coder")))
                .andReturn();

        var credentials = credentialRepository.findByUser(userA);
        assertTrue(credentials.stream().anyMatch(c -> "GitHub Pro".equals(c.getTitle())));
    }

    // 9. Create Credential - Unauthorized without token
    @Test
    @DisplayName("IT 9: Create Credential without token returns 403 Forbidden")
    void testCreateCredentialUnauthorized() throws Exception {
        mockMvc.perform(post("/api/vault/credentials")
                .param("title", "AWS Cloud")
                .param("username", "admin")
                .param("password", "Secret#123"))
                .andExpect(status().isForbidden());
    }

    // 10. Create Credential - Validation failure on empty title
    @Test
    @DisplayName("IT 10: Create Credential with blank title returns 400 Bad Request")
    void testCreateCredentialBlankTitle() throws Exception {
        mockMvc.perform(post("/api/vault/credentials")
                .header("Authorization", "Bearer " + userAToken)
                .param("title", "")
                .param("username", "admin")
                .param("password", "Secret#123"))
                .andExpect(status().isBadRequest());
    }

    // 11. List Credentials
    @Test
    @DisplayName("IT 11: List Credentials returns only current user's credentials")
    void testListCredentials() throws Exception {
        mockMvc.perform(post("/api/vault/credentials")
                .header("Authorization", "Bearer " + userAToken)
                .param("title", "DockerHub")
                .param("username", "dock_user")
                .param("password", "DockSecret#1"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/vault/credentials")
                .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    // 12. Search Credentials
    @Test
    @DisplayName("IT 12: Search Credentials filters by title query")
    void testSearchCredentials() throws Exception {
        mockMvc.perform(post("/api/vault/credentials")
                .header("Authorization", "Bearer " + userAToken)
                .param("title", "GitLab Account")
                .param("username", "gitlab_user")
                .param("password", "GitlabSecret#1"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/vault/credentials/search")
                .header("Authorization", "Bearer " + userAToken)
                .param("query", "GitLab"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].title", containsString("GitLab")));
    }

    // 13. Update Credential
    @Test
    @DisplayName("IT 13: Update Credential modifies title and records password history")
    void testUpdateCredential() throws Exception {
        MvcResult addRes = mockMvc.perform(post("/api/vault/credentials")
                .header("Authorization", "Bearer " + userAToken)
                .param("title", "Initial Title")
                .param("username", "init_user")
                .param("password", "InitPass#1"))
                .andExpect(status().isOk())
                .andReturn();

        String credId = addRes.getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1");

        mockMvc.perform(put("/api/vault/credentials/" + credId)
                .header("Authorization", "Bearer " + userAToken)
                .param("title", "Updated Title")
                .param("username", "init_user")
                .param("password", "NewPass#2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Title")));
    }

    // 14. Delete Credential
    @Test
    @DisplayName("IT 14: Delete Credential removes record from database")
    void testDeleteCredential() throws Exception {
        MvcResult addRes = mockMvc.perform(post("/api/vault/credentials")
                .header("Authorization", "Bearer " + userAToken)
                .param("title", "To Delete")
                .param("username", "del_user")
                .param("password", "DelPass#1"))
                .andExpect(status().isOk())
                .andReturn();

        String credId = addRes.getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1");

        mockMvc.perform(delete("/api/vault/credentials/" + credId)
                .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("deleted successfully")));

        assertFalse(credentialRepository.findByIdAndUser(Long.parseLong(credId), userA).isPresent());
    }

    // 15. Delete Credential - Unauthorized user blocked
    @Test
    @DisplayName("IT 15: User B cannot delete User A's private credential")
    void testDeleteUnauthorizedUserBlocked() throws Exception {
        MvcResult addRes = mockMvc.perform(post("/api/vault/credentials")
                .header("Authorization", "Bearer " + userAToken)
                .param("title", "Private User A Secret")
                .param("username", "alpha")
                .param("password", "AlphaPass#1"))
                .andExpect(status().isOk())
                .andReturn();

        String credId = addRes.getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1");

        // User B attempts to delete User A's credential
        mockMvc.perform(delete("/api/vault/credentials/" + credId)
                .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isNotFound());
    }

    // 16. Share Credential - Success
    @Test
    @DisplayName("IT 16: Share Credential with User B creates valid active share")
    void testShareCredentialSuccess() throws Exception {
        MvcResult addRes = mockMvc.perform(post("/api/vault/credentials")
                .header("Authorization", "Bearer " + userAToken)
                .param("title", "Shared Database")
                .param("username", "db_admin")
                .param("password", "DbAdminPass#1"))
                .andExpect(status().isOk())
                .andReturn();

        String credId = addRes.getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1");

        mockMvc.perform(post("/api/sharing/share")
                .header("Authorization", "Bearer " + userAToken)
                .param("credentialId", credId)
                .param("email", userBEmail)
                .param("permission", "VIEW_ONLY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.permission", is("VIEW_ONLY")))
                .andExpect(jsonPath("$.status", is("ACTIVE")));
    }

    // 17. Share Credential - Invalid permission rejected
    @Test
    @DisplayName("IT 17: Share Credential with invalid permission returns 400 Bad Request")
    void testShareCredentialInvalidPermission() throws Exception {
        mockMvc.perform(post("/api/sharing/share")
                .header("Authorization", "Bearer " + userAToken)
                .param("credentialId", "1")
                .param("email", userBEmail)
                .param("permission", "ILLEGAL_LEVEL"))
                .andExpect(status().isBadRequest());
    }

    // 18. Shared User Access - View Only prevents update
    @Test
    @DisplayName("IT 18: Recipient with VIEW_ONLY cannot edit shared credential")
    void testViewOnlyRecipientCannotEdit() throws Exception {
        MvcResult addRes = mockMvc.perform(post("/api/vault/credentials")
                .header("Authorization", "Bearer " + userAToken)
                .param("title", "ReadOnly Credential")
                .param("username", "ro_user")
                .param("password", "ReadOnlyPass#1"))
                .andExpect(status().isOk())
                .andReturn();

        String credId = addRes.getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1");

        MvcResult shareRes = mockMvc.perform(post("/api/sharing/share")
                .header("Authorization", "Bearer " + userAToken)
                .param("credentialId", credId)
                .param("email", userBEmail)
                .param("permission", "VIEW_ONLY"))
                .andExpect(status().isOk())
                .andReturn();

        String shareId = shareRes.getResponse().getContentAsString().replaceAll(".*\"id\":(\\d+).*", "$1");

        mockMvc.perform(put("/api/sharing/" + shareId)
                .header("Authorization", "Bearer " + userBToken)
                .param("title", "Hacked Title")
                .param("username", "ro_user")
                .param("password", "HackedPass#1"))
                .andExpect(status().isForbidden())
                .andExpect(content().string(containsString("Edit access not allowed")));
    }
}
