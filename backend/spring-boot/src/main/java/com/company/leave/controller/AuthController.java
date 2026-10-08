package com.company.leave.controller;

import com.company.leave.dto.ApiResponse;
import com.company.leave.dto.LoginRequest;
import com.company.leave.dto.UserDto;
import com.company.leave.model.User;
import com.company.leave.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto>> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        UserDto userDto = authService.login(request, session);
        return ResponseEntity.ok(ApiResponse.success("Login successful", userDto));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        authService.logout(session);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(HttpSession session) {
        User user = authService.getSessionUser(session);
        return ResponseEntity.ok(ApiResponse.success(UserDto.fromEntity(user)));
    }
}
