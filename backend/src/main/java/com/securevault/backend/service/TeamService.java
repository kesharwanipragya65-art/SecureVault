package com.securevault.backend.service;

import com.securevault.backend.dto.CredentialResponse;
import com.securevault.backend.dto.TeamMemberResponse;
import com.securevault.backend.dto.TeamResponse;
import com.securevault.backend.entity.*;
import com.securevault.backend.repository.*;
import com.securevault.backend.security.EncryptionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TeamService {

    private final TeamRepository teamRepo;
    private final TeamMemberRepository memberRepo;
    private final UserRepository userRepo;
    private final CredentialRepository credentialRepo;
    private final EncryptionService crypto;

    public TeamService(TeamRepository t, TeamMemberRepository m, UserRepository u, CredentialRepository c, EncryptionService crypto) {
        this.teamRepo = t;
        this.memberRepo = m;
        this.userRepo = u;
        this.credentialRepo = c;
        this.crypto = crypto;
    }

    private void checkTeamAccess(Team t, User user) {
        if (t.getOwner() != null && t.getOwner().getId().equals(user.getId())) return;
        if (memberRepo.findByTeamAndUser(t, user).isPresent()) return;
        throw new RuntimeException("Access denied: You are not a member of this team");
    }

    private void checkTeamAdminAccess(Team t, User user) {
        if (t.getOwner() != null && t.getOwner().getId().equals(user.getId())) return;
        var m = memberRepo.findByTeamAndUser(t, user);
        if (m.isPresent()) {
            String role = m.get().getRole();
            if ("ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role) || "OWNER".equalsIgnoreCase(role)) return;
        }
        throw new RuntimeException("Only team owners and administrators can manage team members");
    }

    private void checkTeamWriteAccess(Team t, User user) {
        if (t.getOwner() != null && t.getOwner().getId().equals(user.getId())) return;
        var m = memberRepo.findByTeamAndUser(t, user);
        if (m.isPresent() && !"VIEWER".equalsIgnoreCase(m.get().getRole())) return;
        throw new RuntimeException("View-only members cannot modify team credentials");
    }

    private TeamResponse toTeamResponse(Team t, User user) {
        String role = "MEMBER";
        if (t.getOwner() != null && t.getOwner().getId().equals(user.getId())) {
            role = "OWNER";
        } else {
            var m = memberRepo.findByTeamAndUser(t, user);
            if (m.isPresent() && m.get().getRole() != null) {
                role = m.get().getRole();
            }
        }
        int count = memberRepo.findByTeam(t).size();
        return new TeamResponse(
            t.getId(),
            t.getName(),
            t.getOwner() != null ? t.getOwner().getId() : null,
            t.getOwner() != null ? t.getOwner().getName() : "Team Owner",
            t.getOwner() != null ? t.getOwner().getEmail() : "",
            role,
            count
        );
    }

    private CredentialResponse toCredentialResponse(Credential c) {
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

    public List<TeamResponse> list(User user) {
        Map<Long, Team> map = new LinkedHashMap<>();
        for (Team t : teamRepo.findByOwner(user)) {
            if (t != null) map.put(t.getId(), t);
        }
        for (TeamMember m : memberRepo.findByUser(user)) {
            if (m != null && m.getTeam() != null) {
                map.put(m.getTeam().getId(), m.getTeam());
            }
        }
        return map.values().stream().map(t -> toTeamResponse(t, user)).toList();
    }

    @Transactional
    public TeamResponse create(String name, User owner) {
        if (name == null || name.isBlank()) throw new RuntimeException("Team name is required");
        Team t = new Team();
        t.setName(name.trim());
        t.setOwner(owner);
        Team saved = teamRepo.save(t);

        TeamMember m = new TeamMember();
        m.setTeam(saved);
        m.setUser(owner);
        m.setRole("OWNER");
        memberRepo.save(m);

        return toTeamResponse(saved, owner);
    }

    public List<TeamMemberResponse> members(Long teamId, User user) {
        Team t = teamRepo.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        checkTeamAccess(t, user);

        List<TeamMember> list = memberRepo.findByTeam(t);
        // Ensure owner is included in list if not already present
        boolean ownerPresent = list.stream().anyMatch(m -> m.getUser().getId().equals(t.getOwner().getId()));
        List<TeamMemberResponse> responses = new ArrayList<>();
        if (!ownerPresent) {
            responses.add(new TeamMemberResponse(0L, t.getOwner().getId(), t.getOwner().getName(), t.getOwner().getEmail(), "OWNER"));
        }
        for (TeamMember m : list) {
            responses.add(new TeamMemberResponse(
                m.getId(),
                m.getUser().getId(),
                m.getUser().getName(),
                m.getUser().getEmail(),
                m.getRole()
            ));
        }
        return responses;
    }

    @Transactional
    public TeamMemberResponse addMember(Long teamId, String email, String role, User requester) {
        Team t = teamRepo.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        checkTeamAdminAccess(t, requester);

        if (email == null || email.isBlank()) throw new RuntimeException("Member email is required");
        User target = userRepo.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email + ". Register that user account first."));

        if (target.getId().equals(t.getOwner().getId())) {
            throw new RuntimeException("User is already the team owner");
        }

        String assignedRole = "MEMBER";
        if (role != null) {
            String upper = role.trim().toUpperCase();
            if (Set.of("ADMIN", "MANAGER", "MEMBER", "VIEWER").contains(upper)) {
                assignedRole = upper;
            }
        }

        TeamMember m = memberRepo.findByTeamAndUser(t, target).orElseGet(TeamMember::new);
        m.setTeam(t);
        m.setUser(target);
        m.setRole(assignedRole);
        TeamMember saved = memberRepo.save(m);

        return new TeamMemberResponse(saved.getId(), target.getId(), target.getName(), target.getEmail(), saved.getRole());
    }

    @Transactional
    public void removeMember(Long teamId, Long memberId, User requester) {
        Team t = teamRepo.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        checkTeamAdminAccess(t, requester);

        TeamMember m = memberRepo.findByIdAndTeam(memberId, t)
                .orElseThrow(() -> new RuntimeException("Team member not found"));

        if (m.getUser().getId().equals(t.getOwner().getId())) {
            throw new RuntimeException("Cannot remove the team owner");
        }

        memberRepo.delete(m);
    }

    @Transactional
    public CredentialResponse createTeamCredential(Long teamId, String title, String username, String password,
                                                   String credentialType, String category, String notes,
                                                   String websiteUrl, User requester) {
        Team t = teamRepo.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        checkTeamWriteAccess(t, requester);

        if (title == null || title.isBlank()) throw new RuntimeException("Title is required");
        if (username == null || username.isBlank()) throw new RuntimeException("Username is required");
        if (password == null || password.isBlank()) throw new RuntimeException("Password is required");

        Credential c = new Credential(title.trim(), username.trim(), crypto.encrypt(password), requester);
        c.setTeam(t);
        if (credentialType != null && !credentialType.isBlank()) c.setCredentialType(credentialType.trim().toUpperCase());
        if (category != null && !category.isBlank()) c.setCategory(category.trim());
        c.setNotes(notes);
        c.setWebsiteUrl(websiteUrl);
        c.setCreatedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());

        Credential saved = credentialRepo.save(c);
        return toCredentialResponse(saved);
    }

    @Transactional
    public void addCredential(Long teamId, Long credentialId, User requester) {
        Team t = teamRepo.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        checkTeamWriteAccess(t, requester);

        Credential c = credentialRepo.findByIdAndUser(credentialId, requester)
                .orElseThrow(() -> new RuntimeException("Credential not found in your vault"));
        c.setTeam(t);
        c.setUpdatedAt(LocalDateTime.now());
        credentialRepo.save(c);
    }

    public List<CredentialResponse> credentials(Long teamId, User user) {
        Team t = teamRepo.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        checkTeamAccess(t, user);

        return credentialRepo.findByTeam(t).stream().map(this::toCredentialResponse).toList();
    }
}
