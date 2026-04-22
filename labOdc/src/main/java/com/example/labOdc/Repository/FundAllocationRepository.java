package com.example.labOdc.Repository;

import com.example.labOdc.Model.FundAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FundAllocationRepository extends JpaRepository<FundAllocation, String> {

    Optional<FundAllocation> findByPaymentId(String paymentId);

    Optional<FundAllocation> findByProjectId(String projectId);
}