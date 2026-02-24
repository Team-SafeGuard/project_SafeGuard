package com.safeguard.service;

import com.safeguard.dto.UserDTO;

public interface UserService {
    /**
     * 사용자 프로필 정보를 업데이트합니다. (이름, 주소, 전화번호 등)
     */
    void updateProfile(Long userNo, UserDTO userDTO);

    /**
     * 사용자의 비밀번호를 업데이트합니다.
     * @param currentPassword 현재 비밀번호 (검증용)
     * @param newPassword 새 비밀번호
     */
    void updatePassword(Long userNo, String currentPassword, String newPassword);

    /**
     * 회원 탈퇴 처리를 합니다.
     */
    void deleteAccount(Long userNo);

    /**
     * 사용자 정보를 조회합니다.
     */
    UserDTO getUserProfile(Long userNo);
}
