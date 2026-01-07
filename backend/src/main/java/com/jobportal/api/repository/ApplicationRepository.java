package com.jobportal.api.repository;

import com.jobportal.api.model.Application;
import com.jobportal.api.model.Job;
import com.jobportal.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, String> {
    Page<Application> findByApplicantOrderByCreatedAtDesc(User applicant, Pageable pageable);
    Page<Application> findByJobOrderByCreatedAtDesc(Job job, Pageable pageable);
    Optional<Application> findByJobAndApplicant(Job job, User applicant);
    boolean existsByJobAndApplicant(Job job, User applicant);
    long countByJob(Job job);
    long countByStatus(Application.ApplicationStatus status);
}
