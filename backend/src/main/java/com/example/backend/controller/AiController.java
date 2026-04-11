package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.service.AiService;
import jakarta.validation.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class AiController {

    private static final Logger logger = LoggerFactory.getLogger(AiController.class);
    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    /**
     * Extract expense details from natural language text
     * Authenticated users only
     */
    @PostMapping("/extract-expense")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> extractExpense(@RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Text is required for expense extraction"));
            }
            
            String currentDateStr = LocalDate.now().toString();
            // Pass the actual current date to the prompt to help Gemini infer 'today',
            // 'yesterday', etc.
            String enhancedText = "Note: Today's actual date is " + currentDateStr + ". Analyze this text: " + text;
            String jsonResult = aiService.extractExpenseDetails(enhancedText);
            
            logger.info("Expense extraction successful for user");
            return ResponseEntity.ok(ApiResponse.success("Expense details extracted successfully", jsonResult));
        } catch (Exception e) {
            logger.error("Error extracting expense details", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to extract expense details: " + e.getMessage()));
        }
    }

    /**
     * Categorize an expense based on its description
     * Authenticated users only
     */
    @PostMapping("/categorize")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> categorizeExpense(@RequestBody Map<String, String> request) {
        try {
            String description = request.get("description");
            
            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Description is required for categorization"));
            }
            
            String category = aiService.categorizeExpense(description);
            logger.info("Expense categorization successful");
            return ResponseEntity.ok(ApiResponse.success("Categorization successful", 
                    Map.of("category", category)));
        } catch (Exception e) {
            logger.error("Error categorizing expense", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to categorize expense: " + e.getMessage()));
        }
    }

    /**
     * AI Financial Chatbot
     * Authenticated users only
     * Provides personalized financial advice and budget suggestions
     */
    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Message is required for chatbot"));
            }
            
            String reply = aiService.chat(message);
            logger.info("Chatbot response generated successfully");
            return ResponseEntity.ok(ApiResponse.success("Chatbot response", 
                    Map.of("reply", reply)));
        } catch (Exception e) {
            logger.error("Error in chatbot response", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate chatbot response: " + e.getMessage()));
        }
    }
}
