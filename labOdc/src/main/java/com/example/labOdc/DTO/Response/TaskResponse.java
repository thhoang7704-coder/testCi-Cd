package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class TaskResponse {

    private String id;
    private String projectId;
    private String assignedTo;
    private String createdBy;
    private String taskName;
    private String description;
    private Task.Priority priority;
    private Task.Status status;
    private LocalDate startDate;
    private LocalDate dueDate;
    private LocalDate completedDate;
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;
    private String excelTemplateUrl;
    private List<String> attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .projectId(task.getProjectId())
                .assignedTo(task.getAssignedTo())
                .createdBy(task.getCreatedBy())
                .taskName(task.getTaskName())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .startDate(task.getStartDate())
                .dueDate(task.getDueDate())
                .completedDate(task.getCompletedDate())
                .estimatedHours(task.getEstimatedHours())
                .actualHours(task.getActualHours())
                .excelTemplateUrl(task.getExcelTemplateUrl())
                .attachments(task.getAttachments())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
