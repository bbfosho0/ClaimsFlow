package com.claimsflow.operations.application;

import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.persistence.ClaimJpaRepository;
import com.claimsflow.claim.persistence.ClaimSpecifications;
import com.claimsflow.operations.api.OperationalResponses;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OperationalQueryService {
    private final ClaimJpaRepository claims;
    private final AdjusterJpaRepository adjusters;

    public OperationalQueryService(
            ClaimJpaRepository claims,
            AdjusterJpaRepository adjusters) {
        this.claims = claims;
        this.adjusters = adjusters;
    }

    @Transactional(readOnly = true)
    public List<Claim> find(OperationalFilters filters) {
        return claims.findAll(
            ClaimSpecifications.operational(filters),
            Sort.by(Sort.Direction.ASC, "createdAt", "claimNumber"));
    }

    @Transactional(readOnly = true)
    public List<Claim> findAllForDashboard() {
        return claims.findAllByOrderByCreatedAtAsc();
    }

    @Transactional(readOnly = true)
    public OperationalResponses.OperationalFilterOptions options() {
        return OperationalResponses.options(adjusters.findByActiveTrueOrderByDisplayNameAsc());
    }
}
