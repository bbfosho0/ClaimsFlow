package com.claimsflow.claim.application;

import com.claimsflow.adjuster.application.AdjusterService;
import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.domain.*;
import com.claimsflow.claim.persistence.*;
import com.claimsflow.operations.application.OperationalFilters;
import com.claimsflow.portal.domain.EvidenceKind;
import com.claimsflow.shared.error.*;
import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClaimApplicationService {
    private final ClaimJpaRepository claims;
    private final AdjusterService adjusters;
    private final AuditService audit;
    private final Clock clock;
    private final CompletenessPolicy completeness = new CompletenessPolicy();
    private final PriorityPolicy priority = new PriorityPolicy();
    private final ClaimTransitionPolicy transitions = new ClaimTransitionPolicy();

    @Autowired
    public ClaimApplicationService(
            ClaimJpaRepository claims,
            AdjusterService adjusters,
            AuditService audit,
            Clock clock) {
        this.claims = claims;
        this.adjusters = adjusters;
        this.audit = audit;
        this.clock = clock;
    }

    public ClaimApplicationService(
            ClaimJpaRepository claims,
            AdjusterService adjusters,
            AuditService audit) {
        this(claims, adjusters, audit, Clock.systemUTC());
    }

    @Transactional
    public Claim create(CreateClaimCommand command) {
        Instant now = clock.instant();
        var complete = completeness.evaluate(command.claimType(), command.incidentReportPresent(), command.photosPresent(), command.proofOfOwnershipPresent(), command.medicalDocumentationPresent());
        var triage = priority.evaluate(command.claimType(), command.estimatedLoss(), command.incidentDate(), complete.percentage(), null, now);
        Instant sla = now.plus(slaDuration(triage.priority()));
        Claim claim = Claim.create(
            claimNumber(now),
            command.claimantName(),
            command.claimantEmail(),
            command.claimType(),
            ClaimRegion.SOUTHEAST,
            command.incidentDate(),
            command.estimatedLoss(),
            command.description(),
            command.incidentReportPresent(),
            command.photosPresent(),
            command.proofOfOwnershipPresent(),
            command.medicalDocumentationPresent(),
            complete.percentage(),
            triage.priority(),
            sla,
            now);
        claims.save(claim);
        audit.record(claim, "system", "CLAIM_CREATED", "Claim created and triaged", null, triage.priority().name(), now);
        return claim;
    }

    @Transactional(readOnly = true)
    public Claim get(UUID id) { return claims.findOneById(id).orElseThrow(() -> new ResourceNotFoundException("CLAIM_NOT_FOUND", "Claim was not found.")); }

    @Transactional(readOnly = true)
    public Page<Claim> list(String query, ClaimStatus status, ClaimPriority priority, String assignment, Pageable pageable) {
        return claims.findAll(ClaimSpecifications.filters(query, status, priority, assignment), pageable);
    }

    @Transactional(readOnly = true)
    public Page<Claim> list(
            String query,
            LocalDate from,
            LocalDate to,
            ClaimType claimType,
            ClaimStatus status,
            ClaimPriority priority,
            String assignment,
            UUID adjusterId,
            String team,
            ClaimRegion region,
            Pageable pageable) {
        LocalDate effectiveTo = to == null ? LocalDate.now(clock) : to;
        LocalDate effectiveFrom = from == null ? effectiveTo.minusDays(365) : from;
        if (effectiveFrom.isAfter(effectiveTo)) {
            throw new IllegalArgumentException("from must not be after to");
        }
        if (ChronoUnit.DAYS.between(effectiveFrom, effectiveTo) > 366) {
            throw new IllegalArgumentException("date range must not exceed 366 days");
        }

        boolean unassigned = "unassigned".equalsIgnoreCase(assignment);
        UUID effectiveAdjusterId = adjusterId;
        String legacyAssignment = null;
        if (!unassigned && effectiveAdjusterId == null && assignment != null && !assignment.isBlank()) {
            try {
                effectiveAdjusterId = UUID.fromString(assignment);
            } catch (IllegalArgumentException ignored) {
                legacyAssignment = assignment;
            }
        }

        OperationalFilters filters = new OperationalFilters(
            effectiveFrom,
            effectiveTo,
            claimType,
            priority,
            status,
            effectiveAdjusterId,
            team == null || team.isBlank() ? null : team.trim(),
            region,
            unassigned);
        return claims.findAll(ClaimSpecifications.queue(query, filters, legacyAssignment), pageable);
    }

    @Transactional
    public Claim assign(UUID claimId, UUID adjusterId, String actor) {
        Claim claim = get(claimId);
        Adjuster previous = claim.getAssignedAdjuster();
        Adjuster next = adjusters.requireActive(adjusterId);
        Instant now = clock.instant();
        claim.assignTo(next, now);
        audit.record(claim, actor, "ASSIGNMENT_CHANGED", "Claim assignment updated", previous == null ? null : previous.getDisplayName(), next.getDisplayName(), now);
        return claim;
    }

    @Transactional
    public Claim updateStatus(UUID claimId, ClaimStatus next, String actor) {
        Claim claim = get(claimId);
        ClaimStatus previous = claim.getStatus();
        if (!transitions.canTransition(previous, next)) throw new DomainConflictException("INVALID_STATUS_TRANSITION", "Cannot move claim from " + previous + " to " + next + ".");
        Instant now = clock.instant();
        claim.changeStatus(next, now);
        audit.record(claim, actor, "STATUS_CHANGED", "Claim status updated", previous.name(), next.name(), now);
        return claim;
    }

    @Transactional
    public Claim updateEvidence(UUID claimId, EvidenceKind kind, boolean present, String actor) {
        Claim claim = get(claimId);
        boolean incidentReport = claim.isIncidentReportPresent();
        boolean photos = claim.isPhotosPresent();
        boolean proofOfOwnership = claim.isProofOfOwnershipPresent();
        boolean medicalDocumentation = claim.isMedicalDocumentationPresent();
        boolean previous;

        switch (kind) {
            case INCIDENT_REPORT -> {
                previous = incidentReport;
                incidentReport = present;
            }
            case PHOTOS -> {
                previous = photos;
                photos = present;
            }
            case PROOF_OF_OWNERSHIP -> {
                previous = proofOfOwnership;
                proofOfOwnership = present;
            }
            case MEDICAL_DOCUMENTATION -> {
                previous = medicalDocumentation;
                medicalDocumentation = present;
            }
            default -> throw new IllegalArgumentException("Unsupported evidence kind: " + kind);
        }

        Instant now = clock.instant();
        var complete = completeness.evaluate(claim.getClaimType(), incidentReport, photos, proofOfOwnership, medicalDocumentation);
        var triage = priority.evaluate(claim.getClaimType(), claim.getEstimatedLoss(), claim.getIncidentDate(), complete.percentage(), null, now);
        Instant sla = now.plus(slaDuration(triage.priority()));

        claim.updateEvidence(
            incidentReport,
            photos,
            proofOfOwnership,
            medicalDocumentation,
            complete.percentage(),
            triage.priority(),
            sla,
            now);

        audit.record(
            claim,
            actor,
            "EVIDENCE_UPDATED",
            evidenceLabel(kind) + " updated",
            kind.name() + "=" + previous,
            kind.name() + "=" + present,
            now);
        return claim;
    }

    public ClaimTransitionPolicy transitions() { return transitions; }
    public CompletenessPolicy completeness() { return completeness; }
    public PriorityPolicy priority() { return priority; }
    public Instant now() { return clock.instant(); }

    private Duration slaDuration(ClaimPriority priority) {
        return switch (priority) {
            case CRITICAL -> Duration.ofHours(12);
            case HIGH -> Duration.ofHours(24);
            case MEDIUM -> Duration.ofHours(72);
            case LOW -> Duration.ofHours(120);
        };
    }

    private String evidenceLabel(EvidenceKind kind) {
        return switch (kind) {
            case INCIDENT_REPORT -> "Incident report";
            case PHOTOS -> "Photos";
            case PROOF_OF_OWNERSHIP -> "Proof of ownership";
            case MEDICAL_DOCUMENTATION -> "Medical documentation";
        };
    }

    private String claimNumber(Instant now) {
        return "CLM-" + LocalDate.ofInstant(now, ZoneOffset.UTC).getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public record CreateClaimCommand(String claimantName, String claimantEmail, ClaimType claimType, LocalDate incidentDate, BigDecimal estimatedLoss, String description, boolean incidentReportPresent, boolean photosPresent, boolean proofOfOwnershipPresent, boolean medicalDocumentationPresent) {}
}
