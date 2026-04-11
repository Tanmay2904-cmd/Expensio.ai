# 🧪 Expensio.ai Testing Guide

**Version**: 1.0.0  
**Date**: April 10, 2026

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [API Testing](#api-testing)
5. [Security Testing](#security-testing)
6. [Performance Testing](#performance-testing)
7. [Known Issues](#known-issues)

---

## 🚀 Quick Start

### Prerequisites

- Java 21+ installed
- Maven 3.8+
- Node.js 18+
- Backend running on port 8080
- Frontend running on port 5173

### Start Backend Server

```bash
cd backend
mvn clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

**Expected Output:**
```
Started BackendApplication in X.XXX seconds (process running for Y.XXX)
Tomcat started on port 8080 (http) with context path '/'
```

---

## 🧪 Unit Testing

### Run Backend Tests

```bash
cd backend
mvn test
```

### Run Specific Test Class

```bash
mvn test -Dtest=UserServiceTest
```

### Run with Coverage

```bash
mvn clean test jacoco:report
```

Coverage report will be generated in `target/site/jacoco/index.html`

---

### Test Structure

Tests should follow this pattern:

```java
@SpringBootTest
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    void testRegisterUserSuccess() {
        RegisterDTO dto = new RegisterDTO("newuser", "password123");
        User result = userService.registerUser(dto);
        
        assertNotNull(result);
        assertEquals("newuser", result.getName());
    }
    
    @Test
    void testRegisterUserDuplicate() {
        RegisterDTO dto = new RegisterDTO("existinguser", "password123");
        
        assertThrows(DuplicateResourceException.class, 
            () -> userService.registerUser(dto));
    }
}
```

---

## 🔗 Integration Testing

### Test Auth Flow

```bash
# 1. Register user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"Pass@123"}'

# 2. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Pass@123"}'

# 3. Use token
curl -X GET http://localhost:8080/api/users/me/profile \
  -H "Authorization: Bearer <TOKEN_HERE>"
```

### Test CRUD Operations

**Create Category:**
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Food"}'
```

**Read Category:**
```bash
curl -X GET http://localhost:8080/api/categories/<ID> \
  -H "Authorization: Bearer <TOKEN>"
```

**Update Category:**
```bash
curl -X PUT http://localhost:8080/api/categories/<ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Food & Groceries"}'
```

**Delete Category:**
```bash
curl -X DELETE http://localhost:8080/api/categories/<ID> \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🧪 API Testing

### Using Postman

1. Import collection: [Create new collection]
2. Add environment variable: `baseUrl = http://localhost:8080`
3. Add variable: `token`

**Authentication Pre-script:**
```javascript
pm.sendRequest({
    url: pm.environment.get("baseUrl") + "/api/auth/login",
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            username: "testuser",
            password: "Pass@123"
        })
    }
}, function (err, response) {
    if (!err) {
        pm.environment.set("token", response.json().data.token);
    }
});
```

### Test Cases Checklist

#### Authentication Tests
- [ ] Register with valid data
- [ ] Register with duplicate username
- [ ] Register with short username (<3 chars)
- [ ] Register with short password (<6 chars)
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Login with non-existent user
- [ ] Access protected endpoint without token
- [ ] Access protected endpoint with invalid token
- [ ] Token expiration (10 hours)

#### Categories Tests
- [ ] Create category as authenticated user
- [ ] Create category as admin
- [ ] Create category with duplicate name
- [ ] List all categories
- [ ] Get specific category
- [ ] Update category
- [ ] Delete category
- [ ] Delete non-existent category

#### Expenses Tests
- [ ] Create expense with valid data
- [ ] Create expense with positive amount
- [ ] Create expense with invalid date format
- [ ] Create expense missing required fields
- [ ] List user's expenses
- [ ] View own expense
- [ ] User cannot view other's expense
- [ ] Admin can view all expenses
- [ ] Update own expense
- [ ] Delete own expense
- [ ] User cannot delete other's expense

#### Reports Tests
- [ ] Get monthly report for current month
- [ ] Get monthly report for specific month
- [ ] Admin can get other user's report
- [ ] User cannot access other's report
- [ ] Report structure validation

#### AI Tests
- [ ] Extract expense from text
- [ ] Categorize expense description
- [ ] Get chatbot response
- [ ] AI endpoints require authentication

#### Authorization Tests
- [ ] User can only modify own data
- [ ] Admin can modify any data
- [ ] User cannot access admin endpoints
- [ ] @PreAuthorize working correctly

#### Validation Tests
- [ ] Username length validation (3-50)
- [ ] Password length validation (min 6)
- [ ] Amount positive validation
- [ ] Date format validation (YYYY-MM-DD)
- [ ] Required field validation

---

## 🔐 Security Testing

### SQL Injection Testing

**Test Case:** Try to login with SQL injection
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin\" OR \"1\"=\"1",
    "password": "anything"
  }'
```

**Expected:** Should return "Invalid username or password"

### JWT Token Tampering

**Test Case:** Modify token and try to use it
```bash
# Original token: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciJ9.xxxxx
# Modified token:  eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.xxxxx

curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <TAMPERED_TOKEN>"
```

**Expected:** Should return 401 Unauthorized

### CORS Testing

**Test Case:** Request from unauthorized origin
```bash
curl -X GET http://localhost:8080/api/categories \
  -H "Origin: http://unauthorized-domain.com" \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected:** Should be blocked or not include CORS headers

### Password Security Testing

**Test Case:** Password is hashed in response
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"sectest","password":"Password@123"}' \
  | grep -i password
```

**Expected:** Password should be BCrypt hashed ($2a$10$...)

---

## 📊 Performance Testing

### Load Testing with Apache JMeter

**Setup:**
1. Download Apache JMeter
2. Create Test Plan with Thread Group
3. Add HTTP Requests
4. Run with 100 concurrent users

**Test Scenario:**
```
Thread Group: 100 users, 10 second ramp-up
1. Register user (10 threads)
2. Login (50 threads)
3. Create expense (30 threads)
4. Get monthly report (10 threads)
```

### Response Time Targets

| Endpoint | Target (ms) | Acceptable Max (ms) |
|----------|------------|-----------------|
| Auth endpoints | 100-200 | 500 |
| CRUD operations | 50-150 | 300 |
| Reports | 200-500 | 1000 |
| AI endpoints | 1000-3000 | 5000 |

---

## ✅ Known Issues & Workarounds

### Issue 1: Login Fails After Registration

**Symptom:** User can register but login returns 401

**Cause:** Firestore UserDetailsService lookup issue

**Workaround:** 
- Verify user exists in Firestore database
- Check UserRepository.findByName() implementation
- Ensure CustomUserDetailsService is properly initialized

**Status**: Investigating

---

### Issue 2: CORS Headers Not Sent

**Symptom:** Frontend gets CORS error when calling API

**Cause:** CORS configuration might need SameSite=None; Secure

**Fix:**
```java
@Bean
public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowCredentials(true)
                .allowedMethods("*")
                .maxAge(3600);
        }
    };
}
```

---

### Issue 3: Date Queries Return Empty Results

**Symptom:** Date range queries in reports return no data

**Cause:** Firestore date format inconsistency

**Fix:** All dates are stored as "YYYY-MM-DD" strings
```java
LocalDate.parse(expense.getDate()); // Works
```

---

## 📋 Regression Testing Checklist

Before each release, verify:

- [ ] All auth tests passing
- [ ] All CRUD tests passing
- [ ] Authorization enforcement working
- [ ] Input validation working
- [ ] Error responses formatted correctly
- [ ] API response wrapper applied to all endpoints
- [ ] No hardcoded secrets in code
- [ ] No debug logging enabled
- [ ] Database connections stable
- [ ] Server starts without errors

---

## 🔍 Debugging Tips

### Enable Debug Logging

In `application.properties`:
```properties
logging.level.root=INFO
logging.level.com.example.backend=DEBUG
logging.level.org.springframework.security=DEBUG
```

### Check Server Logs

```bash
# View latest 100 lines
tail -f backend/server.log | tail -100

# Search for errors
grep ERROR backend/server.log
grep WARN backend/server.log
```

### JVM Debugging

```bash
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 \
  -jar target/backend-0.0.1-SNAPSHOT.jar
```

Then connect debugger on port 5005

---

## 📝 Test Report Template

```
# Test Report - [DATE]

## Summary
- Total Tests: XX
- Passed: XX
- Failed: XX
- Skipped: XX
- Success Rate: XXX%

## Issues Found
1. [Issue 1]
   - Severity: [High/Medium/Low]
   - Description: [Details]
   - Reproduction: [Steps]
   - Status: [Open/Closed]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]

## Sign-off
Tested By: [Name]
Date: [Date]
Status: [APPROVED/REJECTED]
```

---

**Document Version**: 1.0.0  
**Last Updated**: April 10, 2026  
**Status**: ✅ Ready for Testing
