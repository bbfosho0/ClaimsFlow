package com.claimsflow.claim.persistence;

import com.claimsflow.claim.domain.*;
import java.time.Instant;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ClaimJpaRepository extends JpaRepository<Claim, UUID>, JpaSpecificationExecutor<Claim> {
    long countByStatusNotIn(Collection<ClaimStatus> statuses);
    long countByPriorityInAndStatusNotIn(Collection<ClaimPriority> priorities, Collection<ClaimStatus> statuses);
    long countByAssignedAdjusterIsNullAndStatusNotIn(Collection<ClaimStatus> statuses);
    long countByCompletenessPercentageLessThanAndStatusNotIn(int percentage, Collection<ClaimStatus> statuses);
    long countBySlaDeadlineBetweenAndStatusNotIn(Instant start, Instant end, Collection<ClaimStatus> statuses);
    long countByAssignedAdjuster_IdAndStatusNotIn(UUID adjusterId, Collection<ClaimStatus> statuses);
}
