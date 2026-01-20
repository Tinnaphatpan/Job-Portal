package com.jobportal.api.dto.admin;

public class AdminStatsDto {
    private long totalJobseekers;
    private long totalEmployers;
    private long totalActiveJobs;
    private long totalJobs;
    private long totalApplications;
    private long pendingApplications;

    public AdminStatsDto(long totalJobseekers, long totalEmployers,
                         long totalActiveJobs, long totalJobs,
                         long totalApplications, long pendingApplications) {
        this.totalJobseekers = totalJobseekers;
        this.totalEmployers = totalEmployers;
        this.totalActiveJobs = totalActiveJobs;
        this.totalJobs = totalJobs;
        this.totalApplications = totalApplications;
        this.pendingApplications = pendingApplications;
    }

    public long getTotalJobseekers() { return totalJobseekers; }
    public long getTotalEmployers() { return totalEmployers; }
    public long getTotalActiveJobs() { return totalActiveJobs; }
    public long getTotalJobs() { return totalJobs; }
    public long getTotalApplications() { return totalApplications; }
    public long getPendingApplications() { return pendingApplications; }
}
