package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.Response.TaskResponse;
import com.example.labOdc.DTO.TaskDTO;
import com.example.labOdc.Model.Task;
import com.example.labOdc.Model.Talent;
import com.example.labOdc.Model.User;
import com.example.labOdc.Repository.TalentRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.TaskService;
import com.example.labOdc.Exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;
    private final TalentRepository talentRepository;

    @PostMapping("/")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_ASSIGN_TASK')
""")
    public ApiResponse<TaskResponse> createTask(
            @Valid @RequestBody TaskDTO dto,
            Principal principal
    ) {
        Task task = taskService.createTask(dto, principal.getName());
        return ApiResponse.success(TaskResponse.fromEntity(task), "Tạo task thành công", HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_ASSIGN_TASK')
""")
    public ApiResponse<TaskResponse> updateTask(
            @Valid @RequestBody TaskDTO dto,
            @PathVariable String id
    ) {
        Task task = taskService.updateTask(dto, id);
        return ApiResponse.success(TaskResponse.fromEntity(task), "Cập nhật task thành công", HttpStatus.OK);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
""")
    public ApiResponse<TaskResponse> updateStatus(
            @PathVariable String id,
            @RequestParam Task.Status status
    ) {
        Task task = taskService.updateStatus(id, status);
        return ApiResponse.success(TaskResponse.fromEntity(task), "Cập nhật trạng thái", HttpStatus.OK);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_ASSIGN_TASK')
""")
    public ApiResponse<TaskResponse> assignTask(
            @PathVariable String id,
            @RequestParam String talentId
    ) {
        Task task = taskService.assignTask(id, talentId);
        return ApiResponse.success(TaskResponse.fromEntity(task), "Giao task thành công", HttpStatus.OK);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('TALENT_UPDATE_TASK')
""")
    public ApiResponse<TaskResponse> completeTask(@PathVariable String id) {
        Task task = taskService.completeTask(id);
        return ApiResponse.success(TaskResponse.fromEntity(task), "Hoàn thành task", HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasRole('MENTOR')
    or hasAuthority('TALENT_VIEW_ASSIGNED_TASK')
""")
    public ApiResponse<TaskResponse> getTaskById(@PathVariable String id) {
        Task task = taskService.getTaskById(id);
        return ApiResponse.success(TaskResponse.fromEntity(task), "OK", HttpStatus.OK);
    }
    @GetMapping("/project/{projectId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasRole('MENTOR')
    or hasAuthority('TALENT_VIEW_ASSIGNED_TASK')
""")
    public ApiResponse<List<TaskResponse>> getTasksByProject(@PathVariable String projectId) {
        List<TaskResponse> responses = taskService.getTasksByProject(projectId)
                .stream()
                .map(TaskResponse::fromEntity)
                .toList();

        return ApiResponse.success(responses, "OK", HttpStatus.OK);
    }

    @GetMapping("/assignee/{talentId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasRole('MENTOR')
    or hasAuthority('TALENT_VIEW_ASSIGNED_TASK')
""")
    public ApiResponse<List<TaskResponse>> getTasksByAssignee(@PathVariable String talentId) {
        List<TaskResponse> responses = taskService.getTasksByAssignee(talentId)
                .stream()
                .map(TaskResponse::fromEntity)
                .toList();

        return ApiResponse.success(responses, "OK", HttpStatus.OK);
    }

    @GetMapping("/me")
    @PreAuthorize("""
    hasAnyRole('TALENT','USER')
    or hasAuthority('TALENT_VIEW_ASSIGNED_TASK')
""")
    public ApiResponse<List<TaskResponse>> getMyTasks(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return ApiResponse.error(List.of("Unauthenticated user"));
        }

        final String login = principal.getName();
        User user = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Talent talent = talentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Talent not found"));

        List<TaskResponse> responses = taskService.getTasksByAssignee(talent.getId())
                .stream()
                .map(TaskResponse::fromEntity)
                .toList();

        return ApiResponse.success(responses, "OK", HttpStatus.OK);
    }
    @PatchMapping("/{id}/unassign")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_ASSIGN_TASK')
    """)
    public ApiResponse<TaskResponse> unassignTask(@PathVariable String id) {
        Task task = taskService.unassignTask(id);
        return ApiResponse.success(TaskResponse.fromEntity(task), "Thu hồi task", HttpStatus.OK);
    }

    @PatchMapping("/{id}/reopen")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    """)
    public ApiResponse<TaskResponse> reopenTask(@PathVariable String id) {
        Task task = taskService.reopenTask(id);
        return ApiResponse.success(TaskResponse.fromEntity(task), "Mở lại task", HttpStatus.OK);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    """)
    public ApiResponse<TaskResponse> cancelTask(@PathVariable String id) {
        Task task = taskService.cancelTask(id);
        return ApiResponse.success(TaskResponse.fromEntity(task), "Hủy task", HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_REVIEW_TASK')
""")
    public ApiResponse<List<TaskResponse>> getByStatus(@PathVariable Task.Status status) {
        List<TaskResponse> list = taskService.getTasksByStatus(status)
                .stream().map(TaskResponse::fromEntity).toList();
        return ApiResponse.success(list, "OK", HttpStatus.OK);
    }

    @GetMapping("/overdue")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_REVIEW_TASK')
""")
    public ApiResponse<List<TaskResponse>> getOverdueTasks() {
        List<TaskResponse> list = taskService.getOverdueTasks()
                .stream().map(TaskResponse::fromEntity).toList();
        return ApiResponse.success(list, "OK", HttpStatus.OK);
    }

    @GetMapping("/creator/{userId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_ASSIGN_TASK')
""")
    public ApiResponse<List<TaskResponse>> byCreator(@PathVariable String userId) {
        List<Task> list = taskService.getTasksByCreator(userId);
        return ApiResponse.success(list.stream().map(TaskResponse::fromEntity).toList(), "OK", HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
""")
    public ApiResponse<String> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ApiResponse.success("Xóa task thành công", "OK", HttpStatus.OK);
    }
    @PatchMapping("/{id}/priority")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_ASSIGN_TASK')
    """)
    public ApiResponse<TaskResponse> updatePriority(
            @PathVariable String id,
            @RequestParam Task.Priority priority
    ) {
        Task task = taskService.updatePriority(id, priority);
        return ApiResponse.success(
                TaskResponse.fromEntity(task),
                "Cập nhật độ ưu tiên",
                HttpStatus.OK
        );
    }
    @GetMapping("/project/{projectId}/count")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    """)
    public ApiResponse<Long> countByProject(
            @PathVariable String projectId
    ) {
        return ApiResponse.success(
                taskService.countTasksByProject(projectId),
                "OK",
                HttpStatus.OK
        );
    }
    @GetMapping("/project/{projectId}/count/{status}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    """)
    public ApiResponse<Long> countByProjectAndStatus(
            @PathVariable String projectId,
            @PathVariable Task.Status status
    ) {
        return ApiResponse.success(
                taskService.countTasksByProjectAndStatus(projectId, status),
                "OK",
                HttpStatus.OK
        );
    }
    //kiểm tra quyền chỉnh sửa task
    @GetMapping("/{id}/canedit")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_ASSIGN_TASK')
or hasAuthority('TALENT_UPDATE_TASK')
""")
    public ApiResponse<Boolean> canEdit(
            @PathVariable String id,
            Principal principal
    ) {
        return ApiResponse.success(
                taskService.canEditTask(id, principal.getName()),
                "OK",
                HttpStatus.OK
        );
    }
    //kiểm tra quyền xem task
    @GetMapping("/{id}/canview")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_REVIEW_TASK')
or hasAuthority('TALENT_VIEW_ASSIGNED_TASK')
""")
    public ApiResponse<Boolean> canView(
            @PathVariable String id,
            Principal principal
    ) {
        return ApiResponse.success(
                taskService.canViewTask(id, principal.getName()),
                "OK",
                HttpStatus.OK
        );
    }
    //Filter task theo project + assignee
    @GetMapping("/project/{projectId}/assignee/{talentId}")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_REVIEW_TASK')
""")
    public ApiResponse<List<TaskResponse>> getByProjectAndAssignee(
            @PathVariable String projectId,
            @PathVariable String talentId
    ) {
        return ApiResponse.success(
                taskService.getTasksByProject(projectId)
                        .stream()
                        .filter(t -> talentId.equals(t.getAssignedTo()))
                        .map(TaskResponse::fromEntity)
                        .toList(),
                "OK",
                HttpStatus.OK
        );
    }
    //Filter task theo project + assignee + status
    @GetMapping("/project/{projectId}/assignee/{talentId}/status/{status}")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_REVIEW_TASK')
""")
    public ApiResponse<List<TaskResponse>> filter(
            @PathVariable String projectId,
            @PathVariable String talentId,
            @PathVariable Task.Status status
    ) {
        return ApiResponse.success(
                taskService.getTasksByProject(projectId)
                        .stream()
                        .filter(t ->
                                talentId.equals(t.getAssignedTo())
                                        && status == t.getStatus()
                        )
                        .map(TaskResponse::fromEntity)
                        .toList(),
                "OK",
                HttpStatus.OK
        );
    }
    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasAuthority('TALENT_UPDATE_TASK')")
    public ApiResponse<TaskResponse> submitTask(
            @PathVariable String id,
            @RequestBody List<String> attachments,
            Principal principal
    ) {
        Task task = taskService.submitTask(id, principal.getName(), attachments);
        return ApiResponse.success(
                TaskResponse.fromEntity(task),
                "Nộp task thành công",
                HttpStatus.OK
        );
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_REVIEW_TASK')
""")
    public ApiResponse<TaskResponse> reviewTask(
            @PathVariable String id,
            @RequestParam Task.Status status,
            Principal principal
    ) {
        Task task = taskService.reviewTask(id, status, principal.getName());
        return ApiResponse.success(
                TaskResponse.fromEntity(task),
                "Đã review task",
                HttpStatus.OK
        );
    }
    @PatchMapping("/{id}/deadline")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_ASSIGN_TASK')
""")
    public ApiResponse<TaskResponse> updateDeadline(
            @PathVariable String id,
            @RequestParam LocalDate dueDate,
            @RequestParam(required = false) String reason
    ) {
        Task task = taskService.updateDeadline(id, dueDate, reason);
        return ApiResponse.success(
                TaskResponse.fromEntity(task),
                "Gia hạn deadline",
                HttpStatus.OK
        );
    }

    @PatchMapping("/{id}/progress")
    @PreAuthorize("hasAuthority('TALENT_UPDATE_TASK')")
    public ApiResponse<TaskResponse> updateProgress(
            @PathVariable String id,
            @RequestParam int progress,
            @RequestParam BigDecimal actualHours
    ) {
        Task task = taskService.updateProgress(id, progress, actualHours);
        return ApiResponse.success(
                TaskResponse.fromEntity(task),
                "Cập nhật tiến độ",
                HttpStatus.OK
        );
    }
//    LƯU TIẾN ĐỘ TASK
    @PatchMapping("/{id}/progresspercent")
    @PreAuthorize("hasAuthority('TALENT_UPDATE_TASK')")
    public ApiResponse<TaskResponse> updateProgressPercent(
            @PathVariable String id,
            @RequestParam int percent
    ) {
        return ApiResponse.success(
                TaskResponse.fromEntity(taskService.updateProgressPercent(id, percent)),
                "Cập nhật tiến độ %",
                HttpStatus.OK
        );
    }
    //FILTER + SORT THEO DEADLINE
    @GetMapping("/project/{projectId}/sort/deadline")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_REVIEW_TASK')
or hasAuthority('TALENT_VIEW_ASSIGNED_TASK')
""")
    public ApiResponse<List<TaskResponse>> sortByDeadline(@PathVariable String projectId) {
        return ApiResponse.success(
                taskService.getTasksByProjectSortedByDeadline(projectId)
                        .stream().map(TaskResponse::fromEntity).toList(),
                "OK",
                HttpStatus.OK
        );
    }
//    FILTER + SORT THEO PRIORITY
@GetMapping("/project/{projectId}/sort/priority")
@PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_REVIEW_TASK')
or hasAuthority('TALENT_VIEW_ASSIGNED_TASK')
""")
public ApiResponse<List<TaskResponse>> sortByPriority(@PathVariable String projectId) {
        return ApiResponse.success(
                taskService.getTasksByProjectSortedByPriority(projectId)
                        .stream().map(TaskResponse::fromEntity).toList(),
                "OK",
                HttpStatus.OK
        );
    }
//    THỐNG KÊ TASK CHO BÁO CÁO
@GetMapping("/assignee/{userId}/count")
@PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_REVIEW_TASK')
""")
    public ApiResponse<Long> countByAssignee(@PathVariable String userId) {
        return ApiResponse.success(
                taskService.countByAssignee(userId),
                "OK",
                HttpStatus.OK
        );
    }
}