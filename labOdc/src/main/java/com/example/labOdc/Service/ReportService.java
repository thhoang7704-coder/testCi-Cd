package com.example.labOdc.Service;

import com.example.labOdc.DTO.ReportDTO;
import com.example.labOdc.Model.Report;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface ReportService {

    Report createReport(ReportDTO dto, String mentorId);

    List<Report> getAllReports();

    Report getReportById(String id);

    List<Report> getReportsByProject(String projectId);

    List<Report> getReportsByMentor(String mentorId);

    List<Report> getReportsByStatus(Report.Status status);

    Report updateReport(String id, ReportDTO dto);

    void deleteReport(String id);

    Report submitReport(String id);

    Report reviewReport(String id, String adminId, Report.Status status, String reviewNotes);

    List<Report> getMyReports(String mentorId);

    List<Report> getMyReportsByStatus(String mentorId, Report.Status status);

    /**
     * Current logged-in mentor reports (mentor resolved from JWT username).
     */
    List<Report> getMyReports();

    /**
     * Current logged-in mentor reports by status (mentor resolved from JWT username).
     */
    List<Report> getMyReportsByStatus(Report.Status status);

    /**
     * Create report for current logged-in mentor (mentor resolved from JWT username).
     */
    Report createMyReport(ReportDTO dto);

    List<Report> getReportsByType(Report.ReportType reportType);

    List<Report> getReportsByDateRange(LocalDateTime start, LocalDateTime end);

    long countReportsByStatus(Report.Status status);
    // Check trùng report theo chu kỳ
    boolean existsReportPeriod(String projectId, Report.ReportType reportType, LocalDate start, LocalDate end);

    // Báo cáo tháng
    List<Report> getMonthlyReports(String projectId, int month, int year);

    // Tổng hợp tiến độ (mock logic – dùng cho đồ án)
    Object summarizeProjectProgress(String projectId);

    // Export report (stub)
    String exportReport(String reportId, String format);

    List<Report> getReportsByProjectAndStatus(String projectId, Report.Status status);

    List<Report> getReportsByProjectAndMentor(String projectId, String mentorId);

    Map<String, Long> countReportsByProject(String projectId);
}