package com.claimsflow.mywork.api;

import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimRegion;
import com.claimsflow.claim.domain.ClaimStatus;
import com.claimsflow.claim.domain.ClaimType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class MyWorkResponses {
    private MyWorkResponses() {}

    public record MyWorkSnapshot(
        Instant generatedAt,
        UUID adjusterId,
        String displayName,
        String team,
        int capacity,
        long activeClaims,
        long dueWithin24Hours,
        long overdueClaims,
        long evidenceBlockedClaims,
        int utilizationPercentage,
        List<WorkloadPoint> workloadTrend,
        List<MyWorkTimelineItem> timeline,
        List<MyWorkClaim> claims) {}

    public record WorkloadPoint(LocalDate date, long activeClaims) {}

    public record MyWorkTimelineItem(
        UUID claimId,
        String claimNumber,
        String claimantName,
        ClaimPriority priority,
        ClaimStatus status,
        Instant slaDeadline,
        int completenessPercentage,
        String group,
        String reason,
        String tone) {}

    public record MyWorkClaim(
        UUID id,
        String claimNumber,
        String claimantName,
        ClaimType claimType,
        ClaimRegion region,
        ClaimPriority priority,
        ClaimStatus status,
        Instant slaDeadline,
        int completenessPercentage,
        Instant createdAt,
        Instant updatedAt) {}
}
