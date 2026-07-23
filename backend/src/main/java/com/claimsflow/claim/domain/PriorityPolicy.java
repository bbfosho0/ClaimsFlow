package com.claimsflow.claim.domain;

import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public final class PriorityPolicy {
    public PriorityResult evaluate(ClaimType type, BigDecimal estimatedLoss, LocalDate incidentDate, int completenessPercentage, Instant slaDeadline, Instant now) {
        int score = 0;
        List<String> factors = new ArrayList<>();
        if (estimatedLoss.compareTo(new BigDecimal("50000")) >= 0) { score += 3; factors.add("Loss is at least $50,000"); }
        else if (estimatedLoss.compareTo(new BigDecimal("15000")) >= 0) { score += 2; factors.add("Loss is at least $15,000"); }
        else if (estimatedLoss.compareTo(new BigDecimal("5000")) >= 0) { score += 1; factors.add("Loss is at least $5,000"); }

        if (type == ClaimType.PERSONAL_INJURY) { score += 2; factors.add("Personal injury claim"); }
        if (completenessPercentage < 100) { score += 1; factors.add("Required evidence is missing"); }
        LocalDate evaluationDate = LocalDate.ofInstant(now, ZoneOffset.UTC);
        if (ChronoUnit.DAYS.between(incidentDate, evaluationDate) <= 2) { score += 1; factors.add("Incident is recent"); }
        if (slaDeadline != null && Duration.between(now, slaDeadline).toHours() <= 24) { score += 2; factors.add("SLA is due within 24 hours"); }

        ClaimPriority priority = score >= 6 ? ClaimPriority.CRITICAL : score >= 4 ? ClaimPriority.HIGH : score >= 2 ? ClaimPriority.MEDIUM : ClaimPriority.LOW;
        return new PriorityResult(priority, List.copyOf(factors));
    }

    public record PriorityResult(ClaimPriority priority, List<String> factors) {}
}
