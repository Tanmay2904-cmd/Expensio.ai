package com.example.backend.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthorizationUtil {
    private static final Logger logger = LoggerFactory.getLogger(AuthorizationUtil.class);

    /**
     * Get the current authenticated username
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    /**
     * Get the current authenticated user's ID (assuming it's stored as username)
     */
    public static String getCurrentUserId() {
        return getCurrentUsername();
    }

    /**
     * Check if the current user is an admin
     */
    public static boolean isCurrentUserAdmin(String userRole) {
        return "ADMIN".equalsIgnoreCase(userRole);
    }

    /**
     * Check if current user can access resource owned by userId
     * Admins can access all, users can only access their own
     */
    public static boolean canAccessResource(String resourceOwnerId, String userRole) {
        if (isCurrentUserAdmin(userRole)) {
            return true;
        }
        String currentUsername = getCurrentUsername();
        return currentUsername != null && currentUsername.equals(resourceOwnerId);
    }

    /**
     * Validate user has permission to perform action
     * @throws SecurityException if not authorized
     */
    public static void requireOwnershipOrAdmin(String resourceOwnerId, String userRole) 
            throws SecurityException {
        if (!canAccessResource(resourceOwnerId, userRole)) {
            logger.warn("Authorization denied for user: {} attempting to access resource owned by: {}",
                    getCurrentUsername(), resourceOwnerId);
            throw new SecurityException("You don't have permission to access this resource");
        }
    }
}
