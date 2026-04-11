package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.entity.Expense;
import com.example.backend.entity.User;
import com.example.backend.service.ExpenseService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class ReportController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserService userService;

    /**
     * Get monthly expense report
     * Users can only see their own, admins can see all or specific user's
     */
    @GetMapping("/monthly")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMonthlyReport(
            @RequestParam(required = false) String yearMonth,
            @RequestParam(required = false) String userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            // Parse year-month (format: "2024-01")
            YearMonth targetMonth = yearMonth != null
                    ? YearMonth.parse(yearMonth, DateTimeFormatter.ofPattern("yyyy-MM"))
                    : YearMonth.now();

            LocalDate startDate = targetMonth.atDay(1);
            LocalDate endDate = targetMonth.atEndOfMonth();

            List<Expense> expenses;
            User currentUser = userService.getUserByName(userDetails.getUsername());

            // Determine which user's expenses to fetch
            if (userId != null && !userId.isEmpty() && !userId.equals(userDetails.getUsername())) {
                // Admin requesting specific user's report
                if (!currentUser.getRole().equals("ADMIN")) {
                    throw new SecurityException("Only admins can view other users' reports");
                }
                expenses = expenseService.getExpensesByUserAndDateRange(userId, userDetails.getUsername(), startDate, endDate);
            } else {
                // Regular user requesting their own report
                expenses = expenseService.getExpensesByUserAndDateRange(userDetails.getUsername(), userDetails.getUsername(), startDate, endDate);
            }

            // Calculate summary statistics
            double totalAmount = expenses.stream().mapToDouble(Expense::getAmount).sum();
            long totalCount = expenses.size();

            // Group by category
            Map<String, Double> categoryTotals = expenses.stream()
                    .collect(Collectors.groupingBy(
                            e -> e.getCategoryName() != null ? e.getCategoryName() : "Unknown",
                            Collectors.summingDouble(Expense::getAmount)));

            // Group by day (date is already String in format "yyyy-MM-dd")
            Map<String, Double> dailyTotals = expenses.stream()
                    .collect(Collectors.groupingBy(
                            Expense::getDate,
                            Collectors.summingDouble(Expense::getAmount)));

            // Find top 5 expenses
            List<Expense> topExpenses = expenses.stream()
                    .sorted((e1, e2) -> Double.compare(e2.getAmount(), e1.getAmount()))
                    .limit(5)
                    .collect(Collectors.toList());

            // Calculate average daily spending
            double avgDailySpending = dailyTotals.isEmpty() ? 0
                    : dailyTotals.values().stream().mapToDouble(Double::doubleValue).average().orElse(0);

            // Prepare response
            Map<String, Object> report = new HashMap<>();

            Map<String, Object> period = new HashMap<>();
            period.put("yearMonth", targetMonth.format(DateTimeFormatter.ofPattern("yyyy-MM")));
            period.put("startDate", startDate.toString());
            period.put("endDate", endDate.toString());
            period.put("daysInMonth", targetMonth.lengthOfMonth());
            report.put("period", period);

            Map<String, Object> summary = new HashMap<>();
            summary.put("totalAmount", String.format("%.2f", totalAmount));
            summary.put("totalCount", totalCount);
            summary.put("averageAmount", totalCount > 0 ? String.format("%.2f", totalAmount / totalCount) : "0.00");
            summary.put("averageDailySpending", String.format("%.2f", avgDailySpending));
            summary.put("daysWithExpenses", dailyTotals.size());
            report.put("summary", summary);

            report.put("categoryBreakdown", categoryTotals);
            report.put("dailyBreakdown", dailyTotals);

            report.put("topExpenses", topExpenses.stream().map(e -> {
                Map<String, Object> expenseMap = new HashMap<>();
                expenseMap.put("id", e.getId());
                expenseMap.put("amount", e.getAmount());
                expenseMap.put("description", e.getDescription());
                expenseMap.put("category", e.getCategoryName());
                expenseMap.put("date", e.getDate());
                return expenseMap;
            }).collect(Collectors.toList()));

            report.put("allExpenses", expenses.stream().map(e -> {
                Map<String, Object> expenseMap = new HashMap<>();
                expenseMap.put("id", e.getId());
                expenseMap.put("amount", e.getAmount());
                expenseMap.put("description", e.getDescription());
                expenseMap.put("category", e.getCategoryName());
                expenseMap.put("date", e.getDate());
                return expenseMap;
            }).collect(Collectors.toList()));

            return ResponseEntity.ok(ApiResponse.success(report));

        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to generate report: " + e.getMessage()));
        }
    }

    /**
     * Get list of all users for admin report selection
     */
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableUsers() {
        try {
            List<Map<String, Object>> users = userService.getAllUsers().stream()
                    .map(user -> {
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", user.getId());
                        userMap.put("name", user.getName());
                        userMap.put("role", user.getRole());
                        return userMap;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch users: " + e.getMessage()));
        }
    }
}