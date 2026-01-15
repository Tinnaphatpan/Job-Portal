package com.jobportal.api.controller;

import com.jobportal.api.dto.application.*;
import com.jobportal.api.service.ApplicationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping(value = "/jobs/{jobId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('JOBSEEKER')")
    public ResponseEntity<ApplicationDto> apply(
            @PathVariable String jobId,
            @RequestPart(required = false) MultipartFile resume,
            @RequestPart(required = false) String coverLetter,
            Principal principal) {
        return ResponseEntity.ok(applicationService.apply(jobId, resume, coverLetter, principal.getName()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('JOBSEEKER')")
    public ResponseEntity<Page<ApplicationDto>> myApplications(
            @PageableDefault(size = 10) Pageable pageable,
            Principal principal) {
        return ResponseEntity.ok(applicationService.getMyApplications(principal.getName(), pageable));
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<Page<ApplicationDto>> jobApplications(
            @PathVariable String jobId,
            @PageableDefault(size = 10) Pageable pageable,
            Principal principal) {
        return ResponseEntity.ok(applicationService.getJobApplications(jobId, principal.getName(), pageable));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<ApplicationDto> updateStatus(
            @PathVariable String id,
            @RequestBody UpdateStatusRequest request,
            Principal principal) {
        return ResponseEntity.ok(applicationService.updateStatus(id, request, principal.getName()));
    }
}
