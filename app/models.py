"""
Database models for the AI Reality Distortion Detector.
"""

from datetime import datetime
from app import db


class Scan(db.Model):
    """Represents a single image scan and its analysis results."""

    __tablename__ = "scans"

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)
    manipulation_score = db.Column(db.Integer, default=0)  # 0–100
    result_json = db.Column(db.JSON, nullable=True)       # Full API response
    metadata_json = db.Column(db.JSON, nullable=True)      # EXIF metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Scan {self.id} — {self.filename} (score={self.manipulation_score})>"
