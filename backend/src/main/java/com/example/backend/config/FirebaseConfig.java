package com.example.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;

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
                serviceAccount = new java.io.ByteArrayInputStream(envKey.getBytes());
            } else {
                System.out.println("Initializing Firebase using serviceAccountKey.json from resources");
                serviceAccount = getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");
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
