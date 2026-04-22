package com.example.labOdc.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TaskCommentDTO {

    @NotBlank
    private String taskId;

    @NotBlank
    private String comment;

    private String attachments;
}
