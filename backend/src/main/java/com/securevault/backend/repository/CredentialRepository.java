package com.securevault.backend.repository;

import com.securevault.backend.entity.Credential;
import com.securevault.backend.entity.Team;
import com.securevault.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CredentialRepository extends JpaRepository<Credential, Long> {
    List<Credential> findByUser(User user);
    Optional<Credential> findByIdAndUser(Long id, User user);
    List<Credential> findByTeam(Team team);

    @Query("SELECT c FROM Credential c WHERE c.user = :user AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(c.username) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Credential> searchByUserAndQuery(@Param("user") User user, @Param("q") String query);
}
