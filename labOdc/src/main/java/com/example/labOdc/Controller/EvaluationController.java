package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.EvaluationDTO;
import com.example.labOdc.DTO.Response.EvaluationResponse;
import com.example.labOdc.Model.Evaluation;
import com.example.labOdc.Service.EvaluationService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@AllArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;
//    Tạo evaluation evaluatorType xác định: COMPANY / MENTOR / TALENT / LAB_ADMIN
    @PostMapping("/{evaluatorId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('COMPANY_EVALUATE')
    or hasAuthority('MENTOR_EVALUATE')
    or hasAuthority('TALENT_EVALUATE')
""")
    public ApiResponse<EvaluationResponse> createEvaluation(
            @PathVariable String evaluatorId,
            @RequestParam Evaluation.EvaluatorType evaluatorType,
            @Valid @RequestBody EvaluationDTO dto) {

        Evaluation evaluation = evaluationService.createEvaluation(
                dto,
                evaluatorId,
                evaluatorType);

        return ApiResponse.success(
                EvaluationResponse.fromEntity(evaluation),
                "Tạo đánh giá thành công",
                HttpStatus.CREATED);
    }
//  * Lấy tất cả evaluation
    @GetMapping("/")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<List<EvaluationResponse>> getAll() {
        return ApiResponse.success(
                evaluationService.getAll()
                        .stream()
                        .map(EvaluationResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
    //    Lấy evaluation theo ID
    @GetMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<EvaluationResponse> getById(@PathVariable String id) {
        return ApiResponse.success(
                EvaluationResponse.fromEntity(evaluationService.getById(id)),
                "Thành công",
                HttpStatus.OK);
    }
    //    Lấy evaluation theo project
    @GetMapping("/project/{projectId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<List<EvaluationResponse>> getByProject(@PathVariable String projectId) {
        return ApiResponse.success(
                evaluationService.getByProject(projectId)
                        .stream()
                        .map(EvaluationResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
//    Lấy evaluation theo người được đánh giá
    @GetMapping("/evaluated/{evaluatedId}")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('LAB_VIEW_ALL_DATA')
or (#evaluatedId == principal.name)
""")
    public ApiResponse<List<EvaluationResponse>> getByEvaluated(@PathVariable String evaluatedId) {
        return ApiResponse.success(
                evaluationService.getByEvaluated(evaluatedId)
                        .stream()
                        .map(EvaluationResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
//    Lấy evaluation theo người đánh giá
@GetMapping("/evaluator/{evaluatorId}")
@PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or (#evaluatorId == principal.name)
""")
public ApiResponse<List<EvaluationResponse>> getByEvaluator(@PathVariable String evaluatorId) {
        return ApiResponse.success(
                evaluationService.getByEvaluator(evaluatorId)
                        .stream()
                        .map(EvaluationResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
    @GetMapping("/type/{type}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<List<EvaluationResponse>> byType(@PathVariable Evaluation.EvaluatedType type) {
        List<Evaluation> list = evaluationService.getByEvaluatedType(type);
        return ApiResponse.success(list
                        .stream()
                        .map(EvaluationResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
//    Cập nhật evaluation
    @PutMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('COMPANY_EVALUATE')
    or hasAuthority('MENTOR_EVALUATE')
    or hasAuthority('TALENT_EVALUATE')
""")
    public ApiResponse<EvaluationResponse> updateEvaluation(
            @PathVariable String id,
            @RequestBody EvaluationDTO dto) {

        Evaluation evaluation = evaluationService.updateEvaluation(id, dto);

        return ApiResponse.success(
                EvaluationResponse.fromEntity(evaluation),
                "Cập nhật thành công",
                HttpStatus.OK);
    }
//    Xóa evaluation
    @DeleteMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
""")
    public ApiResponse<String> deleteEvaluation(@PathVariable String id) {
        evaluationService.deleteEvaluation(id);
        return ApiResponse.success("Xóa thành công", "OK", HttpStatus.OK);
    }
//tôi đã đánh giá
@GetMapping("/my/{evaluatorId}")
@PreAuthorize("#evaluatorId == principal.name")
public ApiResponse<List<EvaluationResponse>> myEvaluations(
            @PathVariable String evaluatorId) {

        return ApiResponse.success(
                evaluationService.getByEvaluator(evaluatorId)
                        .stream()
                        .map(EvaluationResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
    //người khác đánh giá tôi
    @GetMapping("/about/{evaluatedId}")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or (#evaluatedId == principal.name)
""")
    public ApiResponse<List<EvaluationResponse>> aboutMe(
            @PathVariable String evaluatedId) {

        return ApiResponse.success(
                evaluationService.getByEvaluated(evaluatedId)
                        .stream()
                        .map(EvaluationResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }
    //Điểm trung bình
    @GetMapping("/summary/{evaluatedId}/average")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<Double> averageRating(
            @PathVariable String evaluatedId) {

        return ApiResponse.success(
                evaluationService.getAverageRating(evaluatedId),
                "Điểm trung bình",
                HttpStatus.OK);
    }
    //Thống kê số lượt đánh giá
    @GetMapping("/summary/{evaluatedId}/count")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<Long> countEvaluations(
            @PathVariable String evaluatedId) {

        return ApiResponse.success(
                evaluationService.countEvaluationsFor(evaluatedId),
                "Số lượt đánh giá",
                HttpStatus.OK);
    }
    //Lọc theo khoảng thời gian
    @GetMapping("/range")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<List<EvaluationResponse>> byDateRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {

        return ApiResponse.success(
                evaluationService.getByDateRange(start, end)
                        .stream()
                        .map(EvaluationResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }

    @GetMapping("/{id}/canview")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('COMPANY_EVALUATE')
or hasAuthority('MENTOR_EVALUATE')
or hasAuthority('TALENT_EVALUATE')
""")
    public ApiResponse<Boolean> canView(
            @PathVariable String id,
            Principal principal) {

        return ApiResponse.success(
                evaluationService.canViewEvaluation(
                        id,
                        principal.getName()),
                "OK",
                HttpStatus.OK);
    }

    @GetMapping("/{id}/canedit")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('COMPANY_EVALUATE')
or hasAuthority('MENTOR_EVALUATE')
or hasAuthority('TALENT_EVALUATE')
""")
    public ApiResponse<Boolean> canEdit(
            @PathVariable String id,
            Principal principal) {

        return ApiResponse.success(
                evaluationService.canEditEvaluation(
                        id,
                        principal.getName()),
                "OK",
                HttpStatus.OK);
    }
    @GetMapping("/project/{projectId}/count")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<Long> countByProject(
            @PathVariable String projectId) {

        return ApiResponse.success(
                evaluationService.countByProject(projectId),
                "Thống kê thành công",
                HttpStatus.OK);
    }
    @GetMapping("/project/{projectId}/me/{evaluatorId}/exists")
    @PreAuthorize("hasAnyRole('COMPANY','MENTOR','TALENT')")
    public ApiResponse<Boolean> hasEvaluated(
            @PathVariable String projectId,
            @PathVariable String evaluatorId) {

        return ApiResponse.success(
                evaluationService.hasEvaluatedProject(
                        projectId,
                        evaluatorId),
                "OK",
                HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}/average")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('LAB_VIEW_ALL_DATA')
""")

    public ApiResponse<Double> avgProject(
            @PathVariable String projectId) {

        return ApiResponse.success(
                evaluationService.getAverageRatingByProject(projectId),
                "Điểm trung bình project",
                HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}/evaluated-type/{type}/count")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<Long> countByEvaluatedType(
            @PathVariable String projectId,
            @PathVariable Evaluation.EvaluatedType type) {

        return ApiResponse.success(
                evaluationService
                        .countByProjectAndEvaluatedType(projectId, type),
                "Thống kê thành công",
                HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}/evaluator-type/{type}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<List<EvaluationResponse>> byEvaluatorTypeInProject(
            @PathVariable String projectId,
            @PathVariable Evaluation.EvaluatorType type) {

        return ApiResponse.success(
                evaluationService
                        .getByProjectAndEvaluatorType(projectId, type)
                        .stream()
                        .map(EvaluationResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}/latest")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('LAB_VIEW_ALL_DATA')
""")
    public ApiResponse<List<EvaluationResponse>> latestEvaluations(
            @PathVariable String projectId) {

        return ApiResponse.success(
                evaluationService
                        .getLatestEvaluationsByProject(projectId)
                        .stream()
                        .map(EvaluationResponse::fromEntity)
                        .toList(),
                "Đánh giá mới nhất",
                HttpStatus.OK);
    }

    @GetMapping("/top/{evaluatedId}/high")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<List<EvaluationResponse>> topHigh(
            @PathVariable String evaluatedId) {

        return ApiResponse.success(
                evaluationService
                        .getTopHighRatings(evaluatedId)
                        .stream()
                        .map(EvaluationResponse::fromEntity)
                        .toList(),
                "Top đánh giá cao",
                HttpStatus.OK);
    }
    // ===== FINAL =====
    @PostMapping("/project/{projectId}/final")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<EvaluationResponse> finalEvaluation(
            @PathVariable String projectId,
            @RequestParam String evaluatorId,
            @RequestBody EvaluationDTO dto) {

        return ApiResponse.success(
                EvaluationResponse.fromEntity(
                        evaluationService.createFinalEvaluation(
                                projectId,
                                evaluatorId,
                                dto)),
                "Đánh giá cuối kỳ thành công",
                HttpStatus.CREATED
        );
    }

    // ===== LOCK =====
    @PostMapping("/project/{projectId}/lock")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<String> lock(
            @PathVariable String projectId) {

        evaluationService.lockProjectEvaluation(projectId);
        return ApiResponse.success("Đã khóa đánh giá", "OK", HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}/locked")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<Boolean> locked(
            @PathVariable String projectId) {

        return ApiResponse.success(
                evaluationService.isProjectLocked(projectId),
                "OK",
                HttpStatus.OK);
    }

    // ===== SUMMARY =====
    @GetMapping("/project/{projectId}/final-summary")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<Object> summary(
            @PathVariable String projectId) {

        return ApiResponse.success(
                evaluationService.getFinalSummary(projectId),
                "Tổng kết cuối kỳ",
                HttpStatus.OK);
    }

    // ===== OPTIONAL =====
    @GetMapping("/project/{projectId}/final-score")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<Double> finalScore(
            @PathVariable String projectId) {

        return ApiResponse.success(
                evaluationService.getFinalScore(projectId),
                "Final Score",
                HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}/final-exists")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
    public ApiResponse<Boolean> finalExists(
            @PathVariable String projectId) {

        return ApiResponse.success(
                evaluationService.finalExists(projectId),
                "OK",
                HttpStatus.OK);
    }

    @DeleteMapping("/project/{projectId}/final")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN')")
    public ApiResponse<String> deleteFinal(
            @PathVariable String projectId) {

        evaluationService.deleteFinalEvaluation(projectId);
        return ApiResponse.success("Đã xoá final", "OK", HttpStatus.OK);
    }
}
