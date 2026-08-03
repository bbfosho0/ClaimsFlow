package com.claimsflow.demo.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.claimsflow.demo.application.DemoJourneyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DemoController.class)
@TestPropertySource(properties = "claimsflow.demo.enabled=false")
class DemoControllerDisabledWebTest {
    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private DemoJourneyService service;

    @Test
    void resetRouteIsAbsentWhenDemoCapabilityIsDisabled() throws Exception {
        mvc.perform(post("/api/demo/reset"))
            .andExpect(status().isNotFound());
    }
}
