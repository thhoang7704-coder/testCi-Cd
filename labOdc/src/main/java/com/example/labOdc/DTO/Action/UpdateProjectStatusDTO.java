package com.example.labOdc.DTO.Action;

import com.example.labOdc.Model.ProjectStatus;

import lombok.Data;

@Data
public class UpdateProjectStatusDTO {
    private ProjectStatus status;
}