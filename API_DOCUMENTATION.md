# 🚀 Expensio.ai API Documentation

**Base URL**: `http://localhost:8080/api`

**Version**: 1.0.0

**Last Updated**: April 10, 2026

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Users API](#users-api)
3. [Categories API](#categories-api)
4. [Expenses API](#expenses-api)
5. [Reports API](#reports-api)
6. [AI/Chatbot API](#aichatbot-api)
7. [Error Handling](#error-handling)
8. [Response Format](#response-format)

---

## 🔐 Authentication

### Endpoints Are Protected

All endpoints except `/api/auth/**` require JWT authentication.

**Include JWT Token in Headers:**
```
Authorization: Bearer <TOKEN>
```

---

## 🔑 Authentication Endpoints

### Registration

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "username",
  "password": "password123",
  "role": "USER"  // Optional: defaults to USER
}
```

**Validations:**
- `name`: Required, 3-50 characters
- `password`: Required, minimum 6 characters
- `role`: Optional (DEFAULT: "USER", can be "ADMIN")

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-id",
    "name": "username",
    "role": "USER",
    "password": "$2a$10$..." // BCrypt hashed
  },
  "timestamp": "2026-04-10T09:41:03.442..."
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Username already exists",
  "data": null,
  "timestamp": "2026-04-10T..."
}
```

---

### Login

**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "username": "username",
  "password": "password123"
}
```

**Validations:**
- `username`: Required, 3-50 characters
- `password`: Required, minimum 6 characters

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "role": "USER",
    "username": "username",
    "userId": "user-id"
  },
  "timestamp": "2026-04-10T09:41:03.442..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid username or password",
  "data": null,
  "timestamp": "2026-04-10T..."
}
```

---

## 👥 Users API

### Get All Users

**GET** `/users`

*Requires: ADMIN role*

Get list of all users.

**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    {
      "id": "user-1",
      "name": "admin",
      "role": "ADMIN"
    },
    {
      "id": "user-2",
      "name": "testuser",
      "role": "USER"
    }
  ],
  "timestamp": "2026-04-10T..."
}
```

---

### Create User

**POST** `/users`

*Requires: ADMIN role*

Create a new user (admin only).

**Request Body:**
```json
{
  "name": "newuser",
  "password": "password123",
  "role": "USER"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-3",
    "name": "newuser",
    "role": "USER"
  },
  "timestamp": "2026-04-10T..."
}
```

---

### Get User Profile

**GET** `/users/me/profile`

*Requires: Authentication*

Get current user's profile.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": "user-2",
    "name": "testuser",
    "role": "USER"
  },
  "timestamp": "2026-04-10T..."
}
```

---

### Update User Profile

**PUT** `/users/me/profile`

*Requires: Authentication*

Update current user's profile.

**Request Body:**
```json
{
  "name": "newusername"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user-2",
    "name": "newusername",
    "role": "USER"
  },
  "timestamp": "2026-04-10T..."
}
```

---

### Change Password

**POST** `/users/me/password`

*Requires: Authentication*

Change current user's password.

**Request Body:**
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password"
}
```

**Validations:**
- Must provide both old and new password
- New password must be different from old

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null,
  "timestamp": "2026-04-10T..."
}
```

---

## 📂 Categories API

### Get All Categories

**GET** `/categories`

*Requires: Authentication*

Get all expense categories.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Categories retrieved",
  "data": [
    {
      "id": "cat-1",
      "name": "Food"
    },
    {
      "id": "cat-2",
      "name": "Transport"
    }
  ],
  "timestamp": "2026-04-10T..."
}
```

---

### Create Category

**POST** `/categories`

*Requires: ADMIN role*

Create a new expense category.

**Request Body:**
```json
{
  "name": "Entertainment"
}
```

**Validations:**
- `name`: Required, non-blank

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "cat-3",
    "name": "Entertainment"
  },
  "timestamp": "2026-04-10T..."
}
```

---

### Update Category

**PUT** `/categories/{id}`

*Requires: ADMIN role*

Update category.

**Request Body:**
```json
{
  "name": "Entertainment & Media"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": "cat-3",
    "name": "Entertainment & Media"
  },
  "timestamp": "2026-04-10T..."
}
```

---

### Delete Category

**DELETE** `/categories/{id}`

*Requires: ADMIN role*

Delete a category.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": null,
  "timestamp": "2026-04-10T..."
}
```

---

## 💰 Expenses API

### Create Expense

**POST** `/expenses`

*Requires: Authentication*

Create a new expense.

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Lunch at McDonald's",
  "categoryId": "cat-1",
  "date": "2026-04-10"
}
```

**Validations:**
- `amount`: Required, positive number
- `description`: Required, non-blank
- `categoryId`: Required
- `date`: Required, format: YYYY-MM-DD

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": "exp-1",
    "amount": 50.00,
    "description": "Lunch at McDonald's",
    "categoryId": "cat-1",
    "categoryName": "Food",
    "date": "2026-04-10",
    "userId": "user-2",
    "userName": "testuser"
  },
  "timestamp": "2026-04-10T..."
}
```

---

###  Get My Expenses

**GET** `/expenses/my/list`

*Requires: Authentication*

Get current user's expenses.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expenses retrieved",
  "data": [
    {
      "id": "exp-1",
      "amount": 50.00,
      "description": "Lunch at McDonald's",
      "categoryId": "cat-1",
      "categoryName": "Food",
      "date": "2026-04-10",
      "userId": "user-2",
      "userName": "testuser"
    }
  ],
  "timestamp": "2026-04-10T..."
}
```

---

### Get Expense

**GET** `/expenses/{id}`

*Requires: Authentication*

Get specific expense (user must own it or be admin).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense retrieved",
  "data": {
    "id": "exp-1",
    "amount": 50.00,
    "description": "Lunch",
    "categoryId": "cat-1",
    "categoryName": "Food",
    "date": "2026-04-10",
    "userId": "user-2",
    "userName": "testuser"
  },
  "timestamp": "2026-04-10T..."
}
```

---

### Update Expense

**PUT** `/expenses/{id}`

*Requires: Authentication (Owner or Admin)*

Update expense.

**Request Body:**
```json
{
  "amount": 55.00,
  "description": "Lunch at McDonald's + tip",
  "categoryId": "cat-1",
  "date": "2026-04-10"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "id": "exp-1",
    "amount": 55.00,
    "description": "Lunch at McDonald's + tip",
    "categoryId": "cat-1",
    "categoryName": "Food",
    "date": "2026-04-10",
    "userId": "user-2",
    "userName": "testuser"
  },
  "timestamp": "2026-04-10T..."
}
```

---

### Delete Expense

**DELETE** `/expenses/{id}`

*Requires: Authentication (Owner or Admin)*

Delete expense.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense deleted successfully",
  "data": null,
  "timestamp": "2026-04-10T..."
}
```

---

### My Expenses by Category

**GET** `/expenses/my/total-by-category`

*Requires: Authentication*

Get total expenses grouped by category for current user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expenses by category retrieved",
  "data": {
    "Food": 250.50,
    "Transport": 100.00,
    "Entertainment": 75.25
  },
  "timestamp": "2026-04-10T..."
}
```

---

### My Monthly Summary

**GET** `/expenses/my/monthly-summary`

*Requires: Authentication*

Get expenses grouped by month for current user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Monthly summary retrieved",
  "data": {
    "2026-01": 1250.00,
    "2026-02": 1100.50,
    "2026-03": 950.75,
    "2026-04": 425.75
  },
  "timestamp": "2026-04-10T..."
}
```

---

### Admin: All Expenses by Category

**GET** `/expenses/admin/total-by-category`

*Requires: ADMIN role*

Get total expenses by category for all users.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All expenses by category retrieved",
  "data": {
    "Food": 5250.50,
    "Transport": 2100.00,
    "Entertainment": 1575.25
  },
  "timestamp": "2026-04-10T..."
}
```

---

### Admin: Monthly Summary

**GET** `/expenses/admin/monthly-summary`

*Requires: ADMIN role*

Get all expenses by month.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Monthly summary retrieved",
  "data": {
    "2026-01": 12500.00,
    "2026-02": 11050.50,
    "2026-03": 9500.75,
    "2026-04": 4257.50
  },
  "timestamp": "2026-04-10T..."
}
```

---

## 📊 Reports API

### Get Monthly Report

**GET** `/reports/monthly`

*Requires: Authentication*

Get detailed monthly report for current user.

**Query Parameters:**
- `yearMonth` (optional): Format "YYYY-MM", defaults to current month
- `userId` (optional): Admin only - get report for specific user

**Example:**
```
GET /reports/monthly?yearMonth=2026-04
GET /reports/monthly?yearMonth=2026-04&userId=user-3
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Monthly report retrieved",
  "data": {
    "period": {
      "yearMonth": "2026-04",
      "startDate": "2026-04-01",
      "endDate": "2026-04-30",
      "daysInMonth": 30
    },
    "summary": {
      "totalAmount": "4257.50",
      "totalCount": 45,
      "averageAmount": "94.61",
      "averageDailySpending": "141.92",
      "daysWithExpenses": 30
    },
    "categoryBreakdown": {
      "Food": 1250.50,
      "Transport": 450.00,
      "Entertainment": 375.25,
      "Utilities": 1181.75
    },
    "dailyBreakdown": {
      "2026-04-01": 125.00,
      "2026-04-02": 89.50,
      "2026-04-03": 156.75
    },
    "topExpenses": [
      {
        "id": "exp-5",
        "amount": 250.00,
        "description": "Phone Bill",
        "category": "Utilities",
        "date": "2026-04-15"
      }
    ],
    "allExpenses": [
      {
        "id": "exp-1",
        "amount": 50.00,
        "description": "Lunch",
        "category": "Food",
        "date": "2026-04-10"
      }
    ]
  },
  "timestamp": "2026-04-10T..."
}
```

---

### Get Available Users (For Reports)

**GET** `/reports/users`

*Requires: ADMIN role*

Get list of users for admin to select when generating reports.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    {
      "id": "user-1",
      "name": "admin",
      "role": "ADMIN"
    },
    {
      "id": "user-2",
      "name": "testuser",
      "role": "USER"
    }
  ],
  "timestamp": "2026-04-10T..."
}
```

---

## 🤖 AI/Chatbot API

### Extract Expense Details

**POST** `/ai/extract-expense`

*Requires: Authentication*

Use AI to extract expense details from natural language text.

**Request Body:**
```json
{
  "text": "I spent 50 bucks on lunch today"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense details extracted successfully",
  "data": "{\"amount\": 50.00, \"description\": \"lunch\", \"category\": \"Food\", \"date\": \"2026-04-10\"}",
  "timestamp": "2026-04-10T..."
}
```

---

### Categorize Expense

**POST** `/ai/categorize`

*Requires: Authentication*

Use AI to automatically categorize an expense based on description.

**Request Body:**
```json
{
  "description": "Bought groceries at Whole Foods"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Categorization successful",
  "data": {
    "category": "Food"
  },
  "timestamp": "2026-04-10T..."
}
```

---

### Financial Chatbot

**POST** `/ai/chat`

*Requires: Authentication*

Chat with AI financial assistant for budgeting advice and spending analysis.

**Request Body:**
```json
{
  "message": "How can I save more money this month?"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Chatbot response",
  "data": {
    "reply": "Based on your spending patterns, here are suggestions to save more money: 1. Reduce food expenses by 10%... 2. Look for cheaper transportation options... 3. Cut down on entertainment spending..."
  },
  "timestamp": "2026-04-10T..."
}
```

---

## 🚨 Error Handling

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid JWT token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

### Error Response Format

All errors follow the same response format:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "data": null,
  "timestamp": "2026-04-10T..."
}
```

**Examples:**

**Missing JWT Token (401):**
```json
{
  "success": false,
  "message": "Unauthorized - Missing JWT Token",
  "data": null,
  "timestamp": "2026-04-10T..."
}
```

**Invalid Role (403):**
```json
{
  "success": false,
  "message": "You don't have permission to access this resource",
  "data": null,
  "timestamp": "2026-04-10T..."
}
```

**Resource Not Found (404):**
```json
{
  "success": false,
  "message": "User not found with id: invalid-id",
  "data": null,
  "timestamp": "2026-04-10T..."
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed: amount must be positive",
  "data": null,
  "timestamp": "2026-04-10T..."
}
```

---

## 📋 Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Descriptive message",
  "data": {
    // Response data - varies by endpoint
  },
  "timestamp": "ISO 8601 timestamp"
}
```

### Fields:
- **success**: Boolean indicating if request succeeded
- **message**: Human-readable message
- **data**: Response payload (null for delete operations)
- **timestamp**: ISO 8601 formatted timestamp

---

## 🔑 JWT Token Format

Tokens are valid for **10 hours**.

**Token Structure:**
```
Header.Payload.Signature
```

**Payload includes:**
```json
{
  "sub": "username",
  "role": "USER",
  "iat": 1712741463,
  "exp": 1712778463
}
```

---

## 🧪 Testing Examples

### cURL Examples

**Register User:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testuser",
    "password": "Test@123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test@123"
  }'
```

**Create Category:**
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Food"
  }'
```

**Create Expense:**
```bash
curl -X POST http://localhost:8080/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "description": "Lunch",
    "categoryId": "cat-1",
    "date": "2026-04-10"
  }'
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format with timezone
- All monetary amounts are in decimal format (e.g., 50.00)
- Date format is always YYYY-MM-DD
- JWT tokens must be included in Authorization header as Bearer token
- All endpoints are case-sensitive
- Rate limiting: Not currently implemented

---

**Version**: 1.0.0  
**Last Updated**: April 10, 2026  
**Status**: ✅ Production Ready
