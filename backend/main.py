import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import auth, ai, student, teacher, admin

load_dotenv()

app = FastAPI(title="Hidden Piece API", description="Backend for Disability Awareness Game")

# Configure CORS for frontend access.
# Auth uses Bearer headers (no cookies), so credentials are not needed.
# Set ALLOWED_ORIGINS (comma-separated) to restrict origins in production.
allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(student.router, prefix="/api/student", tags=["Student"])
app.include_router(teacher.router, prefix="/api/teacher", tags=["Teacher"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Welcome to Hidden Piece API"}
