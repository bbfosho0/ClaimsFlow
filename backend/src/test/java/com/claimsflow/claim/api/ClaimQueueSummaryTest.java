package com.claimsflow.claim.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimStatus;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class ClaimQueueSummaryTest {
    private static final Instant NOW = Instant.parse("2026-08-03T12:00:00Z");

    @Test
    void summarizesTheCompleteFilteredSetAndKeepsAtRiskSeparateFromOverdue() {
        Claim atRisk = claim(ClaimStatus.NEW, ClaimPriority.HIGH, NOW.plusSeconds(24 * 3_600L), 75, false);
        Claim overdue = claim(ClaimStatus.UNDER_REVIEW, ClaimPriority.CRITICAL, NOW, 25, true);
        Claim resolved = claim(ClaimStatus.RESOLVED, ClaimPriority.MEDIUM, NOW.minusSeconds(3_600L), 100, false);

        ClaimResponses.QueueSummary summary = ClaimResponses.queueSummary(List.of(atRisk, overdue, resolved), NOW);

        assertThat(summary.totalMatching()).isEqualTo(3);
        assertThat(summary.atRiskClaims()).isEqualTo(1);
        assertThat(summary.overdueClaims()).isEqualTo(1);
        assertThat(summary.unassignedClaims()).isEqualTo(1);
        assertThat(summary.evidenceReadinessPercentage()).isEqualTo(50);
        assertThat(summary.priorityDistribution()).filteredOn(point -> point.count() > 0)
            .extracting(ClaimResponses.DistributionPoint::key)
            .containsExactlyInAnyOrder("HIGH", "CRITICAL", "MEDIUM");
    }

    private Claim claim(
            ClaimStatus status,
            ClaimPriority priority,
            Instant deadline,
            int completeness,
            boolean unassigned) {
        Claim claim = mock(Claim.class);
        when(claim.getStatus()).thenReturn(status);
        when(claim.getPriority()).thenReturn(priority);
        when(claim.getSlaDeadline()).thenReturn(deadline);
        when(claim.getCompletenessPercentage()).thenReturn(completeness);
        when(claim.getAssignedAdjuster()).thenReturn(unassigned ? null : mock(com.claimsflow.adjuster.domain.Adjuster.class));
        return claim;
    }
}
