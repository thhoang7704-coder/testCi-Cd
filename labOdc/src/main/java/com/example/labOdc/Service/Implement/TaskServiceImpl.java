package com.example.labOdc.Service.Implement;

import com.example.labOdc.DTO.Response.TaskResponse;
import com.example.labOdc.DTO.TaskDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Task;
import com.example.labOdc.Repository.TaskRepository;
import com.example.labOdc.Service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    @Override
    public Task createTask(TaskDTO dto, String createdBy) {
        Task task = Task.builder()
                .projectId(dto.getProjectId())
                .assignedTo(dto.getAssignedTo())
                .createdBy(createdBy)
                .taskName(dto.getTaskName())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .status(Task.Status.TODO)
                .startDate(dto.getStartDate())
                .dueDate(dto.getDueDate())
                .estimatedHours(dto.getEstimatedHours())
                .excelTemplateUrl(dto.getExcelTemplateUrl())
                .attachments(dto.getAttachments())
                .build();

        return taskRepository.save(task);
    }

    @Override
    public Task updateTask(TaskDTO dto, String taskId) {
        Task task = getTaskById(taskId);

        task.setTaskName(dto.getTaskName());
        task.setDescription(dto.getDescription());
        task.setPriority(dto.getPriority());
        task.setStartDate(dto.getStartDate());
        task.setDueDate(dto.getDueDate());
        task.setEstimatedHours(dto.getEstimatedHours());
        task.setExcelTemplateUrl(dto.getExcelTemplateUrl());
        task.setAttachments(dto.getAttachments());

        return taskRepository.save(task);
    }

    @Override
    public Task updateStatus(String taskId, Task.Status status) {
        Task task = getTaskById(taskId);

        task.setStatus(status);

        if (status == Task.Status.DONE) {
            task.setCompletedDate(LocalDate.now());
        } else {
            task.setCompletedDate(null);
        }

        return taskRepository.save(task);
    }

    @Override
    public Task assignTask(String taskId, String talentId) {
        Task task = getTaskById(taskId);
        task.setAssignedTo(talentId);
        task.setStatus(Task.Status.IN_PROGRESS);

        return taskRepository.save(task);
    }

    @Override
    public Task unassignTask(String taskId) {
        Task task = getTaskById(taskId);
        task.setAssignedTo(null);
        task.setStatus(Task.Status.TODO);
        return taskRepository.save(task);
    }

    @Override
    public Task completeTask(String taskId) {
        Task task = getTaskById(taskId);
        task.setStatus(Task.Status.DONE);
        task.setCompletedDate(LocalDate.now());

        return taskRepository.save(task);
    }
    @Override
    public Task reopenTask(String taskId) {
        Task task = getTaskById(taskId);
        task.setStatus(Task.Status.IN_PROGRESS);
        task.setCompletedDate(null);
        return taskRepository.save(task);
    }

    @Override
    public Task cancelTask(String taskId) {
        Task task = getTaskById(taskId);
        task.setStatus(Task.Status.CANCELLED);
        return taskRepository.save(task);
    }
    @Override
    public Task getTaskById(String taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Task"));
    }

    @Override
    public List<Task> getTasksByProject(String projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    @Override
    public List<Task> getTasksByAssignee(String talentId) {
        return taskRepository.findByAssignedTo(talentId);
    }

    @Override
    public List<Task> getTasksByCreator(String userId) {
        return taskRepository.findByCreatedBy(userId);
    }
    @Override
    public List<Task> getTasksByStatus(Task.Status status) {
        return taskRepository.findByStatus(status);
    }

    @Override
    public List<Task> getOverdueTasks() {
        return taskRepository.findByDueDateBeforeAndStatusNot(
                LocalDate.now(),
                Task.Status.DONE
        );
    }

    @Override
    public void deleteTask(String taskId) {
        Task task = getTaskById(taskId);
        taskRepository.delete(task);
    }
    @Override
    public boolean canEditTask(String taskId, String userId) {
        Task task = getTaskById(taskId);
        return userId.equals(task.getCreatedBy())
                || userId.equals(task.getAssignedTo());
    }

    @Override
    public boolean canViewTask(String taskId, String userId) {
        Task task = getTaskById(taskId);
        return userId.equals(task.getCreatedBy())
                || userId.equals(task.getAssignedTo());
    }

    @Override
    public Task updatePriority(String taskId, Task.Priority priority) {
        Task task = getTaskById(taskId);
        task.setPriority(priority);
        return taskRepository.save(task);
    }
    @Override
    public long countTasksByProject(String projectId) {
        return taskRepository.countByProjectId(projectId);
    }

    @Override
    public long countTasksByProjectAndStatus(
            String projectId,
            Task.Status status
    ) {
        return taskRepository.countByProjectIdAndStatus(projectId, status);
    }

    @Override
    public Task submitTask(String taskId, String submitterId, List<String> attachments) {
        Task task = getTaskById(taskId);

        if (!submitterId.equals(task.getAssignedTo())) {
            throw new RuntimeException("Không có quyền nộp task này");
        }

        task.setAttachments(attachments);
        task.setStatus(Task.Status.REVIEW);

        return taskRepository.save(task);
    }

    @Override
    public Task reviewTask(
            String taskId,
            Task.Status status,
            String reviewerId
    ) {
        Task task = getTaskById(taskId);

        if (status == Task.Status.DONE) {
            task.setCompletedDate(LocalDate.now());
        }

        task.setStatus(status);
        return taskRepository.save(task);
    }
    @Override
    public Task updateDeadline(
            String taskId,
            LocalDate newDueDate,
            String reason
    ) {
        Task task = getTaskById(taskId);
        task.setDueDate(newDueDate);
        return taskRepository.save(task);
    }

    @Override
    public Task updateProgress(
            String taskId,
            int progressPercent,
            BigDecimal actualHours
    ) {
        Task task = getTaskById(taskId);
        task.setActualHours(actualHours);

        if (progressPercent == 100) {
            task.setStatus(Task.Status.DONE);
            task.setCompletedDate(LocalDate.now());
        }

        return taskRepository.save(task);
    }
    @Override
    public Task updateProgressPercent(String taskId, int percent) {
        Task task = getTaskById(taskId);

        if (percent < 0 || percent > 100) {
            throw new RuntimeException("Progress không hợp lệ");
        }

        task.setActualHours(task.getActualHours());
        task.setStatus(percent == 100 ? Task.Status.DONE : Task.Status.IN_PROGRESS);

        if (percent == 100) {
            task.setCompletedDate(LocalDate.now());
        }

        return taskRepository.save(task);
    }
    @Override
    public List<Task> getTasksByProjectSortedByDeadline(String projectId) {
        return taskRepository.findByProjectIdOrderByDueDateAsc(projectId);
    }

    @Override
    public List<Task> getTasksByProjectSortedByPriority(String projectId) {
        return taskRepository.findByProjectIdOrderByPriorityDesc(projectId);
    }
    @Override
    public long countByAssignee(String userId) {
        return taskRepository.countByAssignedTo(userId);
    }

    @Override
    public long countByAssigneeAndStatus(String userId, Task.Status status) {
        return taskRepository.countByAssignedToAndStatus(userId, status);
    }
}