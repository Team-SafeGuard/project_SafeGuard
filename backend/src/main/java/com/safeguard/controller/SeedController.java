package com.safeguard.controller;

import com.safeguard.dto.ComplaintDTO;
import com.safeguard.dto.SeedRequest;
import com.safeguard.dto.UserDTO;
import com.safeguard.entity.Agency;
import com.safeguard.mapper.ComplaintMapper;
import com.safeguard.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/seed")
@RequiredArgsConstructor
public class SeedController {

    private final ComplaintMapper complaintMapper;
    private final UserMapper userMapper;
    private final com.safeguard.mapper.AgencyMapper agencyMapper;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> resetData() {
        complaintMapper.deleteAllLikes();
        complaintMapper.deleteAllComplaints();
        return ResponseEntity.ok(Map.of("message", "All data deleted"));
    }

    @GetMapping("/agencies")
    public ResponseEntity<List<Agency>> getAgencies() {
        return ResponseEntity.ok(agencyMapper.findAll());
    }

    @PostMapping("/agencies")
    public ResponseEntity<Map<String, Object>> seedAgencies() {
        int count = 0;

        // 1) LOCAL Agencies (17 Regions)
        String[][] localAgencies = {
                { "서울특별시", "11" }, { "부산광역시", "26" }, { "대구광역시", "27" }, { "인천광역시", "28" },
                { "광주광역시", "29" }, { "대전광역시", "30" }, { "울산광역시", "31" }, { "세종특별자치시", "50" },
                { "경기도", "41" }, { "강원특별자치도", "42" }, { "충청북도", "43" }, { "충청남도", "44" },
                { "전북특별자치도", "45" }, { "전라남도", "46" }, { "경상북도", "47" }, { "경상남도", "48" },
                { "제주특별자치도", "49" }
        };

        for (String[] data : localAgencies) {
            if (!agencyMapper.existsByNameAndRegion(data[0], data[1])) {
                com.safeguard.entity.Agency agency = new com.safeguard.entity.Agency();
                agency.setAgencyName(data[0]);
                agency.setRegionCode(data[1]);
                agency.setAgencyType("LOCAL");
                agencyMapper.insertAgency(agency);
                count++;
            }
        }

        // 2) CENTRAL Agencies
        String[] centralAgencies = {
                "경찰청", "국토교통부", "고용노동부", "국방부", "국민권익위원회", "식품의약품안전처",
                "대검찰청", "기획재정부", "행정안전부", "보건복지부", "과학기술정보통신부", "국세청",
                "기후에너지환경부", "법무부", "공정거래위원회", "교육부", "해양수산부", "농림축산식품부",
                "소방청", "인사혁신처", "기타"
        };

        for (String name : centralAgencies) {
            if (!agencyMapper.existsByNameAndRegion(name, null)) {
                com.safeguard.entity.Agency agency = new com.safeguard.entity.Agency();
                agency.setAgencyName(name);
                agency.setRegionCode(null);
                agency.setAgencyType("CENTRAL");
                agencyMapper.insertAgency(agency);
                count++;
            }
        }

        return ResponseEntity.ok(Map.of("message", "Agencies seeded successfully", "count", count));
    }

    @PostMapping("/agency-admins")
    public ResponseEntity<Map<String, Object>> createAgencyAdmins() {
        int count = 0;
        List<Agency> agencies = agencyMapper.findAll();

        for (Agency agency : agencies) {
            // 기관별 관리자 ID 생성 (예: admin_seoul, admin_busan 등)
            String adminId = "admin_" + agency.getAgencyNo();

            // 이미 존재하면 스킵
            if (userMapper.existsByUserId(adminId)) {
                continue;
            }

            UserDTO adminUser = UserDTO.builder()
                    .userId(adminId)
                    .pw(passwordEncoder.encode("admin123"))
                    .name(agency.getAgencyName() + " 관리자")
                    .birthDate(java.time.LocalDate.of(1980, 1, 1))
                    .addr("서울시 중구 세종대로 110")
                    .phone("02-1234-5678")
                    .email(adminId + "@gov.kr")
                    .role(com.safeguard.enums.UserRole.AGENCY)
                    .agencyNo(agency.getAgencyNo())
                    .build();

            userMapper.save(adminUser);
            log.info("[Seed] Created agency admin: {} for {}", adminId, agency.getAgencyName());
            count++;
        }

        return ResponseEntity.ok(Map.of("message", "Agency admins created successfully", "count", count));
    }

    @PostMapping("/complaints")
    public ResponseEntity<Map<String, Object>> createSeedComplaint(@RequestBody SeedRequest request) {
        try {
            System.out.println(">>> SEED REQUEST START: " + request.getTitle());
            // 먼저 기존에 등록된 유저 찾기 (첫번째 유저 사용)
            UserDTO user = userMapper.findByUserId("testuser")
                    .orElseGet(() -> {
                        try {
                            // 테스트 유저가 없으면 만들기
                            log.info("Creating default test user for seeding...");
                            UserDTO newUser = UserDTO.builder()
                                    .userId("testuser")
                                    .pw(passwordEncoder.encode("testuser123"))
                                    .name("테스트유저")
                                    .birthDate(java.time.LocalDate.of(1990, 1, 1))
                                    .addr("서울시 강남구")
                                    .phone("010-0000-0000")
                                    .email("test@test.com")
                                    .role(com.safeguard.enums.UserRole.USER)
                                    .build();
                            userMapper.save(newUser);
                            return userMapper.findByUserId("testuser").orElseThrow();
                        } catch (Exception e) {
                            log.error("Failed to create test user", e);
                            throw new RuntimeException("Test user creation failed: " + e.getMessage());
                        }
                    });

            ComplaintDTO complaint = ComplaintDTO.builder()
                    .title(request.getTitle())
                    .content(request.getDescription())
                    .category(request.getCategory())
                    .address(request.getAddress())
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .imagePath(request.getImagePath())
                    .analysisResult(request.getAnalysisResult())
                    .status(request.getStatus() != null
                            ? com.safeguard.enums.ComplaintStatus.valueOf(request.getStatus())
                            : com.safeguard.enums.ComplaintStatus.RECEIVED)
                    .likeCount(request.getLikeCount() != null ? request.getLikeCount() : 0)
                    .createdDate(
                            request.getCreatedDate() != null ? java.time.OffsetDateTime.parse(request.getCreatedDate())
                                    : java.time.OffsetDateTime.now())
                    .isPublic(true)
                    .userNo(user.getUserNo())
                    .agencyNo(request.getAgencyNo())
                    .build();

            complaintMapper.insert(complaint);
            log.info("[Seed] Created complaint #{} for user {}, agency: {}",
                    complaint.getComplaintNo(), user.getUserId(), request.getAgencyNo());

            return ResponseEntity.ok(Map.of(
                    "message", "Complaint created",
                    "id", complaint.getComplaintNo()));
        } catch (Exception e) {
            e.printStackTrace(); // 콘솔에 강제 출력
            log.error("[Seed] CRITICAL ERROR: ", e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", e.getMessage() != null ? e.getMessage() : "Unknown error",
                    "type", e.getClass().getName()));
        }
    }
}
