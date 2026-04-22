package com.example.labOdc.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Model.Milestone;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, String> {
    List<Milestone> findByProjectIdOrderByDueDateAsc(String projectId);
}