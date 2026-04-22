package com.example.labOdc.Service.Implement;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.labOdc.DTO.MilestoneDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Milestone;
import com.example.labOdc.Model.MilestoneStatus;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Repository.MilestoneRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Service.MilestoneService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MilestoneServiceImpl implements MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    @Override
    public Milestone createMilestone(MilestoneDTO dto) {
        if (dto.getProjectId() == null || dto.getProjectId().isBlank()) {
            throw new IllegalArgumentException("projectId is required");
        }
        if (dto.getMilestoneName() == null || dto.getMilestoneName().isBlank()) {
            throw new IllegalArgumentException("milestoneName is required");
        }

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", dto.getProjectId()));

        // Validate total payment percentage
        if (dto.getPaymentPercentage() != null) {
            java.math.BigDecimal total = milestoneRepository.findByProjectIdOrderByDueDateAsc(project.getId())
                    .stream()
                    .map(Milestone::getPaymentPercentage)
                    .filter(java.util.Objects::nonNull)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            if (total.add(dto.getPaymentPercentage()).compareTo(new java.math.BigDecimal("100")) > 0) {
                throw new IllegalArgumentException("Total payment percentage cannot exceed 100%");
            }
        }

        Milestone m = Milestone.builder()
                .project(project)
                .milestoneName(dto.getMilestoneName())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                // completedDate/status không lấy từ DTO create (complete qua workflow)
                .paymentPercentage(dto.getPaymentPercentage())
                .deliverables(dto.getDeliverables())
                .build();

        return milestoneRepository.save(m);
    }

    @Override
    public List<Milestone> getAllMilestone() {
        return milestoneRepository.findAll();
    }

    @Override
    public Milestone getMilestoneById(String id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", "id", id));
    }

    @Override
    public Milestone updateMilestone(MilestoneDTO dto, String id) {
        Milestone m = getMilestoneById(id);

        // chuẩn: milestone COMPLETED rồi thì không cho sửa các field chính
        if (m.getStatus() == MilestoneStatus.COMPLETED) {
            throw new IllegalStateException("Cannot update a COMPLETED milestone");
        }

        // Nếu muốn cho đổi project thì map id -> entity
        if (dto.getProjectId() != null && !dto.getProjectId().isBlank()) {
            Project project = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project", "id", dto.getProjectId()));
            m.setProject(project);
        }

        if (dto.getMilestoneName() != null)
            m.setMilestoneName(dto.getMilestoneName());
        if (dto.getDescription() != null)
            m.setDescription(dto.getDescription());
        if (dto.getDueDate() != null)
            m.setDueDate(dto.getDueDate());
        if (dto.getPaymentPercentage() != null) {
            // Validate new total percentage
            java.math.BigDecimal totalExcludingCurrent = milestoneRepository
                    .findByProjectIdOrderByDueDateAsc(m.getProject().getId())
                    .stream()
                    .filter(item -> !item.getId().equals(id)) // Exclude current milestone
                    .map(Milestone::getPaymentPercentage)
                    .filter(java.util.Objects::nonNull)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            if (totalExcludingCurrent.add(dto.getPaymentPercentage()).compareTo(new java.math.BigDecimal("100")) > 0) {
                throw new IllegalArgumentException("Total payment percentage cannot exceed 100%");
            }
            m.setPaymentPercentage(dto.getPaymentPercentage());
        }
        if (dto.getDeliverables() != null)
            m.setDeliverables(dto.getDeliverables());

        // status không update ở đây; completed chỉ qua completeMilestone()

        return milestoneRepository.save(m);
    }

    @Override
    public void deleteMilestone(String id) {
        milestoneRepository.deleteById(id);
    }

    // ---------- workflow ----------

    @Override
    public List<Milestone> getMilestonesByProjectId(String projectId) {
        return milestoneRepository.findByProjectIdOrderByDueDateAsc(projectId);
    }

    @Override
    public Milestone completeMilestone(String milestoneId, LocalDate completedDate) {
        Milestone m = getMilestoneById(milestoneId);

        if (m.getStatus() == MilestoneStatus.COMPLETED) {
            return m; // idempotent
        }

        LocalDate doneDate = completedDate != null ? completedDate : LocalDate.now();

        // if (m.getDueDate() != null && doneDate.isBefore(m.getDueDate())) {
        // throw new IllegalArgumentException("completedDate cannot be before dueDate");
        // }

        m.setCompletedDate(doneDate);
        m.setStatus(MilestoneStatus.COMPLETED);

        return milestoneRepository.save(m);
    }
}