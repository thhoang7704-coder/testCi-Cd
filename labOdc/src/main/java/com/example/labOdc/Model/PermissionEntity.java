package com.example.labOdc.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionEntity {
    @Id
    @Column(length = 100)
    private String code; // ví dụ: SYSTEM_MANAGE_USERS

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String groupName; // SYSTEM / LAB / COMPANY /
}
