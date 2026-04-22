package com.example.labOdc.DTO.Response;

import java.time.LocalDateTime;

import com.example.labOdc.Model.Company;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompanyResponse {

    private String id;
    private String userId;

    private String companyName;
    private String taxCode;
    private String address;
    private String industry;
    private String description;
    private String website;

    private String companySize;
    private String status;

    private String approvedById;
    private LocalDateTime approvedAt;
    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CompanyResponse fromCompany(Company c) {
        if (c == null)
            return null;

        return CompanyResponse.builder()
                .id(c.getId())
                .userId(c.getUser() != null ? c.getUser().getId() : null)

                .companyName(c.getCompanyName())
                .taxCode(c.getTaxCode())
                .address(c.getAddress())
                .industry(c.getIndustry())
                .description(c.getDescription())
                .website(c.getWebsite())

                .companySize(c.getCompanySize() != null ? c.getCompanySize().name() : null)
                .status(c.getStatus() != null ? c.getStatus().name() : null)

                .approvedById(c.getApprovedBy() != null ? c.getApprovedBy().getId() : null)
                .approvedAt(c.getApprovedAt())
                .rejectionReason(c.getRejectionReason())

                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}