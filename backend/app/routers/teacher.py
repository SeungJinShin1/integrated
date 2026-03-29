from fastapi import APIRouter, HTTPException, Depends
from app.services.firebase import get_db
from app.dependencies import verify_teacher_token

router = APIRouter()

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
            students_data.append(item)
            
        return {"success": True, "students": students_data}
    except Exception as e:
        print(f"Teacher Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail="데이터를 불러오지 못했습니다.")
