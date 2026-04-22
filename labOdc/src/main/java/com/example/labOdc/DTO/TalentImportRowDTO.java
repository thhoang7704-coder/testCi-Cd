package com.example.labOdc.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TalentImportRowDTO {
    private String email;
    private String fullName;
    private String phone;
    private String studentCode;
    private String major;
    private Integer year;
    private String skills;
}
