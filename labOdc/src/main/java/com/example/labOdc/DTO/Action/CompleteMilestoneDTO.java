package com.example.labOdc.DTO.Action;

import java.time.LocalDate;

import lombok.Data;

@Data
public class CompleteMilestoneDTO {
    private LocalDate completedDate; // null -> LocalDate.now()
}