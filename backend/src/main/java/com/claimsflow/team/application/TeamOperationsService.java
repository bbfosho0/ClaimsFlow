package com.claimsflow.team.application;

import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.claim.domain.*;
import com.claimsflow.operations.application.*;
import com.claimsflow.team.api.TeamOperationsResponses.*;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeamOperationsService {
    private static final Set<ClaimStatus> CLOSED = EnumSet.of(ClaimStatus.RESOLVED, ClaimStatus.CLOSED);

    private final OperationalQueryService query;
    private final AdjusterJpaRepository adjusterRepository;
    private final Clock clock;

    public TeamOperationsService(
            OperationalQueryService query,
            AdjusterJpaRepository adjusterRepository,
            Clock clock) {
        this.query = query;
        this.adjusterRepository = adjusterRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public TeamOperationsSnapshot snapshot(OperationalFilters filters) {
        Instant now = clock.instant();
        List<Claim> claims = query.find(filters);
        List<Claim> open = claims.stream().filter(this::isOpen).toList();
        List<Adjuster> activeAdjusters = adjusterRepository.findByActiveTrueOrderByDisplayNameAsc().stream()
            .filter(adjuster -> filters.team() == null || filters.team().equals(adjuster.getTeam()))
            .filter(adjuster -> filters.adjusterId() == null || filters.adjusterId().equals(adjuster.getId()))
            .toList();

        long atRisk = open.stream().filter(claim -> isAtRisk(claim, now)).count();
        long overdue = open.stream().filter(claim -> claim.getSlaDeadline().isBefore(now)).count();
        long assigned = open.stream().filter(claim -> claim.getAssignedAdjuster() != null).count();
        int readiness = averageCompleteness(claims);
        int assignmentCoverage = percent(assigned, open.size());
        int slaCompliance = slaCompliance(claims);
        int totalCapacity = activeAdjusters.stream().mapToInt(Adjuster::getWorkloadCapacity).sum();
        int utilization = percent(assigned, totalCapacity);

        Map<UUID, Long> activeByAdjuster = open.stream()
            .filter(claim -> claim.getAssignedAdjuster() != null)
            .collect(Collectors.groupingBy(
                claim -> claim.getAssignedAdjuster().getId(),
                Collectors.counting()));

        List<AdjusterWorkload> adjusterWorkloads = activeAdjusters.stream()
            .map(adjuster -> {
                long count = activeByAdjuster.getOrDefault(adjuster.getId(), 0L);
                return new AdjusterWorkload(
                    adjuster.getId(),
                    adjuster.getDisplayName(),
                    adjuster.getTeam(),
                    count,
                    adjuster.getWorkloadCapacity(),
                    Math.min(100, percent(count, adjuster.getWorkloadCapacity())));
            })
            .sorted(Comparator.comparingInt(AdjusterWorkload::utilizationPercentage).reversed())
            .toList();

        Map<String, List<Adjuster>> adjustersByTeam = activeAdjusters.stream()
            .collect(Collectors.groupingBy(Adjuster::getTeam, TreeMap::new, Collectors.toList()));
        List<TeamWorkload> teamWorkloads = adjustersByTeam.entrySet().stream()
            .map(entry -> teamWorkload(entry.getKey(), entry.getValue(), claims, open))
            .toList();

        List<Escalation> escalations = open.stream()
            .filter(claim -> claim.getSlaDeadline().isBefore(now)
                || isAtRisk(claim, now)
                || claim.getPriority() == ClaimPriority.CRITICAL)
            .sorted(Comparator
                .comparingInt((Claim claim) -> escalationRank(claim, now))
                .thenComparing(Claim::getSlaDeadline)
                .thenComparing(Claim::getClaimNumber))
            .limit(10)
            .map(claim -> escalation(claim, now))
            .toList();

        List<Advisory> advisories = advisories(overdue, atRisk, open.size() - assigned, claims.stream().filter(claim -> claim.getCompletenessPercentage() < 100).count());
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
            query.options(),
            new TeamKpis(
                open.size(),
                atRisk,
                overdue,
                slaCompliance,
                readiness,
                assignmentCoverage,
                Math.min(100, utilization)),
            teamWorkloads,
            adjusterWorkloads,
            escalations,
            advisories,
            integrity);
    }

    private TeamWorkload teamWorkload(
            String team,
            List<Adjuster> adjusters,
            List<Claim> allClaims,
            List<Claim> openClaims) {
        Set<UUID> ids = adjusters.stream().map(Adjuster::getId).collect(Collectors.toSet());
        List<Claim> teamClaims = allClaims.stream()
            .filter(claim -> claim.getAssignedAdjuster() != null && ids.contains(claim.getAssignedAdjuster().getId()))
            .toList();
        long active = openClaims.stream()
            .filter(claim -> claim.getAssignedAdjuster() != null && ids.contains(claim.getAssignedAdjuster().getId()))
            .count();
        int capacity = adjusters.stream().mapToInt(Adjuster::getWorkloadCapacity).sum();
        return new TeamWorkload(
            team,
            active,
            capacity,
            Math.min(100, percent(active, capacity)),
            averageCompleteness(teamClaims),
            slaCompliance(teamClaims));
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
                incomplete + " claims have incomplete evidence.",
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
        boolean overdue = claim.getSlaDeadline().isBefore(now);
        boolean atRisk = isAtRisk(claim, now);
        String reason = overdue ? "SLA overdue" : atRisk ? "SLA due within 24 hours" : "Critical-priority review";
        String tone = overdue ? "critical" : atRisk ? "warning" : "advisory";
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
        if (claim.getSlaDeadline().isBefore(now)) return 0;
        if (isAtRisk(claim, now)) return 1;
        if (claim.getPriority() == ClaimPriority.CRITICAL) return 2;
        return 3;
    }

    private boolean isAtRisk(Claim claim, Instant now) {
        return !claim.getSlaDeadline().isBefore(now)
            && !claim.getSlaDeadline().isAfter(now.plus(Duration.ofHours(24)));
    }

    private boolean isOpen(Claim claim) {
        return !CLOSED.contains(claim.getStatus());
    }

    private int averageCompleteness(List<Claim> claims) {
        if (claims.isEmpty()) return 0;
        return (int) Math.round(claims.stream().mapToInt(Claim::getCompletenessPercentage).average().orElse(0));
    }

    private int slaCompliance(List<Claim> claims) {
        List<Claim> resolved = claims.stream().filter(claim -> claim.getResolvedAt() != null).toList();
        if (resolved.isEmpty()) return 100;
        long within = resolved.stream()
            .filter(claim -> !claim.getResolvedAt().isAfter(claim.getSlaDeadline()))
            .count();
        return percent(within, resolved.size());
    }

    private int percent(long numerator, long denominator) {
        if (denominator == 0) return 0;
        return (int) Math.round(numerator * 100.0 / denominator);
    }

    private String integrityLabel(int score) {
        if (score >= 90) return "Excellent";
        if (score >= 75) return "Healthy";
        if (score >= 60) return "Watch";
        return "Intervention required";
    }
}
