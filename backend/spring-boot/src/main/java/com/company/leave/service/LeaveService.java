package com.company.leave.service;

import com.company.leave.dto.LeaveApplyRequest;
import com.company.leave.dto.LeaveResponseDto;
import com.company.leave.exception.BadRequestException;
import com.company.leave.exception.ConflictException;
import com.company.leave.exception.ResourceNotFoundException;
import com.company.leave.model.LeaveRequest;
import com.company.leave.model.LeaveStatus;
import com.company.leave.model.User;
import com.company.leave.repository.LeaveRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final AuditServiceClient auditServiceClient;

    public LeaveService(LeaveRepository leaveRepository, AuditServiceClient auditServiceClient) {
        this.leaveRepository = leaveRepository;
        this.auditServiceClient = auditServiceClient;
    }

    @Transactional
    public LeaveResponseDto submitLeave(LeaveApplyRequest request, User user) {
        if (request.getToDate().isBefore(request.getFromDate())) {
            throw new BadRequestException("To Date must be equal to or after From Date");
        }

        LeaveRequest leave = new LeaveRequest();
        leave.setUser(user);
        leave.setLeaveType(request.getLeaveType());
        leave.setFromDate(request.getFromDate());
        leave.setToDate(request.getToDate());
        leave.setReason(request.getReason().trim());
        leave.setStatus(LeaveStatus.PENDING);

        LeaveRequest saved = leaveRepository.save(leave);

        auditServiceClient.logAction(
                user.getId(),
                "LEAVE_APPLIED",
                saved.getId(),
                String.format("Applied for %s leave from %s to %s", saved.getLeaveType(), saved.getFromDate(), saved.getToDate())
        );

        return LeaveResponseDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<LeaveResponseDto> getMyLeaves(Long userId) {
        return leaveRepository.findByUserIdWithDetails(userId)
                .stream()
                .map(LeaveResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveResponseDto> getAllLeaves(LeaveStatus status) {
        List<LeaveRequest> list = (status != null)
                ? leaveRepository.findByStatusWithDetails(status)
                : leaveRepository.findAllWithDetails();

        return list.stream()
                .map(LeaveResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LeaveResponseDto getLeaveById(Long id) {
        LeaveRequest leave = leaveRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id " + id));
        return LeaveResponseDto.fromEntity(leave);
    }

    @Transactional
    public LeaveResponseDto approveLeave(Long id, User admin) {
        LeaveRequest leave = leaveRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id " + id));

        // only PENDING requests can be approved
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new ConflictException("Leave request cannot be approved because status is already " + leave.getStatus());
        }

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setDecidedAt(LocalDateTime.now());
        leave.setDecidedBy(admin);

        LeaveRequest saved = leaveRepository.save(leave);

        auditServiceClient.logAction(
                admin.getId(),
                "LEAVE_APPROVED",
                saved.getId(),
                "Approved by admin " + admin.getName()
        );

        return LeaveResponseDto.fromEntity(saved);
    }

    @Transactional
    public LeaveResponseDto rejectLeave(Long id, User admin, String rejectionReason) {
        LeaveRequest leave = leaveRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id " + id));

        // only PENDING requests can be rejected
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new ConflictException("Leave request cannot be rejected because status is already " + leave.getStatus());
        }

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setDecidedAt(LocalDateTime.now());
        leave.setDecidedBy(admin);
        leave.setRejectionReason(rejectionReason);

        LeaveRequest saved = leaveRepository.save(leave);

        String details = "Rejected by admin " + admin.getName();
        if (rejectionReason != null && !rejectionReason.isBlank()) {
            details += ". Reason: " + rejectionReason;
        }

        auditServiceClient.logAction(
                admin.getId(),
                "LEAVE_REJECTED",
                saved.getId(),
                details
        );

        return LeaveResponseDto.fromEntity(saved);
    }

    @Transactional
    public LeaveResponseDto rejectLeave(Long id, User admin) {
        return rejectLeave(id, admin, null);
    }
}
