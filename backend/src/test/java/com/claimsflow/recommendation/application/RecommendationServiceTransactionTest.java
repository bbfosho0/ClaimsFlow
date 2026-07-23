package com.claimsflow.recommendation.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimType;
import com.claimsflow.claim.domain.CompletenessPolicy;
import com.claimsflow.recommendation.domain.ClaimInsight;
import com.claimsflow.recommendation.domain.ClaimInsightProvider;
import com.claimsflow.recommendation.domain.Recommendation;
import com.claimsflow.recommendation.persistence.RecommendationJpaRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@SpringJUnitConfig(RecommendationServiceTransactionTest.TestConfiguration.class)
class RecommendationServiceTransactionTest {
    @jakarta.annotation.Resource
    private RecommendationService service;

    @jakarta.annotation.Resource
    private RecommendationJpaRepository recommendations;

    @jakarta.annotation.Resource
    private ClaimApplicationService claims;

    @jakarta.annotation.Resource
    private ClaimInsightProvider provider;

    @jakarta.annotation.Resource
    private AuditService audit;

    @Test
    void remoteAnalysisRunsOutsideTransactionAndPersistenceReloadsInsideTransaction() {
        UUID claimId = UUID.randomUUID();
        Claim analysisClaim = claim("CLM-ANALYSIS");
        Claim reloadedClaim = claim("CLM-RELOADED");
        var getCalls = new AtomicInteger();

        when(claims.get(claimId)).thenAnswer(invocation -> {
            int call = getCalls.incrementAndGet();
            if (call == 2) {
                assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isTrue();
                return reloadedClaim;
            }
            return analysisClaim;
        });
        when(claims.completeness()).thenReturn(new CompletenessPolicy());
        when(provider.analyze(any())).thenAnswer(invocation -> {
            assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            return new ClaimInsight(
                    "REQUEST_INFORMATION",
                    "Collect required evidence.",
                    90,
                    List.of("Damage photos"));
        });
        when(recommendations.save(any())).thenAnswer(invocation -> {
            assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isTrue();
            return invocation.getArgument(0, Recommendation.class);
        });
        when(audit.record(
                eq(reloadedClaim),
                eq("system"),
                eq("RECOMMENDATION_GENERATED"),
                eq("Decision-support recommendation generated"),
                eq(null),
                eq("REQUEST_INFORMATION"),
                any())).thenAnswer(invocation -> {
                    assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isTrue();
                    return null;
                });

        Recommendation recommendation = service.generate(claimId);

        assertThat(recommendation.getClaim()).isSameAs(reloadedClaim);
        verify(claims, org.mockito.Mockito.times(2)).get(claimId);
        verify(recommendations).save(recommendation);
        verify(audit).record(
                eq(reloadedClaim),
                eq("system"),
                eq("RECOMMENDATION_GENERATED"),
                eq("Decision-support recommendation generated"),
                eq(null),
                eq("REQUEST_INFORMATION"),
                any());
    }

    private Claim claim(String claimNumber) {
        Instant now = Instant.parse("2026-07-23T00:00:00Z");
        return Claim.create(
                claimNumber,
                "Example Claimant",
                "claimant@example.test",
                ClaimType.AUTO,
                LocalDate.of(2026, 7, 1),
                new BigDecimal("1250.00"),
                "Vehicle damage",
                true,
                false,
                false,
                false,
                50,
                ClaimPriority.HIGH,
                now.plusSeconds(86400),
                now);
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement
    @Import(RecommendationService.class)
    static class TestConfiguration {
        @Bean
        RecommendationJpaRepository recommendations() {
            return mock(RecommendationJpaRepository.class);
        }

        @Bean
        ClaimApplicationService claims() {
            return mock(ClaimApplicationService.class);
        }

        @Bean
        ClaimInsightProvider provider() {
            return mock(ClaimInsightProvider.class);
        }

        @Bean
        AuditService audit() {
            return mock(AuditService.class);
        }

        @Bean
        PlatformTransactionManager transactionManager() {
            return new ObservingTransactionManager();
        }
    }

    private static final class ObservingTransactionManager extends AbstractPlatformTransactionManager {
        @Override
        protected Object doGetTransaction() {
            return new Object();
        }

        @Override
        protected void doBegin(Object transaction, TransactionDefinition definition) {}

        @Override
        protected void doCommit(DefaultTransactionStatus status) {}

        @Override
        protected void doRollback(DefaultTransactionStatus status) {}
    }
}
