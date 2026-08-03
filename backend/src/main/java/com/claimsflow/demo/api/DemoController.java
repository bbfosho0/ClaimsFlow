package com.claimsflow.demo.api;

import com.claimsflow.demo.application.DemoJourneyService;
import com.claimsflow.demo.config.DemoProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo")
@EnableConfigurationProperties(DemoProperties.class)
@ConditionalOnProperty(prefix = "claimsflow.demo", name = "enabled", havingValue = "true")
public class DemoController {
    private final DemoJourneyService service;
    private final DemoProperties properties;

    public DemoController(DemoJourneyService service, DemoProperties properties) {
        this.service = service;
        this.properties = properties;
    }

    @PostMapping("/reset")
    public DemoResponses.DemoJourneySnapshot reset() {
        if (!properties.enabled()) {
            throw new IllegalStateException("Demo reset is disabled.");
        }
        return service.reset();
    }
}
