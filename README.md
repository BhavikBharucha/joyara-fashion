# Joyara Fashion

Premium Women's Fashion E-commerce Platform built with React.js and FastAPI.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Redux Toolkit, TanStack Query, React Router, Framer Motion

**Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, JWT Authentication

**Database:** MySQL

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Configure database credentials
alembic upgrade head
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173` with API proxy to `http://localhost:8000`.

## Default Admin

- **Email:** admin@joyarafashion.com
- **Password:** Admin@123456

## Architecture

- **Clean Architecture** with separation of concerns
- **Repository Pattern** for data access
- **Service Layer** for business logic
- **JWT Authentication** with access and refresh tokens
- **Role-based Authorization** (admin/customer)

## API Documentation

FastAPI auto-generates interactive API docs at `http://localhost:8000/docs`.
