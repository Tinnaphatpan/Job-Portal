package com.jobportal.api.dto.auth;

import com.jobportal.api.model.User;

public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserInfo user;

    public AuthResponse(String accessToken, String refreshToken, UserInfo user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public UserInfo getUser() { return user; }

    public static class UserInfo {
        private String id;
        private String name;
        private String email;
        private String avatar;
        private User.Role role;
        private String companyName;
        private boolean mustChangePassword;

        public UserInfo(String id, String name, String email, String avatar, User.Role role, String companyName, boolean mustChangePassword) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.avatar = avatar;
            this.role = role;
            this.companyName = companyName;
            this.mustChangePassword = mustChangePassword;
        }

        public String getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getAvatar() { return avatar; }
        public User.Role getRole() { return role; }
        public String getCompanyName() { return companyName; }
        public boolean isMustChangePassword() { return mustChangePassword; }
    }
}
