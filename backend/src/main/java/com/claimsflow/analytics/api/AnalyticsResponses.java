package com.claimsflow.analytics.api;

import com.claimsflow.operations.api.OperationalResponses.OperationalFilterOptions;
import java.math.BigDecimal;
import java.time.*;
import java.util.List;

public final class AnalyticsResponses {
    private AnalyticsResponses() {}

    public record AnalyticsSnapshot(
        Instant generatedAt,
        OperationalFilterOptions options,
        AnalyticsKpis kpis,
        AnalyticsComparison comparison,
        List<TimePoint> claimVolume,
        List<TimePoint> resolvedVolume,
        List<DistributionPoint> statusDistribution,
        List<DistributionPoint> priorityDistribution,
        List<DistributionPoint> regionDistribution,
        List<DistributionPoint> agingBands,
        List<CohortRow> cohorts) {}

    public record AnalyticsKpis(
        BigDecimal estimatedExposure,
        long totalClaims,
        long openClaims,
        long resolvedClaims,
        double averageResolutionHours,
        int evidenceReadinessPercentage,
        int slaCompliancePercentage) {}

    public record AnalyticsComparison(
        LocalDate previousFrom,
        LocalDate previousTo,
        long previousTotalClaims,
        BigDecimal previousEstimatedExposure,
        double previousAverageResolutionHours,
        double claimVolumeChangePercentage,
        double exposureChangePercentage,
        double resolutionTimeChangePercentage) {}

    public record TimePoint(LocalDate date, long count) {}
    public record DistributionPoint(String key, String label, long count, int percentage) {}
    public record CohortRow(
        LocalDate weekStart,
        long totalClaims,
        int resolvedWithin7DaysPercentage,
        int resolvedWithin14DaysPercentage,
        int resolvedWithin30DaysPercentage) {}
}
