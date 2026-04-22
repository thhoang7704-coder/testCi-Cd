package com.example.labOdc.Service;

import java.util.List;

import com.example.labOdc.DTO.ProjectChangeRequestDTO;
import com.example.labOdc.DTO.Action.ApplyProjectChangeRequestDTO;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.ProjectChangeRequest;

public interface ProjectChangeRequestService {
    ProjectChangeRequest createProjectChangeRequest(ProjectChangeRequestDTO dto);

    List<ProjectChangeRequest> getAllProjectChangeRequest();

    ProjectChangeRequest getProjectChangeRequestById(String id);

    ProjectChangeRequest updateProjectChangeRequest(ProjectChangeRequestDTO dto, String id);

    void deleteProjectChangeRequest(String id);

    List<ProjectChangeRequest> getByProjectId(String projectId);

    ProjectChangeRequest approve(String id, String reviewNotes);

    ProjectChangeRequest reject(String id, String reviewNotes);

    ProjectChangeRequest cancel(String id);

    Project applyApprovedChangeRequest(String id, ApplyProjectChangeRequestDTO body);
}