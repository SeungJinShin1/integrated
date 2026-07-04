from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.services.firebase import get_db
from app.dependencies import verify_student_token
import datetime

router = APIRouter()

VALID_STATUSES = ("in_progress", "completed")


def _now() -> str:
    return datetime.datetime.utcnow().isoformat()


def _clean_student_id(student_id: str) -> str:
    sid = student_id.strip()
    if (
        not sid
        or sid in (".", "..")
        or "/" in sid
        # Firestore-reserved document IDs (__.*__)
        or (sid.startswith("__") and sid.endswith("__"))
    ):
        raise HTTPException(status_code=400, detail="유효하지 않은 학생 ID입니다.")
    return sid


class StudentJoin(BaseModel):
    authCode: str
    studentId: str = Field(min_length=1, max_length=60)
    studentName: str = Field(min_length=1, max_length=30)
    gradeMode: Optional[str] = None


class ProgressUpdate(BaseModel):
    authCode: str
    studentId: str = Field(min_length=1, max_length=60)
    studentName: str = Field(min_length=1, max_length=30)
    stage: str = Field(min_length=1, max_length=40)
    score: int = 0
    usedTools: List[str] = []
    stats: Dict[str, Any] = {}
    logs: Dict[str, Any] = {}
    # "in_progress" when a stage is entered, "completed" when finished.
    # Defaults to "completed" so older clients keep working unchanged.
    status: str = "completed"
    gradeMode: Optional[str] = None


@router.post("/join")
def join_class(data: StudentJoin, token: str = Depends(verify_student_token)):
    """Register a student the moment they start the game (after character
    creation), so teachers see them on the dashboard before any stage is
    completed."""
    if data.authCode != token:
        raise HTTPException(status_code=403, detail="잘못된 접근 권한입니다.")
    sid = _clean_student_id(data.studentId)

    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")

    try:
        ref = db.collection('classes').document(data.authCode).collection('students').document(sid)
        snap = ref.get()
        payload: Dict[str, Any] = {
            "studentName": data.studentName,
            "lastActive": _now(),
        }
        if data.gradeMode:
            payload["gradeMode"] = data.gradeMode
        if not snap.exists:
            payload["joinedAt"] = _now()
        ref.set(payload, merge=True)
        return {"success": True}
    except Exception as e:
        print(f"Student Join Error: {e}")
        raise HTTPException(status_code=500, detail="데이터 저장 중 오류가 발생했습니다.")


@router.post("/progress")
def update_progress(data: ProgressUpdate, token: str = Depends(verify_student_token)):
    if data.authCode != token:
        raise HTTPException(status_code=403, detail="잘못된 접근 권한입니다.")
    if data.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="유효하지 않은 데이터입니다.")
    if data.score < 0:
        raise HTTPException(status_code=400, detail="유효하지 않은 데이터입니다.")
    sid = _clean_student_id(data.studentId)

    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")

    try:
        ref = db.collection('classes').document(data.authCode).collection('students').document(sid)
        snap = ref.get()
        existing = (snap.to_dict() or {}) if snap.exists else {}
        existing_stage = (existing.get('stages') or {}).get(data.stage) or {}
        # Records written by the previous backend ended up as literal
        # top-level fields named "stages.<stage>" (set(merge=True) does not
        # expand dotted keys); honor them when deciding completion.
        legacy_stage = existing.get(f'stages.{data.stage}') or {}
        already_completed = (
            existing_stage.get('status') == 'completed'
            or existing_stage.get('completedAt')
            or legacy_stage.get('completedAt')
        )

        now = _now()
        base: Dict[str, Any] = {
            "studentName": data.studentName,
            "lastActive": now,
        }
        if data.gradeMode:
            base["gradeMode"] = data.gradeMode

        if data.status == "in_progress":
            # Never downgrade a completed stage back to in-progress
            # (e.g., a student replaying an episode).
            if already_completed:
                ref.set(base, merge=True)
                return {"success": True, "skipped": "already-completed"}
            stage_entry: Dict[str, Any] = {
                "status": "in_progress",
                "startedAt": existing_stage.get("startedAt") or now,
            }
        else:
            stage_entry = {
                "status": "completed",
                "score": data.score,
                "usedTools": data.usedTools,
                "stats": data.stats,
                "logs": data.logs,
                "completedAt": now,
            }
            if existing_stage.get("startedAt"):
                stage_entry["startedAt"] = existing_stage["startedAt"]

        # Proper nested map: set(merge=True) deep-merges this into the
        # existing "stages" map without touching sibling stage entries.
        base["stages"] = {data.stage: stage_entry}
        ref.set(base, merge=True)
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Student Progress Update Error: {e}")
        raise HTTPException(status_code=500, detail="데이터 저장 중 오류가 발생했습니다.")
