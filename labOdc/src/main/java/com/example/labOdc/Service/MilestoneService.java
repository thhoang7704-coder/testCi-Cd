package com.example.labOdc.Service;

import java.time.LocalDate;
import java.util.List;

import com.example.labOdc.DTO.MilestoneDTO;
import com.example.labOdc.Model.Milestone;

public interface MilestoneService {
    Milestone createMilestone(MilestoneDTO dto);

    List<Milestone> getAllMilestone();

    Milestone getMilestoneById(String id);

    Milestone updateMilestone(MilestoneDTO dto, String id);

    void deleteMilestone(String id);

    // workflow chuẩn
    List<Milestone> getMilestonesByProjectId(String projectId);

    Milestone completeMilestone(String milestoneId, LocalDate completedDate);
}