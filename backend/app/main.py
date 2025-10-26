"""
Main FastAPI application for ChonCance
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, user
from app.core.config import settings

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="ChonCance API - 촌캉스 플랫폼",
)

# CORS configuration
origins = [
    "http://localhost:3000",  # Next.js development server
    "http://localhost:8000",  # FastAPI development server
    "https://choncance.com",  # Production frontend (update as needed)
    "https://choncance.netlify.app",  # Netlify deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(user.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "ChonCance API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
