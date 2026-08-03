package com.claimsflow.operations.application;

import static com.claimsflow.operations.application.OperationalMetrics.SlaState.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimStatus;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class OperationalMetricsTest {
    private static final Instant NOW = Instant.parse("2026-08-03T12:00:00Z");

    @Test
    void classifiesOpenAndClosedClaims() {
        assertThat(OperationalMetrics.isOpen(claim(ClaimStatus.NEW, 50, NOW.plus(Duration.ofDays(1)), null))).isTrue();
        assertThat(OperationalMetrics.isOpen(claim(ClaimStatus.RESOLVED, 100, NOW, NOW))).isFalse();
        assertThat(OperationalMetrics.isOpen(claim(ClaimStatus.CLOSED, 100, NOW, NOW))).isFalse();
    }

    @Test
    void calculatesSafeRoundedPercentages() {
        assertThat(OperationalMetrics.percent(1, 3)).isEqualTo(33);
        assertThat(OperationalMetrics.percent(2, 3)).isEqualTo(67);
        assertThat(OperationalMetrics.percent(4, 0)).isZero();
    }

    @Test
    void averagesCompletenessAndHandlesEmptyInput() {
        assertThat(OperationalMetrics.averageCompleteness(List.of(
            claim(ClaimStatus.NEW, 50, NOW, null),
            claim(ClaimStatus.UNDER_REVIEW, 100, NOW, null)))).isEqualTo(75);
        assertThat(OperationalMetrics.averageCompleteness(List.of())).isZero();
    }

    @Test
    void classifiesExactSlaBoundaries() {
        Claim overdue = claim(ClaimStatus.NEW, 50, NOW.minusMillis(1), null);
        Claim exactDeadline = claim(ClaimStatus.NEW, 50, NOW, null);
        Claim exactRiskEdge = claim(ClaimStatus.NEW, 50, NOW.plus(Duration.ofHours(24)), null);
        Claim current = claim(ClaimStatus.NEW, 50, NOW.plus(Duration.ofHours(24)).plusMillis(1), null);
        Claim closed = claim(ClaimStatus.RESOLVED, 100, NOW.minus(Duration.ofDays(1)), NOW.minus(Duration.ofHours(2)));

        assertThat(OperationalMetrics.slaState(overdue, NOW)).isEqualTo(OVERDUE);
        assertThat(OperationalMetrics.slaState(exactDeadline, NOW)).isEqualTo(AT_RISK);
        assertThat(OperationalMetrics.slaState(exactRiskEdge, NOW)).isEqualTo(AT_RISK);
        assertThat(OperationalMetrics.slaState(current, NOW)).isEqualTo(CURRENT);
        assertThat(OperationalMetrics.slaState(closed, NOW)).isEqualTo(CLOSED);
    }

    @Test
    void calculatesResolvedClaimSlaCompliance() {
        Claim within = claim(ClaimStatus.RESOLVED, 100, NOW, NOW.minus(Duration.ofHours(1)));
        Claim late = claim(ClaimStatus.CLOSED, 100, NOW.minus(Duration.ofHours(2)), NOW);
        Claim open = claim(ClaimStatus.UNDER_REVIEW, 80, NOW.plus(Duration.ofDays(1)), null);

        assertThat(OperationalMetrics.slaCompliance(List.of(within, late, open))).isEqualTo(50);
        assertThat(OperationalMetrics.slaCompliance(List.of(open))).isEqualTo(100);
    }

    @Test
    void calculatesNonnegativeAgeDays() {
        Claim old = mock(Claim.class);
        when(old.getCreatedAt()).thenReturn(NOW.minus(Duration.ofDays(9)).minus(Duration.ofHours(2)));
        Claim future = mock(Claim.class);
        when(future.getCreatedAt()).thenReturn(NOW.plus(Duration.ofDays(1)));

        assertThat(OperationalMetrics.ageDays(old, NOW)).isEqualTo(9);
        assertThat(OperationalMetrics.ageDays(future, NOW)).isZero();
    }

    private Claim claim(
            ClaimStatus status,
            int completeness,
            Instant slaDeadline,
            Instant resolvedAt) {
        Claim claim = mock(Claim.class);
        when(claim.getStatus()).thenReturn(status);
        when(claim.getCompletenessPercentage()).thenReturn(completeness);
        when(claim.getSlaDeadline()).thenReturn(slaDeadline);
        when(claim.getResolvedAt()).thenReturn(resolvedAt);
        when(claim.getCreatedAt()).thenReturn(NOW.minus(Duration.ofDays(2)));
        return claim;
    }
}
