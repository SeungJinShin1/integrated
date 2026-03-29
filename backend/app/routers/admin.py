from fastapi import APIRouter, HTTPException, Depends
from app.services.firebase import get_db
from app.dependencies import verify_admin_token
from typing import Optional
import os

router = APIRouter()

@router.get("/dashboard")
def get_admin_dashboard(token: str = Depends(verify_admin_token)):
    
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not ready")

    try:
        teachers_ref = db.collection('teachers').get()
        teachers = []
        for doc in teachers_ref:
            t = doc.to_dict()
            t['id'] = doc.id
            t.pop('password', None) # secure
            teachers.append(t)
        
        classes_ref = db.collection('classes').get()
        all_students = []
        for cls in classes_ref:
            auth_code = cls.id
            students_ref = db.collection('classes').document(auth_code).collection('students').get()
            for doc in students_ref:
                stu = doc.to_dict()
                stu['authCode'] = auth_code
                stu['id'] = doc.id
                all_students.append(stu)
        
        return {
            "success": True, 
            "teachersTotal": len(teachers), 
            "studentsTotal": len(all_students), 
            "teachers": teachers,
            "students": all_students
        }
    except Exception as e:
        print(f"Admin Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")
