package com.securevault.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="credential_shares")
public class CredentialShare {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) @JoinColumn(name="credential_id") private Credential credential;
    @ManyToOne(optional=false) @JoinColumn(name="owner_id") private User owner;
    @ManyToOne(optional=false) @JoinColumn(name="shared_user_id") private User sharedUser;
    @Column(nullable=false) private String permission;
    @Column(nullable=false) private String status;
    private LocalDateTime expiresAt;
    public CredentialShare() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public Credential getCredential(){return credential;} public void setCredential(Credential credential){this.credential=credential;}
    public User getOwner(){return owner;} public void setOwner(User owner){this.owner=owner;}
    public User getSharedUser(){return sharedUser;} public void setSharedUser(User sharedUser){this.sharedUser=sharedUser;}
    public String getPermission(){return permission;} public void setPermission(String permission){this.permission=permission;}
    public String getStatus(){return status;} public void setStatus(String status){this.status=status;}
    public LocalDateTime getExpiresAt(){return expiresAt;} public void setExpiresAt(LocalDateTime expiresAt){this.expiresAt=expiresAt;}
}
