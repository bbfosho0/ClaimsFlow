package com.claimsflow.recommendation.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimType;
import com.claimsflow.claim.domain.CompletenessPolicy.CompletenessResult;
import java.lang.reflect.RecordComponent;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class ClaimAnalysisRequestTest {

    private final Claim claim = Claim.create(
            "CLM-1001",
            "Avery Example",
            "avery@example.com",
            ClaimType.AUTO,
            LocalDate.of(2026, 7, 1),
            new BigDecimal("1250.00"),
            "Vehicle damage after collision",
            true,
            false,
            false,
            false,
            50,
            ClaimPriority.HIGH,
            Instant.parse("2026-07-24T00:00:00Z"),
            Instant.parse("2026-07-23T00:00:00Z"));

    private final CompletenessResult completeness = new CompletenessResult(50, List.of("Damage photos"));

    @Test
    void analysisRequestContainsOperationalFactsButNoClaimantIdentity() {
        var request = ClaimAnalysisRequest.from(claim, completeness);

        assertThat(request.claimType()).isEqualTo(ClaimType.AUTO);
        assertThat(request.status()).isEqualTo(claim.getStatus());
        assertThat(request.priority()).isEqualTo(ClaimPriority.HIGH);
        assertThat(request.assigned()).isFalse();
        assertThat(request.completenessPercentage()).isEqualTo(50);
        assertThat(request.missingInformation()).containsExactly("Damage photos");
        assertThat(request.estimatedLoss()).isEqualByComparingTo("1250.00");
        assertThat(request.incidentDate()).isEqualTo(LocalDate.of(2026, 7, 1));
        assertThat(request.description()).isEqualTo("Vehicle damage after collision");
        assertThat(ClaimAnalysisRequest.class.getRecordComponents())
                .extracting(RecordComponent::getName)
                .doesNotContain("claimantName", "claimantEmail", "claimNumber");
    }

    @Test
    void analysisRequestCopiesMissingInformation() {
        var missingInformation = new ArrayList<>(List.of("Damage photos"));
        var request = ClaimAnalysisRequest.from(claim, new CompletenessResult(50, missingInformation));

        missingInformation.clear();

        assertThat(request.missingInformation()).containsExactly("Damage photos");
        assertThatThrownBy(() -> request.missingInformation().add("Incident report"))
                .isInstanceOf(UnsupportedOperationException.class);
    }
}
