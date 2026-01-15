package com.safeguard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ComplaintStatsDTO {
    private long total;
    private long today;
    private long received;
    private long processing;
    private long completed;
    @JsonProperty("sla_compliance")
    private double slaCompliance;
    private long overdue;

    // 요약 바(Summary Bar)를 위한 기간별 필드
    private long todayCount;
    private long yesterdayCount;
    private long monthCount;
    private long lastMonthCount;
    private long yearCount;
    private long lastYearCount;

    // 도로 상세 분석 KPI용 추가
    @JsonProperty("avg_processing_days")
    private double avgProcessingDays;
    @JsonProperty("completion_rate")
    private double completionRate;
    @JsonProperty("safety_risk_rate")
    private double safetyRiskRate;
    @JsonProperty("long_term_unprocessed_rate")
    private double longTermUnprocessedRate;
}
