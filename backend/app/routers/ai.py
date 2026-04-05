import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import AIChatRequest

router = APIRouter()

def get_genai():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY is not set.")
        return None
    genai.configure(api_key=api_key)
    # Using the latest Gemini 3 Flash model
    return genai.GenerativeModel('gemini-3-flash-preview')

@router.post("/chat")
async def chat_with_ai(req: AIChatRequest):
    model = get_genai()
    if not model:
        raise HTTPException(status_code=500, detail="AI component not configured on server")
    
    try:
        # Construct the conversation with system prompt behavior
        # In Gemini API, system_instruction can be set, but for simplicity in flash/pro depending on version, 
        # injecting it into the first prompt or using standard parameters works best.
        # We will wrap it securely.
        
        full_prompt = f"System Rules:\n{req.systemPrompt}\n\nUser Question: {req.message}\n\nAI Response:"
        
        response = model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=300,
            )
        )
        return {"reply": response.text.strip()}
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"AI Error: {e}\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Failed to communicate with AI: {str(e)}")
