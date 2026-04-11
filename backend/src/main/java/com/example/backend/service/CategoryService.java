package com.example.backend.service;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.entity.Category;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class CategoryService {
    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category createCategory(CategoryDTO categoryDTO) {
        // Check if category with same name exists
        List<Category> allCategories = categoryRepository.findAll();
        if (allCategories.stream().anyMatch(c -> c.getName().equalsIgnoreCase(categoryDTO.getName()))) {
            throw new DuplicateResourceException("Category with name '" + categoryDTO.getName() + "' already exists");
        }

        Category category = new Category();
        category.setName(categoryDTO.getName());
        logger.info("Creating new category: {}", categoryDTO.getName());
        return categoryRepository.save(category);
    }

    public Category getCategoryById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category updateCategory(String id, CategoryDTO categoryDTO) {
        Category category = getCategoryById(id);
        if (categoryDTO.getName() != null && !categoryDTO.getName().trim().isEmpty()) {
            category.setName(categoryDTO.getName());
        }
        logger.info("Updating category: {}", id);
        return categoryRepository.save(category);
    }

    public void deleteCategory(String id) {
        Category category = getCategoryById(id); // Verify category exists
        categoryRepository.deleteById(id);
        logger.info("Deleted category: {}", id);
    }
}
