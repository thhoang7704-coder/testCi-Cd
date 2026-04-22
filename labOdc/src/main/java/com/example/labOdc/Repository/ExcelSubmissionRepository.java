package com.example.labOdc.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Enum.SubmissionStatus;
import com.example.labOdc.Model.ExcelSubmission;

@Repository
public interface ExcelSubmissionRepository extends JpaRepository<ExcelSubmission, String> {
    List<ExcelSubmission> findByProjectId(String projectId);

    List<ExcelSubmission> findBySubmittedBy(String userId);

    List<ExcelSubmission> findByStatus(SubmissionStatus status);
}
