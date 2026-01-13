package com.jobportal.api.controller;

import com.jobportal.api.dto.job.*;
import com.jobportal.api.service.JobService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<Page<JobSummaryDto>> searchJobs(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) Boolean remote,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(jobService.searchJobs(q, category, location, jobType, remote, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDetailDto> getJob(@PathVariable String id) {
        return ResponseEntity.ok(jobService.getJob(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobDetailDto> createJob(@Valid @RequestBody CreateJobRequest request, Principal principal) {
        return ResponseEntity.ok(jobService.createJob(request, principal.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobDetailDto> updateJob(@PathVariable String id,
                                                   @Valid @RequestBody CreateJobRequest request,
                                                   Principal principal) {
        return ResponseEntity.ok(jobService.updateJob(id, request, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteJob(@PathVariable String id, Principal principal) {
        jobService.deleteJob(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Page<JobSummaryDto>> myJobs(
            @PageableDefault(size = 10) Pageable pageable,
            Principal principal) {
        return ResponseEntity.ok(jobService.getMyJobs(principal.getName(), pageable));
    }
}
