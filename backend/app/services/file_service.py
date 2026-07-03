import os
import uuid

import aiofiles
from fastapi import HTTPException, UploadFile

from app.core.config import get_settings

settings = get_settings()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


class FileService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.max_file_size = settings.MAX_FILE_SIZE

    async def upload_file(self, file: UploadFile, folder: str = "general") -> str:
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")

        content = await file.read()
        if len(content) > self.max_file_size:
            raise HTTPException(status_code=400, detail="File too large")

        filename = f"{uuid.uuid4().hex}{ext}"
        dir_path = os.path.join(self.upload_dir, folder)
        os.makedirs(dir_path, exist_ok=True)

        file_path = os.path.join(dir_path, filename)
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

        return f"/{self.upload_dir}/{folder}/{filename}"

    @staticmethod
    def delete_file(file_path: str) -> None:
        if file_path and os.path.exists(file_path.lstrip("/")):
            os.remove(file_path.lstrip("/"))
