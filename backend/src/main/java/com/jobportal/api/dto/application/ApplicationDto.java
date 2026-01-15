package com.jobportal.api.dto.application;

import com.jobportal.api.model.Application;
import java.time.LocalDateTime;
import java.util.List;

public class ApplicationDto {
    private String id;
    private String jobId;
    private String jobTitle;
    private String company;
    private String applicantId;
    private String applicantName;
    private String applicantEmail;
    private String resumeUrl;
    private String resumeFileName;
    private String coverLetter;
    private Application.ApplicationStatus status;
    private List<TimelineEntry> timeline;
    private LocalDateTime createdAt;

    public ApplicationDto() {}

    public static class TimelineEntry {
        private Application.ApplicationStatus status;
        private String message;
        private LocalDateTime createdAt;

        public TimelineEntry(Application.ApplicationStatus status, String message, LocalDateTime createdAt) {
            this.status = status;
            this.message = message;
            this.createdAt = createdAt;
        }

        public Application.ApplicationStatus getStatus() { return status; }
        public String getMessage() { return message; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getApplicantId() { return applicantId; }
    public void setApplicantId(String applicantId) { this.applicantId = applicantId; }
    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }
    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }
    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    public Application.ApplicationStatus getStatus() { return status; }
    public void setStatus(Application.ApplicationStatus status) { this.status = status; }
    public List<TimelineEntry> getTimeline() { return timeline; }
    public void setTimeline(List<TimelineEntry> timeline) { this.timeline = timeline; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
