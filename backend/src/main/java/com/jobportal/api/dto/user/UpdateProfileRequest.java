package com.jobportal.api.dto.user;

import com.jobportal.api.model.User;
import java.time.LocalDate;

public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String headline;
    private String bio;
    private String companyName;
    private String companyWebsite;
    private User.Gender gender;
    private LocalDate birthDate;
    private String nationality;
    private String religion;
    private User.MilitaryStatus militaryStatus;
    private Integer weight;
    private Integer height;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }
    public User.Gender getGender() { return gender; }
    public void setGender(User.Gender gender) { this.gender = gender; }
    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public String getReligion() { return religion; }
    public void setReligion(String religion) { this.religion = religion; }
    public User.MilitaryStatus getMilitaryStatus() { return militaryStatus; }
    public void setMilitaryStatus(User.MilitaryStatus militaryStatus) { this.militaryStatus = militaryStatus; }
    public Integer getWeight() { return weight; }
    public void setWeight(Integer weight) { this.weight = weight; }
    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }
}
