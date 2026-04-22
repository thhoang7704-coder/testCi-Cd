package com.example.labOdc.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Model.ProjectChangeRequest;
import com.example.labOdc.Model.ProjectChangeRequestStatus;

@Repository
public interface ProjectChangeRequestRepository extends JpaRepository<ProjectChangeRequest, String> {
    List<ProjectChangeRequest> findByProjectIdOrderByCreatedAtDesc(String projectId);

    long countByProjectIdAndStatus(String projectId, ProjectChangeRequestStatus status);
}