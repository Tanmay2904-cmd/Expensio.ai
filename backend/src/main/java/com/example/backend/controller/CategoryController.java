package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.CategoryDTO;
import com.example.backend.entity.Category;
import com.example.backend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;

    /**
     * Get all categories - Accessible to all authenticated users
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * Create a new category - Admin only
     */
    @PostMapping
@PreAuthorize("isAuthenticated()")
public ResponseEntity<ApiResponse<Category>> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
    Category category = categoryService.createCategory(categoryDTO);
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Category created successfully", category));
}

    /**
     * Get category by ID - Accessible to all authenticated users
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Category>> getCategory(@PathVariable String id) {
        Category category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    /**
     * Update category - Admin only
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
        @PathVariable String id,
        @Valid @RequestBody CategoryDTO categoryDTO) {
    Category category = categoryService.updateCategory(id, categoryDTO);
    return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
}

    /**
     * Delete category - Admin only
     */
    @DeleteMapping("/{id}")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable String id) {
    categoryService.deleteCategory(id);
    return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
}
}