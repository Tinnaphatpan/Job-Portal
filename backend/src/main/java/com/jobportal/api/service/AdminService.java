package com.jobportal.api.service;

import com.jobportal.api.dto.admin.*;
import com.jobportal.api.model.Application;
import com.jobportal.api.model.Job;
import com.jobportal.api.model.User;
import com.jobportal.api.repository.ApplicationRepository;
import com.jobportal.api.repository.JobRepository;
import com.jobportal.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, JobRepository jobRepository,
                        ApplicationRepository applicationRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AdminStatsDto getStats() {
        long jobseekers = userRepository.countByRole(User.Role.JOBSEEKER);
        long employers = userRepository.countByRole(User.Role.EMPLOYER);
        long activeJobs = jobRepository.countByStatus(Job.JobStatus.ACTIVE);
        long totalJobs = jobRepository.count();
        long totalApps = applicationRepository.count();
        long pendingApps = applicationRepository.countByStatus(Application.ApplicationStatus.PENDING);
        return new AdminStatsDto(jobseekers, employers, activeJobs, totalJobs, totalApps, pendingApps);
    }

    public Page<AdminUserDto> getUsers(String role, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (role != null && !role.isBlank()) {
            User.Role roleEnum = User.Role.valueOf(role);
            return userRepository.findByRoleOrderByCreatedAtDesc(roleEnum, pageable).map(AdminUserDto::new);
        }
        return userRepository.findAllByOrderByCreatedAtDesc(pageable).map(AdminUserDto::new);
    }

    @Transactional
    public AdminUserDto createUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("อีเมลนี้ถูกใช้งานแล้ว");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setCompanyName(request.getCompanyName());
        user.setRole(request.getRole() != null ? request.getRole() : User.Role.JOBSEEKER);
        user.setMustChangePassword(true);
        return new AdminUserDto(userRepository.save(user));
    }

    @Transactional
    public AdminUserDto toggleUserActive(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        user.setActive(!user.isActive());
        return new AdminUserDto(userRepository.save(user));
    }

    @Transactional
    public void resetUserPassword(String userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);
    }

    public Page<AdminJobDto> getJobs(int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return jobRepository.findAllByOrderByCreatedAtDesc(pageable).map(AdminJobDto::new);
    }

    @Transactional
    public void deleteJob(String jobId) {
        if (!jobRepository.existsById(jobId)) {
            throw new IllegalArgumentException("ไม่พบงานนี้");
        }
        jobRepository.deleteById(jobId);
    }

    @Transactional
    public AdminJobDto updateJobStatus(String jobId, String status) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบงานนี้"));
        job.setStatus(Job.JobStatus.valueOf(status));
        return new AdminJobDto(jobRepository.save(job));
    }
}
