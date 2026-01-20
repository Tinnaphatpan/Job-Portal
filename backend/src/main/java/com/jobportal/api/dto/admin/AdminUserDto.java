package com.jobportal.api.dto.admin;

import com.jobportal.api.model.User;
import java.time.LocalDateTime;

public class AdminUserDto {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String companyName;
    private User.Role role;
    private boolean active;
    private boolean mustChangePassword;
    private LocalDateTime createdAt;

    public AdminUserDto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.companyName = user.getCompanyName();
        this.role = user.getRole();
        this.active = user.isActive();
        this.mustChangePassword = user.isMustChangePassword();
        this.createdAt = user.getCreatedAt();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getCompanyName() { return companyName; }
    public User.Role getRole() { return role; }
    public boolean isActive() { return active; }
    public boolean isMustChangePassword() { return mustChangePassword; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
