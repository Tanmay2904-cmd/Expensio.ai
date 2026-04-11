package com.example.backend.repository;

import com.example.backend.entity.Category;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class CategoryRepository {
    private final Firestore firestore;
    private final String COLLECTION = "categories";

    public CategoryRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<Category> findAll() {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            List<Category> list = new ArrayList<>();
            for (DocumentSnapshot doc : documents) {
                Category c = doc.toObject(Category.class);
                if (c != null) {
                    c.setId(doc.getId());
                    list.add(c);
                }
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public Category save(Category category) {
        try {
            if (category.getId() == null || category.getId().isEmpty()) {
                DocumentReference ref = firestore.collection(COLLECTION).document();
                category.setId(ref.getId());
                ref.set(category).get();
            } else {
                firestore.collection(COLLECTION).document(category.getId()).set(category).get();
            }
            return category;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public Optional<Category> findById(String id) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION).document(id).get().get();
            if (doc.exists()) {
                Category c = doc.toObject(Category.class);
                if (c != null) {
                    c.setId(doc.getId());
                    return Optional.of(c);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    public void deleteById(String id) {
        try {
            firestore.collection(COLLECTION).document(id).delete().get();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
