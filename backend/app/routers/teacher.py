from fastapi import APIRouter, HTTPException, Depends
from app.services.firebase import get_db
from app.dependencies import verify_teacher_token

router = APIRouter()


def _normalize_student(item: dict) -> dict:
    """Fold legacy literal "stages.<key>" top-level fields (written by the
    old set(merge=True) dotted-key code) into the proper nested stages map."""
    stages = dict(item.get('stages') or {})
    for key in [k for k in list(item.keys()) if k.startswith('stages.')]:
        val = item.pop(key)
        stage_key = key[len('stages.'):]
        if stage_key not in stages and isinstance(val, dict):
            val.setdefault('status', 'completed')
            stages[stage_key] = val
    item['stages'] = stages
    return item


@router.get("/dashboard/{authCode}")
def get_dashboard(authCode: str, token: str = Depends(verify_teacher_token)):
    if authCode != token:
        raise HTTPException(status_code=403, detail="권한이 없습니다.")
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")

    try:
        students_ref = db.collection('classes').document(authCode).collection('students').get()

        students_data = []
        for doc in students_ref:
            item = doc.to_dict()
            item['id'] = doc.id
            students_data.append(_normalize_student(item))

        return {"success": True, "students": students_data}
    except Exception as e:
        print(f"Teacher Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail="데이터를 불러오지 못했습니다.")

@router.delete("/students/{authCode}/{studentId}")
def delete_student(authCode: str, studentId: str, token: str = Depends(verify_teacher_token)):
    if authCode != token:
        raise HTTPException(status_code=403, detail="권한이 없습니다.")
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")

    try:
        ref = db.collection('classes').document(authCode).collection('students').document(studentId)
        snap = ref.get()
        if not snap.exists:
            raise HTTPException(status_code=404, detail="해당 학생을 찾을 수 없습니다.")
        ref.delete()
        return {"success": True, "deletedStudentId": studentId}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Teacher Student Delete Error: {e}")
        raise HTTPException(status_code=500, detail="학생 삭제 중 오류가 발생했습니다.")
