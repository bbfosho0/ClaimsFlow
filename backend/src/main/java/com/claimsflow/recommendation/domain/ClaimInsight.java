package com.claimsflow.recommendation.domain;

import java.util.List;

public record ClaimInsight(String action, String explanation, int confidence, List<String> missingInformation) {}
