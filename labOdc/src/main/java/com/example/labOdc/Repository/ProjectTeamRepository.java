package com.example.labOdc.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Model.ProjectTeam;

@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, String> {
    boolean existsByProjectIdAndTalentId(String projectId, String talentId);

    Optional<ProjectTeam> findByProjectIdAndTalentId(String projectId, String talentId);

    List<ProjectTeam> findByProjectIdOrderByCreatedAtDesc(String projectId);

    List<ProjectTeam> findByTalentId(String talentId);

    Optional<ProjectTeam> findFirstByProjectIdAndIsLeaderTrue(String projectId);
}