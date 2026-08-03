package com.claimsflow.demo.api;

import java.util.UUID;

public final class DemoResponses {
    private DemoResponses() {}

    public record DemoJourneySnapshot(
        UUID claimId,
        String claimNumber,
        UUID adjusterId,
        String claimantRoute,
        String adjusterRoute,
        String managerRoute,
        String administratorRoute) {}
}
