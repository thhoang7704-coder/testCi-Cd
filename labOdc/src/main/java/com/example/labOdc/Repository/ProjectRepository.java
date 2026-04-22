package com.example.labOdc.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.ValidationStatus;

public interface ProjectRepository extends JpaRepository<Project, String> {
    boolean existsByProjectCode(String projectCode);

    Optional<Project> findByProjectCode(String projectCode);

    List<Project> findByValidationStatus(ValidationStatus validationStatus);

    List<Project> findByMentorId(String mentorId);
}
