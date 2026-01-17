package com.jobportal.api.service;

import com.jobportal.api.dto.user.UpdateProfileRequest;
import com.jobportal.api.dto.user.UserProfileDto;
import com.jobportal.api.model.User;
import com.jobportal.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StorageService storageService;

    public UserService(UserRepository userRepository, StorageService storageService) {
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    public UserProfileDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        return new UserProfileDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getHeadline() != null) {
            user.setHeadline(request.getHeadline());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getCompanyName() != null) {
            user.setCompanyName(request.getCompanyName());
        }
        if (request.getCompanyWebsite() != null) {
            user.setCompanyWebsite(request.getCompanyWebsite());
        }

        return new UserProfileDto(userRepository.save(user));
    }

    @Transactional
    public UserProfileDto uploadAvatar(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("ขนาดรูปต้องไม่เกิน 2MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/"))) {
            throw new IllegalArgumentException("อัปโหลดได้เฉพาะไฟล์รูปภาพเท่านั้น");
        }

        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String dataUrl = "data:" + contentType + ";base64," + base64;
            user.setAvatar(dataUrl);
            return new UserProfileDto(userRepository.save(user));
        } catch (Exception e) {
            throw new RuntimeException("ไม่สามารถอัปโหลดรูปได้");
        }
    }

    @Transactional
    public UserProfileDto uploadResume(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));

        String resumeUrl = storageService.uploadResume(file, user.getId());
        user.setResumeUrl(resumeUrl);
        user.setResumeFileName(file.getOriginalFilename());
        return new UserProfileDto(userRepository.save(user));
    }
}
