package com.example.labOdc.Service.Implement;

import com.example.labOdc.DTO.ReportDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.LabAdmin;
import com.example.labOdc.Model.Mentor;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.Report;
import com.example.labOdc.Repository.LabAdminRepository;
import com.example.labOdc.Repository.MentorRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Repository.ReportRepository;
import com.example.labOdc.Service.ReportService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@AllArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final ProjectRepository projectRepository;
    private final MentorRepository mentorRepository;
    private final LabAdminRepository labAdminRepository;

    private Mentor resolveCurrentMentor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Unauthenticated user");
        }

        String username = auth.getName();

        return mentorRepository.findAll().stream()
                .filter(m -> m.getUser() != null && username.equals(m.getUser().getUsername()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Mentor cho user đang đăng nhập"));
    }

    @Override
    public Report createReport(ReportDTO dto, String mentorId) {

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Project"));

        // if (project.getMentor() == null) {
        // throw new IllegalStateException("Project chưa được gán mentor, không thể tạo
        // report");
        // }

        // if
        // (!String.valueOf(project.getMentor().getId()).equals(String.valueOf(mentorId)))
        // {
        // throw new IllegalStateException("MentorId không khớp với mentor của
        // project");
        // }

        // Mentor mentor = mentorRepository.findById(mentorId)
        // .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Mentor"));

        Report report = Report.builder()
                .project(project)
                // .mentor(mentor)
                .reportType(dto.getReportType())
                .title(dto.getTitle())
                .content(dto.getContent())
                .reportPeriodStart(dto.getReportPeriodStart())
                .reportPeriodEnd(dto.getReportPeriodEnd())
                .attachmentUrl(dto.getAttachmentUrl())
                .status(Report.Status.DRAFT)
                .build();

        return reportRepository.save(report);
    }

    @Override
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @Override
    public Report getReportById(String id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Report"));
    }

    @Override
    public List<Report> getReportsByProject(String projectId) {
        return reportRepository.findByProjectId(projectId);
    }

    @Override
    public List<Report> getReportsByMentor(String mentorId) {
        return reportRepository.findByMentorId(mentorId);
    }

    @Override
    public List<Report> getReportsByStatus(Report.Status status) {
        return reportRepository.findByStatus(status);
    }

    @Override
    public Report updateReport(String id, ReportDTO dto) {

        Report report = getReportById(id);

        if (dto.getTitle() != null) {
            report.setTitle(dto.getTitle());
        }

        if (dto.getContent() != null) {
            report.setContent(dto.getContent());
        }

        if (dto.getReportType() != null) {
            report.setReportType(dto.getReportType());
        }

        if (dto.getReportPeriodStart() != null) {
            report.setReportPeriodStart(dto.getReportPeriodStart());
        }

        if (dto.getReportPeriodEnd() != null) {
            report.setReportPeriodEnd(dto.getReportPeriodEnd());
        }

        if (dto.getAttachmentUrl() != null) {
            report.setAttachmentUrl(dto.getAttachmentUrl());
        }

        return reportRepository.save(report);
    }

    @Override
    public void deleteReport(String id) {
        reportRepository.deleteById(id);
    }

    @Override
    public Report submitReport(String id) {
        Report report = getReportById(id);

        if (report.getStatus() == Report.Status.APPROVED) {
            throw new IllegalStateException("Report đã được duyệt, không thể submit lại");
        }
        report.setStatus(Report.Status.SUBMITTED);
        report.setSubmittedDate(LocalDate.now());

        return reportRepository.save(report);
    }

    @Override
    public Report reviewReport(String id, String adminId, Report.Status status, String reviewNotes) {

        Report report = getReportById(id);

        LabAdmin admin = labAdminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy LabAdmin"));

        report.setReviewedBy(admin);
        report.setReviewedAt(LocalDateTime.now());
        report.setStatus(status);
        report.setReviewNotes(reviewNotes);

        return reportRepository.save(report);
    }

    @Override
    public List<Report> getMyReports(String mentorId) {
        return reportRepository.findByMentorId(mentorId);
    }

    @Override
    public List<Report> getMyReportsByStatus(String mentorId, Report.Status status) {
        return reportRepository.findByMentorIdAndStatus(mentorId, status);
    }

    @Override
    public List<Report> getMyReports() {
        Mentor mentor = resolveCurrentMentor();
        return reportRepository.findByMentorId(mentor.getId());
    }

    @Override
    public List<Report> getMyReportsByStatus(Report.Status status) {
        Mentor mentor = resolveCurrentMentor();
        return reportRepository.findByMentorIdAndStatus(mentor.getId(), status);
    }

    @Override
    public Report createMyReport(ReportDTO dto) {
        Mentor mentor = resolveCurrentMentor();
        return createReport(dto, mentor.getId());
    }

    @Override
    public List<Report> getReportsByType(Report.ReportType reportType) {
        return reportRepository.findByReportType(reportType);
    }

    @Override
    public List<Report> getReportsByDateRange(
            LocalDateTime start,
            LocalDateTime end) {

        return reportRepository.findByCreatedAtBetween(start, end);
    }

    @Override
    public long countReportsByStatus(Report.Status status) {
        return reportRepository.countByStatus(status);
    }

    @Override
    public boolean existsReportPeriod(
            String projectId,
            Report.ReportType reportType,
            LocalDate start,
            LocalDate end) {

        return reportRepository
                .existsByProjectIdAndReportTypeAndReportPeriodStartAndReportPeriodEnd(
                        projectId, reportType, start, end);
    }

    @Override
    public List<Report> getMonthlyReports(String projectId, int month, int year) {

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        return reportRepository
                .findByProjectIdAndReportTypeAndReportPeriodStartBetween(
                        projectId,
                        Report.ReportType.MONTHLY,
                        start,
                        end);
    }

    @Override
    public Map<String, Object> summarizeProjectProgress(String projectId) {

        List<Report> reports = reportRepository.findByProjectIdAndStatusIn(
                projectId,
                List.of(Report.Status.SUBMITTED, Report.Status.APPROVED));

        Map<String, Object> result = new HashMap<>();

        result.put("totalReports", reports.size());
        result.put("approvedReports",
                reports.stream()
                        .filter(r -> r.getStatus() == Report.Status.APPROVED)
                        .count());

        String latestTitle = reports.stream()
                .filter(r -> r.getCreatedAt() != null)
                .max(Comparator.comparing(Report::getCreatedAt))
                .map(Report::getTitle)
                .orElse(null);

        result.put("latestReport", latestTitle);

        return result;
    }

    @Override
    public String exportReport(String reportId, String format) {

        Report report = getReportById(reportId);

        // Stub cho đồ án – thực tế sẽ sinh file
        return "EXPORT_" + format.toUpperCase()
                + "_REPORT_" + report.getId();
    }

    @Override
    public List<Report> getReportsByProjectAndStatus(String projectId, Report.Status status) {

        return reportRepository.findByProjectIdAndStatus(projectId, status);
    }

    @Override
    public List<Report> getReportsByProjectAndMentor(String projectId, String mentorId) {

        return reportRepository.findByProjectIdAndMentorId(projectId, mentorId);
    }

    @Override
    public Map<String, Long> countReportsByProject(String projectId) {

        Map<String, Long> result = new java.util.HashMap<>();

        for (Report.Status status : Report.Status.values()) {
            long count = reportRepository.countByProjectIdAndStatus(projectId, status);
            result.put(status.name(), count);
        }

        return result;
    }
}