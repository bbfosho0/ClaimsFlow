package com.claimsflow.operations.application;

public record MetricChange(ChangeKind kind, Double percentage) {
    public enum ChangeKind {
        PERCENTAGE,
        NEW,
        CLEARED,
        UNCHANGED
    }

    public MetricChange {
        if (kind == null) throw new IllegalArgumentException("kind is required");
        if (kind == ChangeKind.PERCENTAGE && percentage == null) {
            throw new IllegalArgumentException("percentage is required for percentage changes");
        }
        if (kind != ChangeKind.PERCENTAGE && percentage != null) {
            throw new IllegalArgumentException("percentage is only valid for percentage changes");
        }
    }

    public static MetricChange between(double current, double previous) {
        if (!Double.isFinite(current) || !Double.isFinite(previous)) {
            throw new IllegalArgumentException("metric values must be finite");
        }
        if (previous == 0) {
            return current == 0
                ? new MetricChange(ChangeKind.UNCHANGED, null)
                : new MetricChange(ChangeKind.NEW, null);
        }
        if (current == 0) return new MetricChange(ChangeKind.CLEARED, null);
        double percentage = Math.round(((current - previous) / Math.abs(previous)) * 1000.0) / 10.0;
        return new MetricChange(ChangeKind.PERCENTAGE, percentage);
    }
}
