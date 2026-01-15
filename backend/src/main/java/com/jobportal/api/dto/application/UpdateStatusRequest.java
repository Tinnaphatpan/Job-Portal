package com.jobportal.api.dto.application;

import com.jobportal.api.model.Application;

public class UpdateStatusRequest {
    private Application.ApplicationStatus status;
    private String message;

    public Application.ApplicationStatus getStatus() { return status; }
    public void setStatus(Application.ApplicationStatus status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
