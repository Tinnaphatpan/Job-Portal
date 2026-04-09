package com.jobportal.api.service;

import com.jobportal.api.dto.auth.AuthResponse;
import com.jobportal.api.dto.auth.ChangePasswordRequest;
import com.jobportal.api.dto.auth.GoogleAuthRequest;
import com.jobportal.api.dto.auth.LoginRequest;
import com.jobportal.api.dto.auth.RefreshTokenRequest;
import com.jobportal.api.dto.auth.RegisterRequest;
import com.jobportal.api.model.User;
import com.jobportal.api.repository.UserRepository;
import com.jobportal.api.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String BEARER_PREFIX = "Bearer ";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, AuthenticationManager authenticationManager,
                       UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("อีเมลนี้ถูกใช้งานแล้ว");
        }
        User user = buildNewLocalUser(request);
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = findUserByEmail(request.getEmail());
        return buildAuthResponse(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new IllegalArgumentException("Refresh token ไม่ถูกต้องหรือหมดอายุ");
        }
        User user = findUserByEmail(email);
        return buildAuthResponse(user);
    }

    public AuthResponse.UserInfo getCurrentUser(HttpServletRequest request) {
        String token = extractBearerToken(request);
        String email = jwtService.extractUsername(token);
        User user = findUserByEmail(email);
        return toUserInfo(user);
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = findUserByEmail(email);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("รหัสผ่านปัจจุบันไม่ถูกต้อง");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(request.getEmail());
            user.setName(request.getName() != null ? request.getName() : request.getEmail());
            user.setProvider(User.AuthProvider.GOOGLE);
            user.setProviderId(request.getProviderId());
            user.setEmailVerified(true);
            user.setRole(User.Role.JOBSEEKER);
            if (request.getAvatar() != null) {
                user.setAvatar(request.getAvatar());
            }
            userRepository.save(user);
        } else if (user.getProvider() != User.AuthProvider.GOOGLE) {
            user.setProvider(User.AuthProvider.GOOGLE);
            user.setProviderId(request.getProviderId());
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        return buildAuthResponse(user);
    }

    // ===== Private Helpers =====

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
    }

    private User buildNewLocalUser(RegisterRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(request.getRole() != null ? request.getRole() : User.Role.JOBSEEKER);
        user.setProvider(User.AuthProvider.LOCAL);
        user.setCompanyName(request.getCompanyName());
        user.setPhone(request.getPhone());
        return user;
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return new AuthResponse(
                jwtService.generateToken(userDetails),
                jwtService.generateRefreshToken(userDetails),
                toUserInfo(user));
    }

    private String extractBearerToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            throw new IllegalArgumentException("ไม่พบ token");
        }
        return authHeader.substring(BEARER_PREFIX.length());
    }

    private AuthResponse.UserInfo toUserInfo(User user) {
        return new AuthResponse.UserInfo(
                user.getId(), user.getName(), user.getEmail(),
                user.getAvatar(), user.getRole(), user.getCompanyName(),
                user.isMustChangePassword());
    }
}
