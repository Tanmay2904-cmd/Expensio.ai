package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.entity.User;
import com.example.backend.security.AuthorizationUtil;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class UserController {
    
    @Autowired
    private UserService userService;

    /**
     * Get all users - Admin only
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * Create a new user - Admin only
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody User user) {
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        User savedUser = userService.registerUser(new com.example.backend.dto.RegisterDTO(
                user.getName(), user.getPassword(), user.getRole()
        ));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", savedUser));
    }

    /**
     * Get user by ID - Admin only
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable String id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * Update user - Admin can update anyone, user can update themselves
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody User userDetails,
            @AuthenticationPrincipal UserDetails userDetails1) {
        
        User currentUser = userService.getUserByName(userDetails1.getUsername());
        
        // Check authorization
        if (!currentUser.getRole().equals("ADMIN") && !currentUser.getId().equals(id)) {
            throw new SecurityException("You can only update your own profile");
        }
        
        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
    }

    /**
     * Delete user - Admin only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    /**
     * Get current user's profile
     */
    @GetMapping("/me/profile")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByName(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * Update current user's profile
     */
    @PutMapping("/me/profile")
    public ResponseEntity<ApiResponse<User>> updateCurrentUserProfile(
            @Valid @RequestBody User userDetails,
            @AuthenticationPrincipal UserDetails currentUserDetails) {
        
        User currentUser = userService.getUserByName(currentUserDetails.getUsername());
        currentUser.setName(userDetails.getName());
        User updated = userService.updateUser(currentUser.getId(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    /**
     * Change password for current user
     */
    @PostMapping("/me/password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        
        if (oldPassword == null || oldPassword.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Old password and new password are required"));
        }
        
        User user = userService.getUserByName(userDetails.getUsername());
        userService.changePassword(user.getId(), oldPassword, newPassword);
        
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}