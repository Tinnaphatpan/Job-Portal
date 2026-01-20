package com.jobportal.api.dto.admin;

import com.jobportal.api.model.User;

public class AdminCreateUserRequest {
    private String email;
    private String name;
    private String password;
    private String phone;
    private String companyName;
    private User.Role role = User.Role.JOBSEEKER;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }
}
