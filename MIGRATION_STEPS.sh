#!/bin/bash
# Migration Script - Steps to Apply All Fixes
# Run this guide step-by-step to update your backend to production-ready code

echo "=========================================="
echo "EXPENSIO.AI - BACKEND MIGRATION GUIDE"
echo "=========================================="
echo ""

# Step 1: Verify all new files exist
echo "[STEP 1] Verifying new files created..."
echo "Checking exception handlers..."
ls -la backend/src/main/java/com/example/backend/exception/
echo ""

echo "Checking DTOs..."
ls -la backend/src/main/java/com/example/backend/dto/
echo ""

echo "Checking service layer..."
ls -la backend/src/main/java/com/example/backend/service/
echo ""

# Step 2: Update application.properties
echo "[STEP 2] Environment Configuration"
echo "Ensure these environment variables are set:"
echo "  - JWT_SECRET=<your-secret-key>"
echo "  - GEMINI_API_KEY=<your-api-key>"
echo ""
echo "Or update application.properties with actual values"
echo ""

# Step 3: Build and test
echo "[STEP 3] Build the project"
echo "Run: mvn clean install"
echo ""

# Step 4: Run the application
echo "[STEP 4] Start the application"
echo "Run: java -jar target/backend-0.0.1-SNAPSHOT.jar"
echo ""

# Step 5: Test endpoints
echo "[STEP 5] Test key endpoints"
echo ""
echo "1. Register new user:"
echo "curl -X POST http://localhost:8080/api/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"name\":\"testuser\",\"password\":\"password123\"}'"
echo ""

echo "2. Login:"
echo "curl -X POST http://localhost:8080/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"username\":\"testuser\",\"password\":\"password123\"}'"
echo ""

echo "3. Create Category (use token from login response):"
echo "curl -X POST http://localhost:8080/api/categories \\"
echo "  -H 'Authorization: Bearer <TOKEN>' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"name\":\"Food\"}'"
echo ""

echo "4. Create Expense:"
echo "curl -X POST http://localhost:8080/api/expenses \\"
echo "  -H 'Authorization: Bearer <TOKEN>' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"amount\":50.00,\"description\":\"Lunch\",\"categoryId\":\"<CATEGORY_ID>\",\"date\":\"2024-04-10\",\"userId\":\"testuser\"}'"
echo ""

echo "5. Auto-categorize (NEW ENDPOINT):"
echo "curl -X POST http://localhost:8080/api/ai/categorize \\"
echo "  -H 'Authorization: Bearer <TOKEN>' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"description\":\"Bought groceries at walmart\"}'"
echo ""

echo "=========================================="
echo "MIGRATION COMPLETE!"
echo "=========================================="
