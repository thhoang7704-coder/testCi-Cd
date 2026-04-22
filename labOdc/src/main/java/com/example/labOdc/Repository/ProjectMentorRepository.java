package com.example.labOdc.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Model.ProjectMentor;
import com.example.labOdc.Model.ProjectMentorRole;

@Repository
public interface ProjectMentorRepository extends JpaRepository<ProjectMentor, String> {
    boolean existsByProjectIdAndMentorId(String projectId, String mentorId);

    List<ProjectMentor> findByMentorIdOrderByAssignedAtDesc(String mentorId);

    List<ProjectMentor> findByProjectIdOrderByAssignedAtDesc(String projectId);

    Optional<ProjectMentor> findFirstByProjectIdAndRole(String projectId, ProjectMentorRole role);
}