package com.jobportal.api.dto.admin;

import com.jobportal.api.model.Job;
import java.time.LocalDateTime;

public class AdminJobDto {
    private String id;
    private String title;
    private String company;
    private String location;
    private String category;
    private Job.JobStatus status;
    private Job.JobType jobType;
    private String employerName;
    private LocalDateTime createdAt;

    public AdminJobDto(Job job) {
        this.id = job.getId();
        this.title = job.getTitle();
        this.company = job.getCompany();
        this.location = job.getLocation();
        this.category = job.getCategory();
        this.status = job.getStatus();
        this.jobType = job.getJobType();
        this.employerName = job.getEmployer() != null ? job.getEmployer().getName() : "";
        this.createdAt = job.getCreatedAt();
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getCompany() { return company; }
    public String getLocation() { return location; }
    public String getCategory() { return category; }
    public Job.JobStatus getStatus() { return status; }
    public Job.JobType getJobType() { return jobType; }
    public String getEmployerName() { return employerName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
