package com.safeguard.controller;

import com.safeguard.dto.ComplaintDTO;
import com.safeguard.dto.UserDTO;
import com.safeguard.enums.ComplaintStatus;
import com.safeguard.enums.UserRole;
import com.safeguard.mapper.ComplaintMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintMapper complaintMapper;
    private final com.safeguard.mapper.UserMapper userMapper;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getComplaints(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "complaint_no") String sort,
            @RequestParam(defaultValue = "ASC") String order) {

        List<ComplaintDTO> complaints = complaintMapper.findAll(search, category, status, region, sort, order);
        int totalItems = complaints.size();
        int totalPages = (int) Math.ceil((double) totalItems / limit);

        // Simple pagination
        int start = (page - 1) * limit;
        List<Map<String, Object>> pagedComplaints = complaints.stream()
                .skip(start)
                .limit(limit)
                .map(c -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("complaintNo", c.getComplaintNo());
                    m.put("seqNo", c.getSeqNo());
                    m.put("title", c.getTitle());
                    m.put("category", c.getCategory());
                    m.put("status", c.getStatus());
                    m.put("createdDate", c.getCreatedDate() != null ? c.getCreatedDate().toString() : null);
                    m.put("address", c.getAddress());
                    m.put("authorName", "익명사용자");
                    m.put("likeCount", c.getLikeCount() != null ? c.getLikeCount() : 0);
                    m.put("isPublic", c.getIsPublic() != null ? c.getIsPublic() : true);
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("complaints", pagedComplaints);

        Map<String, Object> pagination = new HashMap<>();
        pagination.put("currentPage", page);
        pagination.put("totalPages", totalPages);
        pagination.put("totalItems", totalItems);
        pagination.put("limit", limit);

        response.put("pagination", pagination);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getComplaintDetail(@PathVariable Long id) {
        ComplaintDTO c = complaintMapper.findByComplaintNo(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Map<String, Object> result = new HashMap<>();
        result.put("complaintNo", c.getComplaintNo());
        result.put("title", c.getTitle());
        result.put("content", c.getContent());
        result.put("category", c.getCategory());
        result.put("status", c.getStatus());
        result.put("address", c.getAddress());
        result.put("latitude", c.getLatitude());
        result.put("longitude", c.getLongitude());
        result.put("imagePath", c.getImagePath());
        result.put("createdDate", c.getCreatedDate() != null ? c.getCreatedDate().toString() : null);
        result.put("authorName", "익명사용자");
        result.put("likeCount", c.getLikeCount() != null ? c.getLikeCount() : 0);
        result.put("answer", c.getAnswer());

        // Check if current user liked this
        // For testing, assuming userNo = 1 (testuser)
        Long userNo = userMapper.findByUserId("testuser").map(u -> u.getUserNo()).orElse(1L);
        result.put("liked", complaintMapper.isLikedByUser(id, userNo));

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long id) {
        // 실제로는 SecurityContext에서 userNo를 가져와야 함.
        // 현재는 테스트를 위해 testuser를 사용.
        // 실제 로그인 연동 시:
        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // if (auth == null || !auth.isAuthenticated()) return
        // ResponseEntity.status(401).build();

        Long userNo = userMapper.findByUserId("testuser").map(u -> u.getUserNo()).orElse(1L);

        boolean isLiked = complaintMapper.checkUserLike(id, userNo) > 0;
        log.info("Toggle Like Request: complaintNo={}, userNo={}, isLiked={}", id, userNo, isLiked);

        if (isLiked) {
            // 좋아요 취소
            log.info("Deleting like...");
            complaintMapper.deleteLike(id, userNo);
            complaintMapper.decreaseLikeCount(id);
        } else {
            // 좋아요 추가
            log.info("Inserting like...");
            complaintMapper.insertLike(id, userNo);
            complaintMapper.updateLikeCount(id);
        }

        ComplaintDTO c = complaintMapper.findByComplaintNo(id).orElseThrow();
        // liked 상태는 토글 후 반전된 상태임
        return ResponseEntity.ok(Map.of("message", "Success", "likeCount", c.getLikeCount(), "liked", !isLiked));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Map<String, Object>> stats = complaintMapper.getStats();
        if (stats != null && !stats.isEmpty()) {
            return ResponseEntity.ok(stats.get(0));
        }
        return ResponseEntity.ok(Map.of("total", 0, "processing", 0, "completed", 0));
    }

    @GetMapping("/top-liked")
    public ResponseEntity<List<ComplaintDTO>> getTopLiked() {
        return ResponseEntity.ok(complaintMapper.getTopLiked());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateStatus(@PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        ComplaintStatus status = ComplaintStatus.valueOf(statusStr);
        complaintMapper.updateStatus(id, status);
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }

    @PatchMapping("/{id}/answer")
    public ResponseEntity<Map<String, String>> updateAnswer(@PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String answer = body.get("answer");
        complaintMapper.updateAnswer(id, answer);
        return ResponseEntity.ok(Map.of("message", "Answer updated successfully"));
    }

    @PostMapping("/setup-agency")
    public ResponseEntity<String> setupAgency() {
        if (!userMapper.existsByUserId("admin")) {
            UserDTO admin = UserDTO.builder()
                    .userId("admin")
                    .pw("admin123")
                    .name("관리자")
                    .role(UserRole.AGENCY)
                    .phone("010-0000-0000") // Required by mapper? No, but good to have
                    .build();
            userMapper.save(admin);
            return ResponseEntity.ok("Admin created: admin/admin123");
        }
        return ResponseEntity.ok("Admin already exists");
    }

    @PostMapping("/setup-manager")
    public ResponseEntity<String> setupManager() {
        try {
            if (!userMapper.existsByUserId("manager")) {
                UserDTO manager = UserDTO.builder()
                        .userId("manager")
                        .pw(passwordEncoder.encode("manager123"))
                        .name("담당자")
                        .birthDate(java.time.LocalDate.of(1990, 1, 1))
                        .addr("서울시 강남구")
                        .email("manager@example.com")
                        .role(UserRole.AGENCY)
                        .phone("010-9999-9999")
                        .build();
                userMapper.save(manager);
                return ResponseEntity.ok("Manager created: manager/manager123");
            }
            return ResponseEntity.ok("Manager already exists");
        } catch (Exception e) {
            log.error("Failed to create manager user", e);
            return ResponseEntity.status(500).body("Failed to create manager: " + e.getMessage());
        }
    }
}
