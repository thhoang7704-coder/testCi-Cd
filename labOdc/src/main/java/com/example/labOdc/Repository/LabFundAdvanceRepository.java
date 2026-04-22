package com.example.labOdc.Repository;

import com.example.labOdc.Model.LabFundAdvance;
import com.example.labOdc.Model.LabFundAdvanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabFundAdvanceRepository extends JpaRepository<LabFundAdvance, String> {

    List<LabFundAdvance> findByProjectId(String projectId);

    List<LabFundAdvance> findByStatus(LabFundAdvanceStatus status);
}