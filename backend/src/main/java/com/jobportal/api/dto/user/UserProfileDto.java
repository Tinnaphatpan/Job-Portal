package com.jobportal.api.dto.user;

import com.jobportal.api.model.User;

public class UserProfileDto {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String avatar;
    private String headline;
    private String bio;
    private String resumeUrl;
    private String resumeFileName;
    private String companyName;
    private String companyWebsite;
    private User.Role role;

    public UserProfileDto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.avatar = user.getAvatar();
        this.headline = user.getHeadline();
        this.bio = user.getBio();
        this.resumeUrl = user.getResumeUrl();
        this.resumeFileName = user.getResumeFileName();
        this.companyName = user.getCompanyName();
        this.companyWebsite = user.getCompanyWebsite();
        this.role = user.getRole();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAvatar() { return avatar; }
    public String getHeadline() { return headline; }
    public String getBio() { return bio; }
    public String getResumeUrl() { return resumeUrl; }
    public String getResumeFileName() { return resumeFileName; }
    public String getCompanyName() { return companyName; }
    public String getCompanyWebsite() { return companyWebsite; }
    public User.Role getRole() { return role; }
}
