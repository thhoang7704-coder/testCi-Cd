package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.Response.TeamVoteResponse;
import com.example.labOdc.DTO.TeamVoteDTO;
import com.example.labOdc.Model.TeamVote;
import com.example.labOdc.Service.TeamVoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teamvotes")
@RequiredArgsConstructor
public class TeamVoteController {

    private final TeamVoteService teamVoteService;


// Talent vote cho proposal
// talentId thường lấy từ JWT

    @PostMapping("/{talentId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LEADER_VOTE')
""")
    public ApiResponse<TeamVoteResponse> vote(
            @PathVariable String talentId,
            @Valid @RequestBody TeamVoteDTO dto) {

        TeamVote vote = teamVoteService.vote(dto, talentId);

        return ApiResponse.success(
                TeamVoteResponse.fromEntity(vote),
                "Vote thành công",
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('LEADER_VOTE')
""")
    public ApiResponse<TeamVoteResponse> update(
            @PathVariable String id,
            @Valid @RequestBody TeamVoteDTO dto) {

        TeamVote vote = teamVoteService.updateVote(id, dto);
        return ApiResponse.success(TeamVoteResponse.fromEntity(vote), "Cập nhật phiếu thành công", HttpStatus.OK);
    }
// Lấy tất cả vote

    @GetMapping("/")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('LEADER_VOTE')
""")
    public ApiResponse<List<TeamVoteResponse>> getAll() {
        return ApiResponse.success(
                teamVoteService.getAll()
                        .stream()
                        .map(TeamVoteResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }


// Lấy vote theo ID

    @GetMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('LEADER_VOTE')
""")
    public ApiResponse<TeamVoteResponse> getById(@PathVariable String id) {
        return ApiResponse.success(
                TeamVoteResponse.fromEntity(
                        teamVoteService.getById(id)),
                "Thành công",
                HttpStatus.OK);
    }


//     Lấy vote theo project

    @GetMapping("/project/{projectId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('LEADER_VOTE')
""")
    public ApiResponse<List<TeamVoteResponse>> getByProject(
            @PathVariable String projectId) {

        return ApiResponse.success(
                teamVoteService.getByProject(projectId)
                        .stream()
                        .map(TeamVoteResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }


//  Lấy vote theo talent
    @GetMapping("/talent/{talentId}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('LEADER_VOTE')
""")
    public ApiResponse<List<TeamVoteResponse>> getByTalent(
            @PathVariable String talentId) {

        return ApiResponse.success(
                teamVoteService.getByTalent(talentId)
                        .stream()
                        .map(TeamVoteResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }


// Lấy vote theo proposal

    @GetMapping("/proposal")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    or hasAuthority('LEADER_VOTE')
""")
    public ApiResponse<List<TeamVoteResponse>> getByProposal(
            @RequestParam String projectId,
            @RequestParam TeamVote.ProposalType proposalType,
            @RequestParam String proposalId) {

        return ApiResponse.success(
                teamVoteService.getByProposal(projectId, proposalType, proposalId)
                        .stream()
                        .map(TeamVoteResponse::fromEntity)
                        .toList(),
                "Thành công",
                HttpStatus.OK);
    }

    //Lấy vote của chính mình
    @GetMapping("/myvote")
    @PreAuthorize("hasAuthority('LEADER_VOTE')")
    public ApiResponse<TeamVoteResponse> myVote(
            @RequestParam String projectId,
            @RequestParam String talentId,
            @RequestParam TeamVote.ProposalType proposalType,
            @RequestParam String proposalId) {

        return ApiResponse.success(
                TeamVoteResponse.fromEntity(
                        teamVoteService.getMyVote(projectId, talentId, proposalType, proposalId)),
                "Thành công",
                HttpStatus.OK);
    }
    //Kiểm tra đã vote hay chưa
    @GetMapping("/has-voted")
    @PreAuthorize("hasAuthority('LEADER_VOTE')")
    public ApiResponse<Boolean> hasVoted(
            @RequestParam String projectId,
            @RequestParam String talentId,
            @RequestParam TeamVote.ProposalType proposalType,
            @RequestParam String proposalId) {

        return ApiResponse.success(
                teamVoteService.hasVoted(projectId, talentId, proposalType, proposalId),
                "Thành công",
                HttpStatus.OK);
    }
    //Thống kê kết quả proposal
    @GetMapping("/summary")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
""")
    public ApiResponse<?> summary(
            @RequestParam String projectId,
            @RequestParam TeamVote.ProposalType proposalType,
            @RequestParam String proposalId) {

        return ApiResponse.success(
                Map.of(
                        "YES", teamVoteService.countVote(projectId, proposalType, proposalId, TeamVote.Vote.YES),
                        "NO", teamVoteService.countVote(projectId, proposalType, proposalId, TeamVote.Vote.NO),
                        "ABSTAIN", teamVoteService.countVote(projectId, proposalType, proposalId, TeamVote.Vote.ABSTAIN)
                ),
                "Thống kê vote",
                HttpStatus.OK);
    }
    //Tổng số người đã vote
    @GetMapping("/count")
    @PreAuthorize("""
hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
or hasAuthority('MENTOR_REVIEW_TASK')
""")
    public ApiResponse<Long> countTotal(
            @RequestParam String projectId,
            @RequestParam TeamVote.ProposalType proposalType,
            @RequestParam String proposalId) {

        return ApiResponse.success(
                teamVoteService.countTotalVote(projectId, proposalType, proposalId),
                "Tổng số vote",
                HttpStatus.OK);
    }
    //Kiểm tra proposal đã được approve chưa
    @GetMapping("/approved")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
    or hasAuthority('MENTOR_REVIEW_TASK')
    """)
    public ApiResponse<Boolean> approved(
            @RequestParam String projectId,
            @RequestParam TeamVote.ProposalType proposalType,
            @RequestParam String proposalId,
            @RequestParam(defaultValue = "0.5") double ratio) {

        return ApiResponse.success(
                teamVoteService.isApproved(projectId, proposalType, proposalId, ratio),
                "Kết quả proposal",
                HttpStatus.OK);
    }
//Xóa toàn bộ vote của proposal
@DeleteMapping("/proposal")
@PreAuthorize("hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')")
public ApiResponse<String> deleteByProposal(
        @RequestParam String projectId,
        @RequestParam TeamVote.ProposalType proposalType,
        @RequestParam String proposalId) {

    teamVoteService.deleteByProposal(projectId, proposalType, proposalId);
    return ApiResponse.success("Đã xóa toàn bộ vote của proposal", "OK", HttpStatus.OK);
}

    // Xóa vote
    @DeleteMapping("/{id}")
    @PreAuthorize("""
    hasAnyRole('SYSTEM_ADMIN','LAB_ADMIN')
""")
    public ApiResponse<String> delete(@PathVariable String id) {
        teamVoteService.deleteVote(id);
        return ApiResponse.success("Xóa thành công", "OK", HttpStatus.OK);
    }
}