package com.safeguard.service.impl;

import com.safeguard.service.ErrorLogService;

import com.safeguard.dto.ErrorLogDTO;
import com.safeguard.mapper.ErrorLogMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ErrorLogServiceImpl implements ErrorLogService {

    private final ErrorLogMapper errorLogMapper;

    @Override
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logError(ErrorLogDTO errorLog) {
        try {
            errorLogMapper.insertErrorLog(errorLog);
        } catch (Exception e) {
            log.error("Failed to save error log to DB: {}", e.getMessage());
        }
    }
}
