"""
AI Reality Distortion Detector — Flask Application Package.

This module creates and configures the Flask application instance,
initializes extensions (SQLAlchemy), and registers routes.
"""

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Initialize extensions (created here so models can import db)
db = SQLAlchemy()

# Create Flask app at module level so routes.py can import it directly
app = Flask(__name__)
app.config.from_object("config.Config")

# Ensure the upload directory exists
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Initialize extensions with the app
db.init_app(app)

# Create database tables and import routes inside the app context
with app.app_context():
    from app import routes  # noqa: F401
    db.create_all()
