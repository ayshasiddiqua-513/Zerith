from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from .database import Base


class PdfReport(Base):
    __tablename__ = "pdf_reports"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(128), index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    url = Column(Text, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


