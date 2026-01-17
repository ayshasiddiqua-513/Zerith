import os
from pathlib import Path
from typing import Dict
from fastapi import UploadFile
from sqlalchemy.orm import Session
from .models import PdfReport
from .schemas import PdfReportOut


LOCAL_STORAGE_DIR = Path(__file__).resolve().parents[1] / "storage"
LOCAL_STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def store_pdf_and_metadata(uid: str, file: UploadFile, session: Session) -> PdfReportOut:
    # In real deployment: if Firebase configured, upload to Firebase Storage.
    # Fallback: local storage
    dest = LOCAL_STORAGE_DIR / file.filename
    content = file.file.read()
    with open(dest, "wb") as f:
        f.write(content)

    report = PdfReport(
        uid=uid,
        filename=file.filename,
        url=str(dest.resolve()),
        size_bytes=len(content),
    )
    session.add(report)
    session.commit()
    session.refresh(report)
    return PdfReportOut.from_orm(report)


