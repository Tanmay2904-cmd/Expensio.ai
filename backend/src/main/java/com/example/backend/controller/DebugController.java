package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174",
        "https://expensio-ai.netlify.app" }, allowCredentials = "true")
public class DebugController {
    @Autowired
    private UserRepository userRepository;

    /**
     * List all users — ADMIN only
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("All users", users));
    }

    /**
     * Debug current authentication status — ADMIN only
     */
    @GetMapping("/auth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugAuth() {
        try {
            String username = SecurityUtil.getCurrentUsername();
            boolean isAdmin = SecurityUtil.isAdmin();
            return ResponseEntity.ok(ApiResponse.success("Auth status", Map.of(
                    "authenticated", username != null,
                    "username", username,
                    "isAdmin", isAdmin)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Not authenticated", Map.of(
                    "authenticated", false,
                    "error", e.getMessage())));
        }
    }
}
