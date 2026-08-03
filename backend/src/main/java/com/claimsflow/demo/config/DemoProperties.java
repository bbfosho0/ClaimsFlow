package com.claimsflow.demo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "claimsflow.demo")
public record DemoProperties(boolean enabled) {}
