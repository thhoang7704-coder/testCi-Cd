package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.LabAdmin;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LabAdminResponse {

    private String id;

    private String userId;
    private String userFullName;
    private String userEmail;

    private String department;
    private String position;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LabAdminResponse fromLabAdmin(LabAdmin labAdmin) {
        if (labAdmin == null)
            return null;

        return LabAdminResponse.builder()
                .id(labAdmin.getId())

                .userId(
                        labAdmin.getUser() != null
                                ? labAdmin.getUser().getId()
                                : null)
                .userFullName(
                        labAdmin.getUser() != null
                                ? labAdmin.getUser().getFullName()
                                : null)
                .userEmail(
                        labAdmin.getUser() != null
                                ? labAdmin.getUser().getEmail()
                                : null)

                .department(labAdmin.getDepartment())
                .position(labAdmin.getPosition())

                .createdAt(labAdmin.getCreatedAt())
                .updatedAt(labAdmin.getUpdatedAt())
                .build();
    }
}
