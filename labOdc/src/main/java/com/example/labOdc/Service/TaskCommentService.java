package com.example.labOdc.Service;

import com.example.labOdc.DTO.TaskCommentDTO;
import com.example.labOdc.Model.TaskComment;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface TaskCommentService {

    TaskComment createComment(TaskCommentDTO dto, String userId);

    List<TaskComment> getCommentsByTask(String taskId);

    List<TaskComment> getByUser(String userId);

    TaskComment getById(String id);

    TaskComment updateComment(String id, TaskCommentDTO dto);

    void deleteComment(String id);

    boolean isOwner(String commentId, String userId);

    long countByTask(String taskId);

    TaskComment replyComment(TaskCommentDTO dto, String userId, String parentCommentId);

    Page<TaskComment> getCommentsByTask(String taskId, int page, int size);

    void softDeleteComment(String id, String userId);

    Map<TaskComment, List<TaskComment>> getCommentTree(String taskId);
}

