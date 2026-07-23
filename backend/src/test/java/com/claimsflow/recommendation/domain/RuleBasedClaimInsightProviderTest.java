package com.claimsflow.recommendation.domain;

import static org.assertj.core.api.Assertions.assertThat;
import com.claimsflow.claim.domain.*;
import java.util.List;
import org.junit.jupiter.api.Test;

class RuleBasedClaimInsightProviderTest {
    private final RuleBasedClaimInsightProvider provider = new RuleBasedClaimInsightProvider();

    @Test
    void missingEvidenceTakesPriority() {
        var insight = provider.analyze(new ClaimAnalysisRequest(ClaimStatus.NEW, ClaimPriority.HIGH, false, 50, List.of("Damage photos")));
        assertThat(insight.action()).isEqualTo("REQUEST_INFORMATION");
        assertThat(insight.missingInformation()).containsExactly("Damage photos");
    }

    @Test
    void completeUnassignedClaimRequestsAssignment() {
        var insight = provider.analyze(new ClaimAnalysisRequest(ClaimStatus.NEW, ClaimPriority.MEDIUM, false, 100, List.of()));
        assertThat(insight.action()).isEqualTo("ASSIGN_ADJUSTER");
    }
}
