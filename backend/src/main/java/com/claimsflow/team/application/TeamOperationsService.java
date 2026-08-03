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
import com.claimsflow.team.api.TeamOperationsResponses.CapacityTrendPoint;
import com.claimsflow.team.api.TeamOperationsResponses.DistributionPoint;
import com.claimsflow.team.api.TeamOperationsResponses.Escalation;
import com.claimsflow.team.api.TeamOperationsResponses.IntegrityScore;
import com.claimsflow.team.api.TeamOperationsResponses.TeamKpis;
import com.claimsflow.team.api.TeamOperationsResponses.TeamOperationsSnapshot;
import com.claimsflow.team.api.TeamOperationsResponses.TeamPriorityMix;
import com.claimsflow.team.api.TeamOperationsResponses.TeamSlaPerformance;
import com.claimsflow.team.api.TeamOperationsResponses.TeamWorkload;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
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

        List<AdjusterWorkload> adjusterWorkloads = activeAdjusters.stream()
            .map(adjuster -> adjusterWorkload(adjuster, claims, openClaims, now))
            .sorted(Comparator
                .comparingInt(AdjusterWorkload::utilizationPercentage)
                .reversed()
                .thenComparing(AdjusterWorkload::displayName))
            .toList();

        Map<String, List<Adjuster>> adjustersByTeam = activeAdjusters.stream()
            .collect(Collectors.groupingBy(Adjuster::getTeam, TreeMap::new, Collectors.toList()));
        List<TeamWorkload> teamWorkloads = adjustersByTeam.entrySet().stream()
            .map(entry -> teamWorkload(entry.getKey(), entry.getValue(), claims, openClaims, now))
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
            integrity,
            teamPriorityMix(adjustersByTeam, claims),
            teamSlaPerformance(adjustersByTeam, claims),
            capacityTrend(claims, activeAdjusters, now));
    }

    private List<Adjuster> selectedActiveAdjusters(OperationalFilters filters) {
        return adjusterRepository.findByActiveTrueOrderByDisplayNameAsc().stream()
            .filter(adjuster -> filters.team() == null || filters.team().equals(adjuster.getTeam()))
            .filter(adjuster -> filters.adjusterId() == null || filters.adjusterId().equals(adjuster.getId()))
            .toList();
    }

    private AdjusterWorkload adjusterWorkload(
            Adjuster adjuster,
            List<Claim> allClaims,
            List<Claim> openClaims,
            Instant now) {
        List<Claim> assignedClaims = allClaims.stream()
            .filter(claim -> claim.getAssignedAdjuster() != null)
            .filter(claim -> adjuster.getId().equals(claim.getAssignedAdjuster().getId()))
            .toList();
        List<Claim> assignedOpen = openClaims.stream()
            .filter(claim -> claim.getAssignedAdjuster() != null)
            .filter(claim -> adjuster.getId().equals(claim.getAssignedAdjuster().getId()))
            .toList();
        return new AdjusterWorkload(
            adjuster.getId(),
            adjuster.getDisplayName(),
            adjuster.getTeam(),
            assignedOpen.size(),
            adjuster.getWorkloadCapacity(),
            Math.min(100, OperationalMetrics.percent(assignedOpen.size(), adjuster.getWorkloadCapacity())),
            countSla(assignedOpen, now, SlaState.AT_RISK),
            countSla(assignedOpen, now, SlaState.OVERDUE),
            assignedOpen.stream().filter(this::isHighPriority).count(),
            OperationalMetrics.averageCompleteness(assignedClaims),
            assignedOpen.stream().map(Claim::getSlaDeadline).min(Instant::compareTo).orElse(null));
    }

    private TeamWorkload teamWorkload(
            String team,
            List<Adjuster> adjusters,
            List<Claim> allClaims,
            List<Claim> openClaims,
            Instant now) {
        Set<UUID> ids = adjusters.stream().map(Adjuster::getId).collect(Collectors.toSet());
        List<Claim> teamClaims = allClaims.stream()
            .filter(claim -> isAssignedTo(claim, ids))
            .toList();
        List<Claim> teamOpenClaims = openClaims.stream()
            .filter(claim -> isAssignedTo(claim, ids))
            .toList();
        int capacity = adjusters.stream().mapToInt(Adjuster::getWorkloadCapacity).sum();
        return new TeamWorkload(
            team,
            teamOpenClaims.size(),
            capacity,
            Math.min(100, OperationalMetrics.percent(teamOpenClaims.size(), capacity)),
            OperationalMetrics.averageCompleteness(teamClaims),
            OperationalMetrics.slaCompliance(teamClaims),
            countSla(teamOpenClaims, now, SlaState.AT_RISK),
            countSla(teamOpenClaims, now, SlaState.OVERDUE),
            teamOpenClaims.stream().filter(this::isHighPriority).count(),
            teamOpenClaims.stream().map(Claim::getSlaDeadline).min(Instant::compareTo).orElse(null));
    }

    private List<TeamPriorityMix> teamPriorityMix(Map<String, List<Adjuster>> adjustersByTeam, List<Claim> claims) {
        return adjustersByTeam.entrySet().stream().map(entry -> {
            Set<UUID> ids = entry.getValue().stream().map(Adjuster::getId).collect(Collectors.toSet());
            List<Claim> teamClaims = claims.stream().filter(claim -> isAssignedTo(claim, ids)).toList();
            Map<ClaimPriority, Long> counts = teamClaims.stream().collect(Collectors.groupingBy(
                Claim::getPriority,
                () -> new EnumMap<>(ClaimPriority.class),
                Collectors.counting()));
            List<DistributionPoint> segments = Arrays.stream(ClaimPriority.values())
                .map(priority -> new DistributionPoint(
                    priority.name(),
                    humanize(priority.name()),
                    counts.getOrDefault(priority, 0L),
                    OperationalMetrics.percent(counts.getOrDefault(priority, 0L), teamClaims.size())))
                .toList();
            return new TeamPriorityMix(entry.getKey(), segments);
        }).toList();
    }

    private List<TeamSlaPerformance> teamSlaPerformance(Map<String, List<Adjuster>> adjustersByTeam, List<Claim> claims) {
        return adjustersByTeam.entrySet().stream().map(entry -> {
            Set<UUID> ids = entry.getValue().stream().map(Adjuster::getId).collect(Collectors.toSet());
            List<Claim> resolved = claims.stream()
                .filter(claim -> isAssignedTo(claim, ids))
                .filter(claim -> claim.getResolvedAt() != null)
                .toList();
            Integer compliance = resolved.isEmpty() ? null : OperationalMetrics.slaCompliance(resolved);
            return new TeamSlaPerformance(entry.getKey(), compliance, resolved.size());
        }).toList();
    }

    private List<CapacityTrendPoint> capacityTrend(List<Claim> claims, List<Adjuster> adjusters, Instant now) {
        int capacity = adjusters.stream().mapToInt(Adjuster::getWorkloadCapacity).sum();
        Set<UUID> ids = adjusters.stream().map(Adjuster::getId).collect(Collectors.toSet());
        LocalDate end = LocalDate.ofInstant(now, ZoneOffset.UTC);
        LocalDate start = end.minusDays(29);
        return start.datesUntil(end.plusDays(1)).map(date -> {
            Instant asOf = date.equals(end)
                ? now
                : date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant().minusNanos(1);
            long activeAssigned = claims.stream()
                .filter(claim -> !claim.getCreatedAt().isAfter(asOf))
                .filter(claim -> claim.getResolvedAt() == null || claim.getResolvedAt().isAfter(asOf))
                .filter(claim -> isAssignedTo(claim, ids))
                .count();
            return new CapacityTrendPoint(date, Math.min(100, OperationalMetrics.percent(activeAssigned, capacity)));
        }).toList();
    }

    private long countSla(List<Claim> claims, Instant now, SlaState state) {
        return claims.stream().filter(claim -> OperationalMetrics.slaState(claim, now) == state).count();
    }

    private boolean isHighPriority(Claim claim) {
        return claim.getPriority() == ClaimPriority.HIGH || claim.getPriority() == ClaimPriority.CRITICAL;
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

    private String humanize(String value) {
        String text = value.toLowerCase(Locale.ROOT).replace('_', ' ');
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }
}
