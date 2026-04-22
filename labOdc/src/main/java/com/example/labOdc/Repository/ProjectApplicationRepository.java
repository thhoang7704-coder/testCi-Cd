package com.example.labOdc.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Model.ProjectApplication;

@Repository
public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, String> {
    List<ProjectApplication> findByProjectId(String projectId);

    List<ProjectApplication> findByTalentId(String talentId);

    boolean existsByProjectIdAndTalentId(String projectId, String talentId);

    Optional<ProjectApplication> findByProjectIdAndTalentId(String projectId, String talentId);

    List<ProjectApplication> findByProjectIdInAndStatus(List<String> projectIds, ProjectApplication.Status status);
}
