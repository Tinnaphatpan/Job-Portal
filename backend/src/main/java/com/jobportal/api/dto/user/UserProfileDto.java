package com.jobportal.api.dto.user;

import com.jobportal.api.model.User;
import java.time.LocalDate;

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
    private User.Gender gender;
    private LocalDate birthDate;
    private String nationality;
    private String religion;
    private User.MilitaryStatus militaryStatus;
    private Integer weight;
    private Integer height;

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
        this.gender = user.getGender();
        this.birthDate = user.getBirthDate();
        this.nationality = user.getNationality();
        this.religion = user.getReligion();
        this.militaryStatus = user.getMilitaryStatus();
        this.weight = user.getWeight();
        this.height = user.getHeight();
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
    public User.Gender getGender() { return gender; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getNationality() { return nationality; }
    public String getReligion() { return religion; }
    public User.MilitaryStatus getMilitaryStatus() { return militaryStatus; }
    public Integer getWeight() { return weight; }
    public Integer getHeight() { return height; }
}
