package com.jobportal.api.service;

import com.jobportal.api.dto.application.*;
import com.jobportal.api.model.*;
import com.jobportal.api.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final EmailService emailService;

    public ApplicationService(ApplicationRepository applicationRepository, JobRepository jobRepository,
                               UserRepository userRepository, StorageService storageService,
                               EmailService emailService) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.emailService = emailService;
    }

    @Transactional
    public ApplicationDto apply(String jobId, MultipartFile resume, String coverLetter, String applicantEmail) {
        User applicant = findUserByEmail(applicantEmail);
        Job job = findJobById(jobId);

        if (applicationRepository.existsByJobAndApplicant(job, applicant)) {
            throw new IllegalArgumentException("คุณได้สมัครงานนี้ไปแล้ว");
        }

        Application application = buildApplication(applicant, job, resume, coverLetter);
        Application saved = applicationRepository.save(application);
        emailService.sendNewApplicationEmail(job.getEmployer().getEmail(), job.getTitle(), applicant.getName());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDto> getMyApplications(String applicantEmail, Pageable pageable) {
        User applicant = findUserByEmail(applicantEmail);
        return applicationRepository.findByApplicantOrderByCreatedAtDesc(applicant, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDto> getJobApplications(String jobId, String employerEmail, Pageable pageable) {
        Job job = findJobById(jobId);
        if (!job.getEmployer().getEmail().equals(employerEmail)) {
            throw new IllegalArgumentException("ไม่มีสิทธิ์ดูใบสมัครนี้");
        }
        return applicationRepository.findByJobOrderByCreatedAtDesc(job, pageable).map(this::toDto);
    }

    @Transactional
    public ApplicationDto updateStatus(String id, UpdateStatusRequest request, String employerEmail) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบใบสมัคร"));
        if (!application.getJob().getEmployer().getEmail().equals(employerEmail)) {
            throw new IllegalArgumentException("ไม่มีสิทธิ์แก้ไขใบสมัครนี้");
        }
        application.setStatus(request.getStatus());
        application.getTimeline().add(buildTimelineEntry(application, request));

        Application saved = applicationRepository.save(application);
        emailService.sendApplicationStatusEmail(application.getApplicant().getEmail(),
                application.getJob().getTitle(), request.getStatus().name(), request.getMessage());
        return toDto(saved);
    }

    // ===== Private Helpers =====

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
    }

    private Job findJobById(String jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบตำแหน่งงานนี้"));
    }

    private Application buildApplication(User applicant, Job job, MultipartFile resume, String coverLetter) {
        Application application = new Application();
        application.setJob(job);
        application.setApplicant(applicant);
        application.setCoverLetter(coverLetter);
        application.setStatus(Application.ApplicationStatus.PENDING);
        setResume(application, applicant, resume);

        ApplicationTimeline initial = new ApplicationTimeline();
        initial.setApplication(application);
        initial.setStatus(Application.ApplicationStatus.PENDING);
        initial.setMessage("ส่งใบสมัครแล้ว");
        application.getTimeline().add(initial);
        return application;
    }

    private void setResume(Application application, User applicant, MultipartFile resume) {
        if (resume != null && !resume.isEmpty()) {
            application.setResumeUrl(storageService.uploadResume(resume, applicant.getId()));
            application.setResumeFileName(resume.getOriginalFilename());
        } else if (applicant.getResumeUrl() != null) {
            application.setResumeUrl(applicant.getResumeUrl());
            application.setResumeFileName(applicant.getResumeFileName());
        }
    }

    private ApplicationTimeline buildTimelineEntry(Application application, UpdateStatusRequest request) {
        ApplicationTimeline entry = new ApplicationTimeline();
        entry.setApplication(application);
        entry.setStatus(request.getStatus());
        entry.setMessage(request.getMessage() != null ? request.getMessage() : getDefaultMessage(request.getStatus()));
        return entry;
    }

    private String getDefaultMessage(Application.ApplicationStatus status) {
        return switch (status) {
            case REVIEWING -> "กำลังพิจารณาใบสมัครของคุณ";
            case SHORTLISTED -> "ผ่านการคัดกรองเบื้องต้น";
            case REJECTED -> "ขอบคุณสำหรับความสนใจ";
            case HIRED -> "ยินดีต้อนรับเข้าสู่ทีม!";
            default -> "อัปเดตสถานะใบสมัคร";
        };
    }

    private ApplicationDto toDto(Application app) {
        List<ApplicationDto.TimelineEntry> timeline = app.getTimeline().stream()
                .map(t -> new ApplicationDto.TimelineEntry(t.getStatus(), t.getMessage(), t.getCreatedAt()))
                .toList();
        ApplicationDto dto = new ApplicationDto();
        dto.setId(app.getId());
        dto.setJobId(app.getJob().getId());
        dto.setJobTitle(app.getJob().getTitle());
        dto.setCompany(app.getJob().getCompany());
        dto.setApplicantId(app.getApplicant().getId());
        dto.setApplicantName(app.getApplicant().getName());
        dto.setApplicantEmail(app.getApplicant().getEmail());
        dto.setResumeUrl(app.getResumeUrl());
        dto.setResumeFileName(app.getResumeFileName());
        dto.setCoverLetter(app.getCoverLetter());
        dto.setStatus(app.getStatus());
        dto.setTimeline(timeline);
        dto.setCreatedAt(app.getCreatedAt());
        return dto;
    }
}
