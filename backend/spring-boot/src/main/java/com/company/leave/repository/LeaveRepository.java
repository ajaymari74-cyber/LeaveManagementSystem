package com.company.leave.repository;

import com.company.leave.model.LeaveRequest;
import com.company.leave.model.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {

    @Query("SELECT l FROM LeaveRequest l JOIN FETCH l.user LEFT JOIN FETCH l.decidedBy WHERE l.user.id = :userId ORDER BY l.appliedAt DESC")
    List<LeaveRequest> findByUserIdWithDetails(@Param("userId") Long userId);

    @Query("SELECT l FROM LeaveRequest l JOIN FETCH l.user LEFT JOIN FETCH l.decidedBy ORDER BY l.appliedAt DESC")
    List<LeaveRequest> findAllWithDetails();

    @Query("SELECT l FROM LeaveRequest l JOIN FETCH l.user LEFT JOIN FETCH l.decidedBy WHERE l.status = :status ORDER BY l.appliedAt DESC")
    List<LeaveRequest> findByStatusWithDetails(@Param("status") LeaveStatus status);

    @Query("SELECT l FROM LeaveRequest l JOIN FETCH l.user LEFT JOIN FETCH l.decidedBy WHERE l.id = :id")
    Optional<LeaveRequest> findByIdWithDetails(@Param("id") Long id);
}
