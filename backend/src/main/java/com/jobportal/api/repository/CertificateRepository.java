package com.jobportal.api.repository;

import com.jobportal.api.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, String> {
    List<Certificate> findByUserIdOrderByIssueDateDesc(String userId);
    void deleteByIdAndUserId(String id, String userId);
}
