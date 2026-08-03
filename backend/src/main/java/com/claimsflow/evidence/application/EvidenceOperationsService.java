package com.claimsflow.evidence.application;

import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.evidence.api.EvidenceOperationsResponses.ClaimantMessage;
import com.claimsflow.evidence.api.EvidenceOperationsResponses.EvidenceCategory;
import com.claimsflow.evidence.api.EvidenceOperationsResponses.EvidenceClaimDetail;
import com.claimsflow.evidence.api.EvidenceOperationsResponses.EvidenceClaimSummary;
import com.claimsflow.evidence.api.EvidenceOperationsResponses.EvidenceOperationsSnapshot;
import com.claimsflow.operations.application.OperationalFilterOptionsService;
import com.claimsflow.operations.application.OperationalFilters;
import com.claimsflow.operations.application.OperationalMetrics;
import com.claimsflow.operations.application.OperationalMetrics.SlaState;
import com.claimsflow.operations.application.OperationalQueryService;
import com.claimsflow.portal.domain.MessageAudience;
import com.claimsflow.portal.persistence.ClaimMessageJpaRepository;
import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EvidenceOperationsService {
    private final OperationalQueryService query;
    private final ClaimMessageJpaRepository messages;
    private final OperationalFilterOptionsService filterOptions;
    private final Clock clock;

    public EvidenceOperationsService(
            OperationalQueryService query,
            ClaimMessageJpaRepository messages,
            OperationalFilterOptionsService filterOptions,
            Clock clock) {
        this.query = query;
        this.messages = messages;
        this.filterOptions = filterOptions;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public EvidenceOperationsSnapshot snapshot(
            OperationalFilters filters,
            UUID selectedClaimId) {
        Instant now = clock.instant();
        List<Claim> filtered = query.find(filters).stream()
            .sorted(Comparator
                .comparingInt((Claim claim) -> rank(claim, now))
                .thenComparing(Claim::getSlaDeadline)
                .thenComparing(Claim::getClaimNumber))
            .toList();

        Claim selected = filtered.stream()
            .filter(claim -> selectedClaimId != null && selectedClaimId.equals(claim.getId()))
            .findFirst()
            .orElse(filtered.isEmpty() ? null : filtered.getFirst());

        return new EvidenceOperationsSnapshot(
            now,
            filterOptions.options(),
            filtered.stream().map(this::summary).toList(),
            selected == null ? null : detail(selected));
    }

    private EvidenceClaimSummary summary(Claim claim) {
        return new EvidenceClaimSummary(
            claim.getId(),
            claim.getClaimNumber(),
            claim.getClaimantName(),
            claim.getClaimType(),
            claim.getStatus(),
            claim.getPriority(),
            claim.getRegion(),
            claim.getCompletenessPercentage(),
            claim.getSlaDeadline(),
            claim.getAssignedAdjuster() == null ? null : claim.getAssignedAdjuster().getDisplayName(),
            claim.getAssignedAdjuster() == null ? null : claim.getAssignedAdjuster().getTeam());
    }

    private EvidenceClaimDetail detail(Claim claim) {
        List<ClaimantMessage> claimantMessages = messages
            .findByClaim_IdAndAudienceOrderByCreatedAtAsc(claim.getId(), MessageAudience.CLAIMANT)
            .stream()
            .map(message -> new ClaimantMessage(
                message.getId(),
                message.getAuthor(),
                message.getAudience().name(),
                message.getBody(),
                message.getCreatedAt()))
            .toList();

        return new EvidenceClaimDetail(
            claim.getId(),
            claim.getClaimNumber(),
            claim.getClaimantName(),
            claim.getClaimantEmail(),
            claim.getClaimType(),
            claim.getStatus(),
            claim.getPriority(),
            claim.getRegion(),
            claim.getEstimatedLoss(),
            claim.getCompletenessPercentage(),
            claim.getSlaDeadline(),
            claim.getCreatedAt(),
            claim.getAssignedAdjuster() == null ? null : claim.getAssignedAdjuster().getDisplayName(),
            claim.getAssignedAdjuster() == null ? null : claim.getAssignedAdjuster().getTeam(),
            List.of(
                category("INCIDENT_REPORT", "Incident report", claim.isIncidentReportPresent()),
                category("PHOTOS", "Photos", claim.isPhotosPresent()),
                category("PROOF_OF_OWNERSHIP", "Proof of ownership", claim.isProofOfOwnershipPresent()),
                category("MEDICAL_DOCUMENTATION", "Medical documentation", claim.isMedicalDocumentationPresent())),
            claimantMessages);
    }

    private EvidenceCategory category(String kind, String label, boolean present) {
        return new EvidenceCategory(kind, label, present, present ? "Received" : "Outstanding");
    }

    private int rank(Claim claim, Instant now) {
        SlaState state = OperationalMetrics.slaState(claim, now);
        if (state == SlaState.OVERDUE) return 0;
        if (state == SlaState.AT_RISK) return 1;
        if (state == SlaState.CLOSED) return 6;
        if (claim.getPriority() == ClaimPriority.CRITICAL) return 2;
        if (claim.getPriority() == ClaimPriority.HIGH) return 3;
        if (claim.getCompletenessPercentage() < 100) return 4;
        return 5;
    }
}
