package com.claimsflow.mywork.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimRegion;
import com.claimsflow.claim.domain.ClaimStatus;
import com.claimsflow.claim.domain.ClaimType;
import com.claimsflow.mywork.api.MyWorkResponses.MyWorkSnapshot;
import com.claimsflow.operations.application.OperationalQueryService;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class MyWorkServiceTest {
    private static final Instant NOW = Instant.parse("2026-08-03T12:00:00Z");
    private static final UUID ADJUSTER_ID = UUID.fromString("00000000-0000-0000-0000-000000000012");

    private final OperationalQueryService query = mock(OperationalQueryService.class);
    private final AdjusterJpaRepository adjusters = mock(AdjusterJpaRepository.class);
    private final MyWorkService service = new MyWorkService(
        query,
        adjusters,
        Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void buildsFullAdjusterWorkloadAndRanksTheNextHumanActions() {
        Adjuster jordan = adjuster();
        Claim overdue = claim(jordan, "CLM-OVERDUE", ClaimPriority.CRITICAL, NOW.minusSeconds(1), 50, NOW.minus(Duration.ofDays(4)), null);
        Claim atRisk = claim(jordan, "CLM-RISK", ClaimPriority.HIGH, NOW.plus(Duration.ofHours(12)), 75, NOW.minus(Duration.ofDays(2)), null);
        Claim later = claim(jordan, "CLM-LATER", ClaimPriority.MEDIUM, NOW.plus(Duration.ofDays(3)), 100, NOW.minus(Duration.ofDays(1)), null);
        Claim resolved = claim(jordan, "CLM-RESOLVED", ClaimPriority.LOW, NOW.minus(Duration.ofDays(1)), 100, NOW.minus(Duration.ofDays(6)), NOW.minus(Duration.ofDays(2)));

        when(adjusters.findById(ADJUSTER_ID)).thenReturn(Optional.of(jordan));
        when(query.find(any())).thenReturn(List.of(overdue, atRisk, later, resolved));

        MyWorkSnapshot snapshot = service.snapshot(ADJUSTER_ID);

        assertThat(snapshot.displayName()).isEqualTo("Jordan Lee");
        assertThat(snapshot.capacity()).isEqualTo(4);
        assertThat(snapshot.activeClaims()).isEqualTo(3);
        assertThat(snapshot.dueWithin24Hours()).isEqualTo(1);
        assertThat(snapshot.overdueClaims()).isEqualTo(1);
        assertThat(snapshot.evidenceBlockedClaims()).isEqualTo(2);
        assertThat(snapshot.utilizationPercentage()).isEqualTo(75);
        assertThat(snapshot.workloadTrend()).hasSize(7);
        assertThat(snapshot.timeline()).extracting(item -> item.claimNumber())
            .containsExactly("CLM-OVERDUE", "CLM-RISK", "CLM-LATER");
        assertThat(snapshot.timeline()).extracting(item -> item.group())
            .containsExactly("NOW", "NOW", "LATER");
        assertThat(snapshot.claims()).hasSize(3);
    }

    private Adjuster adjuster() {
        Adjuster adjuster = mock(Adjuster.class);
        when(adjuster.getId()).thenReturn(ADJUSTER_ID);
        when(adjuster.getDisplayName()).thenReturn("Jordan Lee");
        when(adjuster.getTeam()).thenReturn("Claims Operations");
        when(adjuster.getWorkloadCapacity()).thenReturn(4);
        return adjuster;
    }

    private Claim claim(
            Adjuster adjuster,
            String number,
            ClaimPriority priority,
            Instant deadline,
            int completeness,
            Instant createdAt,
            Instant resolvedAt) {
        Claim claim = mock(Claim.class);
        when(claim.getId()).thenReturn(UUID.nameUUIDFromBytes(number.getBytes()));
        when(claim.getClaimNumber()).thenReturn(number);
        when(claim.getClaimantName()).thenReturn(number + " Claimant");
        when(claim.getClaimType()).thenReturn(ClaimType.PROPERTY);
        when(claim.getRegion()).thenReturn(ClaimRegion.SOUTHEAST);
        when(claim.getStatus()).thenReturn(resolvedAt == null ? ClaimStatus.UNDER_REVIEW : ClaimStatus.RESOLVED);
        when(claim.getPriority()).thenReturn(priority);
        when(claim.getSlaDeadline()).thenReturn(deadline);
        when(claim.getCompletenessPercentage()).thenReturn(completeness);
        when(claim.getCreatedAt()).thenReturn(createdAt);
        when(claim.getUpdatedAt()).thenReturn(createdAt.plus(Duration.ofHours(2)));
        when(claim.getResolvedAt()).thenReturn(resolvedAt);
        when(claim.getAssignedAdjuster()).thenReturn(adjuster);
        return claim;
    }
}
