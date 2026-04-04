package com.jobportal.api.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

public class WorkExperienceRequest {
    private String company;
    private String position;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean current;
    private String description;

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    @JsonProperty("isCurrent")
    public boolean isCurrent() { return current; }
    @JsonProperty("isCurrent")
    public void setCurrent(boolean current) { this.current = current; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
