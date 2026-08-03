package com.claimsflow.evidence.application;

import com.claimsflow.claim.domain.*;
import com.claimsflow.evidence.api.EvidenceOperationsResponses.*;
import com.claimsflow.operations.application.*;
import com.claimsflow.portal.domain.MessageAudience;
import com.claimsflow.portal.persistence.ClaimMessageJpaRepository;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EvidenceOperationsService {
    private final OperationalQueryService query;
    private final ClaimMessageJpaRepository messages;
    private final Clock clock;

    public EvidenceOperationsService(
            OperationalQueryService query,
            ClaimMessageJpaRepository messages,
            Clock clock) {
        this.query = query;
        this.messages = messages;
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
            query.options(),
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
        if (claim.getSlaDeadline().isBefore(now)) return 0;
        if (!claim.getSlaDeadline().isAfter(now.plus(Duration.ofHours(24)))) return 1;
        if (claim.getPriority() == ClaimPriority.CRITICAL) return 2;
        if (claim.getPriority() == ClaimPriority.HIGH) return 3;
        if (claim.getCompletenessPercentage() < 100) return 4;
        return 5;
    }
}
