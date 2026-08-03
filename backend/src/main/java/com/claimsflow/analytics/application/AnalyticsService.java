package com.claimsflow.analytics.application;

import com.claimsflow.analytics.api.AnalyticsResponses.AnalyticsComparison;
import com.claimsflow.analytics.api.AnalyticsResponses.AnalyticsKpis;
import com.claimsflow.analytics.api.AnalyticsResponses.AnalyticsSnapshot;
import com.claimsflow.analytics.api.AnalyticsResponses.CohortRow;
import com.claimsflow.analytics.api.AnalyticsResponses.DistributionPoint;
import com.claimsflow.analytics.api.AnalyticsResponses.MetricChangeResponse;
import com.claimsflow.analytics.api.AnalyticsResponses.TimePoint;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.operations.application.MetricChange;
import com.claimsflow.operations.application.OperationalFilters;
import com.claimsflow.operations.application.OperationalMetrics;
import com.claimsflow.operations.application.OperationalQueryService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.Function;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {
    private final OperationalQueryService query;
    private final Clock clock;

    public AnalyticsService(OperationalQueryService query, Clock clock) {
        this.query = query;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public AnalyticsSnapshot snapshot(OperationalFilters filters) {
        List<Claim> claims = query.find(filters);
        long inclusiveDays = ChronoUnit.DAYS.between(filters.from(), filters.to()) + 1;
        LocalDate previousTo = filters.from().minusDays(1);
        LocalDate previousFrom = previousTo.minusDays(inclusiveDays - 1);
        OperationalFilters previousFilters = new OperationalFilters(
            previousFrom,
            previousTo,
            filters.claimType(),
            filters.priority(),
            filters.status(),
            filters.adjusterId(),
            filters.team(),
            filters.region(),
            filters.unassigned());
        List<Claim> previousClaims = query.find(previousFilters);

        AnalyticsKpis current = kpis(claims);
        AnalyticsKpis previous = kpis(previousClaims);
        AnalyticsComparison comparison = new AnalyticsComparison(
            previousFrom,
            previousTo,
            previous.totalClaims(),
            previous.estimatedExposure(),
            previous.averageResolutionHours(),
            MetricChangeResponse.from(MetricChange.between(current.totalClaims(), previous.totalClaims())),
            MetricChangeResponse.from(MetricChange.between(
                current.estimatedExposure().doubleValue(),
                previous.estimatedExposure().doubleValue())),
            MetricChangeResponse.from(MetricChange.between(
                current.averageResolutionHours(),
                previous.averageResolutionHours())));

        return new AnalyticsSnapshot(
            clock.instant(),
            query.options(),
            current,
            comparison,
            timeSeries(filters.from(), filters.to(), claims, Claim::getCreatedAt),
            timeSeries(filters.from(), filters.to(), claims, Claim::getResolvedAt),
            enumDistribution(claims, Claim::getStatus, com.claimsflow.claim.domain.ClaimStatus.values()),
            enumDistribution(claims, Claim::getPriority, com.claimsflow.claim.domain.ClaimPriority.values()),
            enumDistribution(claims, Claim::getRegion, com.claimsflow.claim.domain.ClaimRegion.values()),
            agingBands(claims),
            cohorts(claims));
    }

    private AnalyticsKpis kpis(List<Claim> claims) {
        long total = claims.size();
        long open = claims.stream().filter(OperationalMetrics::isOpen).count();
        List<Claim> resolved = claims.stream().filter(claim -> claim.getResolvedAt() != null).toList();
        BigDecimal exposure = claims.stream()
            .map(Claim::getEstimatedLoss)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);
        double averageResolution = resolved.stream()
            .mapToLong(claim -> Duration.between(claim.getCreatedAt(), claim.getResolvedAt()).toHours())
            .average()
            .orElse(0);
        averageResolution = Math.round(averageResolution * 10.0) / 10.0;
        return new AnalyticsKpis(
            exposure,
            total,
            open,
            resolved.size(),
            averageResolution,
            OperationalMetrics.averageCompleteness(claims),
            OperationalMetrics.slaCompliance(claims));
    }

    private List<TimePoint> timeSeries(
            LocalDate from,
            LocalDate to,
            List<Claim> claims,
            Function<Claim, Instant> timestamp) {
        Map<LocalDate, Long> counts = claims.stream()
            .map(timestamp)
            .filter(Objects::nonNull)
            .map(value -> LocalDate.ofInstant(value, ZoneOffset.UTC))
            .filter(date -> !date.isBefore(from) && !date.isAfter(to))
            .collect(Collectors.groupingBy(Function.identity(), TreeMap::new, Collectors.counting()));
        return from.datesUntil(to.plusDays(1))
            .map(date -> new TimePoint(date, counts.getOrDefault(date, 0L)))
            .toList();
    }

    private <E extends Enum<E>> List<DistributionPoint> enumDistribution(
            List<Claim> claims,
            Function<Claim, E> classifier,
            E[] values) {
        Map<E, Long> counts = claims.stream()
            .collect(Collectors.groupingBy(
                classifier,
                () -> new EnumMap<>(values[0].getDeclaringClass()),
                Collectors.counting()));
        return Arrays.stream(values)
            .map(value -> new DistributionPoint(
                value.name(),
                humanize(value.name()),
                counts.getOrDefault(value, 0L),
                OperationalMetrics.percent(counts.getOrDefault(value, 0L), claims.size())))
            .toList();
    }

    private List<DistributionPoint> agingBands(List<Claim> claims) {
        Instant now = clock.instant();
        long[] counts = new long[5];
        for (Claim claim : claims) {
            if (!OperationalMetrics.isOpen(claim)) continue;
            long days = OperationalMetrics.ageDays(claim, now);
            int bucket = days <= 2 ? 0 : days <= 7 ? 1 : days <= 14 ? 2 : days <= 30 ? 3 : 4;
            counts[bucket]++;
        }
        long open = Arrays.stream(counts).sum();
        String[] keys = {"0_2", "3_7", "8_14", "15_30", "31_PLUS"};
        String[] labels = {"0–2 days", "3–7 days", "8–14 days", "15–30 days", "31+ days"};
        List<DistributionPoint> result = new ArrayList<>();
        for (int index = 0; index < keys.length; index++) {
            result.add(new DistributionPoint(
                keys[index],
                labels[index],
                counts[index],
                OperationalMetrics.percent(counts[index], open)));
        }
        return List.copyOf(result);
    }

    private List<CohortRow> cohorts(List<Claim> claims) {
        Map<LocalDate, List<Claim>> grouped = claims.stream().collect(Collectors.groupingBy(
            claim -> LocalDate.ofInstant(claim.getCreatedAt(), ZoneOffset.UTC)
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)),
            TreeMap::new,
            Collectors.toList()));
        return grouped.entrySet().stream().map(entry -> {
            List<Claim> cohort = entry.getValue();
            return new CohortRow(
                entry.getKey(),
                cohort.size(),
                resolvedWithin(cohort, 7),
                resolvedWithin(cohort, 14),
                resolvedWithin(cohort, 30));
        }).toList();
    }

    private int resolvedWithin(List<Claim> claims, int days) {
        long count = claims.stream()
            .filter(claim -> claim.getResolvedAt() != null)
            .filter(claim -> !claim.getResolvedAt().isAfter(claim.getCreatedAt().plus(Duration.ofDays(days))))
            .count();
        return OperationalMetrics.percent(count, claims.size());
    }

    private String humanize(String value) {
        String text = value.toLowerCase(Locale.ROOT).replace('_', ' ');
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }
}
