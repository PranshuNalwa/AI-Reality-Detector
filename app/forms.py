"""
Flask-WTF form for image uploads with validation.
"""

from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import SubmitField


class UploadForm(FlaskForm):
    """Upload form with file-type validation."""

    image = FileField(
        "Upload Image",
        validators=[
            FileRequired(message="Please select an image file."),
            FileAllowed(
                ["jpg", "jpeg", "png"],
                message="Only JPG and PNG images are allowed.",
            ),
        ],
    )
    submit = SubmitField("Analyze Image")
