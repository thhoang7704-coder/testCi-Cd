package com.example.labOdc.DTO;

import com.example.labOdc.Model.Report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReportDTO {

    @NotBlank
    private String projectId;

    @NotNull
    private Report.ReportType reportType;

    @NotBlank
    private String title;

    private String content;

    private LocalDate reportPeriodStart;
    private LocalDate reportPeriodEnd;

    private String attachmentUrl;
}
