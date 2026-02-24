package com.safeguard.controller;

import com.safeguard.dto.UserDTO;
import com.safeguard.security.CustomUserDetails;
import com.safeguard.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 내 프로필 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userNo = userDetails.getUserNo();
        return ResponseEntity.ok(userService.getUserProfile(userNo));
    }

    /**
     * 내 프로필 정보 수정 (이름, 주소, 전화번호 등)
     */
    @PatchMapping("/me/profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UserDTO userDTO) {
        
        userService.updateProfile(userDetails.getUserNo(), userDTO);
        return ResponseEntity.ok(Map.of("message", "프로필 정보가 수정되었습니다."));
    }

    /**
     * 내 비밀번호 수정
     */
    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        userService.updatePassword(userDetails.getUserNo(), currentPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
    }

    /**
     * 회원 탈퇴
     */
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteAccount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deleteAccount(userDetails.getUserNo());
        return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다."));
    }
}
