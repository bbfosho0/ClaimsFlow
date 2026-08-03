package com.claimsflow.evidence.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimRegion;
import com.claimsflow.claim.domain.ClaimStatus;
import com.claimsflow.claim.domain.ClaimType;
import com.claimsflow.evidence.api.EvidenceOperationsResponses.EvidenceOperationsSnapshot;
import com.claimsflow.operations.api.OperationalResponses;
import com.claimsflow.operations.api.OperationalResponses.OperationalFilterOptions;
import com.claimsflow.operations.application.OperationalFilterOptionsService;
import com.claimsflow.operations.application.OperationalFilters;
import com.claimsflow.operations.application.OperationalQueryService;
import com.claimsflow.portal.domain.ClaimMessage;
import com.claimsflow.portal.domain.MessageAudience;
import com.claimsflow.portal.persistence.ClaimMessageJpaRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class EvidenceOperationsServiceTest {
    private static final Instant NOW = Instant.parse("2026-08-03T12:00:00Z");

    private final OperationalQueryService query = mock(OperationalQueryService.class);
    private final ClaimMessageJpaRepository messages = mock(ClaimMessageJpaRepository.class);
    private final OperationalFilterOptionsService filterOptions = mock(OperationalFilterOptionsService.class);
    private final EvidenceOperationsService service = new EvidenceOperationsService(
        query,
        messages,
        filterOptions,
        Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void honorsExplicitSelectionAndProjectsOnlyClaimantVisibleMessages() {
        Adjuster jordan = adjuster("Jordan Lee", "Claims Operations");
        Claim overdue = claim("CLM-OVERDUE", ClaimPriority.CRITICAL, NOW.minusSeconds(1), jordan, 25);
        Claim selected = claim("CLM-SELECTED", ClaimPriority.HIGH, NOW.plus(Duration.ofDays(2)), jordan, 75);
        ClaimMessage claimantMessage = message("Jordan Lee", MessageAudience.CLAIMANT, "Please add photos.");
        OperationalFilterOptions options = OperationalResponses.options(List.of(jordan));

        when(query.find(filters())).thenReturn(List.of(selected, overdue));
        when(filterOptions.options()).thenReturn(options);
        when(messages.findByClaim_IdAndAudienceOrderByCreatedAtAsc(
            selected.getId(), MessageAudience.CLAIMANT)).thenReturn(List.of(claimantMessage));

        EvidenceOperationsSnapshot snapshot = service.snapshot(filters(), selected.getId());

        assertThat(snapshot.claims()).extracting(item -> item.claimNumber())
            .containsExactly("CLM-OVERDUE", "CLM-SELECTED");
        assertThat(snapshot.selected().id()).isEqualTo(selected.getId());
        assertThat(snapshot.selected().adjusterName()).isEqualTo("Jordan Lee");
        assertThat(snapshot.selected().team()).isEqualTo("Claims Operations");
        assertThat(snapshot.selected().evidence()).extracting(item -> item.kind())
            .containsExactly("INCIDENT_REPORT", "PHOTOS", "PROOF_OF_OWNERSHIP", "MEDICAL_DOCUMENTATION");
        assertThat(snapshot.selected().evidence()).extracting(item -> item.state())
            .containsExactly("Received", "Outstanding", "Received", "Outstanding");
        assertThat(snapshot.selected().claimantMessages()).singleElement().satisfies(message -> {
            assertThat(message.audience()).isEqualTo("CLAIMANT");
            assertThat(message.body()).isEqualTo("Please add photos.");
        });
        verify(messages).findByClaim_IdAndAudienceOrderByCreatedAtAsc(
            selected.getId(), MessageAudience.CLAIMANT);
    }

    @Test
    void fallsBackToTheHighestOperationalPriorityWhenSelectionIsOutsideTheFilter() {
        Claim current = claim("CLM-CURRENT", ClaimPriority.LOW, NOW.plus(Duration.ofDays(3)), null, 100);
        Claim atRisk = claim("CLM-RISK", ClaimPriority.MEDIUM, NOW.plus(Duration.ofHours(24)), null, 50);
        UUID missingSelection = UUID.fromString("00000000-0000-0000-0000-000000000099");
        OperationalFilterOptions options = OperationalResponses.options(List.of());

        when(query.find(filters())).thenReturn(List.of(current, atRisk));
        when(filterOptions.options()).thenReturn(options);
        when(messages.findByClaim_IdAndAudienceOrderByCreatedAtAsc(
            atRisk.getId(), MessageAudience.CLAIMANT)).thenReturn(List.of());

        EvidenceOperationsSnapshot snapshot = service.snapshot(filters(), missingSelection);

        assertThat(snapshot.selected().claimNumber()).isEqualTo("CLM-RISK");
    }

    @Test
    void returnsAnEmptyProjectionWithoutQueryingMessages() {
        OperationalFilterOptions options = OperationalResponses.options(List.of());
        when(query.find(filters())).thenReturn(List.of());
        when(filterOptions.options()).thenReturn(options);

        EvidenceOperationsSnapshot snapshot = service.snapshot(filters(), null);

        assertThat(snapshot.claims()).isEmpty();
        assertThat(snapshot.selected()).isNull();
    }

    private OperationalFilters filters() {
        return new OperationalFilters(
            LocalDate.of(2026, 7, 1),
            LocalDate.of(2026, 8, 3),
            null,
            null,
            null,
            null,
            null,
            null,
            false);
    }

    private Adjuster adjuster(String name, String team) {
        Adjuster adjuster = mock(Adjuster.class);
        when(adjuster.getId()).thenReturn(UUID.nameUUIDFromBytes(name.getBytes()));
        when(adjuster.getDisplayName()).thenReturn(name);
        when(adjuster.getTeam()).thenReturn(team);
        return adjuster;
    }

    private Claim claim(
            String number,
            ClaimPriority priority,
            Instant deadline,
            Adjuster adjuster,
            int completeness) {
        Claim claim = mock(Claim.class);
        UUID id = UUID.nameUUIDFromBytes(number.getBytes());
        when(claim.getId()).thenReturn(id);
        when(claim.getClaimNumber()).thenReturn(number);
        when(claim.getClaimantName()).thenReturn(number + " Claimant");
        when(claim.getClaimantEmail()).thenReturn(number.toLowerCase() + "@example.com");
        when(claim.getClaimType()).thenReturn(ClaimType.PROPERTY);
        when(claim.getStatus()).thenReturn(ClaimStatus.UNDER_REVIEW);
        when(claim.getPriority()).thenReturn(priority);
        when(claim.getRegion()).thenReturn(ClaimRegion.SOUTHEAST);
        when(claim.getEstimatedLoss()).thenReturn(new BigDecimal("1000.00"));
        when(claim.getCompletenessPercentage()).thenReturn(completeness);
        when(claim.getSlaDeadline()).thenReturn(deadline);
        when(claim.getCreatedAt()).thenReturn(NOW.minus(Duration.ofDays(2)));
        when(claim.getAssignedAdjuster()).thenReturn(adjuster);
        when(claim.isIncidentReportPresent()).thenReturn(true);
        when(claim.isPhotosPresent()).thenReturn(false);
        when(claim.isProofOfOwnershipPresent()).thenReturn(true);
        when(claim.isMedicalDocumentationPresent()).thenReturn(false);
        return claim;
    }

    private ClaimMessage message(String author, MessageAudience audience, String body) {
        ClaimMessage message = mock(ClaimMessage.class);
        when(message.getId()).thenReturn(UUID.nameUUIDFromBytes(body.getBytes()));
        when(message.getAuthor()).thenReturn(author);
        when(message.getAudience()).thenReturn(audience);
        when(message.getBody()).thenReturn(body);
        when(message.getCreatedAt()).thenReturn(NOW.minus(Duration.ofHours(1)));
        return message;
    }
}
