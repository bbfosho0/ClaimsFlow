package com.claimsflow.adjuster.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "adjusters")
public class Adjuster {
    @Id
    private UUID id;

    @Column(nullable = false, length = 120)
    private String displayName;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @Column(nullable = false, length = 40)
    private String role;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private int workloadCapacity;

    protected Adjuster() {}

    public UUID getId() { return id; }
    public String getDisplayName() { return displayName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public boolean isActive() { return active; }
    public int getWorkloadCapacity() { return workloadCapacity; }
}
