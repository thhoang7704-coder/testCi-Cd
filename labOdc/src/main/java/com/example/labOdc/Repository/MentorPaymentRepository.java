package com.example.labOdc.Repository;

import com.example.labOdc.Model.MentorPayment;
import com.example.labOdc.Model.MentorPaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MentorPaymentRepository extends JpaRepository<MentorPayment, String> {

    List<MentorPayment> findByMentorId(String mentorId);

    List<MentorPayment> findByProjectId(String projectId);

    List<MentorPayment> findByStatus(MentorPaymentStatus status);

    Optional<MentorPayment> findByFundAllocationId(String fundAllocationId);

    @Query("""
                SELECT COALESCE(SUM(mp.amount), 0)
                FROM MentorPayment mp
                WHERE mp.mentor.id = :mentorId
                  AND mp.status = 'PAID'
            """)
    BigDecimal getTotalPaidAmountByMentor(@Param("mentorId") String mentorId);
}