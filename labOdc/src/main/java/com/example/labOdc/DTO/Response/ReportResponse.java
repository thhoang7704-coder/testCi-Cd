package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.Report;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ReportResponse {

    private String id;

    private String projectId;
    private String mentorId;

    private Report.ReportType reportType;
    private String title;
    private String content;

    private LocalDate reportPeriodStart;
    private LocalDate reportPeriodEnd;

    private LocalDate submittedDate;
    private Report.Status status;

    private String reviewedById;
    private LocalDateTime reviewedAt;
    private String reviewNotes;

    private String attachmentUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReportResponse fromEntity(Report report) {
        if (report == null)
            return null;

        return ReportResponse.builder()
                .id(report.getId())

                .projectId(
                        report.getProject() != null
                                ? report.getProject().getId()
                                : null)
                .mentorId(
                        report.getMentor() != null
                                ? report.getMentor().getId()
                                : null)

                .reportType(report.getReportType())
                .title(report.getTitle())
                .content(report.getContent())

                .reportPeriodStart(report.getReportPeriodStart())
                .reportPeriodEnd(report.getReportPeriodEnd())

                .submittedDate(report.getSubmittedDate())
                .status(report.getStatus())

                .reviewedById(
                        report.getReviewedBy() != null
                                ? report.getReviewedBy().getId()
                                : null)
                .reviewedAt(report.getReviewedAt())
                .reviewNotes(report.getReviewNotes())

                .attachmentUrl(report.getAttachmentUrl())

                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
