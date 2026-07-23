package com.claimsflow.claim.domain;

import static org.assertj.core.api.Assertions.assertThat;
import java.math.BigDecimal;
import java.time.*;
import org.junit.jupiter.api.Test;

class PriorityPolicyTest {
    private final PriorityPolicy policy = new PriorityPolicy();

    @Test
    void personalInjuryWithLargeLossAndNearSlaIsCritical() {
        Instant now = Instant.parse("2026-07-22T12:00:00Z");
        var result = policy.evaluate(ClaimType.PERSONAL_INJURY, new BigDecimal("60000"), LocalDate.of(2026, 7, 21), 100, now.plus(Duration.ofHours(8)), now);
        assertThat(result.priority()).isEqualTo(ClaimPriority.CRITICAL);
    }

    @Test
    void smallCompletePropertyClaimIsLow() {
        Instant now = Instant.parse("2026-07-22T12:00:00Z");
        var result = policy.evaluate(ClaimType.PROPERTY, new BigDecimal("1000"), LocalDate.of(2026, 6, 1), 100, null, now);
        assertThat(result.priority()).isEqualTo(ClaimPriority.LOW);
    }
}
