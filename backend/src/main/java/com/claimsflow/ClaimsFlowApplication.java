package com.claimsflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ClaimsFlowApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClaimsFlowApplication.class, args);
    }
}
