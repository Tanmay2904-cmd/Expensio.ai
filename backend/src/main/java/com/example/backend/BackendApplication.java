package com.example.backend;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner initAdmin(UserService userService, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                // Try to get user by name, if not exists create admin
                userService.getUserByName("Tanmay Naigaonkar");
            } catch (Exception e) {
                // Create admin
                var registerDTO = new com.example.backend.dto.RegisterDTO();
                registerDTO.setName("Tanmay Naigaonkar");
                registerDTO.setPassword("admin123");
                registerDTO.setRole("ADMIN");
                userService.registerUser(registerDTO);
                System.out.println("✅ Admin user 'Tanmay Naigaonkar' (admin123) created!");
            }
        };
    }
}
