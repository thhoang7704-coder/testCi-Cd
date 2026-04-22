package com.example.labOdc.Service;

import java.util.List;

import com.example.labOdc.Enum.TemplateType;
import com.example.labOdc.Model.ExcelSubmission;

public interface ExcelSubmissionService {
    ExcelSubmission submitExcel(
            String projectId,
            String templateId,
            TemplateType type,
            String fileUrl,
            String userId);

    ExcelSubmission reviewSubmission(
            String submissionId,
            String reviewerId,
            String comment,
            boolean approved);

    List<ExcelSubmission> getByProject(String projectId);

    List<ExcelSubmission> getMySubmissions(String userId);
}
