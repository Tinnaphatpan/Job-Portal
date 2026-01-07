package com.jobportal.api.repository;

import com.jobportal.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(User.Role role);
    org.springframework.data.domain.Page<User> findAllByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<User> findByRoleOrderByCreatedAtDesc(User.Role role, org.springframework.data.domain.Pageable pageable);
}
