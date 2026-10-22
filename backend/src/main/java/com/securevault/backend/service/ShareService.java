package com.securevault.backend.service;
import com.securevault.backend.dto.ShareResponse; import com.securevault.backend.entity.*; import com.securevault.backend.repository.*; import com.securevault.backend.security.EncryptionService;
import org.springframework.stereotype.Service; import java.time.LocalDateTime; import java.util.*;
@Service public class ShareService{
    private final CredentialShareRepository shareRepo; private final CredentialRepository credentialRepo; private final UserRepository userRepo; private final EncryptionService crypto;
    public ShareService(CredentialShareRepository s,CredentialRepository c,UserRepository u,EncryptionService crypto){shareRepo=s;credentialRepo=c;userRepo=u;this.crypto=crypto;}
    private void active(CredentialShare s){if(s.getExpiresAt()!=null && !s.getExpiresAt().isAfter(LocalDateTime.now())){s.setStatus("EXPIRED");shareRepo.save(s);throw new RuntimeException("Share has expired");}if(!"ACTIVE".equals(s.getStatus()))throw new RuntimeException("Share is not active");}
    private ShareResponse dto(CredentialShare s){Credential c=s.getCredential();return new ShareResponse(s.getId(),c.getId(),c.getTitle(),c.getUsername(),crypto.decrypt(c.getPassword()),s.getPermission(),s.getStatus(),s.getExpiresAt(),s.getSharedUser().getEmail());}
    public ShareResponse share(Long credentialId,String email,String permission,LocalDateTime expiresAt,User owner){
        if(!Set.of("VIEW_ONLY","EDIT_ACCESS","FULL_MANAGEMENT").contains(permission))throw new RuntimeException("Invalid permission");
        Credential c=credentialRepo.findByIdAndUser(credentialId,owner).orElseThrow(()->new RuntimeException("Credential not found"));
        User target=userRepo.findByEmail(email.trim().toLowerCase()).orElseThrow(()->new RuntimeException("Shared user not found. Register that user first."));
        if(target.getId().equals(owner.getId()))throw new RuntimeException("You cannot share with yourself");
        CredentialShare s=shareRepo.findByCredentialAndSharedUser(c,target).orElseGet(CredentialShare::new);
        s.setCredential(c);s.setOwner(owner);s.setSharedUser(target);s.setPermission(permission);s.setStatus("ACTIVE");s.setExpiresAt(expiresAt);return dto(shareRepo.save(s));
    }
    public List<ShareResponse> mine(User user){return shareRepo.findBySharedUser(user).stream().map(s->{try{active(s);return dto(s);}catch(RuntimeException e){return null;}}).filter(Objects::nonNull).toList();}
    public List<ShareResponse> sharedByMe(User owner){return shareRepo.findByOwner(owner).stream().map(s->{try{if(s.getExpiresAt()!=null&&!s.getExpiresAt().isAfter(LocalDateTime.now())){s.setStatus("EXPIRED");shareRepo.save(s);}if(!"ACTIVE".equals(s.getStatus()))return null;return dto(s);}catch(Exception e){return null;}}).filter(Objects::nonNull).toList();}
    public void revoke(Long id,User owner){CredentialShare s=shareRepo.findByIdAndOwner(id,owner).orElseThrow(()->new RuntimeException("Share not found"));s.setStatus("REVOKED");shareRepo.save(s);}
    public ShareResponse getForUser(Long id,User user){CredentialShare s=shareRepo.findById(id).orElseThrow(()->new RuntimeException("Share not found"));if(!s.getSharedUser().getId().equals(user.getId()))throw new RuntimeException("Access denied");active(s);return dto(s);}
    public ShareResponse updateShared(Long id,String title,String username,String password,User user){CredentialShare s=shareRepo.findById(id).orElseThrow(()->new RuntimeException("Share not found"));if(!s.getSharedUser().getId().equals(user.getId()))throw new RuntimeException("Access denied");active(s);if(!Set.of("EDIT_ACCESS","FULL_MANAGEMENT").contains(s.getPermission()))throw new RuntimeException("Edit access not allowed");Credential c=s.getCredential();if(title==null||title.isBlank()||username==null||username.isBlank()||password==null||password.isBlank())throw new RuntimeException("All fields are required");c.setTitle(title.trim());c.setUsername(username.trim());c.setPassword(crypto.encrypt(password));credentialRepo.save(c);return dto(s);}
}
