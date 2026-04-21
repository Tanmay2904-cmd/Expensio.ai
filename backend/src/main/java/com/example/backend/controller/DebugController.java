package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("All users", users));
    }

    @PostMapping("/test-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testPassword(
            @RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        var user = userRepository.findByName(username);
        if (user.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("User not found",
                    Map.of("found", false)));
        }

        User u = user.get();
        boolean matches = passwordEncoder.matches(password, u.getPassword());
        String hashPreview = u.getPassword().substring(0,
                Math.min(20, u.getPassword().length())) + "...";

        return ResponseEntity.ok(ApiResponse.success("Password test complete", Map.of(
                "username", u.getName(),
                "storedHash", hashPreview,
                "providedPassword", password,
                "matches", matches)));
    }

    @GetMapping("/auth")
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugAuth() {
        try {
            String username = SecurityUtil.getCurrentUsername();
            boolean isAdmin = SecurityUtil.isAdmin();
            return ResponseEntity.ok(ApiResponse.success("Auth status", Map.of(
                    "authenticated", username != null,
                    "username", username != null ? username : "none",
                    "isAdmin", isAdmin)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Not authenticated", Map.of(
                    "authenticated", false,
                    "error", e.getMessage() != null ? e.getMessage() : "unknown")));
        }
    }

    @GetMapping("/bcrypt-admin123")
    public String getAdminHash() {
        return passwordEncoder.encode("admin123");
    }
}