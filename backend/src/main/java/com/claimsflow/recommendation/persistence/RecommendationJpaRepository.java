package com.claimsflow.recommendation.persistence;

import com.claimsflow.recommendation.domain.Recommendation;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendationJpaRepository extends JpaRepository<Recommendation, UUID> {
    Optional<Recommendation> findByIdAndClaim_Id(UUID id, UUID claimId);
    Optional<Recommendation> findFirstByClaim_IdOrderByGeneratedAtDesc(UUID claimId);
}
