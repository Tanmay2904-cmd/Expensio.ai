package com.example.backend.repository;

import com.example.backend.entity.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {
    private final Firestore firestore;
    private final String COLLECTION = "users";

    public UserRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<User> findAll() {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            List<User> list = new ArrayList<>();
            for (DocumentSnapshot doc : documents) {
                User u = doc.toObject(User.class);
                if (u != null) {
                    u.setId(doc.getId());
                    list.add(u);
                }
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public User save(User user) {
        try {
            if (user.getId() == null || user.getId().isEmpty()) {
                DocumentReference ref = firestore.collection(COLLECTION).document();
                user.setId(ref.getId());
                ref.set(user).get();
            } else {
                firestore.collection(COLLECTION).document(user.getId()).set(user).get();
            }
            return user;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public Optional<User> findById(String id) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION).document(id).get().get();
            if (doc.exists()) {
                User u = doc.toObject(User.class);
                if (u != null) {
                    u.setId(doc.getId());
                    return Optional.of(u);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    public Optional<User> findByName(String name) {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).whereEqualTo("name", name).get();
            List<QueryDocumentSnapshot> docs = future.get().getDocuments();
            if (!docs.isEmpty()) {
                User u = docs.get(0).toObject(User.class);
                u.setId(docs.get(0).getId());
                return Optional.of(u);
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