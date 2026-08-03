package com.claimsflow.dashboard.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimStatus;
import com.claimsflow.operations.application.OperationalQueryService;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class DashboardServiceTest {
    private static final Instant NOW = Instant.parse("2026-08-03T12:00:00Z");

    private final OperationalQueryService operational = mock(OperationalQueryService.class);
    private final AdjusterJpaRepository adjusters = mock(AdjusterJpaRepository.class);
    private final AuditService audit = mock(AuditService.class);
    private final DashboardService service = new DashboardService(
        operational,
        adjusters,
        audit,
        Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void buildsTruthfulPortfolioKpisTrendsAndDistributions() {
        Adjuster jordan = adjuster("Jordan Lee", "Property", 4);
        Claim openReady = claim(
            "CF-1001",
            NOW.minusSeconds(5 * 86_400L),
            null,
            NOW.plusSeconds(8 * 3_600L),
            ClaimStatus.UNDER_REVIEW,
            ClaimPriority.HIGH,
            100,
            "25000.00",
            jordan);
        Claim openOverdue = claim(
            "CF-1002",
            NOW.minusSeconds(12 * 86_400L),
            null,
            NOW.minusSeconds(2 * 3_600L),
            ClaimStatus.WAITING_FOR_INFORMATION,
            ClaimPriority.CRITICAL,
            50,
            "40000.00",
            null);
        Claim resolved = claim(
            "CF-1003",
            NOW.minusSeconds(18 * 86_400L),
            NOW.minusSeconds(2 * 86_400L),
            NOW.minusSeconds(3 * 86_400L),
            ClaimStatus.RESOLVED,
            ClaimPriority.MEDIUM,
            100,
            "10000.00",
            jordan);

        when(operational.findAllForDashboard()).thenReturn(List.of(openReady, openOverdue, resolved));
        when(adjusters.findByActiveTrueOrderByDisplayNameAsc()).thenReturn(List.of(jordan));
        when(audit.recent()).thenReturn(List.of());

        DashboardService.DashboardSnapshot snapshot = service.snapshot();

        assertThat(snapshot.openClaims()).isEqualTo(2);
        assertThat(snapshot.estimatedExposure()).isEqualByComparingTo("65000.00");
        assertThat(snapshot.overallUtilizationPercentage()).isEqualTo(25);
        assertThat(snapshot.resolvedThisPeriod()).isEqualTo(1);
        assertThat(snapshot.slaRiskClaims()).isEqualTo(1);
        assertThat(snapshot.overdueClaims()).isEqualTo(1);
        assertThat(snapshot.openPortfolioTrend()).hasSize(30);
        assertThat(snapshot.createdTrend()).hasSize(30);
        assertThat(snapshot.createdTrend().stream().mapToLong(DashboardService.TimePoint::value).sum()).isEqualTo(3);
        assertThat(snapshot.resolvedTrend()).hasSize(30);
        assertThat(snapshot.resolvedTrend().stream().mapToLong(DashboardService.TimePoint::value).sum()).isEqualTo(1);
        assertThat(snapshot.exposureTrend()).hasSize(30);
        assertThat(snapshot.slaPressureTrend()).hasSize(14);
        assertThat(snapshot.evidenceReadinessBands()).extracting(DashboardService.DistributionPoint::key)
            .containsExactly("0_49", "50_74", "75_99", "COMPLETE");
        assertThat(snapshot.priorityDistribution()).filteredOn(point -> point.count() > 0)
            .extracting(DashboardService.DistributionPoint::key)
            .containsExactlyInAnyOrder("CRITICAL", "HIGH");
        assertThat(snapshot.slaDeadlineBands()).extracting(DashboardService.DistributionPoint::key)
            .containsExactly("OVERDUE", "DUE_24H", "DUE_1_3D", "DUE_4_7D", "DUE_LATER");
        assertThat(snapshot.comparison().estimatedExposure().kind()).isNotBlank();
    }

    @Test
    void classifiesExactlyNowAsOverdueAndExactlyTwentyFourHoursAsAtRisk() {
        Claim exactlyNow = claim("CF-2001", NOW.minusSeconds(86_400), null, NOW, ClaimStatus.NEW, ClaimPriority.MEDIUM, 100, "100.00", null);
        Claim exactly24Hours = claim("CF-2002", NOW.minusSeconds(86_400), null, NOW.plusSeconds(24 * 3_600L), ClaimStatus.NEW, ClaimPriority.MEDIUM, 100, "100.00", null);
        when(operational.findAllForDashboard()).thenReturn(List.of(exactlyNow, exactly24Hours));
        when(adjusters.findByActiveTrueOrderByDisplayNameAsc()).thenReturn(List.of());
        when(audit.recent()).thenReturn(List.of());

        DashboardService.DashboardSnapshot snapshot = service.snapshot();

        assertThat(snapshot.overdueClaims()).isEqualTo(1);
        assertThat(snapshot.slaRiskClaims()).isEqualTo(1);
    }

    private Adjuster adjuster(String name, String team, int capacity) {
        Adjuster adjuster = mock(Adjuster.class);
        when(adjuster.getId()).thenReturn(UUID.nameUUIDFromBytes(name.getBytes()));
        when(adjuster.getDisplayName()).thenReturn(name);
        when(adjuster.getTeam()).thenReturn(team);
        when(adjuster.getWorkloadCapacity()).thenReturn(capacity);
        return adjuster;
    }

    private Claim claim(
            String claimNumber,
            Instant createdAt,
            Instant resolvedAt,
            Instant deadline,
            ClaimStatus status,
            ClaimPriority priority,
            int completeness,
            String loss,
            Adjuster adjuster) {
        Claim claim = mock(Claim.class);
        when(claim.getClaimNumber()).thenReturn(claimNumber);
        when(claim.getCreatedAt()).thenReturn(createdAt);
        when(claim.getResolvedAt()).thenReturn(resolvedAt);
        when(claim.getSlaDeadline()).thenReturn(deadline);
        when(claim.getStatus()).thenReturn(status);
        when(claim.getPriority()).thenReturn(priority);
        when(claim.getCompletenessPercentage()).thenReturn(completeness);
        when(claim.getEstimatedLoss()).thenReturn(new BigDecimal(loss));
        when(claim.getAssignedAdjuster()).thenReturn(adjuster);
        return claim;
    }
}
