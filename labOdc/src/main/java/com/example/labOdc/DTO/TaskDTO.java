package com.example.labOdc.DTO;

import com.example.labOdc.Model.Task;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class TaskDTO {
    @NotBlank
    private String projectId;

    private String assignedTo;

    @NotBlank
    private String taskName;

    private String description;

    private Task.Priority priority;

    private LocalDate startDate;
    private LocalDate dueDate;

    private BigDecimal estimatedHours;

    private String excelTemplateUrl;

    private List<String> attachments;
}
