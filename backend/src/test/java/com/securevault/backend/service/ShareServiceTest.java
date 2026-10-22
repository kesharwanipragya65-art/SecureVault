package com.securevault.backend.service;

import com.securevault.backend.dto.ShareResponse;
import com.securevault.backend.entity.Credential;
import com.securevault.backend.entity.CredentialShare;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.CredentialRepository;
import com.securevault.backend.repository.CredentialShareRepository;
import com.securevault.backend.repository.UserRepository;
import com.securevault.backend.security.EncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShareServiceTest {

    @Mock
    private CredentialShareRepository shareRepository;

    @Mock
    private CredentialRepository credentialRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EncryptionService encryptionService;

    @InjectMocks
    private ShareService shareService;

    private User owner;
    private User recipient;
    private Credential credential;
    private CredentialShare share;

    @BeforeEach
    void setUp() {
        owner = new User("Owner", "owner@example.com", "pass");
        owner.setId(1L);

        recipient = new User("Recipient", "recipient@example.com", "pass");
        recipient.setId(2L);

        credential = new Credential("AWS Console", "aws_admin", "ENC:enc_pass", owner);
        credential.setId(10L);

        share = new CredentialShare();
        share.setId(55L);
        share.setCredential(credential);
        share.setOwner(owner);
        share.setSharedUser(recipient);
        share.setPermission("VIEW_ONLY");
        share.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("share: Successfully shares with VIEW_ONLY")
    void share_viewOnly_success() {
        when(credentialRepository.findByIdAndUser(10L, owner)).thenReturn(Optional.of(credential));
        when(userRepository.findByEmail("recipient@example.com")).thenReturn(Optional.of(recipient));
        when(shareRepository.findByCredentialAndSharedUser(credential, recipient)).thenReturn(Optional.empty());
        when(shareRepository.save(any(CredentialShare.class))).thenReturn(share);
        when(encryptionService.decrypt("ENC:enc_pass")).thenReturn("plain_pass");

        ShareResponse resp = shareService.share(10L, "recipient@example.com", "VIEW_ONLY", null, owner);

        assertNotNull(resp);
        assertEquals("VIEW_ONLY", resp.permission());
        assertEquals("ACTIVE", resp.status());
        verify(shareRepository).save(any(CredentialShare.class));
    }

    @Test
    @DisplayName("share: Throws on invalid permission level")
    void share_invalidPermission_throws() {
        assertThrows(RuntimeException.class,
                () -> shareService.share(10L, "recipient@example.com", "SUPER_ADMIN", null, owner));
    }

    @Test
    @DisplayName("share: Throws when credential not found")
    void share_credentialNotFound_throws() {
        when(credentialRepository.findByIdAndUser(99L, owner)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> shareService.share(99L, "recipient@example.com", "VIEW_ONLY", null, owner));
    }

    @Test
    @DisplayName("share: Throws when recipient not found")
    void share_recipientNotFound_throws() {
        when(credentialRepository.findByIdAndUser(10L, owner)).thenReturn(Optional.of(credential));
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> shareService.share(10L, "ghost@example.com", "VIEW_ONLY", null, owner));
    }

    @Test
    @DisplayName("share: Throws when trying to share with oneself")
    void share_withSelf_throws() {
        when(credentialRepository.findByIdAndUser(10L, owner)).thenReturn(Optional.of(credential));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));

        assertThrows(RuntimeException.class,
                () -> shareService.share(10L, "owner@example.com", "VIEW_ONLY", null, owner));
    }

    @Test
    @DisplayName("getForUser: Success when accessed by recipient")
    void getForUser_success() {
        when(shareRepository.findById(55L)).thenReturn(Optional.of(share));
        when(encryptionService.decrypt("ENC:enc_pass")).thenReturn("plain_pass");

        ShareResponse resp = shareService.getForUser(55L, recipient);

        assertNotNull(resp);
        assertEquals("AWS Console", resp.title());
    }

    @Test
    @DisplayName("getForUser: Throws when accessed by unauthorized user")
    void getForUser_unauthorized_throws() {
        User outsider = new User("Outsider", "outsider@example.com", "pass");
        outsider.setId(99L);
        when(shareRepository.findById(55L)).thenReturn(Optional.of(share));

        assertThrows(RuntimeException.class, () -> shareService.getForUser(55L, outsider));
    }

    @Test
    @DisplayName("getForUser: Throws when sharing has expired")
    void getForUser_expired_throws() {
        share.setExpiresAt(LocalDateTime.now().minusMinutes(10));
        when(shareRepository.findById(55L)).thenReturn(Optional.of(share));

        assertThrows(RuntimeException.class, () -> shareService.getForUser(55L, recipient));
        assertEquals("EXPIRED", share.getStatus());
        verify(shareRepository).save(share);
    }

    @Test
    @DisplayName("updateShared: Throws when permission is VIEW_ONLY")
    void updateShared_viewOnlyForbidden_throws() {
        share.setPermission("VIEW_ONLY");
        when(shareRepository.findById(55L)).thenReturn(Optional.of(share));

        assertThrows(RuntimeException.class,
                () -> shareService.updateShared(55L, "New", "User", "Pass", recipient));
    }

    @Test
    @DisplayName("updateShared: Succeeds when permission is EDIT_ACCESS")
    void updateShared_editAccess_success() {
        share.setPermission("EDIT_ACCESS");
        when(shareRepository.findById(55L)).thenReturn(Optional.of(share));
        when(encryptionService.encrypt("newSecret")).thenReturn("ENC:new_enc");
        when(encryptionService.decrypt(any())).thenReturn("newSecret");

        ShareResponse resp = shareService.updateShared(55L, "AWS Updated", "admin2", "newSecret", recipient);

        assertNotNull(resp);
        verify(credentialRepository).save(credential);
    }

    @Test
    @DisplayName("revoke: Owner successfully marks share as REVOKED")
    void revoke_success() {
        when(shareRepository.findByIdAndOwner(55L, owner)).thenReturn(Optional.of(share));

        shareService.revoke(55L, owner);

        assertEquals("REVOKED", share.getStatus());
        verify(shareRepository).save(share);
    }
}
