package com.claimsflow.operations.application;

import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.persistence.ClaimJpaRepository;
import com.claimsflow.claim.persistence.ClaimSpecifications;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OperationalQueryService {
    private final ClaimJpaRepository claims;

    public OperationalQueryService(ClaimJpaRepository claims) {
        this.claims = claims;
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
}
