package com.example.labOdc.DTO.Response;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.labOdc.Model.User;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserResponse {
    private String id;
    private String email;
    private String fullName;
    private String username;
    private String phone;
    private String avatarUrl;
    private Set<String> roles;
    private Set<String> permissions;
    private Boolean isActive;
    private Boolean emailVerified;
    private LocalDateTime emailVerifiedAt;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .roles(user.getRoles().stream()
                        .map(role -> role.getRole().name())
                        .collect(Collectors.toSet()))
                .permissions(user.getRoles().stream()
                        .flatMap(role -> role.getPermissions().stream())
                        .map(p -> p.getCode())
                        .collect(Collectors.toSet()))
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .emailVerifiedAt(user.getEmailVerifiedAt())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
