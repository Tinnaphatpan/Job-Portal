package com.jobportal.api.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "education_histories")
public class EducationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String institution;

    private String degree;
    private String field;
    private Integer startYear;
    private Integer endYear;
    private Double gpa;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public EducationHistory() {}

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public String getField() { return field; }
    public void setField(String field) { this.field = field; }
    public Integer getStartYear() { return startYear; }
    public void setStartYear(Integer startYear) { this.startYear = startYear; }
    public Integer getEndYear() { return endYear; }
    public void setEndYear(Integer endYear) { this.endYear = endYear; }
    public Double getGpa() { return gpa; }
    public void setGpa(Double gpa) { this.gpa = gpa; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
