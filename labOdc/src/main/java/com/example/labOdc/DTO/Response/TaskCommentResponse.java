package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.TaskComment;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TaskCommentResponse {
    private String id;
    private String taskId;
    private String userId;
    private String comment;
    private String attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskCommentResponse fromEntity(TaskComment taskComment) {
        return TaskCommentResponse.builder()
                .id(taskComment.getId())
                .taskId(taskComment.getTask() != null ? taskComment.getTask().getId() : null)
                .userId(taskComment.getUser() != null ? taskComment.getUser().getId() : null)
                .comment(taskComment.getComment())
                .attachments(taskComment.getAttachments())
                .createdAt(taskComment.getCreatedAt())
                .updatedAt(taskComment.getUpdatedAt())
                .build();
    }
}
