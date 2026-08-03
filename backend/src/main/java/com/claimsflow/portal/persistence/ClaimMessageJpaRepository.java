package com.claimsflow.portal.persistence;

import com.claimsflow.portal.domain.ClaimMessage;
import com.claimsflow.portal.domain.MessageAudience;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimMessageJpaRepository extends JpaRepository<ClaimMessage, UUID> {
    List<ClaimMessage> findByClaim_IdAndAudienceOrderByCreatedAtAsc(
        UUID claimId,
        MessageAudience audience);
}
