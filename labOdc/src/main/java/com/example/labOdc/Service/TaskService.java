package com.example.labOdc.Service;

import com.example.labOdc.DTO.TaskDTO;
import com.example.labOdc.Model.Task;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TaskService {

    Task createTask(TaskDTO dto, String createdBy);

    Task updateTask(TaskDTO dto, String taskId);

    Task updateStatus(String taskId, Task.Status status);

    Task assignTask(String taskId, String talentId);

    Task unassignTask(String taskId);

    Task completeTask(String taskId);

    Task reopenTask(String taskId);

    Task cancelTask(String taskId);

    Task getTaskById(String taskId);

    List<Task> getTasksByProject(String projectId);

    List<Task> getTasksByAssignee(String talentId);

    List<Task> getTasksByCreator(String userId);

    List<Task> getTasksByStatus(Task.Status status);

    List<Task> getOverdueTasks();

    void deleteTask(String taskId);

    boolean canEditTask(String taskId, String userId);

    boolean canViewTask(String taskId, String userId);

    Task updatePriority(String taskId, Task.Priority priority);

    long countTasksByProject(String projectId);

    long countTasksByProjectAndStatus(String projectId, Task.Status status);

    Task submitTask(String taskId, String submitterId, List<String> attachments);

    Task reviewTask(
            String taskId,
            Task.Status status,
            String reviewerId
    );
    Task updateDeadline(
            String taskId,
            LocalDate newDueDate,
            String reason
    );

    Task updateProgress(
            String taskId,
            int progressPercent,
            BigDecimal actualHours
    );
    Task updateProgressPercent(String taskId, int percent);
    List<Task> getTasksByProjectSortedByDeadline(String projectId);
    List<Task> getTasksByProjectSortedByPriority(String projectId);
    long countByAssignee(String userId);
    long countByAssigneeAndStatus(String userId, Task.Status status);
}