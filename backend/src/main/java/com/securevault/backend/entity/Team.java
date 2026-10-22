package com.securevault.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name="teams")
public class Team {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String name;
    @ManyToOne(optional=false) @JoinColumn(name="owner_id") private User owner;
    public Team() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getName(){return name;} public void setName(String name){this.name=name;}
    public User getOwner(){return owner;} public void setOwner(User owner){this.owner=owner;}
}
