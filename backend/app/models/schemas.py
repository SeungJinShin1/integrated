from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

class TeacherRegister(BaseModel):
    username: str
    password: str
    email: EmailStr

class TeacherLogin(BaseModel):
    username: str
    password: str

class StudentLogin(BaseModel):
    authCode: str

class FindAccount(BaseModel):
    email: EmailStr

class AIChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    # Accepted for backward compatibility with older clients, but ignored:
    # the system prompt is fixed server-side (see routers/ai.py).
    systemPrompt: Optional[str] = None

class AdminResetPassword(BaseModel):
    newPassword: Optional[str] = None  # if omitted, server generates one

# Database schema references
# Teacher:
# { "uid": "...", "username": "...", "email": "...", "password": "...", "role": "teacher", "authCode": "123456" }
# Student progress is kept under /classes/{authCode}/students/{mac-or-uuid} ... but honestly since no student login is needed for low-grade,
# and high-grade is just 6-digit code, students can just login and it creates a temp session or asks for their name.
# Let's say: when a student logs in with the 6-digit `authCode`, they are asked for their name. That registers them to the class.
