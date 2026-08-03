package com.claimsflow.evidence.api;

import com.claimsflow.claim.domain.*;
import com.claimsflow.operations.api.OperationalResponses.OperationalFilterOptions;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

public final class EvidenceOperationsResponses {
    private EvidenceOperationsResponses() {}

    public record EvidenceOperationsSnapshot(
        Instant generatedAt,
        OperationalFilterOptions options,
        List<EvidenceClaimSummary> claims,
        EvidenceClaimDetail selected) {}

    public record EvidenceClaimSummary(
        UUID id,
        String claimNumber,
        String claimantName,
        ClaimType claimType,
        ClaimStatus status,
        ClaimPriority priority,
        ClaimRegion region,
        int completenessPercentage,
        Instant slaDeadline,
        String adjusterName,
        String team) {}

    public record EvidenceClaimDetail(
        UUID id,
        String claimNumber,
        String claimantName,
        String claimantEmail,
        ClaimType claimType,
        ClaimStatus status,
        ClaimPriority priority,
        ClaimRegion region,
        BigDecimal estimatedLoss,
        int completenessPercentage,
        Instant slaDeadline,
        Instant createdAt,
        String adjusterName,
        String team,
        List<EvidenceCategory> evidence,
        List<ClaimantMessage> claimantMessages) {}

    public record EvidenceCategory(
        String kind,
        String label,
        boolean present,
        String state) {}

    public record ClaimantMessage(
        UUID id,
        String author,
        String audience,
        String body,
        Instant createdAt) {}
}
