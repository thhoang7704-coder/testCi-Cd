package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.MemberContribution;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MemberContributionResponse {

    private String id;

    private String projectId;
    private String projectName;

    private String talentId;
    private String talentName;
    private String talentStudentCode;

    private MemberContribution.ContributionType contributionType;

    private String description;
    private BigDecimal score;

    private String recordedById;
    private String recordedByName;

    private LocalDateTime recordedAt;

    public static MemberContributionResponse fromEntity(MemberContribution mc) {
        if (mc == null)
            return null;

        return MemberContributionResponse.builder()
                .id(mc.getId())

                .projectId(
                        mc.getProject() != null
                                ? mc.getProject().getId()
                                : null)
                .projectName(
                        mc.getProject() != null
                                ? mc.getProject().getProjectName()
                                : null)

                .talentId(
                        mc.getTalent() != null
                                ? mc.getTalent().getId()
                                : null)
                .talentName(
                        mc.getTalent() != null && mc.getTalent().getUser() != null
                                ? mc.getTalent().getUser().getFullName()
                                : null)
                .talentStudentCode(
                        mc.getTalent() != null
                                ? mc.getTalent().getStudentCode()
                                : null)

                .contributionType(mc.getContributionType())
                .description(mc.getDescription())
                .score(mc.getScore())

                .recordedById(
                        mc.getRecordedBy() != null
                                ? mc.getRecordedBy().getId()
                                : null)
                .recordedByName(
                        mc.getRecordedBy() != null
                                ? mc.getRecordedBy().getFullName()
                                : null)

                .recordedAt(mc.getRecordedAt())
                .build();
    }
}
