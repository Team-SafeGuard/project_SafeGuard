package com.civilcomplaint.security;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtUserDetails {
    private Integer id;
    private String email;
    private String role;
}
