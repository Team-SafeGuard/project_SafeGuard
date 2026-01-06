package com.civilcomplaint.service;

import com.civilcomplaint.dto.request.LoginRequest;
import com.civilcomplaint.dto.request.RegisterRequest;
import com.civilcomplaint.dto.response.LoginResponse;
import com.civilcomplaint.dto.response.UserResponse;
import com.civilcomplaint.entity.AppUser;
import com.civilcomplaint.repository.UserRepository;
import com.civilcomplaint.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider jwtTokenProvider;

        @Transactional
        public UserResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already exists");
                }
                AppUser user = AppUser.builder()
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .name(request.getName())
                                .role("USER")
                                .build();
                userRepository.save(user);
                log.info("[Auth] Register success: {}", request.getEmail());
                return UserResponse.builder()
                                .id(user.getId())
                                .email(user.getEmail())
                                .name(user.getName())
                                .role(user.getRole())
                                .build();
        }

        @Transactional(readOnly = true)
        public LoginResponse login(LoginRequest request) {
                AppUser user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        throw new RuntimeException("Invalid credentials");
                }
                String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
                log.info("[Auth] Login success: {}", request.getEmail());
                return LoginResponse.builder()
                                .message("Login successful")
                                .token(token)
                                .user(UserResponse.builder()
                                                .id(user.getId())
                                                .email(user.getEmail())
                                                .name(user.getName())
                                                .role(user.getRole())
                                                .build())
                                .build();
        }

        @Transactional(readOnly = true)
        public UserResponse getUserInfo(Integer id) {
                AppUser user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return UserResponse.builder()
                                .id(user.getId())
                                .email(user.getEmail())
                                .name(user.getName())
                                .role(user.getRole())
                                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                                .build();
        }
}
