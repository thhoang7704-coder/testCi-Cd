package com.example.labOdc.DTO.Response;

import java.time.LocalDateTime;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateMentorRequestDTO {
    private String email;
    private String password;
    private String fullName;
    private String username;
    private String phone;
    private String avatarUrl;
    private Boolean isActive;
    private Boolean emailVerified;
    private LocalDateTime emailVerifiedAt;
    private LocalDateTime lastLoginAt;
    private Set<String> roles; // Optional: nếu frontend muốn gửi thêm role khác

    // Phần Mentor
    private String expertise;
    private Integer yearsExperience;
    private String bio;
}
