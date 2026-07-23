package com.claimsflow.claim.domain;

import java.util.ArrayList;
import java.util.List;

public final class CompletenessPolicy {
    public CompletenessResult evaluate(ClaimType type, boolean incidentReport, boolean photos, boolean proofOfOwnership, boolean medicalDocumentation) {
        List<String> missing = new ArrayList<>();
        switch (type) {
            case AUTO -> {
                if (!incidentReport) missing.add("Incident report");
                if (!photos) missing.add("Damage photos");
            }
            case PROPERTY -> {
                if (!photos) missing.add("Property photos");
                if (!proofOfOwnership) missing.add("Proof of ownership");
            }
            case PERSONAL_INJURY -> {
                if (!incidentReport) missing.add("Incident report");
                if (!medicalDocumentation) missing.add("Medical documentation");
            }
        }
        return new CompletenessResult((2 - missing.size()) * 50, List.copyOf(missing));
    }

    public record CompletenessResult(int percentage, List<String> missingEvidence) {}
}
