# Authentication Fix Tracker - UPDATED FOR PROD 401

✅ JWT fallback secret added to application.properties

## Test Steps:

### Backend Local:
```cmd
# Generate key (32+ bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Run
set JWT_SECRET=your_generated_key_here
cd backend
mvn spring-boot:run
```

### Auth Tests (localhost:8080):
```cmd
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"test\",\"password\":\"test123\",\"role\":\"USER\"}"

curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"password\":\"test123\"}"
```

### Frontend Local:
```cmd
cd frontend
npm run dev
# Auto-uses localhost:8080 (axiosConfig updated)
```

### Production Fix (Render):
1. Render Dashboard → expensio-ai → Environment
2. Add `JWT_SECRET` = `openssl rand -base64 32`
3. Redeploy
4. Test: curl https://expensio-ai.onrender.com/api/auth/login -d...

**Next**: Run local tests, then deploy JWT_SECRET to Render.
