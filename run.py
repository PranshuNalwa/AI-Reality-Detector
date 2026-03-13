"""
Entry point for the AI Reality Distortion Detector application.
Run with: python run.py
"""
import os

# Fix for PyZbar on Apple Silicon Macs
if os.path.exists('/opt/homebrew/lib'):
    os.environ['DYLD_LIBRARY_PATH'] = '/opt/homebrew/lib:' + os.environ.get('DYLD_LIBRARY_PATH', '')

from app import app

if __name__ == "__main__":
    app.run(port=8000,debug=True)
