package com.jobportal.api.dto.job;

import com.jobportal.api.model.Job;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class CreateJobRequest {
    @NotBlank private String title;
    @NotBlank private String location;
    @NotBlank private String description;
    private String requirements;
    private String benefits;
    private boolean remote;
    @NotNull private Job.JobType jobType;
    private Integer salaryMin;
    private Integer salaryMax;
    private String category;
    private List<String> tags;
    private LocalDate deadline;
    private Job.JobStatus status = Job.JobStatus.ACTIVE;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }
    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
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
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public Job.JobStatus getStatus() { return status; }
    public void setStatus(Job.JobStatus status) { this.status = status; }
}
