package com.claimsflow.dashboard.application;

import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimStatus;
import com.claimsflow.operations.application.MetricChange;
import com.claimsflow.operations.application.OperationalQueryService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {
    private static final Set<ClaimStatus> CLOSED = EnumSet.of(ClaimStatus.RESOLVED, ClaimStatus.CLOSED);
    private static final Duration COMPARISON_WINDOW = Duration.ofDays(30);

    private final OperationalQueryService operational;
    private final AdjusterJpaRepository adjusters;
    private final AuditService audit;
    private final Clock clock;

    public DashboardService(
            OperationalQueryService operational,
            AdjusterJpaRepository adjusters,
            AuditService audit,
            Clock clock) {
        this.operational = operational;
        this.adjusters = adjusters;
        this.audit = audit;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardSnapshot snapshot() {
        Instant now = clock.instant();
        List<Claim> all = operational.findAllForDashboard();
        List<Claim> open = all.stream().filter(claim -> isActiveAt(claim, now)).toList();
        List<Adjuster> activeAdjusters = adjusters.findByActiveTrueOrderByDisplayNameAsc();

        long high = open.stream().filter(this::isHighPriority).count();
        long atRisk = open.stream().filter(claim -> isWithin24Hours(claim, now)).count();
        long overdue = open.stream().filter(claim -> isOverdue(claim, now)).count();
        long unassigned = open.stream().filter(claim -> claim.getAssignedAdjuster() == null).count();
        long incomplete = open.stream().filter(claim -> claim.getCompletenessPercentage() < 100).count();
        int readiness = averageCompleteness(open);
        int activePercent = percent(open.size(), all.size());
        BigDecimal estimatedExposure = exposure(open);
        int totalCapacity = activeAdjusters.stream().mapToInt(Adjuster::getWorkloadCapacity).sum();
        long assignedOpen = open.stream().filter(claim -> claim.getAssignedAdjuster() != null).count();
        int overallUtilization = percent(assignedOpen, totalCapacity);
        long resolvedThisPeriod = all.stream()
            .filter(claim -> claim.getResolvedAt() != null)
            .filter(claim -> !claim.getResolvedAt().isBefore(now.minus(COMPARISON_WINDOW)))
            .filter(claim -> !claim.getResolvedAt().isAfter(now))
            .count();

        Map<UUID, Long> activeByAdjuster = new HashMap<>();
        for (Claim claim : open) {
            if (claim.getAssignedAdjuster() != null) {
                activeByAdjuster.merge(claim.getAssignedAdjuster().getId(), 1L, Long::sum);
            }
        }

        List<Workload> workload = activeAdjusters.stream()
            .map(adjuster -> new Workload(
                adjuster.getId(),
                adjuster.getDisplayName(),
                adjuster.getTeam(),
                activeByAdjuster.getOrDefault(adjuster.getId(), 0L),
                adjuster.getWorkloadCapacity()))
            .sorted(Comparator.comparingLong(Workload::activeClaims).reversed().thenComparing(Workload::displayName))
            .toList();

        List<Activity> recent = audit.recent().stream()
            .map(event -> new Activity(
                event.getClaim().getId(),
                event.getActor(),
                event.getActionType(),
                event.getSummary(),
                event.getOccurredAt()))
            .toList();

        List<SignalCount> signals = List.of(
            new SignalCount("SLA", "critical", atRisk + overdue),
            new SignalCount("EVIDENCE", "warning", incomplete),
            new SignalCount("OWNERSHIP", "live", unassigned),
            new SignalCount("PRIORITY", "advisory", high),
            new SignalCount("ADVISORY", "healthy", Math.max(0, open.size() - high)));

        Instant previousAsOf = now.minus(COMPARISON_WINDOW);
        List<Claim> previousOpen = all.stream().filter(claim -> isActiveAt(claim, previousAsOf)).toList();
        long previousPressure = previousOpen.stream().filter(claim -> isOverdue(claim, previousAsOf) || isWithin24Hours(claim, previousAsOf)).count();
        DashboardComparison comparison = new DashboardComparison(
            LocalDate.ofInstant(previousAsOf, ZoneOffset.UTC),
            Change.from(MetricChange.between(open.size(), previousOpen.size())),
            Change.from(MetricChange.between(estimatedExposure.doubleValue(), exposure(previousOpen).doubleValue())),
            Change.from(MetricChange.between(atRisk + overdue, previousPressure)),
            Change.from(MetricChange.between(readiness, averageCompleteness(previousOpen))));

        return new DashboardSnapshot(
            now,
            all.size(),
            open.size(),
            high,
            atRisk,
            overdue,
            unassigned,
            incomplete,
            readiness,
            activePercent,
            estimatedExposure,
            overallUtilization,
            resolvedThisPeriod,
            comparison,
            openPortfolioTrend(all, now),
            eventTrend(all, now, Claim::getCreatedAt),
            eventTrend(all, now, Claim::getResolvedAt),
            exposureTrend(all, now),
            slaPressureTrend(all, now),
            evidenceReadinessBands(open),
            priorityDistribution(open),
            slaDeadlineBands(open, now),
            signals,
            workload,
            recent);
    }

    private List<TimePoint> openPortfolioTrend(List<Claim> claims, Instant now) {
        LocalDate end = LocalDate.ofInstant(now, ZoneOffset.UTC);
        LocalDate start = end.minusDays(29);
        return start.datesUntil(end.plusDays(1))
            .map(date -> {
                Instant asOf = asOf(date, end, now);
                return new TimePoint(date, claims.stream().filter(claim -> isActiveAt(claim, asOf)).count());
            })
            .toList();
    }

    private List<TimePoint> eventTrend(
            List<Claim> claims,
            Instant now,
            Function<Claim, Instant> timestamp) {
        LocalDate end = LocalDate.ofInstant(now, ZoneOffset.UTC);
        LocalDate start = end.minusDays(29);
        Map<LocalDate, Long> counts = claims.stream()
            .map(timestamp)
            .filter(value -> value != null && !value.isAfter(now))
            .map(value -> LocalDate.ofInstant(value, ZoneOffset.UTC))
            .filter(date -> !date.isBefore(start) && !date.isAfter(end))
            .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
        return start.datesUntil(end.plusDays(1))
            .map(date -> new TimePoint(date, counts.getOrDefault(date, 0L)))
            .toList();
    }

    private List<MonetaryTimePoint> exposureTrend(List<Claim> claims, Instant now) {
        LocalDate end = LocalDate.ofInstant(now, ZoneOffset.UTC);
        LocalDate start = end.minusDays(29);
        return start.datesUntil(end.plusDays(1))
            .map(date -> {
                Instant asOf = asOf(date, end, now);
                return new MonetaryTimePoint(
                    date,
                    exposure(claims.stream().filter(claim -> isActiveAt(claim, asOf)).toList()));
            })
            .toList();
    }

    private List<SlaPressurePoint> slaPressureTrend(List<Claim> claims, Instant now) {
        LocalDate end = LocalDate.ofInstant(now, ZoneOffset.UTC);
        LocalDate start = end.minusDays(13);
        return start.datesUntil(end.plusDays(1))
            .map(date -> {
                Instant asOf = asOf(date, end, now);
                List<Claim> active = claims.stream().filter(claim -> isActiveAt(claim, asOf)).toList();
                return new SlaPressurePoint(
                    date,
                    active.stream().filter(claim -> isWithin24Hours(claim, asOf)).count(),
                    active.stream().filter(claim -> isOverdue(claim, asOf)).count());
            })
            .toList();
    }

    private List<DistributionPoint> evidenceReadinessBands(List<Claim> claims) {
        long[] counts = new long[4];
        for (Claim claim : claims) {
            int completeness = claim.getCompletenessPercentage();
            int bucket = completeness < 50 ? 0 : completeness < 75 ? 1 : completeness < 100 ? 2 : 3;
            counts[bucket]++;
        }
        String[] keys = {"0_49", "50_74", "75_99", "COMPLETE"};
        String[] labels = {"0–49%", "50–74%", "75–99%", "100% complete"};
        List<DistributionPoint> result = new ArrayList<>();
        for (int index = 0; index < keys.length; index++) {
            result.add(new DistributionPoint(keys[index], labels[index], counts[index], percent(counts[index], claims.size())));
        }
        return List.copyOf(result);
    }

    private List<DistributionPoint> priorityDistribution(List<Claim> claims) {
        Map<ClaimPriority, Long> counts = new EnumMap<>(ClaimPriority.class);
        for (Claim claim : claims) counts.merge(claim.getPriority(), 1L, Long::sum);
        return Arrays.stream(ClaimPriority.values())
            .map(priority -> new DistributionPoint(
                priority.name(),
                humanize(priority.name()),
                counts.getOrDefault(priority, 0L),
                percent(counts.getOrDefault(priority, 0L), claims.size())))
            .toList();
    }

    private List<DistributionPoint> slaDeadlineBands(List<Claim> claims, Instant now) {
        long[] counts = new long[5];
        for (Claim claim : claims) {
            Duration remaining = Duration.between(now, claim.getSlaDeadline());
            int bucket = !claim.getSlaDeadline().isAfter(now) ? 0
                : remaining.compareTo(Duration.ofHours(24)) <= 0 ? 1
                : remaining.compareTo(Duration.ofDays(3)) <= 0 ? 2
                : remaining.compareTo(Duration.ofDays(7)) <= 0 ? 3
                : 4;
            counts[bucket]++;
        }
        String[] keys = {"OVERDUE", "DUE_24H", "DUE_1_3D", "DUE_4_7D", "DUE_LATER"};
        String[] labels = {"Overdue", "Due <24h", "Due 1–3d", "Due 4–7d", "Due >7d"};
        List<DistributionPoint> result = new ArrayList<>();
        for (int index = 0; index < keys.length; index++) {
            result.add(new DistributionPoint(keys[index], labels[index], counts[index], percent(counts[index], claims.size())));
        }
        return List.copyOf(result);
    }

    private Instant asOf(LocalDate date, LocalDate currentDate, Instant now) {
        return date.equals(currentDate)
            ? now
            : date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant().minusNanos(1);
    }

    private boolean isActiveAt(Claim claim, Instant asOf) {
        return !claim.getCreatedAt().isAfter(asOf)
            && (claim.getResolvedAt() == null || claim.getResolvedAt().isAfter(asOf));
    }

    private boolean isHighPriority(Claim claim) {
        return claim.getPriority() == ClaimPriority.HIGH || claim.getPriority() == ClaimPriority.CRITICAL;
    }

    private boolean isOverdue(Claim claim, Instant now) {
        return !claim.getSlaDeadline().isAfter(now);
    }

    private boolean isWithin24Hours(Claim claim, Instant now) {
        return claim.getSlaDeadline().isAfter(now)
            && !claim.getSlaDeadline().isAfter(now.plus(Duration.ofHours(24)));
    }

    private int averageCompleteness(List<Claim> claims) {
        return claims.isEmpty()
            ? 100
            : (int) Math.round(claims.stream().mapToInt(Claim::getCompletenessPercentage).average().orElse(100));
    }

    private BigDecimal exposure(List<Claim> claims) {
        return claims.stream()
            .map(Claim::getEstimatedLoss)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);
    }

    private int percent(long numerator, long denominator) {
        if (denominator == 0) return 0;
        return (int) Math.round(numerator * 100.0 / denominator);
    }

    private String humanize(String value) {
        String text = value.toLowerCase().replace('_', ' ');
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }

    public record SignalCount(String category, String tone, long count) {}
    public record Workload(UUID adjusterId, String displayName, String team, long activeClaims, int capacity) {}
    public record Activity(UUID claimId, String actor, String actionType, String summary, Instant occurredAt) {}
    public record Change(String kind, Double percentage) {
        public static Change from(MetricChange change) {
            return new Change(change.kind().name(), change.percentage());
        }
    }
    public record DashboardComparison(
        LocalDate previousAsOf,
        Change openClaims,
        Change estimatedExposure,
        Change slaPressure,
        Change evidenceReadiness) {}
    public record TimePoint(LocalDate date, long value) {}
    public record MonetaryTimePoint(LocalDate date, BigDecimal amount) {}
    public record SlaPressurePoint(LocalDate date, long atRisk, long overdue) {}
    public record DistributionPoint(String key, String label, long count, int percentage) {}
    public record DashboardSnapshot(
        Instant generatedAt,
        long totalClaims,
        long openClaims,
        long highPriorityClaims,
        long slaRiskClaims,
        long overdueClaims,
        long unassignedClaims,
        long incompleteClaims,
        int evidenceReadinessPercentage,
        int activePortfolioPercentage,
        BigDecimal estimatedExposure,
        int overallUtilizationPercentage,
        long resolvedThisPeriod,
        DashboardComparison comparison,
        List<TimePoint> openPortfolioTrend,
        List<TimePoint> createdTrend,
        List<TimePoint> resolvedTrend,
        List<MonetaryTimePoint> exposureTrend,
        List<SlaPressurePoint> slaPressureTrend,
        List<DistributionPoint> evidenceReadinessBands,
        List<DistributionPoint> priorityDistribution,
        List<DistributionPoint> slaDeadlineBands,
        List<SignalCount> signalCounts,
        List<Workload> workload,
        List<Activity> recentActivity) {}
}
