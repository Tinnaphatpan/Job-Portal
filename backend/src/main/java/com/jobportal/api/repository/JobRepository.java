package com.jobportal.api.repository;

import com.jobportal.api.model.Job;
import com.jobportal.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, String> {

    Page<Job> findByStatusOrderByCreatedAtDesc(Job.JobStatus status, Pageable pageable);

    Page<Job> findByEmployerAndStatusOrderByCreatedAtDesc(User employer, Job.JobStatus status, Pageable pageable);

    // Full-text search ด้วย ILIKE
    @Query(value = """
        SELECT * FROM jobs
        WHERE status = 'ACTIVE'
        AND (
            :query IS NULL OR :query = ''
            OR title ILIKE '%' || :query || '%'
            OR company ILIKE '%' || :query || '%'
            OR description ILIKE '%' || :query || '%'
            OR category ILIKE '%' || :query || '%'
        )
        AND (:category IS NULL OR :category = '' OR category = :category)
        AND (:location IS NULL OR :location = '' OR location ILIKE '%' || :location || '%')
        AND (:jobType IS NULL OR :jobType = '' OR job_type = :jobType)
        AND (:remote IS NULL OR remote = :remote)
        ORDER BY created_at DESC
        """,
        countQuery = "SELECT COUNT(*) FROM jobs WHERE status = 'ACTIVE'",
        nativeQuery = true)
    Page<Object[]> searchJobs(
        @Param("query") String query,
        @Param("category") String category,
        @Param("location") String location,
        @Param("jobType") String jobType,
        @Param("remote") Boolean remote,
        Pageable pageable
    );

    @Modifying
    @Query("UPDATE Job j SET j.viewCount = j.viewCount + 1 WHERE j.id = :id")
    void incrementViewCount(@Param("id") String id);

    long countByStatus(Job.JobStatus status);
    Page<Job> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
