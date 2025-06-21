
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import uvicorn
from rag_module import RAG
import base64
import os

app = FastAPI(title="RAG Service", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG instance
rag = RAG(
    chromadb_path=os.getenv("CHROMADB_PATH", "./chromadb"),
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Request models
class IngestRequest(BaseModel):
    text: str
    user_id: str
    data_type: str
    source: str = "manual"
    content_type: str = "general"

class RetrieveRequest(BaseModel):
    user_id: str
    query: str
    n_results: int = 5

class CheckDataRequest(BaseModel):
    user_id: str

class CaptionRequest(BaseModel):
    image_data: str  # base64 encoded
    content_type: str = "food"

class IngestImageRequest(BaseModel):
    image_data: str  # base64 encoded
    user_id: str
    data_type: str
    source: str = "image"
    content_type: str = "food"

@app.post("/ingest")
async def ingest_text(request: IngestRequest):
    """Ingest text data into the RAG system"""
    try:
        metadata = {
            "user_id": request.user_id,
            "data_type": request.data_type,
            "source": request.source,
            "content_type": request.content_type
        }
        
        doc_id = rag.ingest_text(request.text, metadata)
        return {"success": True, "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest_image")
async def ingest_image(request: IngestImageRequest):
    """Ingest image data into the RAG system"""
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(request.image_data)
        
        metadata = {
            "user_id": request.user_id,
            "data_type": request.data_type,
            "source": request.source,
            "content_type": request.content_type
        }
        
        doc_id = rag.ingest_image(image_bytes, metadata)
        return {"success": True, "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrieve")
async def retrieve_user_data(request: RetrieveRequest):
    """Retrieve user-specific data using similarity search"""
    try:
        results = rag.retrieve_user_data(
            request.user_id, 
            request.query, 
            request.n_results
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/check_data")
async def check_user_data(request: CheckDataRequest):
    """Check if user has existing data in the system"""
    try:
        has_data = rag.check_user_has_data(request.user_id)
        return has_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/caption")
async def caption_image(request: CaptionRequest):
    """Generate caption for image using OpenAI Vision API"""
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(request.image_data)
        caption = rag.caption_image(image_bytes, request.content_type)
        return {"caption": caption}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "rag-service"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
