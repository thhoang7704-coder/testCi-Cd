package com.example.labOdc.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.labOdc.Enum.TemplateType;
import com.example.labOdc.Model.ExcelSubmission;
import com.example.labOdc.Service.ExcelSubmissionService;

import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;

@PermitAll
@RestController
@RequestMapping("/api/excel-submissions")
@RequiredArgsConstructor
public class ExcelSubmissionController {

    private final ExcelSubmissionService excelSubmissionService;

    // 1. Submit excel file
    @PostMapping("/submit")
    public ExcelSubmission submitExcel(
            @RequestParam String projectId,
            @RequestParam String templateId,
            @RequestParam TemplateType type,
            @RequestParam String fileUrl,
            @RequestParam String userId) {

        return excelSubmissionService.submitExcel(
                projectId,
                templateId,
                type,
                fileUrl,
                userId);
    }

    // 2. Review submission (approve / reject)
    @PutMapping("/{id}/review")
    public ExcelSubmission reviewSubmission(
            @PathVariable String id,
            @RequestParam String reviewerId,
            @RequestParam String comment,
            @RequestParam boolean approved) {

        return excelSubmissionService.reviewSubmission(
                id,
                reviewerId,
                comment,
                approved);
    }

    // 3. Get submissions by project
    @GetMapping("/project/{projectId}")
    public List<ExcelSubmission> getByProject(@PathVariable String projectId) {
        return excelSubmissionService.getByProject(projectId);
    }

    // 4. Get my submissions
    @GetMapping("/my/{userId}")
    public List<ExcelSubmission> getMySubmissions(@PathVariable String userId) {
        return excelSubmissionService.getMySubmissions(userId);
    }
}
