package com.safeguard.service;

import com.safeguard.dto.ErrorLogDTO;

public interface ErrorLogService {
    void logError(ErrorLogDTO errorLog);
}
