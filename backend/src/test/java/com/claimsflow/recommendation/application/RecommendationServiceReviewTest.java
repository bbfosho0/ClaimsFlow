package com.claimsflow.recommendation.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.claim.domain.*;
import com.claimsflow.recommendation.domain.*;
import com.claimsflow.recommendation.persistence.RecommendationJpaRepository;
import com.claimsflow.shared.error.DomainConflictException;
import java.math.BigDecimal;
import java.time.*;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceReviewTest {
    @Mock private RecommendationJpaRepository recommendations;
    @Mock private ClaimApplicationService claims;
    @Mock private ClaimInsightProvider provider;
    @Mock private AuditService audit;
    @Mock private PlatformTransactionManager transactionManager;

    private RecommendationService service;
    private Claim claim;
    private Recommendation recommendation;

    @BeforeEach
    void setUp() {
        service = new RecommendationService(recommendations, claims, provider, audit, transactionManager);
        Instant now = Instant.parse("2026-08-02T12:00:00Z");
        claim = Claim.create(
                "CF-2026-0142",
                "Taylor Morgan",
                "taylor@example.test",
                ClaimType.PROPERTY,
                LocalDate.parse("2026-07-30"),
                new BigDecimal("42000.00"),
                "Storm damage affected the roof and interior ceiling.",
                true,
                true,
                false,
                false,
                75,
                ClaimPriority.CRITICAL,
                now.plus(Duration.ofHours(18)),
                now);
        recommendation = Recommendation.pending(
                claim,
                "REQUEST_INFORMATION",
                "Collect proof of ownership before final review.",
                84,
                "Proof of ownership",
                now);
    }

    @Test
    void rejectsBlankHumanReviewReasonBeforeLoadingRecommendation() {
        DomainConflictException error = assertThrows(
                DomainConflictException.class,
                () -> service.review(claim.getId(), recommendation.getId(), RecommendationReviewState.APPROVED, "Interview User", "   "));

        assertEquals("A human review reason is required.", error.getMessage());
        verifyNoInteractions(recommendations, audit);
    }

    @Test
    void recordsOperatorReasonInImmutableAuditSummary() {
        when(recommendations.findByIdAndClaim_Id(recommendation.getId(), claim.getId()))
                .thenReturn(Optional.of(recommendation));

        Recommendation result = service.review(
                claim.getId(),
                recommendation.getId(),
                RecommendationReviewState.APPROVED,
                "Interview User",
                "Evidence was reviewed and the request is appropriate.");

        assertEquals(RecommendationReviewState.APPROVED, result.getReviewState());
        assertEquals("Interview User", result.getReviewerName());
        ArgumentCaptor<String> summary = ArgumentCaptor.forClass(String.class);
        verify(audit).record(
                eq(claim),
                eq("Interview User"),
                eq("RECOMMENDATION_REVIEWED"),
                summary.capture(),
                eq("PENDING"),
                eq("APPROVED"),
                any(Instant.class));
        assertEquals("Human review recorded: Evidence was reviewed and the request is appropriate.", summary.getValue());
    }

    @Test
    void returnsLatestRecommendationWithoutGeneratingAnotherOne() {
        when(claims.get(claim.getId())).thenReturn(claim);
        when(recommendations.findFirstByClaim_IdOrderByGeneratedAtDesc(claim.getId()))
                .thenReturn(Optional.of(recommendation));

        assertSame(recommendation, service.latest(claim.getId()).orElseThrow());
        verify(recommendations).findFirstByClaim_IdOrderByGeneratedAtDesc(claim.getId());
        verifyNoInteractions(provider);
    }
}
