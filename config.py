import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")

    # ── Database ──────────────────────────────────────────────
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///ai_reality_detector.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── File Uploads ──────────────────────────────────────────
    UPLOAD_FOLDER = os.path.join(
        os.path.abspath(os.path.dirname(__file__)), "app", "static", "uploads"
    )
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB

    # ── Sightengine API ───────────────────────────────────────
    SIGHTENGINE_API_USER = os.environ.get("SIGHTENGINE_API_USER", "")
    SIGHTENGINE_API_SECRET = os.environ.get("SIGHTENGINE_API_SECRET", "")
