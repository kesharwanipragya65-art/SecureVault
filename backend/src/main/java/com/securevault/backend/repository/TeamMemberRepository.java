package com.securevault.backend.repository;
import com.securevault.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface TeamMemberRepository extends JpaRepository<TeamMember,Long>{
 Optional<TeamMember> findByTeamAndUser(Team team,User user);
 List<TeamMember> findByTeam(Team team);
 List<TeamMember> findByUser(User user);
 Optional<TeamMember> findByIdAndTeam(Long id, Team team);
}
