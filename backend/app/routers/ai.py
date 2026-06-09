import os
import traceback
from google import genai
from google.genai import types
from fastapi import APIRouter, HTTPException
from app.models.schemas import AIChatRequest

router = APIRouter()

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
                system_instruction=req.systemPrompt,
                max_output_tokens=1024,
                # gemini-3.5-flash defaults to "medium" thinking effort, which is
                # the quality level we want — so we leave thinking_config unset
                # (avoids a hard dependency on a newer SDK's thinking_level field).
            ),
        )
        return {"reply": (response.text or "").strip()}
    except Exception as e:
        print(f"AI Error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to communicate with AI: {str(e)}")
