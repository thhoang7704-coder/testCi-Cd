package com.example.labOdc.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MentorDTO {
    private String expertise;
    private Integer yearsExperience;
    private String bio;
    private String name;
}
