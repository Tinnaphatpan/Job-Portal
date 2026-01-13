package com.jobportal.api.service;

import com.jobportal.api.dto.job.*;
import com.jobportal.api.model.Job;
import com.jobportal.api.model.User;
import com.jobportal.api.repository.ApplicationRepository;
import com.jobportal.api.repository.JobRepository;
import com.jobportal.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    public JobService(JobRepository jobRepository, UserRepository userRepository,
                      ApplicationRepository applicationRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    public Page<JobSummaryDto> searchJobs(String query, String category, String location,
                                           String jobType, Boolean remote, Pageable pageable) {
        Page<Object[]> results = jobRepository.searchJobs(query, category, location, jobType, remote, pageable);
        List<JobSummaryDto> dtos = results.stream()
                .map(row -> jobRepository.findById(row[0].toString()).map(this::toSummaryDto).orElse(null))
                .filter(j -> j != null)
                .toList();
        return new PageImpl<>(dtos, pageable, results.getTotalElements());
    }

    @Transactional
    public JobDetailDto getJob(String id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบตำแหน่งงานนี้"));
        jobRepository.incrementViewCount(id);
        return toDetailDto(job);
    }

    @Transactional
    public JobDetailDto createJob(CreateJobRequest request, String employerEmail) {
        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        Job job = new Job();
        job.setEmployer(employer);
        job.setTitle(request.getTitle());
        job.setCompany(employer.getCompanyName() != null ? employer.getCompanyName() : employer.getName());
        job.setCompanyLogo(employer.getCompanyLogo());
        job.setLocation(request.getLocation());
        job.setRemote(request.isRemote());
        job.setJobType(request.getJobType());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setBenefits(request.getBenefits());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setCategory(request.getCategory());
        job.setTags(request.getTags());
        job.setDeadline(request.getDeadline());
        job.setStatus(request.getStatus() != null ? request.getStatus() : Job.JobStatus.ACTIVE);
        return toDetailDto(jobRepository.save(job));
    }

    @Transactional
    public JobDetailDto updateJob(String id, CreateJobRequest request, String employerEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบตำแหน่งงานนี้"));
        if (!job.getEmployer().getEmail().equals(employerEmail)) {
            throw new IllegalArgumentException("ไม่มีสิทธิ์แก้ไขตำแหน่งงานนี้");
        }
        job.setTitle(request.getTitle());
        job.setLocation(request.getLocation());
        job.setRemote(request.isRemote());
        job.setJobType(request.getJobType());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setBenefits(request.getBenefits());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setCategory(request.getCategory());
        job.setTags(request.getTags());
        job.setDeadline(request.getDeadline());
        job.setStatus(request.getStatus());
        return toDetailDto(jobRepository.save(job));
    }

    @Transactional
    public void deleteJob(String id, String userEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบตำแหน่งงานนี้"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        if (!job.getEmployer().getEmail().equals(userEmail) && user.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("ไม่มีสิทธิ์ลบตำแหน่งงานนี้");
        }
        jobRepository.delete(job);
    }

    @Transactional(readOnly = true)
    public Page<JobSummaryDto> getMyJobs(String employerEmail, Pageable pageable) {
        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        return jobRepository.findByEmployerAndStatusOrderByCreatedAtDesc(employer, Job.JobStatus.ACTIVE, pageable)
                .map(this::toSummaryDto);
    }

    private JobSummaryDto toSummaryDto(Job job) {
        JobSummaryDto dto = new JobSummaryDto();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setCompany(job.getCompany());
        dto.setCompanyLogo(job.getCompanyLogo());
        dto.setLocation(job.getLocation());
        dto.setRemote(job.isRemote());
        dto.setJobType(job.getJobType());
        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setCategory(job.getCategory());
        dto.setTags(job.getTags());
        dto.setStatus(job.getStatus());
        dto.setDeadline(job.getDeadline());
        dto.setViewCount(job.getViewCount());
        dto.setCreatedAt(job.getCreatedAt());
        return dto;
    }

    private JobDetailDto toDetailDto(Job job) {
        long appCount = applicationRepository.countByJob(job);
        User employer = job.getEmployer();
        JobDetailDto dto = new JobDetailDto();
        dto.setId(job.getId());
        dto.setEmployerId(employer.getId());
        dto.setTitle(job.getTitle());
        dto.setCompany(job.getCompany());
        dto.setCompanyLogo(job.getCompanyLogo());
        dto.setCompanyWebsite(employer.getCompanyWebsite());
        dto.setCompanyDescription(employer.getCompanyDescription());
        dto.setLocation(job.getLocation());
        dto.setRemote(job.isRemote());
        dto.setJobType(job.getJobType());
        dto.setDescription(job.getDescription());
        dto.setRequirements(job.getRequirements());
        dto.setBenefits(job.getBenefits());
        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setSalaryCurrency(job.getSalaryCurrency());
        dto.setCategory(job.getCategory());
        dto.setTags(job.getTags());
        dto.setStatus(job.getStatus());
        dto.setDeadline(job.getDeadline());
        dto.setViewCount(job.getViewCount());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setApplicationCount(appCount);
        return dto;
    }
}
