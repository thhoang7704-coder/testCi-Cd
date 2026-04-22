package com.example.labOdc.Service.Implement;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.labOdc.Enum.SubmissionStatus;
import com.example.labOdc.Enum.TemplateType;
import com.example.labOdc.Model.ExcelSubmission;
import com.example.labOdc.Repository.ExcelSubmissionRepository;
import com.example.labOdc.Service.ExcelSubmissionService;

@Service
public class ExcelSubmissionServiceImpl implements ExcelSubmissionService {
    private final ExcelSubmissionRepository repository;

    public ExcelSubmissionServiceImpl(ExcelSubmissionRepository excelSubmissionRepository) {
        this.repository = excelSubmissionRepository;
    }

    @Override
    public ExcelSubmission submitExcel(String projectId, String templateId,
            TemplateType type, String fileUrl, String userId) {

        ExcelSubmission submission = ExcelSubmission.builder()
                .projectId(projectId)
                .templateId(templateId)
                .templateType(type)
                .fileUrl(fileUrl)
                .submittedBy(userId)
                .status(SubmissionStatus.SUBMITTED)
                .submittedAt(LocalDateTime.now())
                .build();

        return repository.save(submission);
    }

    @Override
    public ExcelSubmission reviewSubmission(String submissionId,
            String reviewerId,
            String comment,
            boolean approved) {

        ExcelSubmission submission = repository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setReviewerId(reviewerId);
        submission.setReviewComment(comment);
        submission.setReviewedAt(LocalDateTime.now());

        submission.setStatus(
                approved ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED);

        return repository.save(submission);
    }

    @Override
    public List<ExcelSubmission> getByProject(String projectId) {
        return repository.findByProjectId(projectId);
    }

    @Override
    public List<ExcelSubmission> getMySubmissions(String userId) {
        return repository.findBySubmittedBy(userId);
    }
}
