package com.claimsflow.mywork.api;

import com.claimsflow.mywork.application.MyWorkService;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/my-work")
public class MyWorkController {
    private final MyWorkService service;

    public MyWorkController(MyWorkService service) {
        this.service = service;
    }

    @GetMapping("/{adjusterId}")
    public MyWorkResponses.MyWorkSnapshot get(@PathVariable UUID adjusterId) {
        return service.snapshot(adjusterId);
    }
}
