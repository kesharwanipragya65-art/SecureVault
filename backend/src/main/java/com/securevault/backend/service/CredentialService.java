package com.securevault.backend.service;

import com.securevault.backend.dto.CredentialResponse;
import com.securevault.backend.entity.Credential;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.CredentialRepository;
import com.securevault.backend.repository.TeamMemberRepository;
import com.securevault.backend.security.EncryptionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CredentialService {

    private final CredentialRepository repo;
    private final EncryptionService crypto;
    private final TeamMemberRepository teamMemberRepo;
    private final PasswordHistoryService historyService;

    public CredentialService(CredentialRepository repo,
                             EncryptionService crypto,
                             TeamMemberRepository teamMemberRepo,
                             PasswordHistoryService historyService) {
        this.repo = repo;
        this.crypto = crypto;
        this.teamMemberRepo = teamMemberRepo;
        this.historyService = historyService;
    }

    private void validate(String t, String u, String p) {
        if (t == null || t.isBlank()) throw new RuntimeException("Title is required");
        if (u == null || u.isBlank()) throw new RuntimeException("Username is required");
        if (p == null || p.isBlank()) throw new RuntimeException("Password is required");
    }

    private CredentialResponse dto(Credential c) {
        return new CredentialResponse(
            c.getId(),
            c.getTitle(),
            c.getUsername(),
            crypto.decrypt(c.getPassword()),
            c.getCredentialType() != null ? c.getCredentialType() : "WEBSITE",
            c.getCategory() != null ? c.getCategory() : "General",
            c.isFavorite(),
            c.getNotes(),
            c.getWebsiteUrl(),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }

    @Transactional
    public CredentialResponse add(String t, String u, String p, User owner) {
        return add(t, u, p, "WEBSITE", "General", false, null, null, owner);
    }

    @Transactional
    public CredentialResponse add(String t, String u, String p, String type, String category,
                                  boolean favorite, String notes, String websiteUrl, User owner) {
        validate(t, u, p);
        Credential c = new Credential(t.trim(), u.trim(), crypto.encrypt(p), owner);
        if (type != null && !type.isBlank()) c.setCredentialType(type.trim().toUpperCase());
        if (category != null && !category.isBlank()) c.setCategory(category.trim());
        c.setFavorite(favorite);
        c.setNotes(notes);
        c.setWebsiteUrl(websiteUrl);
        c.setCreatedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());
        return dto(repo.save(c));
    }

    public List<CredentialResponse> list(User owner) {
        return repo.findByUser(owner).stream().map(this::dto).toList();
    }

    @Transactional
    public CredentialResponse update(Long id, String t, String u, String p, User owner) {
        return update(id, t, u, p, null, null, null, null, null, owner);
    }

    @Transactional
    public CredentialResponse update(Long id, String t, String u, String p, String type, String category,
                                     Boolean favorite, String notes, String websiteUrl, User owner) {
        validate(t, u, p);
        Credential c = repo.findByIdAndUser(id, owner)
                .orElseThrow(() -> new RuntimeException("Credential not found"));

        String oldEncrypted = c.getPassword();
        c.setTitle(t.trim());
        c.setUsername(u.trim());
        String newEncrypted = crypto.encrypt(p);
        c.setPassword(newEncrypted);

        if (type != null && !type.isBlank()) c.setCredentialType(type.trim().toUpperCase());
        if (category != null && !category.isBlank()) c.setCategory(category.trim());
        if (favorite != null) c.setFavorite(favorite);
        if (notes != null) c.setNotes(notes);
        if (websiteUrl != null) c.setWebsiteUrl(websiteUrl);
        c.setUpdatedAt(LocalDateTime.now());

        Credential saved = repo.save(c);
        if (oldEncrypted != null && !oldEncrypted.equals(newEncrypted)) {
            historyService.recordHistory(saved, oldEncrypted, owner);
        }

        return dto(saved);
    }

    @Transactional
    public CredentialResponse toggleFavorite(Long id, User owner) {
        Credential c = repo.findByIdAndUser(id, owner)
                .orElseThrow(() -> new RuntimeException("Credential not found"));
        c.setFavorite(!c.isFavorite());
        c.setUpdatedAt(LocalDateTime.now());
        return dto(repo.save(c));
    }

    @Transactional
    public void delete(Long id, User owner) {
        Credential c = repo.findByIdAndUser(id, owner)
                .orElseThrow(() -> new RuntimeException("Credential not found"));
        repo.delete(c);
    }

    public List<CredentialResponse> search(String query, User owner) {
        if (query == null || query.isBlank()) {
            return list(owner);
        }
        return repo.searchByUserAndQuery(owner, query.trim()).stream()
                .map(this::dto)
                .toList();
    }

    public List<CredentialResponse> filter(String type, String category, Boolean favoriteOnly, User owner) {
        return repo.findByUser(owner).stream()
                .filter(c -> type == null || type.isBlank() || type.equalsIgnoreCase(c.getCredentialType()))
                .filter(c -> category == null || category.isBlank() || category.equalsIgnoreCase(c.getCategory()))
                .filter(c -> favoriteOnly == null || !favoriteOnly || c.isFavorite())
                .map(this::dto)
                .toList();
    }

    public Credential ownedRaw(Long id, User owner) {
        return repo.findByIdAndUser(id, owner)
                .orElseThrow(() -> new RuntimeException("Credential not found"));
    }

    public CredentialResponse response(Credential c) {
        return dto(c);
    }
}
