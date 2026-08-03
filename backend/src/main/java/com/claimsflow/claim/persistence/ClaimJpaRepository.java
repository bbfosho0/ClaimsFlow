package com.claimsflow.claim.persistence;

import com.claimsflow.claim.domain.*;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClaimJpaRepository extends JpaRepository<Claim, UUID>, JpaSpecificationExecutor<Claim> {
    @EntityGraph(attributePaths = "assignedAdjuster")
    Optional<Claim> findOneById(UUID id);

    @Override
    @EntityGraph(attributePaths = "assignedAdjuster")
    Page<Claim> findAll(Specification<Claim> specification, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "assignedAdjuster")
    List<Claim> findAll(Specification<Claim> specification, Sort sort);

    @EntityGraph(attributePaths = "assignedAdjuster")
    List<Claim> findAllByOrderByCreatedAtAsc();

    List<Claim> findAllByClaimantEmail(String claimantEmail);
    List<Claim> findAllByDemoDatasetKey(String demoDatasetKey);
    long countByDemoDatasetKey(String demoDatasetKey);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from Claim c where c.claimantEmail = :email")
    int deleteByClaimantEmail(@Param("email") String email);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from Claim c where c.demoDatasetKey = :datasetKey")
    int deleteByDemoDatasetKey(@Param("datasetKey") String datasetKey);

    long countByStatusNotIn(Collection<ClaimStatus> statuses);
    long countByPriorityInAndStatusNotIn(Collection<ClaimPriority> priorities, Collection<ClaimStatus> statuses);
    long countByAssignedAdjusterIsNullAndStatusNotIn(Collection<ClaimStatus> statuses);
    long countByCompletenessPercentageLessThanAndStatusNotIn(int percentage, Collection<ClaimStatus> statuses);
    long countBySlaDeadlineBetweenAndStatusNotIn(Instant start, Instant end, Collection<ClaimStatus> statuses);
    long countByAssignedAdjuster_IdAndStatusNotIn(UUID adjusterId, Collection<ClaimStatus> statuses);
}
