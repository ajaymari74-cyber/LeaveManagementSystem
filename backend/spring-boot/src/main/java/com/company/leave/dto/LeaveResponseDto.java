package com.company.leave.dto;

import com.company.leave.model.LeaveRequest;
import com.company.leave.model.LeaveStatus;
import com.company.leave.model.LeaveType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeaveResponseDto {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private LeaveType leaveType;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String reason;
    private LeaveStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime decidedAt;
    private Long decidedById;
    private String decidedByName;
    private String rejectionReason;

    public LeaveResponseDto() {
    }

    public static LeaveResponseDto fromEntity(LeaveRequest req) {
        if (req == null) return null;
        LeaveResponseDto dto = new LeaveResponseDto();
        dto.setId(req.getId());
        if (req.getUser() != null) {
            dto.setUserId(req.getUser().getId());
            dto.setUserName(req.getUser().getName());
            dto.setUserEmail(req.getUser().getEmail());
        }
        dto.setLeaveType(req.getLeaveType());
        dto.setFromDate(req.getFromDate());
        dto.setToDate(req.getToDate());
        dto.setReason(req.getReason());
        dto.setStatus(req.getStatus());
        dto.setAppliedAt(req.getAppliedAt());
        dto.setDecidedAt(req.getDecidedAt());
        if (req.getDecidedBy() != null) {
            dto.setDecidedById(req.getDecidedBy().getId());
            dto.setDecidedByName(req.getDecidedBy().getName());
        }
        dto.setRejectionReason(req.getRejectionReason());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public LeaveType getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(LeaveType leaveType) {
        this.leaveType = leaveType;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LeaveStatus getStatus() {
        return status;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public LocalDateTime getDecidedAt() {
        return decidedAt;
    }

    public void setDecidedAt(LocalDateTime decidedAt) {
        this.decidedAt = decidedAt;
    }

    public Long getDecidedById() {
        return decidedById;
    }

    public void setDecidedById(Long decidedById) {
        this.decidedById = decidedById;
    }

    public String getDecidedByName() {
        return decidedByName;
    }

    public void setDecidedByName(String decidedByName) {
        this.decidedByName = decidedByName;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
