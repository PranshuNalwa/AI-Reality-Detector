"""
Entry point for the AI Reality Distortion Detector application.
Run with: python run.py
"""
import os

# Fix for PyZbar on Windows (Python 3.8+)
if os.name == 'nt':
    import site
    for path in site.getsitepackages():
        pyzbar_path = os.path.join(path, 'pyzbar')
        if os.path.isdir(pyzbar_path):
            os.add_dll_directory(pyzbar_path)

from app import app

if __name__ == "__main__":
    app.run(port=8000,debug=True)
