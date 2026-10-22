package com.securevault.backend.repository;
import com.securevault.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface TeamRepository extends JpaRepository<Team,Long>{List<Team> findByOwner(User owner);}
