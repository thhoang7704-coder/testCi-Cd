package com.example.labOdc.Service.Implement;

import com.example.labOdc.DTO.TaskCommentDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Task;
import com.example.labOdc.Model.TaskComment;
import com.example.labOdc.Model.User;
import com.example.labOdc.Repository.TaskCommentRepository;
import com.example.labOdc.Repository.TaskRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.TaskCommentService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TaskCommentServiceImpl implements TaskCommentService {

    private static final String DELETED_FLAG = "[ĐÃ XÓA]";
    private final TaskCommentRepository taskCommentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    public TaskComment createComment(TaskCommentDTO dto, String userId) {

        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Task"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy User"));

        TaskComment comment = TaskComment.builder()
                .task(task)
                .user(user)
                .comment(dto.getComment())
                .attachments(dto.getAttachments())
                .build();

        return taskCommentRepository.save(comment);
    }

    @Override
    public List<TaskComment> getCommentsByTask(String taskId) {
        return taskCommentRepository.findByTaskId(taskId);
    }

    @Override
    public TaskComment getById(String id) {
        return taskCommentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy comment"));
    }
    @Override
    public List<TaskComment> getByUser(String userId) {
        return taskCommentRepository.findByUserId(userId);
    }
    @Override
    public TaskComment updateComment(String id, TaskCommentDTO dto) {
        TaskComment comment = getById(id);

        if (dto.getComment() != null) {
            comment.setComment(dto.getComment());
        }

        if (dto.getAttachments() != null) {
            comment.setAttachments(dto.getAttachments());
        }

        return taskCommentRepository.save(comment);
    }

    @Override
    public void deleteComment(String id) {
        taskCommentRepository.deleteById(id);
    }

    @Override
    public boolean isOwner(String commentId, String userId) {
        return taskCommentRepository.existsByIdAndUserId(commentId, userId);
    }

    @Override
    public long countByTask(String taskId) {
        return taskCommentRepository.countByTaskId(taskId);
    }

    @Override
    public TaskComment replyComment(TaskCommentDTO dto, String userId, String parentCommentId) {

        TaskComment parent = getById(parentCommentId);

        dto.setAttachments(parentCommentId);
        return createComment(dto, userId);
    }

    @Override
    public Page<TaskComment> getCommentsByTask(String taskId, int page, int size) {
        return taskCommentRepository.findByTaskId(
                taskId,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
    }
    @Override
    public void softDeleteComment(String id, String userId) {
        if (!isOwner(id, userId)) {
            throw new RuntimeException("Không có quyền xóa comment");
        }
        TaskComment comment = getById(id);
        comment.setComment(DELETED_FLAG);
        taskCommentRepository.save(comment);
    }
    @Override
    public Map<TaskComment, List<TaskComment>> getCommentTree(String taskId) {
        List<TaskComment> all = getCommentsByTask(taskId);

        Map<String, TaskComment> map = all.stream()
                .collect(Collectors.toMap(TaskComment::getId, c -> c));

        Map<TaskComment, List<TaskComment>> tree = new LinkedHashMap<>();

        for (TaskComment c : all) {
            if (c.getAttachments() == null) {
                tree.putIfAbsent(c, new ArrayList<>());
            } else {
                TaskComment parent = map.get(c.getAttachments());
                if (parent != null) {
                    tree.computeIfAbsent(parent, k -> new ArrayList<>()).add(c);
                }
            }
        }
        return tree;
    }
}