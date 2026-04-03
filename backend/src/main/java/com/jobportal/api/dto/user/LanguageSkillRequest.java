package com.jobportal.api.dto.user;

import com.jobportal.api.model.LanguageSkill;

public class LanguageSkillRequest {
    private String language;
    private LanguageSkill.Level level;

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public LanguageSkill.Level getLevel() { return level; }
    public void setLevel(LanguageSkill.Level level) { this.level = level; }
}
