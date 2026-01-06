package com.civilcomplaint.entity;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUser {
    private Integer id;
    private String email;
    private String password;
    private String name;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
