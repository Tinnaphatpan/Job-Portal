package com.jobportal.api.service;

import com.jobportal.api.dto.auth.*;
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
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(request.getRole() != null ? request.getRole() : User.Role.JOBSEEKER);
        user.setProvider(User.AuthProvider.LOCAL);
        user.setCompanyName(request.getCompanyName());
        user.setPhone(request.getPhone());
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        return buildAuthResponse(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new IllegalArgumentException("Refresh token ไม่ถูกต้องหรือหมดอายุ");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        return buildAuthResponse(user);
    }

    public AuthResponse.UserInfo getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("ไม่พบ token");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        return toUserInfo(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return new AuthResponse(
                jwtService.generateToken(userDetails),
                jwtService.generateRefreshToken(userDetails),
                toUserInfo(user));
    }

    public AuthResponse googleLogin(GoogleLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(request.getEmail());
                    newUser.setName(request.getName() != null ? request.getName() : request.getEmail());
                    newUser.setAvatar(request.getAvatar());
                    newUser.setProvider(User.AuthProvider.GOOGLE);
                    newUser.setProviderId(request.getProviderId());
                    newUser.setEmailVerified(true);
                    newUser.setRole(User.Role.JOBSEEKER);
                    return userRepository.save(newUser);
                });
        return buildAuthResponse(user);
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("รหัสผ่านปัจจุบันไม่ถูกต้อง");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    private AuthResponse.UserInfo toUserInfo(User user) {
        return new AuthResponse.UserInfo(
                user.getId(), user.getName(), user.getEmail(),
                user.getAvatar(), user.getRole(), user.getCompanyName(),
                user.isMustChangePassword());
    }
}
