package com.jobportal.api.repository;

import com.jobportal.api.model.WorkExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkExperienceRepository extends JpaRepository<WorkExperience, String> {
    List<WorkExperience> findByUserIdOrderByStartDateDesc(String userId);
    void deleteByIdAndUserId(String id, String userId);
}
