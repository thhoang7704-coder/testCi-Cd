package com.example.labOdc.Controller;


import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.MemberContributionDTO;
import com.example.labOdc.DTO.Response.MemberContributionResponse;
import com.example.labOdc.Model.MemberContribution;
import com.example.labOdc.Service.MemberContributionService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/membercontributions")
@AllArgsConstructor
public class MemberContributionController {

    private final MemberContributionService memberContributionService;

//  Tạo contribution recordedByUserId thường lấy từ JWT
    @PostMapping("/{recordedByUserId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TALENT')
""")
    public ApiResponse<MemberContributionResponse> create(
            @PathVariable String recordedByUserId,
            @Valid @RequestBody MemberContributionDTO dto) {

        MemberContribution mc =
                memberContributionService.createContribution(dto, recordedByUserId);

        return ApiResponse.success(
                MemberContributionResponse.fromEntity(mc),
                "Tạo contribution thành công",
                HttpStatus.CREATED);
    }


//  Lấy tất cả contribution
    @GetMapping("/")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TALENT')
""")
    public ApiResponse<List<MemberContributionResponse>> getAll() {
        return ApiResponse.success(
                memberContributionService.getAll()
                        .stream()
                        .map(MemberContributionResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }

//    Lấy theo ID
    @GetMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TALENT')
    or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<MemberContributionResponse> getById(@PathVariable String id) {
        return ApiResponse.success(
                MemberContributionResponse.fromEntity(
                        memberContributionService.getById(id)),
                "Thành công",
                HttpStatus.OK);
    }


//  Lấy theo project

    @GetMapping("/project/{projectId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TALENT')
    or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<List<MemberContributionResponse>> getByProject(
            @PathVariable String projectId) {

        return ApiResponse.success(
                memberContributionService.getByProject(projectId)
                        .stream()
                        .map(MemberContributionResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }


//     Lấy theo talent

    @GetMapping("/talent/{talentId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TALENT')
    or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<List<MemberContributionResponse>> getByTalent(
            @PathVariable String talentId) {

        return ApiResponse.success(
                memberContributionService.getByTalent(talentId)
                        .stream()
                        .map(MemberContributionResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }


//  Lấy theo người ghi nhận

    @GetMapping("/recorder/{userId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TALENT')
""")
    public ApiResponse<List<MemberContributionResponse>> getByRecorder(
            @PathVariable String userId) {

        return ApiResponse.success(
                memberContributionService.getByRecorder(userId)
                        .stream()
                        .map(MemberContributionResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
    @GetMapping("/type/{type}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TALENT')
""")
    public ApiResponse<List<MemberContributionResponse>> byType(
            @PathVariable MemberContribution.ContributionType type) {
        List<MemberContribution> list = memberContributionService.getByType(type);
        return ApiResponse.success(
                list.stream().map(MemberContributionResponse::fromEntity).toList(),
                "OK",
                HttpStatus.OK);
    }

//   Cập nhật contribution
    @PutMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TALENT')
""")
    public ApiResponse<MemberContributionResponse> update(
            @PathVariable String id,
            @RequestBody MemberContributionDTO dto) {

        MemberContribution mc =
                memberContributionService.updateContribution(id, dto);

        return ApiResponse.success(
                MemberContributionResponse.fromEntity(mc),
                "Cập nhật thành công",
                HttpStatus.OK);
    }


//   Xóa contribution
    @DeleteMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
""")
    public ApiResponse<String> delete(@PathVariable String id) {
        memberContributionService.deleteContribution(id);
        return ApiResponse.success("Xóa thành công", "OK", HttpStatus.OK);
    }
    //project + talent
    @GetMapping("/project/{projectId}/talent/{talentId}")
    @PreAuthorize("""
        hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
        or hasAuthority('LAB_VIEW_ALL_DATA')
    """)
    public ApiResponse<List<MemberContributionResponse>> getByProjectAndTalent(
            @PathVariable String projectId,
            @PathVariable String talentId) {

        return ApiResponse.success(
                memberContributionService
                        .getByProjectAndTalent(projectId, talentId)
                        .stream()
                        .map(MemberContributionResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }

    //tổng điểm talent trong project
    @GetMapping("/project/{projectId}/talent/{talentId}/total-score")
    @PreAuthorize("""
        hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
        or hasAuthority('LAB_VIEW_ALL_DATA')
    """)
    public ApiResponse<BigDecimal> totalScore(
            @PathVariable String projectId,
            @PathVariable String talentId) {

        return ApiResponse.success(
                memberContributionService
                        .getTotalScoreOfTalentInProject(projectId, talentId),
                "Thành công",
                HttpStatus.OK);
    }

    //điểm trung bình của talent
    @GetMapping("/talent/{talentId}/average-score")
    @PreAuthorize("""
        hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
        or hasAuthority('LAB_VIEW_ALL_DATA')
    """)
    public ApiResponse<BigDecimal> avgScore(
            @PathVariable String talentId) {

        return ApiResponse.success(
                memberContributionService.getAverageScoreOfTalent(talentId),
                "Thành công",
                HttpStatus.OK);
    }

    //kiểm tra tồn tại
    @GetMapping("/exists")
    @PreAuthorize("""
        hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    """)
    public ApiResponse<Boolean> exists(
            @RequestParam String projectId,
            @RequestParam String talentId) {

        return ApiResponse.success(
                memberContributionService.existsContribution(projectId, talentId),
                "OK",
                HttpStatus.OK);
    }
    // tổng điểm project
    @GetMapping("/project/{projectId}/totalscore")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<BigDecimal> totalProjectScore(
            @PathVariable String projectId) {

        return ApiResponse.success(
                memberContributionService.getTotalScoreOfProject(projectId),
                "OK",
                HttpStatus.OK);
    }

    // % đóng góp talent
    @GetMapping("/project/{projectId}/talent/{talentId}/percentage")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LAB_VIEW_ALL_DATA')
    or hasAuthority('MENTOR_REVIEW_TALENT')
""")
    public ApiResponse<BigDecimal> percentage(
            @PathVariable String projectId,
            @PathVariable String talentId) {

        return ApiResponse.success(
                memberContributionService
                        .getContributionPercentage(projectId, talentId),
                "OK",
                HttpStatus.OK);
    }

    // ranking
    @GetMapping("/project/{projectId}/ranking")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LAB_VIEW_ALL_DATA')
    or hasAuthority('MENTOR_REVIEW_TALENT')
""")
    public ApiResponse<List<Object[]>> ranking(
            @PathVariable String projectId) {

        return ApiResponse.success(
                memberContributionService.getRankingByProject(projectId),
                "OK",
                HttpStatus.OK);
    }

    // history
    @GetMapping("/project/{projectId}/talent/{talentId}/history")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LAB_VIEW_ALL_DATA')
    or hasAuthority('MENTOR_REVIEW_TALENT')
""")
    public ApiResponse<List<MemberContributionResponse>> history(
            @PathVariable String projectId,
            @PathVariable String talentId) {

        return ApiResponse.success(
                memberContributionService.getHistory(projectId, talentId)
                        .stream()
                        .map(MemberContributionResponse::fromEntity)
                        .toList(),
                "OK",
                HttpStatus.OK);
    }

    // summary by type
    @GetMapping("/project/{projectId}/summary-by-type")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<List<Object[]>> summaryByType(
            @PathVariable String projectId) {

        return ApiResponse.success(
                memberContributionService.getSummaryByType(projectId),
                "OK",
                HttpStatus.OK);
    }
//    Đếm số contribution trong project
    @GetMapping("/project/{projectId}/count")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<Long> countByProject(
            @PathVariable String projectId) {

        return ApiResponse.success(
                memberContributionService.countByProject(projectId),
                "OK",
                HttpStatus.OK);
    }

}