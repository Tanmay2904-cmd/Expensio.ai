package com.example.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.io.ByteArrayInputStream;

@Configuration
public class FirebaseConfig {

    private static Firestore firestoreInstance;

    @Bean
    public Firestore firestore() throws Exception {
        if (firestoreInstance != null) {
            return firestoreInstance;
        }

        try {
            InputStream serviceAccount;
            String envKey = System.getenv("FIREBASE_KEY_JSON");

            if (envKey != null && !envKey.isEmpty()) {
                System.out.println("Initializing Firebase using FIREBASE_KEY_JSON environment variable");
                serviceAccount = new ByteArrayInputStream(envKey.getBytes());
            } else {
                // Try original name
                serviceAccount = getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");

                // Fallback to user's new name
                if (serviceAccount == null) {
                    serviceAccount = getClass().getClassLoader().getResourceAsStream("expensiofirebase.json");
                }

                if (serviceAccount != null) {
                    System.out.println("Initializing Firebase using JSON key file from resources");
                }
            }

            if (serviceAccount == null) {
                throw new RuntimeException(
                        "Firebase credentials not found (neither FIREBASE_KEY_JSON nor serviceAccountKey.json found)");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (!FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.getInstance().delete();
            }
            FirebaseApp.initializeApp(options);

            firestoreInstance = FirestoreClient.getFirestore();
            return firestoreInstance;
        } catch (Exception e) {
            System.err.println("Firebase initialization failed: " + e.getMessage());
            throw e;
        }
    }
}
