package com.securevault.backend.repository;
import com.securevault.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CredentialShareRepository extends JpaRepository<CredentialShare,Long>{
 Optional<CredentialShare> findByCredentialAndSharedUser(Credential credential,User sharedUser);
 List<CredentialShare> findBySharedUser(User user);
 List<CredentialShare> findByOwner(User owner);
 Optional<CredentialShare> findByIdAndOwner(Long id,User owner);
}
