package com.civilcomplaint.controller;

import com.civilcomplaint.dto.request.ComplaintRequest;
import com.civilcomplaint.security.JwtUserDetails;
import com.civilcomplaint.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {
    private final ComplaintService complaintService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(@AuthenticationPrincipal JwtUserDetails user) {
        return ResponseEntity.ok(complaintService.getComplaints(user != null ? user.getId() : null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> detail(@PathVariable Integer id,
            @AuthenticationPrincipal JwtUserDetails user) {
        return ResponseEntity.ok(complaintService.getComplaintDetail(id, user != null ? user.getId() : null));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody ComplaintRequest request,
            @AuthenticationPrincipal JwtUserDetails user) {
        return ResponseEntity.ok(complaintService.createComplaint(request, user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Integer id, @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal JwtUserDetails user) {
        return ResponseEntity.ok(complaintService.updateComplaint(id, request, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Integer id,
            @AuthenticationPrincipal JwtUserDetails user) {
        return ResponseEntity.ok(complaintService.deleteComplaint(id, user.getId(), user.getRole()));
    }
}
