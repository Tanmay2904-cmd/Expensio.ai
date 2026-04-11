package com.example.backend.repository;

import com.example.backend.entity.Expense;
import com.example.backend.entity.Category;
import com.example.backend.entity.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ExpenseRepository {
    private final Firestore firestore;
    private final String COLLECTION = "expenses";

    public ExpenseRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<Expense> findAll() {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            List<Expense> list = new ArrayList<>();
            for (DocumentSnapshot doc : documents) {
                Expense e = doc.toObject(Expense.class);
                if (e != null) {
                    e.setId(doc.getId());
                    list.add(e);
                }
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public Expense save(Expense expense) {
        try {
            if (expense.getId() == null || expense.getId().isEmpty()) {
                DocumentReference ref = firestore.collection(COLLECTION).document();
                expense.setId(ref.getId());
                ref.set(expense).get();
            } else {
                firestore.collection(COLLECTION).document(expense.getId()).set(expense).get();
            }
            return expense;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public Optional<Expense> findById(String id) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION).document(id).get().get();
            if (doc.exists()) {
                Expense e = doc.toObject(Expense.class);
                if (e != null) {
                    e.setId(doc.getId());
                    return Optional.of(e);
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

    public List<Expense> findByUserName(String userName) {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).whereEqualTo("userName", userName).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            List<Expense> list = new ArrayList<>();
            for (DocumentSnapshot doc : documents) {
                Expense e = doc.toObject(Expense.class);
                if (e != null) {
                    e.setId(doc.getId());
                    list.add(e);
                }
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<Expense> findByUserIdAndDateBetween(String userId, LocalDate start, LocalDate end) {
        return findExpensesBetweenAndFilter("userId", userId, start.toString(), end.toString());
    }

    public List<Expense> findByUserNameAndDateBetween(String userName, LocalDate start, LocalDate end) {
        return findExpensesBetweenAndFilter("userName", userName, start.toString(), end.toString());
    }

    private List<Expense> findExpensesBetweenAndFilter(String field, String val, String start, String end) {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION)
                    .whereEqualTo(field, val)
                    .whereGreaterThanOrEqualTo("date", start)
                    .whereLessThanOrEqualTo("date", end)
                    .get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            List<Expense> list = new ArrayList<>();
            for (DocumentSnapshot doc : documents) {
                Expense e = doc.toObject(Expense.class);
                if (e != null) {
                    e.setId(doc.getId());
                    list.add(e);
                }
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}