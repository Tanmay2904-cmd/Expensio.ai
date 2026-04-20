# Authentication Fix - Detailed Steps (Prod 401 Issue)

**Status**: Plan approved. 401 on prod login due to missing JWT_SECRET/DB.

## Step-by-Step Implementation:

### 1. Update Backend Config (JWT Fallback)
```
Edit backend/src/main/resources/application.properties:
jwt.secret=${JWT_SECRET:your-super-secret-jwt-key-min32chars-long-change-in-prod!!}
```
**Progress**: [ ]

### 2. Update Frontend Axios (Local Dev Support)
```
Edit frontend/src/utils/axiosConfig.js:
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
```
Add `.env.local`: `VITE_BACKEND_URL=http://localhost:8080`
**Progress**: [ ]

### 3. Update TODO.md with Prod Test Commands
```
Add curl register/login tests
```
**Progress**: [ ]

### 4. Test Local Backend
```
# Generate key
openssl rand -base64 32 (or node script in DEPLOY_ENV_VARS.md)

# Windows cmd:
set JWT_SECRET=yourkeyhere
cd backend
mvn spring-boot:run

Expected: Startup success on :8080
```
**Progress**: [ ]

### 5. Local Auth Tests (curl)
```
# Register
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"test\",\"password\":\"test123\",\"role\":\"USER\"}"

# Login
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"test\",\"password\":\"test123\"}"
```
**Progress**: [ ]

### 6. Deploy Fix
```
Render Dashboard → Backend → Environment → Add JWT_SECRET
Redeploy
Test: https://expensio-ai.onrender.com/api/auth/login
```
**Progress**: [ ]

### 7. Frontend Local
```
cd frontend
echo "VITE_BACKEND_URL=http://localhost:8080" > .env.local
npm run dev
```
**Progress**: [ ]

**Next**: Complete step 1-3 edits, then test step 4. Mark [x] as done.
