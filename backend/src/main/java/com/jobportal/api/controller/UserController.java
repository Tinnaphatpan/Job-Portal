package com.jobportal.api.controller;

import com.jobportal.api.dto.user.*;
import com.jobportal.api.model.*;
import com.jobportal.api.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getProfile(Principal principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDto> updateProfile(@RequestBody UpdateProfileRequest request, Principal principal) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileDto> uploadAvatar(@RequestPart("file") MultipartFile file, Principal principal) {
        return ResponseEntity.ok(userService.uploadAvatar(principal.getName(), file));
    }

    @PostMapping(value = "/me/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileDto> uploadResume(@RequestPart("file") MultipartFile file, Principal principal) {
        return ResponseEntity.ok(userService.uploadResume(principal.getName(), file));
    }

    // ===== Work Experience =====
    @GetMapping("/me/work-experiences")
    public ResponseEntity<List<WorkExperience>> getWorkExperiences(Principal principal) {
        return ResponseEntity.ok(userService.getWorkExperiences(principal.getName()));
    }

    @PostMapping("/me/work-experiences")
    public ResponseEntity<WorkExperience> addWorkExperience(@RequestBody WorkExperienceRequest req, Principal principal) {
        return ResponseEntity.ok(userService.addWorkExperience(principal.getName(), req));
    }

    @PutMapping("/me/work-experiences/{id}")
    public ResponseEntity<WorkExperience> updateWorkExperience(@PathVariable String id, @RequestBody WorkExperienceRequest req, Principal principal) {
        return ResponseEntity.ok(userService.updateWorkExperience(principal.getName(), id, req));
    }

    @DeleteMapping("/me/work-experiences/{id}")
    public ResponseEntity<Void> deleteWorkExperience(@PathVariable String id, Principal principal) {
        userService.deleteWorkExperience(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // ===== Education =====
    @GetMapping("/me/educations")
    public ResponseEntity<List<EducationHistory>> getEducations(Principal principal) {
        return ResponseEntity.ok(userService.getEducationHistories(principal.getName()));
    }

    @PostMapping("/me/educations")
    public ResponseEntity<EducationHistory> addEducation(@RequestBody EducationHistoryRequest req, Principal principal) {
        return ResponseEntity.ok(userService.addEducationHistory(principal.getName(), req));
    }

    @PutMapping("/me/educations/{id}")
    public ResponseEntity<EducationHistory> updateEducation(@PathVariable String id, @RequestBody EducationHistoryRequest req, Principal principal) {
        return ResponseEntity.ok(userService.updateEducationHistory(principal.getName(), id, req));
    }

    @DeleteMapping("/me/educations/{id}")
    public ResponseEntity<Void> deleteEducation(@PathVariable String id, Principal principal) {
        userService.deleteEducationHistory(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // ===== Certificates =====
    @GetMapping("/me/certificates")
    public ResponseEntity<List<Certificate>> getCertificates(Principal principal) {
        return ResponseEntity.ok(userService.getCertificates(principal.getName()));
    }

    @PostMapping("/me/certificates")
    public ResponseEntity<Certificate> addCertificate(@RequestBody CertificateRequest req, Principal principal) {
        return ResponseEntity.ok(userService.addCertificate(principal.getName(), req));
    }

    @PutMapping("/me/certificates/{id}")
    public ResponseEntity<Certificate> updateCertificate(@PathVariable String id, @RequestBody CertificateRequest req, Principal principal) {
        return ResponseEntity.ok(userService.updateCertificate(principal.getName(), id, req));
    }

    @DeleteMapping("/me/certificates/{id}")
    public ResponseEntity<Void> deleteCertificate(@PathVariable String id, Principal principal) {
        userService.deleteCertificate(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // ===== Language Skills =====
    @GetMapping("/me/languages")
    public ResponseEntity<List<LanguageSkill>> getLanguages(Principal principal) {
        return ResponseEntity.ok(userService.getLanguageSkills(principal.getName()));
    }

    @PostMapping("/me/languages")
    public ResponseEntity<LanguageSkill> addLanguage(@RequestBody LanguageSkillRequest req, Principal principal) {
        return ResponseEntity.ok(userService.addLanguageSkill(principal.getName(), req));
    }

    @PutMapping("/me/languages/{id}")
    public ResponseEntity<LanguageSkill> updateLanguage(@PathVariable String id, @RequestBody LanguageSkillRequest req, Principal principal) {
        return ResponseEntity.ok(userService.updateLanguageSkill(principal.getName(), id, req));
    }

    @DeleteMapping("/me/languages/{id}")
    public ResponseEntity<Void> deleteLanguage(@PathVariable String id, Principal principal) {
        userService.deleteLanguageSkill(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
