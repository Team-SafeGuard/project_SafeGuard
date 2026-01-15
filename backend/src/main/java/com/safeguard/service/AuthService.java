package com.safeguard.service;

import com.safeguard.dto.LoginRequest;
import com.safeguard.dto.SignupRequest;
import java.util.Map;

public interface AuthService {

    void signup(SignupRequest request);

    Map<String, Object> login(LoginRequest request);

    String findId(String name, String phone, String birthDate);

    void verifyUserForReset(String userId, String phone, String birthDate);

    void updatePassword(String userId, String phone, String newPassword, String birthDate);

    boolean isIdDuplicate(String userId);

    Map<String, Object> getUserInfo(String userId);
}
