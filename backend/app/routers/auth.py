from fastapi import APIRouter, HTTPException, Depends
import hashlib
import random
import os
import smtplib
from email.message import EmailMessage

from app.models.schemas import TeacherRegister, TeacherLogin, StudentLogin, FindAccount
from app.services.firebase import get_db

router = APIRouter()

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register")
def register_teacher(data: TeacherRegister):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not ready")

    teachers_ref = db.collection('teachers')
    # Check if exists
    docs = teachers_ref.where('username', '==', data.username).get()
    if docs:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    docs_email = teachers_ref.where('email', '==', data.email).get()
    if docs_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    auth_code = str(random.randint(100000, 999999))
    # Ensure uniqueness of auth code
    while teachers_ref.where('authCode', '==', auth_code).get():
        auth_code = str(random.randint(100000, 999999))

    teacher_data = {
        "username": data.username,
        "password": hash_pw(data.password),
        "email": data.email,
        "authCode": auth_code,
        "role": "teacher"
    }

    try:
        teachers_ref.add(teacher_data)
        return {"success": True, "authCode": auth_code}
    except Exception as e:
        print(f"Teacher Registration Error: {e}")
        raise HTTPException(status_code=500, detail="회원가입 처리 중 오류가 발생했습니다.")

@router.post("/login")
def login(data: TeacherLogin):
    # Check Admin first
    admin_user = os.getenv("ADMIN_USER", "admin")
    admin_pass = os.getenv("ADMIN_PASS", "260420")
    if data.username == admin_user and data.password == admin_pass:
        return {"success": True, "role": "admin", "username": "Admin", "authCode": admin_pass}

    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not ready")

    teachers_ref = db.collection('teachers')
    docs = teachers_ref.where('username', '==', data.username).where('password', '==', hash_pw(data.password)).get()

    if not docs:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    user_doc = docs[0].to_dict()
    return {
        "success": True,
        "role": "teacher",
        "username": user_doc.get("username"),
        "authCode": user_doc.get("authCode")
    }

@router.post("/student/login")
def student_login(data: StudentLogin):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not ready")

    teachers_ref = db.collection('teachers')
    docs = teachers_ref.where('authCode', '==', data.authCode).get()

    if not docs:
        raise HTTPException(status_code=401, detail="Invalid authorization code")

    teacher_doc = docs[0].to_dict()
    return {
        "success": True,
        "role": "student",
        "teacher": teacher_doc.get("username"),
        "authCode": data.authCode
    }

@router.post("/find")
def find_account(data: FindAccount):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not ready")

    teachers_ref = db.collection('teachers')
    docs = teachers_ref.where('email', '==', data.email).get()

    if not docs:
        raise HTTPException(status_code=404, detail="Email not found")

    user_doc = docs[0].to_dict()
    
    # Send email
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not (smtp_user and smtp_password):
        # Allow dev mode bypass
        return {"success": True, "dev_mock": True, "username": user_doc.get("username")}

    msg = EmailMessage()
    msg['Subject'] = "[히든피스] 요청하신 계정 정보입니다"
    msg['From'] = smtp_user
    msg['To'] = data.email
    msg.set_content(f"안녕하세요.\n\n요청하신 계정 정보는 다음과 같습니다:\n\n아이디: {user_doc.get('username')}\n\n* 비밀번호는 보안상 전송되지 않으며 암호화되어 관리됩니다. 재설정이 필요하다면 관리자에게 문의하세요.")

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        return {"success": True, "message": "Email sent"}
    except Exception as e:
        print(f"Email Sending Error: {e}")
        raise HTTPException(status_code=500, detail="이메일 전송 중 오류가 발생했습니다.")
