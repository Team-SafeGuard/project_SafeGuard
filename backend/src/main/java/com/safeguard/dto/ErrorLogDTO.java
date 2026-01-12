package com.safeguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorLogDTO {
    private Long logId;
    private String traceId;
    private String endpoint;
    private String httpMethod;
    private String clientIp;
    private String userId;
    private String errorCode;
    private String errorMessage;
    private String stackTrace;
    private OffsetDateTime timestamp;
}
