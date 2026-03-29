from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.firebase import get_db
from app.dependencies import verify_student_token
import datetime

router = APIRouter()

class ProgressUpdate(BaseModel):
    authCode: str
    studentId: str  # e.g., "stu1234"
    studentName: str
    stage: str
    score: int
    usedTools: List[str]
    stats: Dict[str, Any]
    logs: Dict[str, Any]

@router.post("/progress")
def update_progress(data: ProgressUpdate, token: str = Depends(verify_student_token)):
    if data.authCode != token:
        raise HTTPException(status_code=403, detail="잘못된 접근 권한입니다.")

    if data.score < 0:
        raise HTTPException(status_code=400, detail="유효하지 않은 데이터입니다.")

    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")

    class_ref = db.collection('classes').document(data.authCode)
    student_ref = class_ref.collection('students').document(data.studentId)
    
    update_data = {
        "studentName": data.studentName,
        "lastActive": datetime.datetime.utcnow().isoformat(),
        f"stages.{data.stage}": {
            "score": data.score,
            "usedTools": data.usedTools,
            "stats": data.stats,
            "logs": data.logs,
            "completedAt": datetime.datetime.utcnow().isoformat()
        }
    }
    
    try:
        student_ref.set(update_data, merge=True)
        return {"success": True}
    except Exception as e:
        print(f"Student Progress Update Error: {e}")
        raise HTTPException(status_code=500, detail="데이터 저장 중 오류가 발생했습니다.")
