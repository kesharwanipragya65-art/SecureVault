package com.securevault.backend.service;

import com.securevault.backend.entity.User;
import com.securevault.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Alice", "alice@example.com", "encoded_secret");
        sampleUser.setId(1L);
    }

    @Test
    @DisplayName("register: Success when valid parameters supplied")
    void register_success() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("plain_secret")).thenReturn("encoded_secret");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        User created = authService.register("Alice", "alice@example.com", "plain_secret");

        assertNotNull(created);
        assertEquals("alice@example.com", created.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register: Throws when name is null or blank")
    void register_blankName_throws() {
        assertThrows(RuntimeException.class, () -> authService.register("", "a@b.com", "pass"));
        assertThrows(RuntimeException.class, () -> authService.register(null, "a@b.com", "pass"));
    }

    @Test
    @DisplayName("register: Throws when email is null or blank")
    void register_blankEmail_throws() {
        assertThrows(RuntimeException.class, () -> authService.register("Alice", "", "pass"));
        assertThrows(RuntimeException.class, () -> authService.register("Alice", "   ", "pass"));
        assertThrows(RuntimeException.class, () -> authService.register("Alice", null, "pass"));
    }

    @Test
    @DisplayName("register: Throws when password is null or blank")
    void register_blankPassword_throws() {
        assertThrows(RuntimeException.class, () -> authService.register("Alice", "a@b.com", ""));
        assertThrows(RuntimeException.class, () -> authService.register("Alice", "a@b.com", null));
    }

    @Test
    @DisplayName("register: Throws when email already registered")
    void register_duplicateEmail_throws() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.register("Alice", "alice@example.com", "secret"));
        assertTrue(ex.getMessage().contains("already registered"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("login: Returns true when password matches")
    void login_success() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("raw_secret", "encoded_secret")).thenReturn(true);

        boolean result = authService.login("alice@example.com", "raw_secret");

        assertTrue(result);
    }

    @Test
    @DisplayName("login: Returns false when password does not match")
    void login_wrongPassword_returnsFalse() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrong_secret", "encoded_secret")).thenReturn(false);

        boolean result = authService.login("alice@example.com", "wrong_secret");

        assertFalse(result);
    }

    @Test
    @DisplayName("login: Throws when email is not found")
    void login_userNotFound_throws() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> authService.login("ghost@example.com", "pass"));
    }
}
