package com.company.leave.dto;

import java.time.LocalDateTime;

public class AuditLogDto {

    private Long userId;
    private String action;
    private Long leaveId;
    private LocalDateTime timestamp;
    private String details;

    public AuditLogDto() {
    }

    public AuditLogDto(Long userId, String action, Long leaveId, LocalDateTime timestamp, String details) {
        this.userId = userId;
        this.action = action;
        this.leaveId = leaveId;
        this.timestamp = timestamp;
        this.details = details;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Long getLeaveId() {
        return leaveId;
    }

    public void setLeaveId(Long leaveId) {
        this.leaveId = leaveId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
