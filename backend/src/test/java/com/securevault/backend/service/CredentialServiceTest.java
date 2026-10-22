package com.securevault.backend.service;

import com.securevault.backend.dto.CredentialResponse;
import com.securevault.backend.entity.Credential;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.CredentialRepository;
import com.securevault.backend.repository.TeamMemberRepository;
import com.securevault.backend.security.EncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CredentialServiceTest {

    @Mock
    private CredentialRepository credentialRepository;

    @Mock
    private EncryptionService encryptionService;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private PasswordHistoryService passwordHistoryService;

    @InjectMocks
    private CredentialService credentialService;

    private User owner;
    private Credential sampleCredential;

    @BeforeEach
    void setUp() {
        owner = new User("Alice", "alice@example.com", "hash");
        owner.setId(10L);

        sampleCredential = new Credential("GitHub", "alice_git", "ENC:encrypted_pass", owner);
        sampleCredential.setId(100L);
    }

    @Test
    @DisplayName("add: Success when title, username, password valid")
    void add_success() {
        when(encryptionService.encrypt("plain123")).thenReturn("ENC:encrypted_pass");
        when(credentialRepository.save(any(Credential.class))).thenReturn(sampleCredential);
        when(encryptionService.decrypt("ENC:encrypted_pass")).thenReturn("plain123");

        CredentialResponse resp = credentialService.add("GitHub", "alice_git", "plain123", owner);

        assertNotNull(resp);
        assertEquals("GitHub", resp.title());
        assertEquals("alice_git", resp.username());
        assertEquals("plain123", resp.password());
        verify(credentialRepository).save(any(Credential.class));
    }

    @Test
    @DisplayName("add: Throws when required fields are missing")
    void add_validationFailures() {
        assertThrows(RuntimeException.class, () -> credentialService.add("", "user", "pass", owner));
        assertThrows(RuntimeException.class, () -> credentialService.add("Title", "", "pass", owner));
        assertThrows(RuntimeException.class, () -> credentialService.add("Title", "user", "", owner));
    }

    @Test
    @DisplayName("list: Returns decrypted credentials for owner")
    void list_returnsDecrypted() {
        when(credentialRepository.findByUser(owner)).thenReturn(List.of(sampleCredential));
        when(encryptionService.decrypt("ENC:encrypted_pass")).thenReturn("plain123");

        List<CredentialResponse> list = credentialService.list(owner);

        assertEquals(1, list.size());
        assertEquals("plain123", list.get(0).password());
    }

    @Test
    @DisplayName("update: Successfully updates and records old password in history")
    void update_recordsHistoryOnPasswordChange() {
        when(credentialRepository.findByIdAndUser(100L, owner)).thenReturn(Optional.of(sampleCredential));
        when(encryptionService.encrypt("newPassword!")).thenReturn("ENC:new_encrypted");
        when(credentialRepository.save(any(Credential.class))).thenReturn(sampleCredential);
        when(encryptionService.decrypt(anyString())).thenReturn("newPassword!");

        CredentialResponse updated = credentialService.update(100L, "GitHub Updated", "alice_git2", "newPassword!", owner);

        assertNotNull(updated);
        verify(passwordHistoryService).recordHistory(eq(sampleCredential), eq("ENC:encrypted_pass"), eq(owner));
        verify(credentialRepository).save(sampleCredential);
    }

    @Test
    @DisplayName("update: Throws when credential not found for owner")
    void update_notFound_throws() {
        when(credentialRepository.findByIdAndUser(999L, owner)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> credentialService.update(999L, "Title", "User", "Pass", owner));
    }

    @Test
    @DisplayName("delete: Successfully deletes owned credential")
    void delete_success() {
        when(credentialRepository.findByIdAndUser(100L, owner)).thenReturn(Optional.of(sampleCredential));

        credentialService.delete(100L, owner);

        verify(credentialRepository).delete(sampleCredential);
    }

    @Test
    @DisplayName("delete: Throws when credential not owned")
    void delete_notOwned_throws() {
        when(credentialRepository.findByIdAndUser(200L, owner)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> credentialService.delete(200L, owner));
        verify(credentialRepository, never()).delete(any());
    }

    @Test
    @DisplayName("search: Returns matching credentials")
    void search_returnsMatches() {
        when(credentialRepository.searchByUserAndQuery(owner, "git")).thenReturn(List.of(sampleCredential));
        when(encryptionService.decrypt("ENC:encrypted_pass")).thenReturn("plain123");

        List<CredentialResponse> results = credentialService.search("git", owner);

        assertEquals(1, results.size());
        assertEquals("GitHub", results.get(0).title());
    }

    @Test
    @DisplayName("search: Blank query delegates to full list")
    void search_blankQuery_delegatesToList() {
        when(credentialRepository.findByUser(owner)).thenReturn(List.of(sampleCredential));
        when(encryptionService.decrypt("ENC:encrypted_pass")).thenReturn("plain123");

        List<CredentialResponse> results = credentialService.search("", owner);

        assertEquals(1, results.size());
    }
}
