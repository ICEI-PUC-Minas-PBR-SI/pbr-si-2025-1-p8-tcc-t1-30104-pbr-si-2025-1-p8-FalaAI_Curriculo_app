from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import base64
import os
from dotenv import load_dotenv
import json
import logging


load_dotenv()

app = FastAPI(title="FalaAI Backend", version="1.0.0", description="Backend para processamento de áudio com Gemini")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

@app.get("/")
async def root():
    
    return {
        "message": "FalaAI Backend está funcionando! 🎤🤖",
        "version": "1.0.0",
        "status": "online"
    }

@app.post("/process-audio")
async def process_audio(audio: UploadFile = File(...)):
    
    try:
        logger.info(f"📁 Recebendo arquivo: {audio.filename}, tamanho: {audio.size} bytes")
        
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Chave Gemini não configurada")
        
        
        if audio.size and audio.size > 500000:
            logger.warning(f"⚠️ Arquivo muito grande: {audio.size} bytes")
            return {
                "success": True,
                "data": get_fallback_data(),
                "message": "Arquivo muito grande, usando dados de exemplo",
                "fallback": True
            }
        
        
        audio_content = await audio.read()
        logger.info(f"📊 Áudio lido: {len(audio_content)} bytes")
        
        
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        logger.info("🔄 Áudio convertido para base64")
        
        #
        result = await process_with_gemini(audio_base64)
        
        if result:
            logger.info("✅ Processamento bem-sucedido com Gemini")
            return {"success": True, "data": result}
        else:
            logger.warning("⚠️ Falha no Gemini, usando fallback")
            return {
                "success": True, 
                "data": get_fallback_data(), 
                "message": "Processado com dados de exemplo",
                "fallback": True
            }
            
    except Exception as e:
        logger.error(f"❌ Erro no processamento: {str(e)}")
        return {
            "success": True, 
            "data": get_fallback_data(), 
            "error": str(e),
            "message": "Erro no processamento, usando dados de exemplo"
        }

async def process_with_gemini(audio_base64: str):
    
    try:
        logger.info("🤖 Processando com Gemini...")
        
        
        prompt = """Transcreva e extraia dados para currículo. Retorne JSON:
{
  "nome": "Nome extraído",
  "experiencia": "Experiência resumida",
  "habilidades": "Habilidades principais",
  "formacao": "Formação",
  "resumo": "Resumo profissional",
  "transcricao": "Fala completa"
}"""
        
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "audio/wav",
                                "data": audio_base64
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 500,
                "topP": 0.7,
                "topK": 5
            }
        }
        
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}"
        
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=30
        )
        
        if not response.ok:
            logger.error(f"❌ Erro Gemini: {response.status_code} - {response.text}")
            return None
            
        data = response.json()
        response_text = data["candidates"][0]["content"]["parts"][0]["text"]
        
        logger.info("✅ Resposta Gemini recebida")
        
        
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group())
                logger.info("✅ JSON parseado com sucesso")
                return result
            except json.JSONDecodeError as e:
                logger.error(f"❌ Erro parse JSON: {e}")
                return None
        
        return None
        
    except Exception as e:
        logger.error(f"❌ Erro Gemini: {e}")
        return None

def get_fallback_data():
    
    return {
        "nome": "Usuário do FalaAI",
        "experiencia": "Profissional qualificado com experiência em desenvolvimento de software e tecnologia.",
        "habilidades": "JavaScript, React, Node.js, Python, Banco de dados, Git, HTML, CSS",
        "formacao": "Graduação em área de tecnologia ou correlata",
        "resumo": "Profissional dedicado com foco em desenvolvimento e inovação tecnológica.",
        "transcricao": "Áudio processado via backend FastAPI para demonstração do FalaAI"
    }

@app.get("/health")
async def health_check():
    
    return {
        "status": "healthy",
        "service": "FalaAI Backend",
        "gemini_configured": bool(GEMINI_API_KEY),
        "version": "1.0.0"
    }

@app.get("/stats")
async def get_stats():
    
    return {
        "service": "FalaAI Backend",
        "endpoints": [
            {"path": "/", "method": "GET", "description": "Raiz do serviço"},
            {"path": "/process-audio", "method": "POST", "description": "Processar áudio"},
            {"path": "/health", "method": "GET", "description": "Verificar saúde"},
            {"path": "/stats", "method": "GET", "description": "Estatísticas"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)