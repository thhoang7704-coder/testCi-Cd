package com.example.labOdc.DTO.Response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.labOdc.Model.Milestone;
import com.example.labOdc.Model.MilestoneStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MilestoneResponse {
    private String id;
    private String projectId;
    private String milestoneName;
    private String description;
    private LocalDate dueDate;
    private LocalDate completedDate;
    private MilestoneStatus status;
    private BigDecimal paymentPercentage;
    private String deliverables;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MilestoneResponse fromMilestone(Milestone m) {
        return MilestoneResponse.builder()
                .id(m.getId())
                .projectId(m.getProject() != null ? m.getProject().getId() : null)
                .milestoneName(m.getMilestoneName())
                .description(m.getDescription())
                .dueDate(m.getDueDate())
                .completedDate(m.getCompletedDate())
                .status(m.getStatus())
                .paymentPercentage(m.getPaymentPercentage())
                .deliverables(m.getDeliverables())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}