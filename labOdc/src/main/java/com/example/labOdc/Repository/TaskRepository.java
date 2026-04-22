package com.example.labOdc.Repository;

import com.example.labOdc.Model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    List<Task> findByProjectId(String projectId);

    List<Task> findByAssignedTo(String assignedTo);

    List<Task> findByCreatedBy(String userId);

    List<Task> findByProjectIdAndStatus(String projectId, Task.Status status);

    List<Task> findByStatus(Task.Status status);

    List<Task> findByDueDateBeforeAndStatusNot(
            LocalDate date,
            Task.Status status
    );
    long countByProjectId(String projectId);

    long countByProjectIdAndStatus(
            String projectId,
            Task.Status status
    );
    List<Task> findByProjectIdAndAssignedTo(String projectId, String assignedTo);

    List<Task> findByProjectIdAndAssignedToAndStatus(
            String projectId,
            String assignedTo,
            Task.Status status
    );

    List<Task> findByProjectIdOrderByDueDateAsc(String projectId);

    List<Task> findByProjectIdOrderByPriorityDesc(String projectId);

    long countByAssignedTo(String userId);

    long countByAssignedToAndStatus(String userId, Task.Status status);
}