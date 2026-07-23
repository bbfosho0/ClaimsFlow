package com.claimsflow.claim.domain;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

class ClaimTransitionPolicyTest {
    private final ClaimTransitionPolicy policy = new ClaimTransitionPolicy();

    @Test
    void allowsNormalReviewFlow() {
        assertThat(policy.canTransition(ClaimStatus.NEW, ClaimStatus.UNDER_REVIEW)).isTrue();
        assertThat(policy.canTransition(ClaimStatus.UNDER_REVIEW, ClaimStatus.READY_FOR_DECISION)).isTrue();
    }

    @Test
    void rejectsSkippingDirectlyToResolved() {
        assertThat(policy.canTransition(ClaimStatus.NEW, ClaimStatus.RESOLVED)).isFalse();
    }
}
