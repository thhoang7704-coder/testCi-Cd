package com.example.labOdc.Repository;

import com.example.labOdc.Model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {

    List<Report> findByProjectId(String projectId);

    List<Report> findByMentorId(String mentorId);

    List<Report> findByStatus(Report.Status status);

    List<Report> findByMentorIdAndStatus(String mentorId, Report.Status status);

    List<Report> findByReportType(Report.ReportType reportType);

    List<Report> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByStatus(Report.Status status);

    // Check trùng report theo project + type + period
    boolean existsByProjectIdAndReportTypeAndReportPeriodStartAndReportPeriodEnd(String projectId, Report.ReportType reportType, LocalDate start, LocalDate end);

    // Báo cáo theo tháng (MONTHLY)
    List<Report> findByProjectIdAndReportTypeAndReportPeriodStartBetween(String projectId, Report.ReportType reportType, LocalDate start, LocalDate end);

    // Lấy report đã SUBMITTED / APPROVED
    List<Report> findByProjectIdAndStatusIn(String projectId, List<Report.Status> statuses);

    List<Report> findByProjectIdAndStatus(String projectId, Report.Status status);

    List<Report> findByProjectIdAndMentorId(String projectId, String mentorId);

    long countByProjectIdAndStatus(String projectId, Report.Status status);
}
