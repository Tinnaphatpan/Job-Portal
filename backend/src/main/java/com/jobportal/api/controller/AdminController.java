package com.jobportal.api.controller;

import com.jobportal.api.dto.admin.*;
import com.jobportal.api.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserDto>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getUsers(role, page, size));
    }

    @PostMapping("/users")
    public ResponseEntity<AdminUserDto> createUser(@RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.ok(adminService.createUser(request));
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<AdminUserDto> toggleActive(@PathVariable String id) {
        return ResponseEntity.ok(adminService.toggleUserActive(id));
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable String id, @RequestBody Map<String, String> body) {
        adminService.resetUserPassword(id, body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "รีเซ็ตรหัสผ่านสำเร็จ"));
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<AdminJobDto>> getJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getJobs(page, size));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable String id) {
        adminService.deleteJob(id);
        return ResponseEntity.ok(Map.of("message", "ลบงานสำเร็จ"));
    }

    @PatchMapping("/jobs/{id}/status")
    public ResponseEntity<AdminJobDto> updateJobStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateJobStatus(id, body.get("status")));
    }
}
