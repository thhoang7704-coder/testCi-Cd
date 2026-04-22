package com.example.labOdc.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MentorImportRowDTO {
    private String email;
    private String fullName;
    private String phone;
    private String expertise;
    private Integer experienceYears;
}
