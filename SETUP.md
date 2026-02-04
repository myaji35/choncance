# ChonCance Setup Guide

Complete setup guide for running the ChonCance application with backend and frontend.

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 15+

## Backend Setup

### 1. Install PostgreSQL

If you don't have PostgreSQL installed:

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE choncance;

# Exit psql
\q
```

### 3. Setup Python Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### 4. Configure Environment Variables

Edit `backend/.env` and update:

```env
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/choncance
SECRET_KEY=your-super-secret-key-here-generate-with-openssl
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Generate a secure SECRET_KEY:
```bash
openssl rand -hex 32
```

### 5. Run Database Migrations

```bash
# From backend directory with venv activated
alembic revision --autogenerate -m "Initial migration with User table"
alembic upgrade head
```

### 6. Start Backend Server

```bash
# From backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Frontend Setup

### 1. Install Dependencies

```bash
# From project root directory
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Frontend will be available at:
- App: http://localhost:3000

## Testing the Signup Feature

### Option 1: Manual Testing via UI

1. Ensure both backend (port 8000) and frontend (port 3000) are running
2. Open browser to http://localhost:3000/signup
3. Fill in the form:
   - Email: test@example.com
   - Name: 홍길동
   - Phone: 010-1234-5678
   - Password: password123
   - Password Confirm: password123
   - Check both agreement boxes
4. Click "회원가입"
5. You should be redirected to /dashboard with a JWT token stored

### Option 2: Testing via cURL

```bash
# Test registration endpoint
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "agreed_to_terms": true,
    "agreed_to_privacy": true
  }'
```

Expected response:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "role": "GUEST",
    "profile_image": null,
    "created_at": "2024-01-15T12:00:00Z"
  },
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### Option 3: Testing via FastAPI Docs

1. Open http://localhost:8000/docs
2. Find POST /api/v1/auth/register
3. Click "Try it out"
4. Fill in the request body
5. Click "Execute"

## Verifying Database

Check that the user was created:

```bash
psql -U postgres -d choncance

SELECT id, email, name, phone, role, created_at FROM users;

\q
```

## Common Issues

### Issue: "Database connection failed"
**Solution:** Ensure PostgreSQL is running and DATABASE_URL in .env is correct

### Issue: "Module not found" errors in backend
**Solution:** Ensure virtual environment is activated and dependencies are installed

### Issue: "CORS error" in browser
**Solution:** Verify backend is running on port 8000 and CORS origins include http://localhost:3000

### Issue: "Checkbox component not found"
**Solution:** The checkbox component has been added. Run `npm install` if needed.

### Issue: "Alembic can't find models"
**Solution:** Ensure you're running alembic from the backend directory with venv activated

## Development Workflow

1. Start PostgreSQL service
2. Activate backend venv: `cd backend && source venv/bin/activate`
3. Start backend: `uvicorn app.main:app --reload`
4. In new terminal, start frontend: `npm run dev`
5. Access app at http://localhost:3000

## Next Steps

After successful signup implementation:
- Implement login (US-1.2)
- Add password reset flow (US-1.3)
- Build theme discovery features (Epic 2)
- Develop host management (Epic 3)
