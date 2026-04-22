package com.example.labOdc.DTO;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class ImportResult {
    private int total;
    private int success;
    private int failed;
    private List<String> errors = new ArrayList<>();
}
