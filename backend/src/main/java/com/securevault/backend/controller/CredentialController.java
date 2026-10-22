package com.securevault.backend.controller;

import com.securevault.backend.dto.CredentialResponse;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.UserRepository;
import com.securevault.backend.service.AuditLogService;
import com.securevault.backend.service.CredentialService;
import com.securevault.backend.util.RequestMetadataUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vault/credentials")
@CrossOrigin(origins = "http://localhost:5173")
public class CredentialController {

    private final CredentialService service;
    private final UserRepository users;
    private final AuditLogService auditLogService;

    public CredentialController(CredentialService service, UserRepository users, AuditLogService auditLogService) {
        this.service = service;
        this.users = users;
        this.auditLogService = auditLogService;
    }

    private User user(Authentication a) {
        return users.findByEmail(a.getName()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestParam String title,
                                 @RequestParam String username,
                                 @RequestParam String password,
                                 @RequestParam(required = false, defaultValue = "WEBSITE") String credentialType,
                                 @RequestParam(required = false, defaultValue = "General") String category,
                                 @RequestParam(required = false, defaultValue = "false") boolean favorite,
                                 @RequestParam(required = false) String notes,
                                 @RequestParam(required = false) String websiteUrl,
                                 Authentication a,
                                 HttpServletRequest request) {
        try {
            User u = user(a);
            CredentialResponse res = service.add(title, username, password, credentialType, category, favorite, notes, websiteUrl, u);
            auditLogService.log(u, "CREDENTIAL_CREATE", "Added credential: " + title + " (" + credentialType + ")", RequestMetadataUtil.extractClientIp(request));
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<CredentialResponse> list(Authentication a) {
        return service.list(user(a));
    }

    @GetMapping("/search")
    public List<CredentialResponse> search(@RequestParam(required = false, defaultValue = "") String query,
                                           Authentication a) {
        return service.search(query, user(a));
    }

    @GetMapping("/filter")
    public List<CredentialResponse> filter(@RequestParam(required = false) String type,
                                           @RequestParam(required = false) String category,
                                           @RequestParam(required = false) Boolean favoriteOnly,
                                           Authentication a) {
        return service.filter(type, category, favoriteOnly, user(a));
    }

    @GetMapping("/{id}")
    public CredentialResponse get(@PathVariable Long id, Authentication a) {
        return service.response(service.ownedRaw(id, user(a)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestParam String title,
                                    @RequestParam String username,
                                    @RequestParam String password,
                                    @RequestParam(required = false) String credentialType,
                                    @RequestParam(required = false) String category,
                                    @RequestParam(required = false) Boolean favorite,
                                    @RequestParam(required = false) String notes,
                                    @RequestParam(required = false) String websiteUrl,
                                    Authentication a,
                                    HttpServletRequest request) {
        try {
            User u = user(a);
            CredentialResponse res = service.update(id, title, username, password, credentialType, category, favorite, notes, websiteUrl, u);
            auditLogService.log(u, "CREDENTIAL_UPDATE", "Updated credential: " + title, RequestMetadataUtil.extractClientIp(request));
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<?> toggleFavorite(@PathVariable Long id, Authentication a) {
        try {
            return ResponseEntity.ok(service.toggleFavorite(id, user(a)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id, Authentication a, HttpServletRequest request) {
        try {
            User u = user(a);
            service.delete(id, u);
            auditLogService.log(u, "CREDENTIAL_DELETE", "Deleted credential ID: " + id, RequestMetadataUtil.extractClientIp(request));
            return ResponseEntity.ok("Credential deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
