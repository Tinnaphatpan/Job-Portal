package com.jobportal.api.repository;

import com.jobportal.api.model.EducationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EducationHistoryRepository extends JpaRepository<EducationHistory, String> {
    List<EducationHistory> findByUserIdOrderByStartYearDesc(String userId);
    void deleteByIdAndUserId(String id, String userId);
}
