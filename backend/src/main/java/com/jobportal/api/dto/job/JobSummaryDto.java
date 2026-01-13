package com.jobportal.api.dto.job;

import com.jobportal.api.model.Job;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class JobSummaryDto {
    private String id;
    private String title;
    private String company;
    private String companyLogo;
    private String location;
    private boolean remote;
    private Job.JobType jobType;
    private Integer salaryMin;
    private Integer salaryMax;
    private String category;
    private List<String> tags;
    private Job.JobStatus status;
    private LocalDate deadline;
    private int viewCount;
    private LocalDateTime createdAt;

    public JobSummaryDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public boolean isRemote() { return remote; }
    public void setRemote(boolean remote) { this.remote = remote; }
    public Job.JobType getJobType() { return jobType; }
    public void setJobType(Job.JobType jobType) { this.jobType = jobType; }
    public Integer getSalaryMin() { return salaryMin; }
    public void setSalaryMin(Integer salaryMin) { this.salaryMin = salaryMin; }
    public Integer getSalaryMax() { return salaryMax; }
    public void setSalaryMax(Integer salaryMax) { this.salaryMax = salaryMax; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public Job.JobStatus getStatus() { return status; }
    public void setStatus(Job.JobStatus status) { this.status = status; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public int getViewCount() { return viewCount; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
