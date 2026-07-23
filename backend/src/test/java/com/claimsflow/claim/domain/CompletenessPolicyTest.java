package com.claimsflow.claim.domain;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class CompletenessPolicyTest {
    private final CompletenessPolicy policy = new CompletenessPolicy();

    @Test
    void autoClaimListsMissingPhotos() {
        var result = policy.evaluate(ClaimType.AUTO, true, false, false, false);
        assertThat(result.percentage()).isEqualTo(50);
        assertThat(result.missingEvidence()).containsExactly("Damage photos");
    }

    @Test
    void propertyClaimIsCompleteWithPhotosAndProof() {
        var result = policy.evaluate(ClaimType.PROPERTY, false, true, true, false);
        assertThat(result.percentage()).isEqualTo(100);
        assertThat(result.missingEvidence()).isEmpty();
    }
}
