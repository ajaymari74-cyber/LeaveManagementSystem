package com.company.leave.controller;

import com.company.leave.dto.ApiResponse;
import com.company.leave.dto.LeaveApplyRequest;
import com.company.leave.dto.LeaveResponseDto;
import com.company.leave.exception.ForbiddenException;
import com.company.leave.model.LeaveStatus;
import com.company.leave.model.Role;
import com.company.leave.model.User;
import com.company.leave.service.AuthService;
import com.company.leave.service.LeaveService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;
    private final AuthService authService;

    public LeaveController(LeaveService leaveService, AuthService authService) {
        this.leaveService = leaveService;
        this.authService = authService;
    }

    private User requireRole(HttpSession session, Role expectedRole) {
        User user = authService.getSessionUser(session);
        if (user.getRole() != expectedRole) {
            throw new ForbiddenException("Forbidden: " + expectedRole + " privilege required");
        }
        return user;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveResponseDto>> applyLeave(
            @Valid @RequestBody LeaveApplyRequest request,
            HttpSession session) {
        User employee = requireRole(session, Role.EMPLOYEE);
        LeaveResponseDto result = leaveService.submitLeave(request, employee);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave request submitted successfully", result));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LeaveResponseDto>>> getMyLeaves(HttpSession session) {
        User employee = requireRole(session, Role.EMPLOYEE);
        List<LeaveResponseDto> leaves = leaveService.getMyLeaves(employee.getId());
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveResponseDto>>> getAllLeaves(
            @RequestParam(required = false) LeaveStatus status,
            HttpSession session) {
        requireRole(session, Role.ADMIN);
        List<LeaveResponseDto> leaves = leaveService.getAllLeaves(status);
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> getLeaveById(
            @PathVariable Long id,
            HttpSession session) {
        requireRole(session, Role.ADMIN);
        LeaveResponseDto leave = leaveService.getLeaveById(id);
        return ResponseEntity.ok(ApiResponse.success(leave));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> approveLeave(
            @PathVariable Long id,
            HttpSession session) {
        User admin = requireRole(session, Role.ADMIN);
        LeaveResponseDto leave = leaveService.approveLeave(id, admin);
        return ResponseEntity.ok(ApiResponse.success("Leave request approved", leave));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> rejectLeave(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            HttpSession session) {
        User admin = requireRole(session, Role.ADMIN);
        String reason = (body != null) ? body.get("reason") : null;
        LeaveResponseDto leave = leaveService.rejectLeave(id, admin, reason);
        return ResponseEntity.ok(ApiResponse.success("Leave request rejected", leave));
    }
}
