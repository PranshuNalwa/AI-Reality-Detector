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
    SQLALCHEMY_DATABASE_URI = "sqlite:///site.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Sightengine API credentials
    SIGHTENGINE_API_USER = os.getenv("SIGHTENGINE_API_USER", "")
    SIGHTENGINE_API_SECRET = os.getenv("SIGHTENGINE_API_SECRET", "")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    FACT_CHECK_API_KEY = os.getenv("FACT_CHECK_API_KEY", "")
    SAPLING_API_KEY = os.getenv("SAPLING_API_KEY", "")

    # File upload settings
    UPLOAD_FOLDER = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "app", "static", "uploads"
    )
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
