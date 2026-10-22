package com.securevault.backend.service;

import com.securevault.backend.entity.Credential;
import com.securevault.backend.entity.PasswordHistory;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.PasswordHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordHistoryServiceTest {

    @Mock
    private PasswordHistoryRepository historyRepository;

    @InjectMocks
    private PasswordHistoryService historyService;

    private User owner;
    private User otherUser;
    private Credential credential;

    @BeforeEach
    void setUp() {
        owner = new User("Owner", "owner@example.com", "pass");
        owner.setId(1L);

        otherUser = new User("Other", "other@example.com", "pass");
        otherUser.setId(2L);

        credential = new Credential("Site", "user", "ENC:curr", owner);
        credential.setId(50L);
    }

    @Test
    @DisplayName("recordHistory: Successfully saves old encrypted password")
    void recordHistory_success() {
        PasswordHistory ph = new PasswordHistory(credential, "ENC:old", LocalDateTime.now(), owner);
        when(historyRepository.save(any(PasswordHistory.class))).thenReturn(ph);

        PasswordHistory saved = historyService.recordHistory(credential, "ENC:old", owner);

        assertNotNull(saved);
        assertEquals("ENC:old", saved.getEncryptedOldPassword());
        verify(historyRepository).save(any(PasswordHistory.class));
    }

    @Test
    @DisplayName("recordHistory: Throws on null credential")
    void recordHistory_nullCredential_throws() {
        assertThrows(IllegalArgumentException.class, () -> historyService.recordHistory(null, "old", owner));
    }

    @Test
    @DisplayName("recordHistory: Returns null when password is blank or null")
    void recordHistory_blankPassword_returnsNull() {
        assertNull(historyService.recordHistory(credential, "", owner));
        assertNull(historyService.recordHistory(credential, null, owner));
        verify(historyRepository, never()).save(any());
    }

    @Test
    @DisplayName("getHistory: Success when requested by credential owner")
    void getHistory_authorizedOwner_success() {
        PasswordHistory h = new PasswordHistory(credential, "ENC:old", LocalDateTime.now(), owner);
        when(historyRepository.findByCredentialOrderByChangedAtDesc(credential)).thenReturn(List.of(h));

        List<PasswordHistory> list = historyService.getHistory(credential, owner);

        assertEquals(1, list.size());
    }

    @Test
    @DisplayName("getHistory: Throws SecurityException when requested by non-owner")
    void getHistory_unauthorizedUser_throws() {
        assertThrows(SecurityException.class, () -> historyService.getHistory(credential, otherUser));
    }

    @Test
    @DisplayName("isPasswordPreviouslyUsed: Returns true when matches past password")
    void isPasswordPreviouslyUsed_match_returnsTrue() {
        PasswordHistory h = new PasswordHistory(credential, "ENC:matching", LocalDateTime.now(), owner);
        when(historyRepository.findByCredentialOrderByChangedAtDesc(credential)).thenReturn(List.of(h));

        boolean reused = historyService.isPasswordPreviouslyUsed(credential, "ENC:matching");

        assertTrue(reused);
    }

    @Test
    @DisplayName("isPasswordPreviouslyUsed: Returns false when novel password")
    void isPasswordPreviouslyUsed_noMatch_returnsFalse() {
        when(historyRepository.findByCredentialOrderByChangedAtDesc(credential)).thenReturn(List.of());

        boolean reused = historyService.isPasswordPreviouslyUsed(credential, "ENC:brand_new");

        assertFalse(reused);
    }
}
