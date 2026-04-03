package com.jobportal.api.repository;

import com.jobportal.api.model.LanguageSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LanguageSkillRepository extends JpaRepository<LanguageSkill, String> {
    List<LanguageSkill> findByUserId(String userId);
    void deleteByIdAndUserId(String id, String userId);
}
