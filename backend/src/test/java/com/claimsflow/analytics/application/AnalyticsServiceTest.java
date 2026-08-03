package com.claimsflow.analytics.application;

import static com.claimsflow.operations.application.MetricChange.ChangeKind.NEW;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.claimsflow.analytics.api.AnalyticsResponses.AnalyticsSnapshot;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimRegion;
import com.claimsflow.claim.domain.ClaimStatus;
import com.claimsflow.operations.api.OperationalResponses;
import com.claimsflow.operations.application.OperationalFilters;
import com.claimsflow.operations.application.OperationalQueryService;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

class AnalyticsServiceTest {
    private static final Instant NOW = Instant.parse("2026-08-03T12:00:00Z");
    private static final LocalDate FROM = LocalDate.of(2026, 7, 1);
    private static final LocalDate TO = LocalDate.of(2026, 7, 7);

    private final OperationalQueryService query = mock(OperationalQueryService.class);
    private final AnalyticsService service = new AnalyticsService(
        query,
        Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void buildsCurrentPeriodAnalyticsAndTruthfulNewComparisons() {
        OperationalFilters filters = filters(FROM, TO);
        Claim resolved = claim(
            Instant.parse("2026-07-01T10:00:00Z"),
            Instant.parse("2026-07-03T10:00:00Z"),
            Instant.parse("2026-07-04T10:00:00Z"),
            ClaimStatus.RESOLVED,
            ClaimPriority.HIGH,
            ClaimRegion.WEST,
            100,
            "1000.00");
        Claim open = claim(
            Instant.parse("2026-07-02T10:00:00Z"),
            null,
            Instant.parse("2026-08-04T10:00:00Z"),
            ClaimStatus.NEW,
            ClaimPriority.MEDIUM,
            ClaimRegion.SOUTHEAST,
            50,
            "500.00");

        when(query.find(any())).thenAnswer(invocation -> {
            OperationalFilters requested = invocation.getArgument(0);
            return requested.from().equals(FROM) ? List.of(resolved, open) : List.of();
        });
        when(query.options()).thenReturn(OperationalResponses.options(List.of()));

        AnalyticsSnapshot snapshot = service.snapshot(filters);

        assertThat(snapshot.kpis().totalClaims()).isEqualTo(2);
        assertThat(snapshot.kpis().openClaims()).isEqualTo(1);
        assertThat(snapshot.kpis().resolvedClaims()).isEqualTo(1);
        assertThat(snapshot.kpis().estimatedExposure()).isEqualByComparingTo("1500.00");
        assertThat(snapshot.kpis().averageResolutionHours()).isEqualTo(48.0);
        assertThat(snapshot.kpis().evidenceReadinessPercentage()).isEqualTo(75);
        assertThat(snapshot.kpis().slaCompliancePercentage()).isEqualTo(100);

        assertThat(snapshot.comparison().claimVolumeChange().kind()).isEqualTo(NEW);
        assertThat(snapshot.comparison().claimVolumeChange().percentage()).isNull();
        assertThat(snapshot.comparison().exposureChange().kind()).isEqualTo(NEW);
        assertThat(snapshot.comparison().resolutionTimeChange().kind()).isEqualTo(NEW);

        assertThat(snapshot.claimVolume()).hasSize(7);
        assertThat(snapshot.claimVolume().get(0).count()).isEqualTo(1);
        assertThat(snapshot.claimVolume().get(1).count()).isEqualTo(1);
        assertThat(snapshot.resolvedVolume()).filteredOn(point -> point.count() > 0).singleElement()
            .extracting(point -> point.date())
            .isEqualTo(LocalDate.of(2026, 7, 3));
        assertThat(snapshot.statusDistribution()).extracting(point -> point.key())
            .containsExactly("NEW", "UNDER_REVIEW", "WAITING_FOR_INFORMATION", "READY_FOR_DECISION", "RESOLVED", "CLOSED");
        assertThat(snapshot.regionDistribution()).filteredOn(point -> point.count() > 0)
            .extracting(point -> point.key())
            .containsExactly("SOUTHEAST", "WEST");
        assertThat(snapshot.cohorts()).hasSize(1);
        assertThat(snapshot.cohorts().getFirst().resolvedWithin7DaysPercentage()).isEqualTo(50);
    }

    @Test
    void supportsSingleDayAndEmptyDatasetsWithoutInvalidValues() {
        LocalDate day = LocalDate.of(2026, 8, 3);
        OperationalFilters filters = filters(day, day);
        when(query.find(any())).thenReturn(List.of());
        when(query.options()).thenReturn(OperationalResponses.options(List.of()));

        AnalyticsSnapshot snapshot = service.snapshot(filters);

        assertThat(snapshot.claimVolume()).hasSize(1);
        assertThat(snapshot.claimVolume().getFirst().count()).isZero();
        assertThat(snapshot.kpis().averageResolutionHours()).isZero();
        assertThat(snapshot.kpis().evidenceReadinessPercentage()).isZero();
        assertThat(snapshot.kpis().slaCompliancePercentage()).isEqualTo(100);
        assertThat(snapshot.agingBands()).allMatch(point -> point.count() == 0 && point.percentage() == 0);
        assertThat(snapshot.cohorts()).isEmpty();
    }

    private OperationalFilters filters(LocalDate from, LocalDate to) {
        return new OperationalFilters(from, to, null, null, null, null, null, null, false);
    }

    private Claim claim(
            Instant createdAt,
            Instant resolvedAt,
            Instant slaDeadline,
            ClaimStatus status,
            ClaimPriority priority,
            ClaimRegion region,
            int completeness,
            String estimatedLoss) {
        Claim claim = mock(Claim.class);
        when(claim.getCreatedAt()).thenReturn(createdAt);
        when(claim.getResolvedAt()).thenReturn(resolvedAt);
        when(claim.getSlaDeadline()).thenReturn(slaDeadline);
        when(claim.getStatus()).thenReturn(status);
        when(claim.getPriority()).thenReturn(priority);
        when(claim.getRegion()).thenReturn(region);
        when(claim.getCompletenessPercentage()).thenReturn(completeness);
        when(claim.getEstimatedLoss()).thenReturn(new BigDecimal(estimatedLoss));
        return claim;
    }
}
