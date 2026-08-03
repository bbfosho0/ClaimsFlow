package com.claimsflow.team.application;

import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.operations.application.OperationalFilterOptionsService;
import com.claimsflow.operations.application.OperationalFilters;
import com.claimsflow.operations.application.OperationalMetrics;
import com.claimsflow.operations.application.OperationalMetrics.SlaState;
import com.claimsflow.operations.application.OperationalQueryService;
import com.claimsflow.team.api.TeamOperationsResponses.AdjusterWorkload;
import com.claimsflow.team.api.TeamOperationsResponses.Advisory;
import com.claimsflow.team.api.TeamOperationsResponses.Escalation;
import com.claimsflow.team.api.TeamOperationsResponses.IntegrityScore;
import com.claimsflow.team.api.TeamOperationsResponses.TeamKpis;
import com.claimsflow.team.api.TeamOperationsResponses.TeamOperationsSnapshot;
import com.claimsflow.team.api.TeamOperationsResponses.TeamWorkload;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeamOperationsService {
    private final OperationalQueryService query;
    private final AdjusterJpaRepository adjusterRepository;
    private final OperationalFilterOptionsService filterOptions;
    private final Clock clock;

    public TeamOperationsService(
            OperationalQueryService query,
            AdjusterJpaRepository adjusterRepository,
            OperationalFilterOptionsService filterOptions,
            Clock clock) {
        this.query = query;
        this.adjusterRepository = adjusterRepository;
        this.filterOptions = filterOptions;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public TeamOperationsSnapshot snapshot(OperationalFilters filters) {
        Instant now = clock.instant();
        List<Claim> claims = query.find(filters);
        List<Claim> openClaims = claims.stream().filter(OperationalMetrics::isOpen).toList();
        List<Adjuster> activeAdjusters = selectedActiveAdjusters(filters);

        long atRisk = openClaims.stream()
            .filter(claim -> OperationalMetrics.slaState(claim, now) == SlaState.AT_RISK)
            .count();
        long overdue = openClaims.stream()
            .filter(claim -> OperationalMetrics.slaState(claim, now) == SlaState.OVERDUE)
            .count();
        long assigned = openClaims.stream().filter(claim -> claim.getAssignedAdjuster() != null).count();
        int readiness = OperationalMetrics.averageCompleteness(claims);
        int assignmentCoverage = OperationalMetrics.percent(assigned, openClaims.size());
        int slaCompliance = OperationalMetrics.slaCompliance(claims);
        int totalCapacity = activeAdjusters.stream().mapToInt(Adjuster::getWorkloadCapacity).sum();
        int utilization = Math.min(100, OperationalMetrics.percent(assigned, totalCapacity));

        Map<UUID, Long> activeByAdjuster = openClaims.stream()
            .filter(claim -> claim.getAssignedAdjuster() != null)
            .collect(Collectors.groupingBy(
                claim -> claim.getAssignedAdjuster().getId(),
                Collectors.counting()));

        List<AdjusterWorkload> adjusterWorkloads = activeAdjusters.stream()
            .map(adjuster -> adjusterWorkload(adjuster, activeByAdjuster))
            .sorted(Comparator
                .comparingInt(AdjusterWorkload::utilizationPercentage)
                .reversed()
                .thenComparing(AdjusterWorkload::displayName))
            .toList();

        Map<String, List<Adjuster>> adjustersByTeam = activeAdjusters.stream()
            .collect(Collectors.groupingBy(Adjuster::getTeam, TreeMap::new, Collectors.toList()));
        List<TeamWorkload> teamWorkloads = adjustersByTeam.entrySet().stream()
            .map(entry -> teamWorkload(entry.getKey(), entry.getValue(), claims, openClaims))
            .toList();

        List<Escalation> escalations = openClaims.stream()
            .filter(claim -> isEscalation(claim, now))
            .sorted(Comparator
                .comparingInt((Claim claim) -> escalationRank(claim, now))
                .thenComparing(Claim::getSlaDeadline)
                .thenComparing(Claim::getClaimNumber))
            .limit(10)
            .map(claim -> escalation(claim, now))
            .toList();

        long incompleteOpenClaims = openClaims.stream()
            .filter(claim -> claim.getCompletenessPercentage() < 100)
            .count();
        List<Advisory> advisories = advisories(
            overdue,
            atRisk,
            openClaims.size() - assigned,
            incompleteOpenClaims);
        int overall = Math.round(
            slaCompliance * 0.40f
                + readiness * 0.30f
                + assignmentCoverage * 0.30f);
        IntegrityScore integrity = new IntegrityScore(
            overall,
            slaCompliance,
            readiness,
            assignmentCoverage,
            integrityLabel(overall));

        return new TeamOperationsSnapshot(
            now,
            filterOptions.options(),
            new TeamKpis(
                openClaims.size(),
                atRisk,
                overdue,
                slaCompliance,
                readiness,
                assignmentCoverage,
                utilization),
            teamWorkloads,
            adjusterWorkloads,
            escalations,
            advisories,
            integrity);
    }

    private List<Adjuster> selectedActiveAdjusters(OperationalFilters filters) {
        return adjusterRepository.findByActiveTrueOrderByDisplayNameAsc().stream()
            .filter(adjuster -> filters.team() == null || filters.team().equals(adjuster.getTeam()))
            .filter(adjuster -> filters.adjusterId() == null || filters.adjusterId().equals(adjuster.getId()))
            .toList();
    }

    private AdjusterWorkload adjusterWorkload(Adjuster adjuster, Map<UUID, Long> activeByAdjuster) {
        long activeClaims = activeByAdjuster.getOrDefault(adjuster.getId(), 0L);
        return new AdjusterWorkload(
            adjuster.getId(),
            adjuster.getDisplayName(),
            adjuster.getTeam(),
            activeClaims,
            adjuster.getWorkloadCapacity(),
            Math.min(100, OperationalMetrics.percent(activeClaims, adjuster.getWorkloadCapacity())));
    }

    private TeamWorkload teamWorkload(
            String team,
            List<Adjuster> adjusters,
            List<Claim> allClaims,
            List<Claim> openClaims) {
        Set<UUID> ids = adjusters.stream().map(Adjuster::getId).collect(Collectors.toSet());
        List<Claim> teamClaims = allClaims.stream()
            .filter(claim -> isAssignedTo(claim, ids))
            .toList();
        long activeClaims = openClaims.stream()
            .filter(claim -> isAssignedTo(claim, ids))
            .count();
        int capacity = adjusters.stream().mapToInt(Adjuster::getWorkloadCapacity).sum();
        return new TeamWorkload(
            team,
            activeClaims,
            capacity,
            Math.min(100, OperationalMetrics.percent(activeClaims, capacity)),
            OperationalMetrics.averageCompleteness(teamClaims),
            OperationalMetrics.slaCompliance(teamClaims));
    }

    private boolean isAssignedTo(Claim claim, Set<UUID> ids) {
        return claim.getAssignedAdjuster() != null
            && ids.contains(claim.getAssignedAdjuster().getId());
    }

    private boolean isEscalation(Claim claim, Instant now) {
        SlaState state = OperationalMetrics.slaState(claim, now);
        return state == SlaState.OVERDUE
            || state == SlaState.AT_RISK
            || claim.getPriority() == ClaimPriority.CRITICAL;
    }

    private List<Advisory> advisories(long overdue, long atRisk, long unassigned, long incomplete) {
        List<Advisory> result = new ArrayList<>();
        if (overdue > 0) {
            result.add(new Advisory(
                "Overdue SLA intervention",
                overdue + " claims have passed their SLA deadline.",
                "/app/claims",
                Map.of("sort", "slaDeadline,asc"),
                "critical"));
        } else if (atRisk > 0) {
            result.add(new Advisory(
                "SLA pressure",
                atRisk + " claims enter deadline risk within 24 hours.",
                "/app/claims",
                Map.of("sort", "slaDeadline,asc"),
                "warning"));
        }
        if (unassigned > 0) {
            result.add(new Advisory(
                "Ownership gap",
                unassigned + " active claims need an assigned reviewer.",
                "/app/claims",
                Map.of("assignment", "unassigned"),
                "live"));
        }
        if (incomplete > 0) {
            result.add(new Advisory(
                "Evidence follow-up",
                incomplete + " active claims have incomplete evidence.",
                "/app/claims",
                Map.of("sort", "completenessPercentage,asc"),
                "advisory"));
        }
        if (result.isEmpty()) {
            result.add(new Advisory(
                "Portfolio stable",
                "No immediate operational intervention is required.",
                "/app/claims",
                Map.of(),
                "healthy"));
        }
        return List.copyOf(result);
    }

    private Escalation escalation(Claim claim, Instant now) {
        SlaState state = OperationalMetrics.slaState(claim, now);
        String reason = switch (state) {
            case OVERDUE -> "SLA overdue";
            case AT_RISK -> "SLA due within 24 hours";
            default -> "Critical-priority review";
        };
        String tone = switch (state) {
            case OVERDUE -> "critical";
            case AT_RISK -> "warning";
            default -> "advisory";
        };
        return new Escalation(
            claim.getId(),
            claim.getClaimNumber(),
            claim.getClaimantName(),
            claim.getPriority(),
            claim.getStatus(),
            claim.getSlaDeadline(),
            reason,
            tone);
    }

    private int escalationRank(Claim claim, Instant now) {
        return switch (OperationalMetrics.slaState(claim, now)) {
            case OVERDUE -> 0;
            case AT_RISK -> 1;
            default -> claim.getPriority() == ClaimPriority.CRITICAL ? 2 : 3;
        };
    }

    private String integrityLabel(int score) {
        if (score >= 90) return "Excellent";
        if (score >= 75) return "Healthy";
        if (score >= 60) return "Watch";
        return "Intervention required";
    }
}
