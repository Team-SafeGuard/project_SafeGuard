package com.civilcomplaint.dto.request;

import lombok.Data;

@Data
public class ComplaintRequest {
    private String imagePath;
    private String description;
    private String analysisResult;
    private String status;
}
