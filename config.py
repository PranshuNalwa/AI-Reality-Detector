"""
Application configuration.
Loads sensitive values from .env via python-dotenv.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class."""

    # Flask secret key for session management and CSRF protection
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")

    # SQLAlchemy settings
    # Use DATABASE_URL for Postgres (Vercel/Heroku/Railway), fallback to local SQLite
    _db_url = os.getenv("DATABASE_URL", "sqlite:///site.db")
    # Fix for SQLAlchemy 1.4+ which requires 'postgresql://' instead of 'postgres://'
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Sightengine API credentials
    SIGHTENGINE_API_USER = os.getenv("SIGHTENGINE_API_USER", "")
    SIGHTENGINE_API_SECRET = os.getenv("SIGHTENGINE_API_SECRET", "")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    FACT_CHECK_API_KEY = os.getenv("FACT_CHECK_API_KEY", "")
    SAPLING_API_KEY = os.getenv("SAPLING_API_KEY", "")

    # File upload settings
    # Vercel serverless only allows writing to /tmp
    if os.getenv("VERCEL"):
        UPLOAD_FOLDER = "/tmp"
    else:
        UPLOAD_FOLDER = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "app", "static", "uploads"
        )
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
