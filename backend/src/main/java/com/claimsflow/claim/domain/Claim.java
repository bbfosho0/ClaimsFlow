package com.claimsflow.claim.domain;

import com.claimsflow.adjuster.domain.Adjuster;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "claims")
public class Claim {
    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 32)
    private String claimNumber;

    @Column(nullable = false, length = 160)
    private String claimantName;

    @Column(nullable = false, length = 200)
    private String claimantEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ClaimType claimType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ClaimRegion region;

    @Column(nullable = false)
    private LocalDate incidentDate;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal estimatedLoss;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private boolean incidentReportPresent;

    @Column(nullable = false)
    private boolean photosPresent;

    @Column(nullable = false)
    private boolean proofOfOwnershipPresent;

    @Column(nullable = false)
    private boolean medicalDocumentationPresent;

    @Column(nullable = false)
    private int completenessPercentage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ClaimPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ClaimStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_adjuster_id")
    private Adjuster assignedAdjuster;

    @Column(nullable = false)
    private Instant slaDeadline;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    private Instant resolvedAt;

    @Column(length = 64)
    private String demoDatasetKey;

    @Version
    private long version;

    protected Claim() {}

    public static Claim create(
            String claimNumber,
            String claimantName,
            String claimantEmail,
            ClaimType claimType,
            LocalDate incidentDate,
            BigDecimal estimatedLoss,
            String description,
            boolean incidentReportPresent,
            boolean photosPresent,
            boolean proofOfOwnershipPresent,
            boolean medicalDocumentationPresent,
            int completenessPercentage,
            ClaimPriority priority,
            Instant slaDeadline,
            Instant now) {
        return create(
            claimNumber,
            claimantName,
            claimantEmail,
            claimType,
            ClaimRegion.SOUTHEAST,
            incidentDate,
            estimatedLoss,
            description,
            incidentReportPresent,
            photosPresent,
            proofOfOwnershipPresent,
            medicalDocumentationPresent,
            completenessPercentage,
            priority,
            slaDeadline,
            now);
    }

    public static Claim create(
            String claimNumber,
            String claimantName,
            String claimantEmail,
            ClaimType claimType,
            ClaimRegion region,
            LocalDate incidentDate,
            BigDecimal estimatedLoss,
            String description,
            boolean incidentReportPresent,
            boolean photosPresent,
            boolean proofOfOwnershipPresent,
            boolean medicalDocumentationPresent,
            int completenessPercentage,
            ClaimPriority priority,
            Instant slaDeadline,
            Instant now) {
        Claim claim = new Claim();
        claim.id = UUID.randomUUID();
        claim.claimNumber = claimNumber;
        claim.claimantName = claimantName;
        claim.claimantEmail = claimantEmail;
        claim.claimType = claimType;
        claim.region = region == null ? ClaimRegion.SOUTHEAST : region;
        claim.incidentDate = incidentDate;
        claim.estimatedLoss = estimatedLoss;
        claim.description = description;
        claim.incidentReportPresent = incidentReportPresent;
        claim.photosPresent = photosPresent;
        claim.proofOfOwnershipPresent = proofOfOwnershipPresent;
        claim.medicalDocumentationPresent = medicalDocumentationPresent;
        claim.completenessPercentage = completenessPercentage;
        claim.priority = priority;
        claim.status = ClaimStatus.NEW;
        claim.slaDeadline = slaDeadline;
        claim.createdAt = now;
        claim.updatedAt = now;
        return claim;
    }

    public static Claim createSeeded(
            UUID id,
            String claimNumber,
            String claimantName,
            String claimantEmail,
            ClaimType claimType,
            ClaimRegion region,
            LocalDate incidentDate,
            BigDecimal estimatedLoss,
            String description,
            boolean incidentReportPresent,
            boolean photosPresent,
            boolean proofOfOwnershipPresent,
            boolean medicalDocumentationPresent,
            int completenessPercentage,
            ClaimPriority priority,
            ClaimStatus status,
            Adjuster assignedAdjuster,
            Instant slaDeadline,
            Instant createdAt,
            Instant updatedAt,
            Instant resolvedAt,
            String demoDatasetKey) {
        Claim claim = new Claim();
        claim.id = id;
        claim.claimNumber = claimNumber;
        claim.claimantName = claimantName;
        claim.claimantEmail = claimantEmail;
        claim.claimType = claimType;
        claim.region = region;
        claim.incidentDate = incidentDate;
        claim.estimatedLoss = estimatedLoss;
        claim.description = description;
        claim.incidentReportPresent = incidentReportPresent;
        claim.photosPresent = photosPresent;
        claim.proofOfOwnershipPresent = proofOfOwnershipPresent;
        claim.medicalDocumentationPresent = medicalDocumentationPresent;
        claim.completenessPercentage = completenessPercentage;
        claim.priority = priority;
        claim.status = status;
        claim.assignedAdjuster = assignedAdjuster;
        claim.slaDeadline = slaDeadline;
        claim.createdAt = createdAt;
        claim.updatedAt = updatedAt;
        claim.resolvedAt = resolvedAt;
        claim.demoDatasetKey = demoDatasetKey;
        return claim;
    }

    public void assignTo(Adjuster adjuster, Instant now) {
        this.assignedAdjuster = adjuster;
        this.updatedAt = now;
    }

    public void changeStatus(ClaimStatus next, Instant now) {
        this.status = next;
        this.resolvedAt = switch (next) {
            case RESOLVED, CLOSED -> now;
            default -> null;
        };
        this.updatedAt = now;
    }

    public void updateEvidence(
            boolean incidentReportPresent,
            boolean photosPresent,
            boolean proofOfOwnershipPresent,
            boolean medicalDocumentationPresent,
            int completenessPercentage,
            ClaimPriority priority,
            Instant slaDeadline,
            Instant now) {
        this.incidentReportPresent = incidentReportPresent;
        this.photosPresent = photosPresent;
        this.proofOfOwnershipPresent = proofOfOwnershipPresent;
        this.medicalDocumentationPresent = medicalDocumentationPresent;
        this.completenessPercentage = completenessPercentage;
        this.priority = priority;
        this.slaDeadline = slaDeadline;
        this.updatedAt = now;
    }

    public UUID getId() { return id; }
    public String getClaimNumber() { return claimNumber; }
    public String getClaimantName() { return claimantName; }
    public String getClaimantEmail() { return claimantEmail; }
    public ClaimType getClaimType() { return claimType; }
    public ClaimRegion getRegion() { return region; }
    public LocalDate getIncidentDate() { return incidentDate; }
    public BigDecimal getEstimatedLoss() { return estimatedLoss; }
    public String getDescription() { return description; }
    public boolean isIncidentReportPresent() { return incidentReportPresent; }
    public boolean isPhotosPresent() { return photosPresent; }
    public boolean isProofOfOwnershipPresent() { return proofOfOwnershipPresent; }
    public boolean isMedicalDocumentationPresent() { return medicalDocumentationPresent; }
    public int getCompletenessPercentage() { return completenessPercentage; }
    public ClaimPriority getPriority() { return priority; }
    public ClaimStatus getStatus() { return status; }
    public Adjuster getAssignedAdjuster() { return assignedAdjuster; }
    public Instant getSlaDeadline() { return slaDeadline; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public String getDemoDatasetKey() { return demoDatasetKey; }
    public long getVersion() { return version; }
}
