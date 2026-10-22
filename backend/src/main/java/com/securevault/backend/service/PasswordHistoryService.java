package com.securevault.backend.service;

import com.securevault.backend.entity.Credential;
import com.securevault.backend.entity.PasswordHistory;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.PasswordHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PasswordHistoryService {

    private final PasswordHistoryRepository historyRepository;

    public PasswordHistoryService(PasswordHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @Transactional
    public PasswordHistory recordHistory(Credential credential, String oldEncryptedPassword, User changedBy) {
        if (credential == null) throw new IllegalArgumentException("Credential cannot be null");
        if (oldEncryptedPassword == null || oldEncryptedPassword.isBlank()) return null;

        PasswordHistory history = new PasswordHistory(
            credential,
            oldEncryptedPassword,
            LocalDateTime.now(),
            changedBy
        );
        return historyRepository.save(history);
    }

    public List<PasswordHistory> getHistory(Credential credential, User requestingUser) {
        if (credential == null) throw new IllegalArgumentException("Credential cannot be null");
        if (!credential.getUser().getId().equals(requestingUser.getId())) {
            throw new SecurityException("Not authorized to view password history for this credential");
        }
        return historyRepository.findByCredentialOrderByChangedAtDesc(credential);
    }

    public boolean isPasswordPreviouslyUsed(Credential credential, String currentEncryptedPassword) {
        if (credential == null || currentEncryptedPassword == null) return false;
        List<PasswordHistory> past = historyRepository.findByCredentialOrderByChangedAtDesc(credential);
        return past.stream().anyMatch(h -> currentEncryptedPassword.equals(h.getEncryptedOldPassword()));
    }
}
