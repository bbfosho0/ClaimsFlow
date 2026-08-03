package com.claimsflow.demo.application;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "claimsflow.demo", name = "enabled", havingValue = "true")
public final class OperationalDemoDatasetRunner implements ApplicationRunner {
    private final OperationalDemoDatasetService service;

    public OperationalDemoDatasetRunner(OperationalDemoDatasetService service) {
        this.service = service;
    }

    @Override
    public void run(ApplicationArguments args) {
        service.ensureSeeded();
    }
}
