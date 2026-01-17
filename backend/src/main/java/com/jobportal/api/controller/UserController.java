package com.jobportal.api.controller;

import com.jobportal.api.dto.user.UpdateProfileRequest;
import com.jobportal.api.dto.user.UserProfileDto;
import com.jobportal.api.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

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
    public ResponseEntity<UserProfileDto> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Principal principal) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileDto> uploadAvatar(
            @RequestPart("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(userService.uploadAvatar(principal.getName(), file));
    }

    @PostMapping(value = "/me/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileDto> uploadResume(
            @RequestPart("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(userService.uploadResume(principal.getName(), file));
    }
}
