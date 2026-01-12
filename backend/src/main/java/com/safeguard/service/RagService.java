package com.safeguard.service;

import com.safeguard.dto.RagAnalysisResponse;

public interface RagService {
    RagAnalysisResponse analyzeText(String text);
}
