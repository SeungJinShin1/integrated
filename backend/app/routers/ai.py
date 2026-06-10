import os
import traceback
from google import genai
from google.genai import types
from fastapi import APIRouter, HTTPException
from app.models.schemas import AIChatRequest

router = APIRouter()

# System prompt is fixed server-side so the endpoint cannot be repurposed
# as a general Gemini proxy (the client-sent systemPrompt is ignored).
SYSTEM_PROMPT = """You are a friendly AI guide in the Korean educational game "히든피스: 우리 반 보물찾기" (Hidden Piece: Our Class Treasure Hunt) about understanding autism spectrum disorder (ASD) for elementary school students (5th grade).
RULES:
- Answer ONLY questions related to: autism, disabilities, inclusion, empathy, understanding differences, and how to help friends with ASD.
- Use simple Korean appropriate for 10-11 year old students.
- Be warm, encouraging, and educational.
- If a student asks unrelated questions, gently redirect: "그건 제 전문 분야가 아니에요. 승주 같은 친구들에 대해 궁금한 건 뭐든 물어보세요!"
- Never use medical jargon. Explain concepts through relatable examples.
- Always emphasize that autism is not a disease, but a different way of experiencing the world.
- Keep responses under 150 words."""

_client = None


def get_client():
    global _client
    if _client is not None:
        return _client
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY is not set.")
        return None
    _client = genai.Client(api_key=api_key)
    return _client


def _friendly_ai_error(e: Exception) -> str:
    """Map raw API errors to safe, student-friendly Korean messages."""
    msg = str(e)
    if "RESOURCE_EXHAUSTED" in msg or "429" in msg:
        return "AI 사용량이 한도에 도달했어요. 선생님께 알려주세요!"
    if "API key" in msg or "PERMISSION_DENIED" in msg or "UNAUTHENTICATED" in msg:
        return "AI 설정에 문제가 있어요. 선생님께 알려주세요!"
    return "AI 연결에 문제가 생겼어요. 잠시 후 다시 시도해 주세요."


@router.post("/chat")
async def chat_with_ai(req: AIChatRequest):
    client = get_client()
    if not client:
        raise HTTPException(status_code=500, detail="AI component not configured on server")

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=req.message,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                max_output_tokens=1024,
                # gemini-3.5-flash defaults to "medium" thinking effort, which is
                # the quality level we want — so we leave thinking_config unset
                # (avoids a hard dependency on a newer SDK's thinking_level field).
            ),
        )
        return {"reply": (response.text or "").strip()}
    except Exception as e:
        # Log full details server-side only; never leak raw API errors
        # (billing info, project ids, stack traces) to students.
        print(f"AI Error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=_friendly_ai_error(e))
