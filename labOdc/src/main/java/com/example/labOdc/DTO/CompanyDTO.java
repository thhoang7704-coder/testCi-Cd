package com.example.labOdc.DTO;

import com.example.labOdc.Model.Company;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyDTO {
    @NotBlank
    private String companyName;

    @NotBlank
    private String taxCode;

    private String address;
    private String industry;
    private String description;
    private String website;
    private Company.Size companySize;
}
