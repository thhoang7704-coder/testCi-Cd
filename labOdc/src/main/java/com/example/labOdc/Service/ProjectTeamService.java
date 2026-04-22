package com.example.labOdc.Service;

import java.time.LocalDate;
import java.util.List;

import com.example.labOdc.DTO.ProjectTeamDTO;
import com.example.labOdc.Model.ProjectTeam;

public interface ProjectTeamService {
    ProjectTeam createProjectTeam(ProjectTeamDTO dto);

    List<ProjectTeam> getAllProjectTeam();

    ProjectTeam getProjectTeamById(String id);

    ProjectTeam updateProjectTeam(ProjectTeamDTO dto, String id);

    void deleteProjectTeam(String id);

    // workflow chuẩn
    List<ProjectTeam> getProjectTeamsByProjectId(String projectId);

    ProjectTeam setLeader(String projectTeamId);

    ProjectTeam removeMember(String projectTeamId, LocalDate leftDate);
}