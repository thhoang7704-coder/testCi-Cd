package com.example.labOdc.DTO.Action;

import java.time.LocalDate;

import lombok.Data;

@Data
public class RemoveMemberDTO {
    private LocalDate leftDate; // optional, null thì lấy LocalDate.now()
}