# AI Reality Distortion Detector

A Flask web application that analyzes images to detect AI-generated content, deepfakes, and digital manipulations using the **Sightengine API**, with **Pillow** for EXIF metadata extraction and **SQLAlchemy** for persistence.

## Features

- **AI & Deepfake Detection** — Upload an image and get a 0–100 manipulation confidence score
- **EXIF Metadata Extraction** — View camera, software, and date information embedded in the image
- **Drag-and-Drop Upload** — Modern upload interface with instant file preview
- **Scan History** — Browse all past analyses with color-coded score badges
- **Share Results** — Copy result links to your clipboard with one click

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | Python 3, Flask, SQLAlchemy         |
| Frontend    | Jinja2, HTML5, CSS3, Vanilla JS     |
| Detection   | Sightengine API (`genai`, `deepfake`) |
| Metadata    | Pillow (EXIF)                       |
| Database    | SQLite                              |

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AI-Reality-Detector.git
cd AI-Reality-Detector
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate   # macOS / Linux
venv\Scripts\activate      # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Edit `.env` with your credentials:

```
SECRET_KEY=your-random-secret-key
SIGHTENGINE_API_USER=your-api-user
SIGHTENGINE_API_SECRET=your-api-secret
```

> Sign up for a free API key at [sightengine.com](https://sightengine.com).

### 5. Run the application

```bash
python run.py
```

Visit **http://127.0.0.1:5000** in your browser.

## Project Structure

```
AI-Reality-Detector/
├── app/
│   ├── __init__.py              # Flask app factory + DB init
│   ├── models.py                # Scan model
│   ├── routes.py                # All route handlers
│   ├── forms.py                 # Upload form (Flask-WTF)
│   ├── utils/
│   │   ├── helpers.py           # File upload utilities
│   │   ├── metadata_extractor.py # EXIF extraction
│   │   └── image_analysis.py    # Sightengine integration
│   ├── templates/               # Jinja2 HTML templates
│   └── static/                  # CSS, JS, uploads
├── config.py                    # App configuration
├── run.py                       # Entry point
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables (not committed)
└── .gitignore
```

## License

MIT
