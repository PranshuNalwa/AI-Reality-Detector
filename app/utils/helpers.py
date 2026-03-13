"""
Helper utilities for file handling.
"""

import os
import uuid
from werkzeug.utils import secure_filename

# Allowed image extensions
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}


def allowed_file(filename: str) -> bool:
    """Return True if the filename has an allowed image extension."""
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def save_upload(file, upload_folder: str) -> str:
    """
    Save an uploaded file to *upload_folder* with a unique, secure name.
    Returns the full path to the saved file.
    """
    original = secure_filename(file.filename)
    # Prepend a UUID to avoid name collisions
    unique_name = f"{uuid.uuid4().hex}_{original}"
    path = os.path.join(upload_folder, unique_name)
    file.save(path)
    return path


def delete_file(path: str) -> None:
    """Remove a file from disk if it exists (cleanup after analysis)."""
    try:
        if os.path.isfile(path):
            os.remove(path)
    except OSError:
        pass  # Silently ignore deletion errors
