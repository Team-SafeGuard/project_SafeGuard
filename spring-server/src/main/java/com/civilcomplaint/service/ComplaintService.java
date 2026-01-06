package com.civilcomplaint.service;

import com.civilcomplaint.dto.request.ComplaintRequest;
import com.civilcomplaint.entity.*;
import com.civilcomplaint.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintService {
    private final ComplaintMapper complaintMapper;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getComplaints(Integer userId) {
        List<Complaint> complaints = complaintMapper.findAll();
        return complaints.stream()
                .map(c -> {
                    String authorName = userMapper.findById(c.getUserId())
                            .map(AppUser::getName).orElse("Unknown");
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", c.getId());
                    m.put("imagePath", c.getImagePath());
                    m.put("description", c.getDescription());
                    m.put("status", c.getStatus());
                    m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
                    m.put("authorName", authorName);
                    return m;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getComplaintDetail(Integer id, Integer userId) {
        Complaint c = complaintMapper.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        String authorName = userMapper.findById(c.getUserId()).map(AppUser::getName).orElse("Unknown");
        String authorEmail = userMapper.findById(c.getUserId()).map(AppUser::getEmail).orElse("Unknown");

        Map<String, Object> result = new HashMap<>();
        result.put("id", c.getId());
        result.put("imagePath", c.getImagePath());
        result.put("description", c.getDescription());
        result.put("analysisResult", c.getAnalysisResult());
        result.put("status", c.getStatus());
        result.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        result.put("authorName", authorName);
        result.put("authorEmail", authorEmail);
        return result;
    }

    @Transactional
    public Map<String, Object> createComplaint(ComplaintRequest request, Integer userId) {
        Complaint c = Complaint.builder()
                .imagePath(request.getImagePath())
                .description(request.getDescription())
                .userId(userId)
                .status("PENDING")
                .build();
        complaintMapper.insert(c);
        log.info("[Complaints] Created: #{} by user {}", c.getId(), userId);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Complaint submitted");
        result.put("id", c.getId());
        return result;
    }

    @Transactional
    public Map<String, Object> updateComplaint(Integer id, ComplaintRequest request, Integer userId) {
        Complaint c = complaintMapper.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        if (!c.getUserId().equals(userId))
            throw new RuntimeException("Not authorized");

        if (request.getDescription() != null)
            c.setDescription(request.getDescription());
        if (request.getAnalysisResult() != null)
            c.setAnalysisResult(request.getAnalysisResult());
        if (request.getStatus() != null)
            c.setStatus(request.getStatus());
        complaintMapper.update(c);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Complaint updated");
        return result;
    }

    @Transactional
    public Map<String, Object> deleteComplaint(Integer id, Integer userId, String role) {
        Complaint c = complaintMapper.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        if (!c.getUserId().equals(userId) && "USER".equals(role))
            throw new RuntimeException("Not authorized");
        complaintMapper.deleteById(id);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Complaint deleted");
        return result;
    }
}
