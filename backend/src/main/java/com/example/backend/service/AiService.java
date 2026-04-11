package com.example.backend.service;

import com.example.backend.entity.Category;
import com.example.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final CategoryRepository categoryRepository;
    private final RestTemplate restTemplate;

    public AiService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
        this.restTemplate = new RestTemplate();
    }

    public String categorizeExpense(String description) {
        List<Category> categories = categoryRepository.findAll();

        if (categories.isEmpty()) {
            return "Uncategorized";
        }

        String categoryNames = categories.stream()
                .map(Category::getName)
                .collect(Collectors.joining(", "));

        String prompt = String.format("You are an exact string matcher for an expense tracker. " +
                "Given this exact list of category names: [%s]. " +
                "Classify the following expense description: '%s'. " +
                "Respond ONLY with the EXACT category name from the list. Do not include any punctuation, quotes, or conversational text. If it doesn't clearly match any, return the most generic category from the list.",
                categoryNames, description);

        return callGroq(prompt).trim();
    }

    public String extractExpenseDetails(String text) {
        List<Category> categories = categoryRepository.findAll();
        String categoryNames = categories.stream()
                .map(Category::getName)
                .collect(Collectors.joining(", "));

        String prompt = String.format(
                "Parse the following expense text and extract details into ONLY a valid pure JSON object. Do not wrap it in markdown code blocks like ```json. " +
                "The text is: '%s'. " +
                "Available categories for EXACT match are: [%s]. " +
                "The JSON must have exactly these keys: " +
                "\"amount\" (number, use 0 if not found), " +
                "\"description\" (string, the short expense description), " +
                "\"categoryName\" (string, EXACT match from the available categories list, or best matching category name), " +
                "\"date\" (string, format YYYY-MM-DD, infer from text or return today's actual date).",
                text, categoryNames);

        String result = callGroq(prompt).trim();
        if (result.startsWith("```json")) {
            result = result.substring(7);
        }
        if (result.startsWith("```")) {
            result = result.substring(3);
        }
        if (result.endsWith("```")) {
            result = result.substring(0, result.length() - 3);
        }
        return result.trim();
    }

    public String chat(String userMessage) {
    String prompt = "You are a strict AI financial assistant in the Expensio app. " +
            "You ONLY answer questions related to: personal finance, budgeting, expense tracking, saving money, investments, and financial planning. " +
            "If the user asks ANYTHING outside of finance topics (like general knowledge, coding, jokes, etc.), " +
            "politely refuse and say: 'I can only help with finance and budgeting related questions. Please ask me something related to your expenses or budget!' " +
            "Be concise and friendly. " +
            "User says: " + userMessage;
    return callGroq(prompt);
}

    @SuppressWarnings("unchecked")
    private String callGroq(String prompt) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "Error: API Key is not configured.";
        }

        String url = "https://api.groq.com/openai/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> message = Map.of(
                "role", "user",
                "content", prompt
        );
        Map<String, Object> requestBodyMap = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", List.of(message),
                "max_tokens", 1000
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBodyMap, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> messageResp = (Map<String, Object>) choices.get(0).get("message");
                    return (String) messageResp.get("content");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling AI service: " + e.getMessage();
        }
        return "Unknown";
    }
}