package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ExpenseDTO;
import com.example.backend.entity.Expense;
import com.example.backend.entity.User;
import com.example.backend.service.ExpenseService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class ExpenseController {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseController.class);
    private static final String[] MONTHS = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserService userService;

    /**
     * Get all expenses - Admin only
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Expense>>> getAllExpenses() {
        List<Expense> expenses = expenseService.getAllExpenses();
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    /**
     * Create a new expense - Authenticated users
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Expense>> createExpense(
            @Valid @RequestBody ExpenseDTO expenseDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        Expense expense = expenseService.createExpense(expenseDTO, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense created successfully", expense));
    }

    /**
     * Get expense by ID - User can only see own expense, admin can see all
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Expense>> getExpense(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = userService.getUserByName(userDetails.getUsername());
        Expense expense = expenseService.getExpenseById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(expense));
    }

    /**
     * Update expense - Only owner or admin can update
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Expense>> updateExpense(
            @PathVariable String id,
            @Valid @RequestBody ExpenseDTO expenseDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        Expense expense = expenseService.updateExpense(id, expenseDTO, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Expense updated successfully", expense));
    }

    /**
     * Delete expense - Only owner or admin can delete
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> deleteExpense(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {

        expenseService.deleteExpense(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully"));
    }

    /**
     * Get current user's expenses
     */
    @GetMapping("/my/list")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Expense>>> getMyExpenses(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<Expense> expenses = expenseService.getExpensesByUser(userDetails.getUsername(), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    /**
     * Get total expenses by category for current user
     */
    @GetMapping("/my/total-by-category")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getMyTotalByCategory(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<Expense> expenses = expenseService.getExpensesByUser(userDetails.getUsername(), userDetails.getUsername());
        Map<String, Double> totalByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategoryName() != null ? e.getCategoryName() : "Unknown",
                        Collectors.summingDouble(Expense::getAmount)
                ));
        return ResponseEntity.ok(ApiResponse.success(totalByCategory));
    }

    /**
     * Get monthly summary for current user
     */
    @GetMapping("/my/monthly-summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getMyMonthlySummary(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<Expense> expenses = expenseService.getExpensesByUser(userDetails.getUsername(), userDetails.getUsername());
        Map<String, Double> monthlySummary = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> {
                            if (e.getDate() != null && e.getDate().length() >= 7) {
                                try {
                                    int monthIndex = Integer.parseInt(e.getDate().substring(5, 7)) - 1;
                                    return MONTHS[monthIndex];
                                } catch (Exception ex) {
                                    return "Unknown";
                                }
                            }
                            return "Unknown";
                        },
                        Collectors.summingDouble(Expense::getAmount)
                ));
        return ResponseEntity.ok(ApiResponse.success(monthlySummary));
    }

    /**
     * Get total expenses by category - Admin only (for all users)
     */
    @GetMapping("/admin/total-by-category")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getTotalByCategory() {
        List<Expense> expenses = expenseService.getAllExpenses();
        Map<String, Double> totalByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategoryName() != null ? e.getCategoryName() : "Unknown",
                        Collectors.summingDouble(Expense::getAmount)
                ));
        return ResponseEntity.ok(ApiResponse.success(totalByCategory));
    }

    /**
     * Get monthly summary - Admin only (for all users)
     */
    @GetMapping("/admin/monthly-summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getMonthlySummary() {
        List<Expense> expenses = expenseService.getAllExpenses();
        Map<String, Double> monthlySummary = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> {
                            if (e.getDate() != null && e.getDate().length() >= 7) {
                                try {
                                    int monthIndex = Integer.parseInt(e.getDate().substring(5, 7)) - 1;
                                    return MONTHS[monthIndex];
                                } catch (Exception ex) {
                                    return "Unknown";
                                }
                            }
                            return "Unknown";
                        },
                        Collectors.summingDouble(Expense::getAmount)
                ));
        return ResponseEntity.ok(ApiResponse.success(monthlySummary));
    }
}