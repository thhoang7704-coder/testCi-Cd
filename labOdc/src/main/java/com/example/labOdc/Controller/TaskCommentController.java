package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.Response.TaskCommentResponse;
import com.example.labOdc.DTO.TaskCommentDTO;
import com.example.labOdc.Model.TaskComment;
import com.example.labOdc.Service.TaskCommentService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/taskcomments")
@AllArgsConstructor
public class TaskCommentController {

    private final TaskCommentService taskCommentService;

    // Tạo comment
    @PostMapping("/{userId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('TALENT_COMMENT_TASK')
""")
    public ApiResponse<TaskCommentResponse> createComment(
            @PathVariable String userId,
            @Valid @RequestBody TaskCommentDTO dto) {

        TaskComment comment = taskCommentService.createComment(dto, userId);
        return ApiResponse.success(
                TaskCommentResponse.fromEntity(comment),
                "Tạo comment thành công",
                HttpStatus.CREATED);
    }
    @GetMapping("/task/{taskId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('TALENT_VIEW_ASSIGNED_TASK')
""")
    public ApiResponse<List<TaskCommentResponse>> getByTask(@PathVariable String taskId) {

        List<TaskComment> list = taskCommentService.getCommentsByTask(taskId);

        return ApiResponse.success(
                list.stream().map(TaskCommentResponse::fromEntity).toList(),
                "Thành công",
                HttpStatus.OK);
    }
    @GetMapping("/user/{userId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
""")
    public ApiResponse<List<TaskCommentResponse>> getByUser(@PathVariable String userId) {
        List<TaskComment> list = taskCommentService.getByUser(userId);
        return ApiResponse.success(list.stream().map(TaskCommentResponse::fromEntity).toList(), "Thành công", HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('TALENT_VIEW_ASSIGNED_TASK')
""")
    public ApiResponse<TaskCommentResponse> getById(@PathVariable String id) {
        TaskComment comment = taskCommentService.getById(id);
        return ApiResponse.success(
                TaskCommentResponse.fromEntity(comment),
                "Thành công",
                HttpStatus.OK);
    }
    @PutMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('TALENT_COMMENT_TASK')
""")
    public ApiResponse<TaskCommentResponse> updateComment(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestBody TaskCommentDTO dto) {

        if (!taskCommentService.isOwner(id, userId)) {
            return ApiResponse.error(
                    "Bạn không có quyền sửa comment này",
                    HttpStatus.FORBIDDEN
            );
        }

        TaskComment comment = taskCommentService.updateComment(id, dto);
        return ApiResponse.success(
                TaskCommentResponse.fromEntity(comment),
                "Cập nhật thành công",
                HttpStatus.OK
        );
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
""")
    public ApiResponse<String> deleteComment(@PathVariable String id) {
        taskCommentService.deleteComment(id);
        return ApiResponse.success("Xóa thành công", "OK", HttpStatus.OK);
    }
    //Đếm comment theo task
    @GetMapping("/task/{taskId}/count")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_REVIEW_TASK')
""")
    public ApiResponse<Long> countByTask(@PathVariable String taskId) {
        return ApiResponse.success(
                taskCommentService.countByTask(taskId),
                "OK",
                HttpStatus.OK
        );
    }
    //Kiểm tra user có phải owner comment không
    @GetMapping("/{id}/is-owner/{userId}")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('TALENT_COMMENT_TASK')
""")
    public ApiResponse<Boolean> isOwner(
            @PathVariable String id,
            @PathVariable String userId
    ) {
        return ApiResponse.success(
                taskCommentService.isOwner(id, userId),
                "OK",
                HttpStatus.OK
        );
    }
    //Reply comment
    @PostMapping("/{userId}/reply/{parentId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('TALENT_COMMENT_TASK')
""")
    public ApiResponse<TaskCommentResponse> reply(
            @PathVariable String userId,
            @PathVariable String parentId,
            @RequestBody TaskCommentDTO dto) {

        TaskComment c = taskCommentService.replyComment(dto, userId, parentId);
        return ApiResponse.success(TaskCommentResponse.fromEntity(c), "Reply thành công", HttpStatus.CREATED);
    }

    //Pagination
    @GetMapping("/task/{taskId}/page")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('TALENT_VIEW_ASSIGNED_TASK')
""")
    public ApiResponse<List<TaskCommentResponse>> getPage(
            @PathVariable String taskId,
            @RequestParam int page,
            @RequestParam int size) {

        return ApiResponse.success(
                taskCommentService.getCommentsByTask(taskId, page, size)
                        .map(TaskCommentResponse::fromEntity)
                        .getContent(),
                "OK",
                HttpStatus.OK
        );
    }

    //Owner soft delete
    @DeleteMapping("/{id}/soft")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('TALENT_COMMENT_TASK')
""")
    public ApiResponse<String> softDelete(
            @PathVariable String id,
            @RequestParam String userId) {

        taskCommentService.softDeleteComment(id, userId);
        return ApiResponse.success("Xóa comment thành công", "OK", HttpStatus.OK);
    }

    // Tree comment Nội dung comment dạng cây phản ánh toàn bộ quá trình thảo luận, cần giới hạn quyền truy cập.
    @GetMapping("/task/{taskId}/tree")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('TALENT_VIEW_ASSIGNED_TASK')
""")
    public ApiResponse<Map<TaskCommentResponse, List<TaskCommentResponse>>> tree(
            @PathVariable String taskId) {

        Map<TaskComment, List<TaskComment>> tree = taskCommentService.getCommentTree(taskId);

        Map<TaskCommentResponse, List<TaskCommentResponse>> res = new LinkedHashMap<>();
        tree.forEach((k, v) ->
                res.put(
                        TaskCommentResponse.fromEntity(k),
                        v.stream().map(TaskCommentResponse::fromEntity).toList()
                )
        );

        return ApiResponse.success(res, "OK", HttpStatus.OK);
    }

}

