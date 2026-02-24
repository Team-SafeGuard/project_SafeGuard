package com.safeguard.service;

import com.safeguard.dto.SttResponse;
import org.springframework.web.multipart.MultipartFile;

public interface SttService {
    SttResponse transcribe(MultipartFile file);
}
