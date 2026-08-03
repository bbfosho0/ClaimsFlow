package com.claimsflow.operations.application;

import static com.claimsflow.operations.application.MetricChange.ChangeKind.*;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class MetricChangeTest {
    @Test
    void representsNewValuesWithoutInventingAPercentage() {
        assertThat(MetricChange.between(5, 0))
            .isEqualTo(new MetricChange(NEW, null));
    }

    @Test
    void representsClearedValuesWithoutInventingAPercentage() {
        assertThat(MetricChange.between(0, 5))
            .isEqualTo(new MetricChange(CLEARED, null));
    }

    @Test
    void representsUnchangedZeroValues() {
        assertThat(MetricChange.between(0, 0))
            .isEqualTo(new MetricChange(UNCHANGED, null));
    }

    @Test
    void roundsFinitePositiveAndNegativeChangesToOneDecimalPlace() {
        assertThat(MetricChange.between(15, 10))
            .isEqualTo(new MetricChange(PERCENTAGE, 50.0));
        assertThat(MetricChange.between(8, 10))
            .isEqualTo(new MetricChange(PERCENTAGE, -20.0));
    }

    @Test
    void treatsEqualNonzeroValuesAsAZeroPercentageChange() {
        assertThat(MetricChange.between(10, 10))
            .isEqualTo(new MetricChange(PERCENTAGE, 0.0));
    }
}
