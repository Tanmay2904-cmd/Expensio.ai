package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.LoginDTO;
import com.example.backend.dto.RegisterDTO;
import com.example.backend.entity.User;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterDTO registerDTO) {
        logger.info("Attempting registration for: {}", registerDTO.getName());
        // ✅ Force USER role on public registration — no one can self-assign ADMIN
        registerDTO.setRole("USER");
        User savedUser = userService.registerUser(registerDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginDTO loginDTO) {
        logger.info("Login attempt for: {}", loginDTO.getUsername());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDTO.getUsername(), loginDTO.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(loginDTO.getUsername());
            User user = userService.getUserByName(loginDTO.getUsername());

            String token = jwtUtil.generateToken(loginDTO.getUsername(), user.getRole());
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", user.getRole());
            response.put("username", user.getName());
            response.put("userId", user.getId());

            logger.info("Login successful for: {}", loginDTO.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));

        } catch (BadCredentialsException e) {
            logger.error("Bad credentials for: {}", loginDTO.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        } catch (UsernameNotFoundException e) {
            logger.error("User not found: {}", loginDTO.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        } catch (Exception e) {
            logger.error("Login error for {}: {}", loginDTO.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        }
    }

    // ⚠️ TEMPORARY — Admin password fix karne ke liye, deploy ke baad delete karo
    @PostMapping("/fix-admin")
    public ResponseEntity<ApiResponse<String>> fixAdmin(@RequestBody Map<String, String> body) {
        String secret = body.get("secret");
        if (!"expensio-fix-2024".equals(secret)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Forbidden"));
        }
        String adminName = body.get("username");
        String newPassword = body.get("password");
        userService.resetAdminPassword(adminName, newPassword);
        logger.info("Admin password reset for: {}", adminName);
        return ResponseEntity.ok(ApiResponse.success("Admin password fixed successfully"));
    }
}