package com.safeguard.service.impl;

import com.safeguard.service.ComplaintService;
import com.safeguard.service.FileService;

import com.safeguard.entity.Agency;
import com.safeguard.entity.Complaint;
import com.safeguard.entity.SpatialFeature;
import com.safeguard.enums.ComplaintStatus;
import com.safeguard.mapper.ComplaintMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintMapper complaintMapper;
    private final FileService fileService;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
    private final com.safeguard.mapper.AgencyMapper agencyMapper;

    @Override
    @Transactional
    public Long createComplaint(Map<String, Object> data, org.springframework.web.multipart.MultipartFile file,
            Long userNo) {
        log.info("Creating complaint for user: {}", userNo);

        String imagePath = (String) data.get("imagePath");
        if (file != null && !file.isEmpty()) {
            try {
                String fileName = fileService.storeFile(file);
                imagePath = "/uploads/" + fileName;
            } catch (Exception e) {
                log.error("Failed to upload file during complaint creation", e);
                // 파일 업로드 실패해도 민원은 접수? 아니면 에러?
                // 여기서는 로그만 남기고 진행하거나 throw new RuntimeException("Image upload failed");
            }
        }

        // 1. Complaint 저장
        Complaint complaint = new Complaint();
        complaint.setCategory((String) data.get("category"));
        complaint.setTitle((String) data.get("title"));
        complaint.setContent((String) data.get("content"));
        complaint.setIsPublic((Boolean) data.get("isPublic"));
        complaint.setStatus(ComplaintStatus.UNPROCESSED);
        complaint.setUserNo(userNo);
        complaint.setImagePath(imagePath);

        // 위치 정보 설정
        @SuppressWarnings("unchecked")
        Map<String, Object> location = (Map<String, Object>) data.get("location");
        if (location != null) {
            if (location.containsKey("address")) {
                complaint.setAddress((String) location.get("address"));
            }
            if (location.containsKey("lat") && location.containsKey("lng")) {
                complaint.setLatitude(Double.parseDouble(location.get("lat").toString()));
                complaint.setLongitude(Double.parseDouble(location.get("lng").toString()));
            }
        }

        // 기관 정보 설정
        if (data.containsKey("agencyCode")) {
            Object agencyCodeObj = data.get("agencyCode");
            if (agencyCodeObj != null) {
                Long parsedAgencyNo = null;
                if (agencyCodeObj instanceof Integer) {
                    parsedAgencyNo = ((Integer) agencyCodeObj).longValue();
                } else if (agencyCodeObj instanceof Long) {
                    parsedAgencyNo = (Long) agencyCodeObj;
                } else if (agencyCodeObj instanceof String) {
                    try {
                        parsedAgencyNo = Long.parseLong((String) agencyCodeObj);
                    } catch (NumberFormatException e) {
                        log.warn("Invalid agencyCode format: {}", agencyCodeObj);
                    }
                }

                if (parsedAgencyNo != null && parsedAgencyNo > 0) {
                    complaint.setAgencyNo(parsedAgencyNo);
                }
            }
        }

        complaintMapper.insertComplaint(complaint);
        Long complaintNo = complaint.getComplaintNo();

        // 2. Spatial Feature 저장
        if (location != null) {
            SpatialFeature sf = new SpatialFeature();
            sf.setComplaintNo(complaintNo);
            sf.setFeatureType("POINT");
            sf.setAddrText((String) location.get("address"));

            double lat = Double.parseDouble(location.get("lat").toString());
            double lng = Double.parseDouble(location.get("lng").toString());
            sf.setGeom(geometryFactory.createPoint(new Coordinate(lng, lat)));

            complaintMapper.insertSpatialFeature(sf);
        }

        // 3. 기관 매핑 (Multi-Agency Assignment)
        // A. 소관 부처 (AI 결과)
        if (complaint.getAgencyNo() != null) {
            complaintMapper.insertComplaintAgency(complaintNo, complaint.getAgencyNo());
        }

        // B. 관할 지자체 (주소 기반)
        if (complaint.getAddress() != null) {
            String[] addrParts = complaint.getAddress().split(" ");
            if (addrParts.length > 0) {
                String regionName = addrParts[0]; // e.g., "서울특별시"
                Agency regionAgency = agencyMapper.selectAgencyByName(regionName);

                // 중복 방지: 이미 AI 결과로 들어간 기관이 지자체와 같다면 skip
                if (regionAgency != null) {
                    if (complaint.getAgencyNo() == null
                            || !complaint.getAgencyNo().equals(regionAgency.getAgencyNo())) {
                        complaintMapper.insertComplaintAgency(complaintNo, regionAgency.getAgencyNo());
                    }
                }
            }
        }

        return complaintNo;
    }
}
