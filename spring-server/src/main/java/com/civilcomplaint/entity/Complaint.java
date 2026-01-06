package com.civilcomplaint.entity;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {
    private Integer id;
    private String imagePath;
    private String description;
    private String analysisResult;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer userId;
}
