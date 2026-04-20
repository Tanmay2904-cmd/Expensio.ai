# Production Environment Variables (Render/Heroku/Vercel)

## Required for Backend (https://expensio-ai.onrender.com)

| Var | Value | Description |
|-----|-------|-------------|
| `JWT_SECRET` | `openssl rand -base64 32` \| your_base64_key_here | **Required** JWT signing key (32+ bytes base64) |
| `GROQ_API_KEY` | gsk_... (https://console.groq.com) | AI features (optional) |
| `FIREBASE_KEY_JSON` | base64(`serviceAccountKey.json`) \| env var | Firestore access |

## Setup Render:
1. Dashboard → Expensio Backend → Environment
2. Add vars above
3. Redeploy

## Local Test:
```bash
# Windows (cmd)
set JWT_SECRET=your_base64_key
cd backend && mvn spring-boot:run

# PowerShell
$env:JWT_SECRET="your_base64_key"
```

## Generate Secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# OR
openssl rand -base64 32
```

