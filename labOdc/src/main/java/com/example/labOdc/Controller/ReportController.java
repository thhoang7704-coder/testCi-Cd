package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.ReportDTO;
import com.example.labOdc.DTO.Response.ReportResponse;
import com.example.labOdc.Model.Report;
import com.example.labOdc.Service.ReportService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@AllArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/{mentorId}")
    @PreAuthorize("""
        hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR','TALENT','COMPANY')
        or hasAuthority('MENTOR_SUBMIT_REPORT')
""")
    public ApiResponse<ReportResponse> createReport(
            @PathVariable String mentorId,
            @Valid @RequestBody ReportDTO dto) {

        Report report = reportService.createReport(dto, mentorId);

        return ApiResponse.success(
                ReportResponse.fromEntity(report),
                "Tạo report thành công",
                HttpStatus.CREATED);
    }

    @GetMapping("/")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR')
    or hasAuthority('LAB_VIEW_ALL_REPORTS')
""")
    public ApiResponse<List<ReportResponse>> getAllReports() {
        return ApiResponse.success(
                reportService.getAllReports()
                        .stream()
                        .map(ReportResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("""
        hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR','TALENT','COMPANY')
    or hasAuthority('LAB_VIEW_ALL_REPORTS')
""")
    public ApiResponse<ReportResponse> getById(@PathVariable String id) {
        return ApiResponse.success(
                ReportResponse.fromEntity(reportService.getReportById(id)),
                "Thành công",
                HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("""
        hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR','TALENT','COMPANY')
    or hasAuthority('LAB_VIEW_ALL_REPORTS')
""")
    public ApiResponse<List<ReportResponse>> getByProject(@PathVariable String projectId) {
        return ApiResponse.success(
                reportService.getReportsByProject(projectId)
                        .stream()
                        .map(ReportResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }

    @GetMapping("/mentor/{mentorId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR')
    or hasAuthority('LAB_VIEW_ALL_REPORTS')
""")
    public ApiResponse<List<ReportResponse>> getByMentor(@PathVariable String mentorId) {
        return ApiResponse.success(
                reportService.getReportsByMentor(mentorId)
                        .stream()
                        .map(ReportResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('LAB_ADMIN','SYSTEM_ADMIN')")
    public ApiResponse<List<ReportResponse>> byStatus(@PathVariable Report.Status status) {
        List<Report> list = reportService.getReportsByStatus(status);
        return ApiResponse.success(list
                        .stream()
                        .map(ReportResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR')
    or hasAuthority('MENTOR_SUBMIT_REPORT')
""")
    public ApiResponse<ReportResponse> updateReport(
            @PathVariable String id,
            @RequestBody ReportDTO dto) {

        Report report = reportService.updateReport(id, dto);

        return ApiResponse.success(
                ReportResponse.fromEntity(report),
                "Cập nhật thành công",
                HttpStatus.OK);
    }
    @PutMapping("/{id}/submit")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR')
    or hasAuthority('MENTOR_SUBMIT_REPORT')
""")
    public ApiResponse<ReportResponse> submitReport(@PathVariable String id) {
        return ApiResponse.success(
                ReportResponse.fromEntity(reportService.submitReport(id)),
                "Đã submit report",
                HttpStatus.OK);
    }

    @PutMapping("/{id}/review/{adminId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
""")
    public ApiResponse<ReportResponse> reviewReport(
            @PathVariable String id,
            @PathVariable String adminId,
            @RequestParam Report.Status status,
            @RequestParam(required = false) String notes) {

        return ApiResponse.success(
                ReportResponse.fromEntity(
                        reportService.reviewReport(id, adminId, status, notes)),
                "Review thành công",
                HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN', 'MENTOR')
""")
    public ApiResponse<String> deleteReport(@PathVariable String id) {
        reportService.deleteReport(id);
        return ApiResponse.success("Xóa thành công", "OK", HttpStatus.OK);
    }

        // ===== Current mentor endpoints (no mentorId param) =====

        @PostMapping("/my")
        @PreAuthorize("hasRole('MENTOR')")
        public ApiResponse<ReportResponse> createMyReport(@Valid @RequestBody ReportDTO dto) {
                Report report = reportService.createMyReport(dto);
                return ApiResponse.success(
                                ReportResponse.fromEntity(report),
                                "Tạo report thành công",
                                HttpStatus.CREATED);
        }

        @GetMapping("/my")
        @PreAuthorize("hasRole('MENTOR')")
        public ApiResponse<List<ReportResponse>> myReports() {
                return ApiResponse.success(
                                reportService.getMyReports()
                                                .stream()
                                                .map(ReportResponse::fromEntity)
                                                .toList(),
                                "Thành công",
                                HttpStatus.OK);
        }

        @GetMapping("/my/status/{status}")
        @PreAuthorize("hasRole('MENTOR')")
        public ApiResponse<List<ReportResponse>> myReportsByStatus(@PathVariable Report.Status status) {
                return ApiResponse.success(
                                reportService.getMyReportsByStatus(status)
                                                .stream()
                                                .map(ReportResponse::fromEntity)
                                                .toList(),
                                "Thành công",
                                HttpStatus.OK);
        }
    //My Reports
    @GetMapping("/my/{mentorId}")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR') or hasAuthority('MENTOR_SUBMIT_REPORT')")
    public ApiResponse<List<ReportResponse>> myReports(@PathVariable String mentorId) {

        return ApiResponse.success(
                reportService.getMyReports(mentorId)
                        .stream()
                        .map(ReportResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
    //My Reports theo trạng thái
    @GetMapping("/my/{mentorId}/status/{status}")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR') or hasAuthority('MENTOR_SUBMIT_REPORT')")
    public ApiResponse<List<ReportResponse>> myReportsByStatus(
            @PathVariable String mentorId,
            @PathVariable Report.Status status) {

        return ApiResponse.success(
                reportService.getMyReportsByStatus(mentorId, status)
                        .stream()
                        .map(ReportResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
    //Lọc theo loại report
    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<List<ReportResponse>> byType(@PathVariable Report.ReportType type) {

        return ApiResponse.success(
                reportService.getReportsByType(type)
                        .stream()
                        .map(ReportResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
    //Lọc theo khoảng thời gian
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<List<ReportResponse>> byDateRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {

        return ApiResponse.success(
                reportService.getReportsByDateRange(start, end)
                        .stream()
                        .map(ReportResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
    //Thống kê report theo trạng thái
    @GetMapping("/summary/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<?> summaryByStatus() {

        return ApiResponse.success(
                List.of(
                        Report.Status.DRAFT,
                        Report.Status.SUBMITTED,
                        Report.Status.APPROVED,
                        Report.Status.REJECTED,
                        Report.Status.REVISION_NEEDED
                ).stream().collect(
                        java.util.stream.Collectors.toMap(
                                s -> s.name(),
                                s -> reportService.countReportsByStatus(s)
                        )
                ),
                "Thống kê report",
                HttpStatus.OK);
    }
    @GetMapping("/exists")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR')")
    public ApiResponse<Boolean> existsReport(
            @RequestParam String projectId,
            @RequestParam Report.ReportType reportType,
            @RequestParam LocalDate start,
            @RequestParam LocalDate end) {

        return ApiResponse.success(
                reportService.existsReportPeriod(
                        projectId, reportType, start, end),
                "Check report",
                HttpStatus.OK
        );
    }
    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR')")
    public ApiResponse<List<ReportResponse>> monthlyReports(
            @RequestParam String projectId,
            @RequestParam int month,
            @RequestParam int year) {

        return ApiResponse.success(
                reportService.getMonthlyReports(projectId, month, year)
                        .stream()
                        .map(ReportResponse::fromEntity)
                        .toList(),
                "Báo cáo tháng",
                HttpStatus.OK
        );
    }
    @GetMapping("/project/{projectId}/summary")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR')")
    public ApiResponse<?> summaryProject(@PathVariable String projectId) {

        return ApiResponse.success(
                reportService.summarizeProjectProgress(projectId),
                "Tổng hợp tiến độ",
                HttpStatus.OK
        );
    }
    @GetMapping("/{id}/export")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<String> exportReport(
            @PathVariable String id,
            @RequestParam(defaultValue = "pdf") String format) {

        return ApiResponse.success(
                reportService.exportReport(id, format),
                "Export report",
                HttpStatus.OK
        );
    }
    @GetMapping("/project/{projectId}/status/{status}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR')
    or hasAuthority('LAB_VIEW_ALL_REPORTS')
""")
    public ApiResponse<List<ReportResponse>> getReportsByProjectAndStatus(
            @PathVariable String projectId,
            @PathVariable Report.Status status) {

        return ApiResponse.success(
                reportService.getReportsByProjectAndStatus(projectId, status)
                        .stream()
                        .map(ReportResponse::fromEntity)
                        .toList(),
                "Danh sách report theo project & status",
                HttpStatus.OK
        );
    }
    @GetMapping("/project/{projectId}/mentor/{mentorId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR')
    or hasAuthority('LAB_VIEW_ALL_REPORTS')
""")
    public ApiResponse<List<ReportResponse>> getReportsByProjectAndMentor(
            @PathVariable String projectId,
            @PathVariable String mentorId) {

        return ApiResponse.success(
                reportService.getReportsByProjectAndMentor(projectId, mentorId)
                        .stream()
                        .map(ReportResponse::fromEntity)
                        .toList(),
                "Danh sách report theo project & mentor",
                HttpStatus.OK
        );
    }

    @GetMapping("/project/{projectId}/count")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN','MENTOR')
    or hasAuthority('LAB_VIEW_ALL_REPORTS')
""")
    public ApiResponse<?> countReportsByProject(@PathVariable String projectId) {

        return ApiResponse.success(
                reportService.countReportsByProject(projectId),
                "Thống kê report theo project",
                HttpStatus.OK
        );
    }

}