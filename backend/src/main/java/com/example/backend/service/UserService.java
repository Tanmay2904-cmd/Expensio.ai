package com.example.backend.service;

import com.example.backend.dto.RegisterDTO;
import com.example.backend.entity.User;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(RegisterDTO registerDTO) {
        if (userRepository.findByName(registerDTO.getName()).isPresent()) {
            throw new DuplicateResourceException("Username already exists");
        }
        User user = new User();
        user.setName(registerDTO.getName());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setRole(registerDTO.getRole() != null ? registerDTO.getRole() : "USER");
        logger.info("Registering user: {} with role: {}", registerDTO.getName(), user.getRole());
        return userRepository.save(user);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User getUserByName(String name) {
        return userRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + name));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(String id, User userDetails) {
        User user = getUserById(id);
        if (userDetails.getName() != null) {
            user.setName(userDetails.getName());
        }
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        logger.info("Updating user: {}", id);
        return userRepository.save(user);
    }

    public User changePassword(String id, String oldPassword, String newPassword) {
        User user = getUserById(id);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        logger.info("Password changed for user: {}", id);
        return userRepository.save(user);
    }

    // ✅ New: re-encode plain text admin password
    public User resetAdminPassword(String adminName, String newPassword) {
        User user = getUserByName(adminName);
        user.setPassword(passwordEncoder.encode(newPassword));
        logger.info("Password re-encoded for admin: {}", adminName);
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        getUserById(id);
        userRepository.deleteById(id);
        logger.info("Deleted user: {}", id);
    }
}