package com.claimsflow.team.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimStatus;
import com.claimsflow.operations.api.OperationalResponses;
import com.claimsflow.operations.api.OperationalResponses.OperationalFilterOptions;
import com.claimsflow.operations.application.OperationalFilterOptionsService;
import com.claimsflow.operations.application.OperationalFilters;
import com.claimsflow.operations.application.OperationalQueryService;
import com.claimsflow.team.api.TeamOperationsResponses.TeamOperationsSnapshot;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class TeamOperationsServiceTest {
    private static final Instant NOW = Instant.parse("2026-08-03T12:00:00Z");
    private static final UUID ALEX_ID = UUID.fromString("00000000-0000-0000-0000-000000000011");
    private static final UUID JORDAN_ID = UUID.fromString("00000000-0000-0000-0000-000000000012");

    private final OperationalQueryService query = mock(OperationalQueryService.class);
    private final AdjusterJpaRepository adjusters = mock(AdjusterJpaRepository.class);
    private final OperationalFilterOptionsService filterOptions = mock(OperationalFilterOptionsService.class);
    private final TeamOperationsService service = new TeamOperationsService(
        query,
        adjusters,
        filterOptions,
        Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void calculatesSelectedWorkloadCapacitySlaAndAdvisories() {
        Adjuster alex = adjuster(ALEX_ID, "Alex Morgan", "Claims Operations", 5);
        Adjuster jordan = adjuster(JORDAN_ID, "Jordan Lee", "Claims Operations", 5);
        Claim overdue = claim(
            "CLM-OVERDUE",
            ClaimStatus.UNDER_REVIEW,
            ClaimPriority.HIGH,
            NOW.minusSeconds(1),
            null,
            alex,
            50);
        Claim atRisk = claim(
            "CLM-RISK",
            ClaimStatus.NEW,
            ClaimPriority.MEDIUM,
            NOW.plus(Duration.ofHours(24)),
            null,
            null,
            75);
        Claim current = claim(
            "CLM-CURRENT",
            ClaimStatus.UNDER_REVIEW,
            ClaimPriority.CRITICAL,
            NOW.plus(Duration.ofHours(30)),
            null,
            jordan,
            100);
        Claim resolvedWithin = claim(
            "CLM-RESOLVED",
            ClaimStatus.RESOLVED,
            ClaimPriority.LOW,
            NOW.minus(Duration.ofHours(1)),
            NOW.minus(Duration.ofHours(2)),
            alex,
            100);
        Claim resolvedLate = claim(
            "CLM-LATE",
            ClaimStatus.CLOSED,
            ClaimPriority.LOW,
            NOW.minus(Duration.ofHours(3)),
            NOW.minus(Duration.ofHours(1)),
            jordan,
            100);
        OperationalFilterOptions options = OperationalResponses.options(List.of(alex, jordan));

        when(query.find(filters())).thenReturn(List.of(overdue, atRisk, current, resolvedWithin, resolvedLate));
        when(adjusters.findByActiveTrueOrderByDisplayNameAsc()).thenReturn(List.of(alex, jordan));
        when(filterOptions.options()).thenReturn(options);

        TeamOperationsSnapshot snapshot = service.snapshot(filters());

        assertThat(snapshot.kpis().activeClaims()).isEqualTo(3);
        assertThat(snapshot.kpis().atRiskClaims()).isEqualTo(1);
        assertThat(snapshot.kpis().overdueClaims()).isEqualTo(1);
        assertThat(snapshot.kpis().assignmentCoveragePercentage()).isEqualTo(67);
        assertThat(snapshot.kpis().overallUtilizationPercentage()).isEqualTo(20);
        assertThat(snapshot.kpis().slaCompliancePercentage()).isEqualTo(50);
        assertThat(snapshot.kpis().evidenceReadinessPercentage()).isEqualTo(85);

        assertThat(snapshot.adjusters()).extracting(item -> item.activeClaims()).containsExactly(1L, 1L);
        assertThat(snapshot.teams()).singleElement().satisfies(team -> {
            assertThat(team.name()).isEqualTo("Claims Operations");
            assertThat(team.activeClaims()).isEqualTo(2);
            assertThat(team.capacity()).isEqualTo(10);
            assertThat(team.utilizationPercentage()).isEqualTo(20);
            assertThat(team.slaCompliancePercentage()).isEqualTo(50);
        });

        assertThat(snapshot.escalations()).extracting(item -> item.claimNumber())
            .containsExactly("CLM-OVERDUE", "CLM-RISK", "CLM-CURRENT");
        assertThat(snapshot.escalations().get(0).reason()).isEqualTo("SLA overdue");
        assertThat(snapshot.escalations().get(1).reason()).isEqualTo("SLA due within 24 hours");

        assertThat(snapshot.advisories()).extracting(item -> item.title())
            .containsExactly("Overdue SLA intervention", "Ownership gap", "Evidence follow-up");
        assertThat(snapshot.advisories().get(0).queryParams()).containsEntry("sort", "slaDeadline,asc");
        assertThat(snapshot.advisories().get(1).queryParams()).containsEntry("assignment", "unassigned");
        assertThat(snapshot.integrity().overall()).isEqualTo(66);
        assertThat(snapshot.integrity().label()).isEqualTo("Watch");
    }

    @Test
    void usesOnlyTheSelectedAdjusterCapacityAndProducesAStableAdvisory() {
        Adjuster alex = adjuster(ALEX_ID, "Alex Morgan", "Claims Operations", 4);
        Adjuster jordan = adjuster(JORDAN_ID, "Jordan Lee", "Claims Operations", 8);
        OperationalFilters selected = new OperationalFilters(
            LocalDate.of(2026, 7, 1),
            LocalDate.of(2026, 8, 3),
            null,
            null,
            null,
            ALEX_ID,
            null,
            null,
            false);
        Claim current = claim(
            "CLM-STABLE",
            ClaimStatus.UNDER_REVIEW,
            ClaimPriority.LOW,
            NOW.plus(Duration.ofDays(3)),
            null,
            alex,
            100);
        OperationalFilterOptions options = OperationalResponses.options(List.of(alex, jordan));

        when(query.find(selected)).thenReturn(List.of(current));
        when(adjusters.findByActiveTrueOrderByDisplayNameAsc()).thenReturn(List.of(alex, jordan));
        when(filterOptions.options()).thenReturn(options);

        TeamOperationsSnapshot snapshot = service.snapshot(selected);

        assertThat(snapshot.kpis().overallUtilizationPercentage()).isEqualTo(25);
        assertThat(snapshot.adjusters()).singleElement().extracting(item -> item.adjusterId()).isEqualTo(ALEX_ID);
        assertThat(snapshot.advisories()).singleElement().satisfies(advisory -> {
            assertThat(advisory.title()).isEqualTo("Portfolio stable");
            assertThat(advisory.queryParams()).isEmpty();
        });
    }

    private OperationalFilters filters() {
        return new OperationalFilters(
            LocalDate.of(2026, 7, 1),
            LocalDate.of(2026, 8, 3),
            null,
            null,
            null,
            null,
            null,
            null,
            false);
    }

    private Adjuster adjuster(UUID id, String name, String team, int capacity) {
        Adjuster adjuster = mock(Adjuster.class);
        when(adjuster.getId()).thenReturn(id);
        when(adjuster.getDisplayName()).thenReturn(name);
        when(adjuster.getTeam()).thenReturn(team);
        when(adjuster.getWorkloadCapacity()).thenReturn(capacity);
        return adjuster;
    }

    private Claim claim(
            String number,
            ClaimStatus status,
            ClaimPriority priority,
            Instant deadline,
            Instant resolvedAt,
            Adjuster adjuster,
            int completeness) {
        Claim claim = mock(Claim.class);
        UUID id = UUID.nameUUIDFromBytes(number.getBytes());
        when(claim.getId()).thenReturn(id);
        when(claim.getClaimNumber()).thenReturn(number);
        when(claim.getClaimantName()).thenReturn(number + " Claimant");
        when(claim.getStatus()).thenReturn(status);
        when(claim.getPriority()).thenReturn(priority);
        when(claim.getSlaDeadline()).thenReturn(deadline);
        when(claim.getResolvedAt()).thenReturn(resolvedAt);
        when(claim.getAssignedAdjuster()).thenReturn(adjuster);
        when(claim.getCompletenessPercentage()).thenReturn(completeness);
        return claim;
    }
}
