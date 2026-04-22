package com.example.labOdc.Service;

import java.util.List;

import com.example.labOdc.DTO.ProjectDTO;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.ProjectStatus;

public interface ProjectService {
    Project createProject(ProjectDTO dto);

    List<Project> getAllProject();

    Project getProjectById(String id);

    Project updateProject(ProjectDTO dto, String id);

    void deleteProject(String id);

    // workflow
    Project submitProject(String projectId);

    Project completeProject(String projectId);

    /**
     * Mentor requests to complete a project. Verifies mentor ownership and that all tasks are DONE.
     */
    Project requestCompleteProject(String projectId);
    Project approveProject(String projectId, String validatedBy);

    Project rejectProject(String projectId, String validatedBy, String rejectionReason);

    Project updateProjectStatus(String projectId, ProjectStatus status);
}