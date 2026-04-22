package com.example.labOdc.Service;

import java.util.List;

import com.example.labOdc.DTO.Response.FundDistributionResponse;
import com.example.labOdc.DTO.Response.ProjectApplicationResponse;
import com.example.labOdc.DTO.Response.ProjectResponse;
import com.example.labOdc.DTO.Response.TalentResponse;
import com.example.labOdc.DTO.Response.TaskResponse;
import com.example.labOdc.DTO.TalentDTO;

public interface TalentService {
    // ===== CRUD Core =====
    TalentResponse createTalent(TalentDTO talentDTO);

    // ===== Self profile (current TALENT) =====
    TalentResponse getMyTalent();

    TalentResponse updateMyTalent(TalentDTO talentDTO);

    List<TalentResponse> getAllTalents();

    TalentResponse getTalentById(String id);

    TalentResponse updateTalent(TalentDTO talentDTO, String id);

    void deleteTalent(String id);

    // ===== 4.5.2 Tham gia dự án =====
    List<ProjectResponse> getAvailableProjects();

    void applyToProject(String projectId, String coverLetter);

    List<ProjectApplicationResponse> getMyApplications();

    List<ProjectResponse> getMyProjects();

    // ===== 4.5.3 Thực hiện công việc =====
    List<TaskResponse> getAssignedTasks();

    void updateTaskProgress(String taskId, String status);

    // ===== 4.5.4 Theo dõi quyền lợi =====
    List<FundDistributionResponse> viewTeamFundDistribution(String projectId);
}
