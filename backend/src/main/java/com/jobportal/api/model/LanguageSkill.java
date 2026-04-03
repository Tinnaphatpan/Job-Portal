package com.jobportal.api.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "language_skills")
public class LanguageSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String language;

    @Enumerated(EnumType.STRING)
    private Level level;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Level { BASIC, INTERMEDIATE, ADVANCED, NATIVE }

    public LanguageSkill() {}

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public Level getLevel() { return level; }
    public void setLevel(Level level) { this.level = level; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
