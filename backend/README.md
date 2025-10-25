# ChonCance Backend

FastAPI backend for the ChonCance platform.

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update the values:
- `DATABASE_URL`: Your PostgreSQL connection string
- `SECRET_KEY`: Generate a secure random key for JWT signing

### 4. Setup PostgreSQL Database

Create a PostgreSQL database named `choncance`:

```bash
psql -U postgres
CREATE DATABASE choncance;
\q
```

### 5. Run Database Migrations

```bash
# Generate initial migration
alembic revision --autogenerate -m "Initial migration with User table"

# Apply migrations
alembic upgrade head
```

### 6. Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - User registration

## Project Structure

```
backend/
├── alembic/              # Database migrations
├── app/
│   ├── core/            # Core configuration
│   │   ├── config.py    # Application settings
│   │   └── database.py  # Database setup
│   ├── models/          # SQLAlchemy models
│   │   └── user.py      # User model
│   ├── routers/         # API endpoints
│   │   └── auth.py      # Authentication routes
│   ├── schemas/         # Pydantic schemas
│   │   └── user.py      # User schemas
│   ├── utils/           # Utility functions
│   │   └── security.py  # Password hashing, JWT
│   └── main.py          # FastAPI application
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment file
├── alembic.ini          # Alembic configuration
└── requirements.txt     # Python dependencies
```

## Testing the API

### Register a New User

```bash
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

## Development

- Python 3.10+
- FastAPI 0.104+
- SQLAlchemy 2.0+ (async)
- PostgreSQL 15+
