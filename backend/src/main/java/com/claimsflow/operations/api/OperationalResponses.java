package com.claimsflow.operations.api;

import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.claim.domain.*;
import java.util.*;

public final class OperationalResponses {
    private OperationalResponses() {}

    public record AdjusterOption(UUID id, String displayName, String team) {
        public static AdjusterOption from(Adjuster adjuster) {
            return new AdjusterOption(
                adjuster.getId(),
                adjuster.getDisplayName(),
                adjuster.getTeam());
        }
    }

    public record OperationalFilterOptions(
        List<String> claimTypes,
        List<String> priorities,
        List<String> statuses,
        List<String> regions,
        List<String> teams,
        List<AdjusterOption> adjusters) {}

    public static OperationalFilterOptions options(List<Adjuster> adjusters) {
        return new OperationalFilterOptions(
            Arrays.stream(ClaimType.values()).map(Enum::name).toList(),
            Arrays.stream(ClaimPriority.values()).map(Enum::name).toList(),
            Arrays.stream(ClaimStatus.values()).map(Enum::name).toList(),
            Arrays.stream(ClaimRegion.values()).map(Enum::name).toList(),
            adjusters.stream().map(Adjuster::getTeam).filter(Objects::nonNull).distinct().sorted().toList(),
            adjusters.stream().map(AdjusterOption::from).toList());
    }
}
