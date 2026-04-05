import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import AIChatRequest

router = APIRouter()

def get_genai(system_prompt: str = None):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY is not set.")
        return None
    genai.configure(api_key=api_key)
    # Using the latest Gemini 3 Flash model with system instruction
    return genai.GenerativeModel(
        'gemini-3-flash-preview',
        system_instruction=system_prompt
    )

@router.post("/chat")
async def chat_with_ai(req: AIChatRequest):
    model = get_genai(req.systemPrompt)
    if not model:
        raise HTTPException(status_code=500, detail="AI component not configured on server")

    try:
        response = model.generate_content(
            req.message,
            generation_config=genai.types.GenerationConfig(
                temperature=0.75,
                max_output_tokens=1024,
            )
        )
        return {"reply": response.text.strip()}
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"AI Error: {e}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Failed to communicate with AI: {str(e)}")
