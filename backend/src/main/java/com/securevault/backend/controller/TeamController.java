package com.securevault.backend.controller;

import com.securevault.backend.dto.CredentialResponse;
import com.securevault.backend.dto.TeamMemberResponse;
import com.securevault.backend.dto.TeamResponse;
import com.securevault.backend.entity.User;
import com.securevault.backend.repository.UserRepository;
import com.securevault.backend.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "http://localhost:5173")
public class TeamController {

    private final TeamService service;
    private final UserRepository users;

    public TeamController(TeamService service, UserRepository users) {
        this.service = service;
        this.users = users;
    }

    private User user(Authentication a) {
        return users.findByEmail(a.getName()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<TeamResponse> list(Authentication a) {
        return service.list(user(a));
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam String name,
            Authentication a) {
        try {
            return ResponseEntity.ok(service.create(name, user(a)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<?> members(@PathVariable Long teamId, Authentication a) {
        try {
            return ResponseEntity.ok(service.members(teamId, user(a)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<?> addMember(
            @PathVariable Long teamId,
            @RequestParam String email,
            @RequestParam(defaultValue = "MEMBER") String role,
            Authentication a) {
        try {
            return ResponseEntity.ok(service.addMember(teamId, email, role, user(a)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{teamId}/members/{memberId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long teamId,
            @PathVariable Long memberId,
            Authentication a) {
        try {
            service.removeMember(teamId, memberId, user(a));
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{teamId}/credentials")
    public ResponseEntity<?> credentials(@PathVariable Long teamId, Authentication a) {
        try {
            return ResponseEntity.ok(service.credentials(teamId, user(a)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{teamId}/credentials")
    public ResponseEntity<?> createCredential(
            @PathVariable Long teamId,
            @RequestParam String title,
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam(required = false, defaultValue = "WEBSITE") String credentialType,
            @RequestParam(required = false, defaultValue = "General") String category,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) String websiteUrl,
            Authentication a) {
        try {
            return ResponseEntity.ok(service.createTeamCredential(teamId, title, username, password, credentialType, category, notes, websiteUrl, user(a)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{teamId}/credentials/{credentialId}")
    public ResponseEntity<?> addCredential(
            @PathVariable Long teamId,
            @PathVariable Long credentialId,
            Authentication a) {
        try {
            service.addCredential(teamId, credentialId, user(a));
            return ResponseEntity.ok(Map.of("message", "Credential added to team vault"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
