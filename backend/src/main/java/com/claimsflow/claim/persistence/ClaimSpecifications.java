package com.claimsflow.claim.persistence;

import com.claimsflow.claim.domain.*;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class ClaimSpecifications {
    private ClaimSpecifications() {}

    public static Specification<Claim> filters(String query, ClaimStatus status, ClaimPriority priority, String assignment) {
        return Specification.where(search(query)).and(hasStatus(status)).and(hasPriority(priority)).and(hasAssignment(assignment));
    }

    private static Specification<Claim> search(String query) {
        return (root, cq, cb) -> {
            if (query == null || query.isBlank()) return cb.conjunction();
            String value = "%" + query.trim().toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("claimNumber")), value),
                cb.like(cb.lower(root.get("claimantName")), value),
                cb.like(cb.lower(root.get("claimantEmail")), value));
        };
    }

    private static Specification<Claim> hasStatus(ClaimStatus status) {
        return (root, cq, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static Specification<Claim> hasPriority(ClaimPriority priority) {
        return (root, cq, cb) -> priority == null ? cb.conjunction() : cb.equal(root.get("priority"), priority);
    }

    private static Specification<Claim> hasAssignment(String assignment) {
        return (root, cq, cb) -> {
            if (assignment == null || assignment.isBlank()) return cb.conjunction();
            if (assignment.equalsIgnoreCase("unassigned")) return cb.isNull(root.get("assignedAdjuster"));
            try { return cb.equal(root.get("assignedAdjuster").get("id"), UUID.fromString(assignment)); }
            catch (IllegalArgumentException ignored) { return cb.disjunction(); }
        };
    }
}
