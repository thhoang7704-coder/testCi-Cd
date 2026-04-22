package com.example.labOdc.Repository;

import com.example.labOdc.Model.TaskComment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskCommentRepository extends JpaRepository<TaskComment, String> {

    List<TaskComment> findByTaskId(String taskId);

    List<TaskComment> findByUserId(String userId);

    long countByTaskId(String taskId);

    boolean existsByIdAndUserId(String id, String userId);

    Page<TaskComment> findByTaskId(String taskId, Pageable pageable);

    List<TaskComment> findByTaskIdAndCommentNot(String taskId, String deletedFlag);

    List<TaskComment> findByTaskIdAndAttachments(String taskId, String parentId);
}

