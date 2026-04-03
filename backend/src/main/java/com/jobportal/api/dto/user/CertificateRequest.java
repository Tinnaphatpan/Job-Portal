package com.jobportal.api.dto.user;

import java.time.LocalDate;

public class CertificateRequest {
    private String name;
    private String issuer;
    private LocalDate issueDate;
    private LocalDate expireDate;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getExpireDate() { return expireDate; }
    public void setExpireDate(LocalDate expireDate) { this.expireDate = expireDate; }
}
