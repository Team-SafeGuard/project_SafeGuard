package com.safeguard.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommonResponse<T> {
    private String result; // "SUCCESS" or "FAIL"
    private String message;
    private T data;
    private String errorCode;

    public static <T> CommonResponse<T> success(T data) {
        return CommonResponse.<T>builder()
                .result("SUCCESS")
                .data(data)
                .build();
    }

    public static <T> CommonResponse<T> success(T data, String message) {
        return CommonResponse.<T>builder()
                .result("SUCCESS")
                .message(message)
                .data(data)
                .build();
    }

    public static <T> CommonResponse<T> fail(String errorCode, String message) {
        return CommonResponse.<T>builder()
                .result("FAIL")
                .errorCode(errorCode)
                .message(message)
                .build();
    }
}
