from fastapi import HTTPException, Header, Depends
from typing import Optional
import os
from app.services.firebase import get_db

async def verify_admin_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split("Bearer ")[1]
    
    admin_pass = os.getenv("ADMIN_PASS", "260420")
    if token != admin_pass:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Admin Token")
    return token

async def verify_teacher_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split("Bearer ")[1]
    
    db = get_db()
    if not db:
        print("Error: Database not ready in dependency")
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")
        
    teachers_ref = db.collection('teachers')
    docs = teachers_ref.where('authCode', '==', token).get()
    
    if not docs:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Teacher Token")
    
    return token

async def verify_student_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split("Bearer ")[1]
    
    db = get_db()
    if not db:
        print("Error: Database not ready in dependency")
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")
        
    teachers_ref = db.collection('teachers')
    docs = teachers_ref.where('authCode', '==', token).get()
    
    if not docs:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Session Token")
    
    return token
