from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from typing import List
import shutil
import os
import uuid
from datetime import datetime
from api.database import get_db_connection
from pydantic import BaseModel

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

class DocumentResponse(BaseModel):
    id: int
    filename: str
    filepath: str
    filesize: int
    created_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # Validate PDF
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
        
    file_size = os.path.getsize(file_path)
    
    # Save to DB
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO documents (filename, filepath, filesize) VALUES (%s, %s, %s) RETURNING id, created_at",
                (file.filename, unique_filename, file_size)
            )
            result = cur.fetchone()
            conn.commit()
            
            return {
                "id": result["id"],
                "filename": file.filename,
                "filepath": unique_filename,
                "filesize": file_size,
                "created_at": result["created_at"]
            }
    except Exception as e:
        # Cleanup file if DB insert fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("")
def get_documents():
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM documents ORDER BY created_at DESC")
            documents = cur.fetchall()
            return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/{id}")
def get_document(id: int):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM documents WHERE id = %s", (id,))
            document = cur.fetchone()
            
            if not document:
                raise HTTPException(status_code=404, detail="Document not found")
                
            return document
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/{id}")
def delete_document(id: int):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            
            # Get file path first
            cur.execute("SELECT filepath FROM documents WHERE id = %s", (id,))
            result = cur.fetchone()
            
            if not result:
                raise HTTPException(status_code=404, detail="Document not found")
            
            filename = result["filepath"]
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Delete from DB
            cur.execute("DELETE FROM documents WHERE id = %s", (id,))
            conn.commit()
            
            # Delete file
            if os.path.exists(file_path):
                os.remove(file_path)
                
            return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

@router.get("/download/{id}")
def download_document(id: int):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM documents WHERE id = %s", (id,))
            document = cur.fetchone()
            
            if not document:
                raise HTTPException(status_code=404, detail="Document not found")
            
            file_path = os.path.join(UPLOAD_DIR, document["filepath"])
            
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="File not found on server")
                
            return FileResponse(
                path=file_path,
                filename=document["filename"],
                media_type="application/pdf"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading document: {str(e)}")
