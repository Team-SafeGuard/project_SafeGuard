package com.safeguard.service;

import com.safeguard.dto.LoginRequest;
import com.safeguard.dto.SignupRequest;
import java.util.Map;

public interface AuthService {
    void signup(SignupRequest request);

    Map<String, Object> login(LoginRequest request);

    String findId(String name, String phone);

    void verifyUserForReset(String userId, String phone);

    void updatePassword(String userId, String phone, String newPassword);

    void resetPassword(String userId, String phone);

    Map<String, Object> getUserInfo(String userId);
}
