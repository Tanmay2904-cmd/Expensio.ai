package com.example.backend.service;

import com.example.backend.dto.ExpenseDTO;
import com.example.backend.entity.Expense;
import com.example.backend.entity.User;
import com.example.backend.exception.ForbiddenException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {
    private static final Logger logger = LoggerFactory.getLogger(ExpenseService.class);
    private final ExpenseRepository expenseRepository;
    private final CategoryService categoryService;
    
    @Autowired
    private UserService userService;

    public ExpenseService(ExpenseRepository expenseRepository, CategoryService categoryService) {
        this.expenseRepository = expenseRepository;
        this.categoryService = categoryService;
    }

    /**
     * Get all expenses - for admin use only
     */
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Expense createExpense(ExpenseDTO expenseDTO, String currentUsername) {
        // Set user ID to current username if not explicitly provided
        String userId = expenseDTO.getUserId() != null ? expenseDTO.getUserId() : currentUsername;
        expenseDTO.setUserId(userId);
        
        // Check authorization
        if (!currentUsername.equals(userId) && !isAdmin(currentUsername)) {
            throw new ForbiddenException("You can only create expenses for yourself");
        }

        Expense expense = new Expense();
        expense.setAmount(expenseDTO.getAmount());
        expense.setDescription(expenseDTO.getDescription());
        expense.setCategoryId(expenseDTO.getCategoryId());
        expense.setDate(expenseDTO.getDate());
        expense.setUserId(userId);
        expense.setUserName(currentUsername);
        
        // Fetch and set category name
        try {
            String categoryName = categoryService.getCategoryById(expenseDTO.getCategoryId()).getName();
            expense.setCategoryName(categoryName);
        } catch (ResourceNotFoundException e) {
            logger.warn("Category not found for ID: {}", expenseDTO.getCategoryId());
            expense.setCategoryName("Unknown");
        }

        logger.info("Creating expense for user: {}", userId);
        return expenseRepository.save(expense);
    }

    public Expense getExpenseById(String id, String currentUsername) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        
        // Authorization check
        if (!expense.getUserName().equals(currentUsername) && !isAdmin(currentUsername)) {
            throw new ForbiddenException("You do not have permission to view this expense");
        }

        return expense;
    }

    public List<Expense> getExpensesByUser(String userId, String currentUsername) {
        // Authorization check
        if (!userId.equals(currentUsername) && !isAdmin(currentUsername)) {
            throw new ForbiddenException("You do not have permission to view expenses for this user");
        }

        return expenseRepository.findAll().stream()
                .filter(e -> e.getUserName().equals(userId) || e.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public List<Expense> getExpensesByUserAndDateRange(String userId, String currentUsername, LocalDate startDate, LocalDate endDate) {
        // Authorization check
        if (!userId.equals(currentUsername) && !isAdmin(currentUsername)) {
            throw new ForbiddenException("You do not have permission to view expenses for this user");
        }

        return expenseRepository.findAll().stream()
                .filter(e -> e.getUserName().equals(userId) || e.getUserId().equals(userId))
                .filter(e -> {
                    try {
                        LocalDate expenseDate = LocalDate.parse(e.getDate());
                        return !expenseDate.isBefore(startDate) && !expenseDate.isAfter(endDate);
                    } catch (Exception ex) {
                        logger.warn("Invalid date format for expense: {}", e.getId());
                        return false;
                    }
                })
                .collect(Collectors.toList());
    }

    public List<Expense> getMonthlyExpenses(String userId, String currentUsername, YearMonth yearMonth) {
        // Authorization check
        if (!userId.equals(currentUsername) && !isAdmin(currentUsername)) {
            throw new ForbiddenException("You do not have permission to view expenses for this user");
        }

        String monthPrefix = yearMonth.toString() + "-";
        return expenseRepository.findAll().stream()
                .filter(e -> e.getUserName().equals(userId) || e.getUserId().equals(userId))
                .filter(e -> e.getDate().startsWith(monthPrefix))
                .collect(Collectors.toList());
    }

    public Expense updateExpense(String id, ExpenseDTO expenseDTO, String currentUsername) {
        Expense expense = getExpenseById(id, currentUsername);

        if (expenseDTO.getAmount() != null) {
            expense.setAmount(expenseDTO.getAmount());
        }
        if (expenseDTO.getDescription() != null) {
            expense.setDescription(expenseDTO.getDescription());
        }
        if (expenseDTO.getCategoryId() != null) {
            expense.setCategoryId(expenseDTO.getCategoryId());
            try {
                String categoryName = categoryService.getCategoryById(expenseDTO.getCategoryId()).getName();
                expense.setCategoryName(categoryName);
            } catch (ResourceNotFoundException e) {
                logger.warn("Category not found for ID: {}", expenseDTO.getCategoryId());
            }
        }
        if (expenseDTO.getDate() != null) {
            expense.setDate(expenseDTO.getDate());
        }

        logger.info("Updating expense: {}", id);
        return expenseRepository.save(expense);
    }

    public void deleteExpense(String id, String currentUsername) {
        Expense expense = getExpenseById(id, currentUsername);
        expenseRepository.deleteById(id);
        logger.info("Deleted expense: {}", id);
    }

    public double getTotalExpensesByUser(String userId, String currentUsername) {
        return getExpensesByUser(userId, currentUsername).stream()
                .mapToDouble(Expense::getAmount)
                .sum();
    }

    public List<Object[]> getExpensesByCategory(String userId, String currentUsername) {
        List<Expense> expenses = getExpensesByUser(userId, currentUsername);
        return expenses.stream()
                .collect(Collectors.groupingBy(Expense::getCategoryName, 
                        Collectors.summingDouble(Expense::getAmount)))
                .entrySet().stream()
                .map(e -> new Object[]{e.getKey(), e.getValue()})
                .collect(Collectors.toList());
    }

    /**
     * Check if user has admin role
     */
    private boolean isAdmin(String username) {
        try {
            User user = userService.getUserByName(username);
            return "ADMIN".equalsIgnoreCase(user.getRole());
        } catch (Exception e) {
            logger.warn("Could not determine admin status for user: {}", username);
            return false;
        }
    }
}
