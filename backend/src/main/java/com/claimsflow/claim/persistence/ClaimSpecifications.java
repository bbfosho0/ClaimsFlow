package com.claimsflow.claim.persistence;

import com.claimsflow.claim.domain.*;
import com.claimsflow.operations.application.OperationalFilters;
import jakarta.persistence.criteria.JoinType;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class ClaimSpecifications {
    private ClaimSpecifications() {}

    public static Specification<Claim> filters(String query, ClaimStatus status, ClaimPriority priority, String assignment) {
        return Specification.where(search(query)).and(hasStatus(status)).and(hasPriority(priority)).and(hasAssignment(assignment));
    }

    public static Specification<Claim> operational(OperationalFilters filters) {
        return Specification.where(createdBetween(filters))
            .and(hasClaimType(filters.claimType()))
            .and(hasPriority(filters.priority()))
            .and(hasStatus(filters.status()))
            .and(hasAdjuster(filters.adjusterId(), filters.unassigned()))
            .and(hasTeam(filters.team()))
            .and(hasRegion(filters.region()));
    }

    public static Specification<Claim> queue(
            String query,
            OperationalFilters filters,
            String legacyAssignment) {
        return Specification.where(search(query))
            .and(operational(filters))
            .and(hasAssignment(legacyAssignment));
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

    private static Specification<Claim> createdBetween(OperationalFilters filters) {
        return (root, cq, cb) -> cb.and(
            cb.greaterThanOrEqualTo(
                root.get("createdAt"),
                filters.from().atStartOfDay(ZoneOffset.UTC).toInstant()),
            cb.lessThan(
                root.get("createdAt"),
                filters.to().plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant()));
    }

    private static Specification<Claim> hasClaimType(ClaimType claimType) {
        return (root, cq, cb) -> claimType == null
            ? cb.conjunction()
            : cb.equal(root.get("claimType"), claimType);
    }

    private static Specification<Claim> hasStatus(ClaimStatus status) {
        return (root, cq, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static Specification<Claim> hasPriority(ClaimPriority priority) {
        return (root, cq, cb) -> priority == null ? cb.conjunction() : cb.equal(root.get("priority"), priority);
    }

    private static Specification<Claim> hasRegion(ClaimRegion region) {
        return (root, cq, cb) -> region == null ? cb.conjunction() : cb.equal(root.get("region"), region);
    }

    private static Specification<Claim> hasAdjuster(UUID adjusterId, boolean unassigned) {
        return (root, cq, cb) -> {
            if (unassigned) return cb.isNull(root.get("assignedAdjuster"));
            if (adjusterId == null) return cb.conjunction();
            return cb.equal(root.get("assignedAdjuster").get("id"), adjusterId);
        };
    }

    private static Specification<Claim> hasTeam(String team) {
        return (root, cq, cb) -> {
            if (team == null || team.isBlank()) return cb.conjunction();
            return cb.equal(root.join("assignedAdjuster", JoinType.LEFT).get("team"), team);
        };
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
