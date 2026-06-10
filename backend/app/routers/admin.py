from fastapi import APIRouter, HTTPException, Depends
from app.services.firebase import get_db
from app.dependencies import verify_admin_token
from app.models.schemas import AdminResetPassword
import hashlib
import secrets
import string

router = APIRouter()


def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def _generate_temp_password(length: int = 10) -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


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
            t.pop('password', None)  # never expose hash
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
            "students": all_students,
        }
    except Exception as e:
        print(f"Admin Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")


@router.delete("/teachers/{teacher_id}")
def delete_teacher(teacher_id: str, token: str = Depends(verify_admin_token)):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not ready")

    try:
        teacher_ref = db.collection('teachers').document(teacher_id)
        snap = teacher_ref.get()
        if not snap.exists:
            raise HTTPException(status_code=404, detail="해당 교사를 찾을 수 없습니다.")

        teacher_data = snap.to_dict() or {}
        auth_code = teacher_data.get('authCode')

        # Cascade delete: students in this teacher's class collection
        deleted_students = 0
        if auth_code:
            students_ref = db.collection('classes').document(auth_code).collection('students').get()
            for stu_doc in students_ref:
                stu_doc.reference.delete()
                deleted_students += 1
            # Delete the class document itself if present
            db.collection('classes').document(auth_code).delete()

        teacher_ref.delete()

        return {
            "success": True,
            "deletedTeacherId": teacher_id,
            "deletedStudents": deleted_students,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Teacher delete error: {e}")
        raise HTTPException(status_code=500, detail="교사 삭제 중 오류가 발생했습니다.")


@router.post("/teachers/{teacher_id}/reset-password")
def reset_teacher_password(
    teacher_id: str,
    payload: AdminResetPassword,
    token: str = Depends(verify_admin_token),
):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not ready")

    try:
        teacher_ref = db.collection('teachers').document(teacher_id)
        snap = teacher_ref.get()
        if not snap.exists:
            raise HTTPException(status_code=404, detail="해당 교사를 찾을 수 없습니다.")

        new_password = (payload.newPassword or '').strip()
        if not new_password:
            new_password = _generate_temp_password()
        if len(new_password) < 6:
            raise HTTPException(status_code=400, detail="비밀번호는 6자 이상이어야 합니다.")

        teacher_ref.update({"password": hash_pw(new_password)})
        teacher_data = snap.to_dict() or {}

        return {
            "success": True,
            "teacherId": teacher_id,
            "username": teacher_data.get('username'),
            "email": teacher_data.get('email'),
            "authCode": teacher_data.get('authCode'),
            "tempPassword": new_password,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Reset password error: {e}")
        raise HTTPException(status_code=500, detail="비밀번호 재설정 중 오류가 발생했습니다.")


@router.delete("/students/{auth_code}/{student_id}")
def delete_student(auth_code: str, student_id: str, token: str = Depends(verify_admin_token)):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not ready")

    try:
        ref = db.collection('classes').document(auth_code).collection('students').document(student_id)
        snap = ref.get()
        if not snap.exists:
            raise HTTPException(status_code=404, detail="해당 학생 기록을 찾을 수 없습니다.")
        ref.delete()
        return {"success": True, "deletedStudentId": student_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Student delete error: {e}")
        raise HTTPException(status_code=500, detail="학생 기록 삭제 중 오류가 발생했습니다.")
