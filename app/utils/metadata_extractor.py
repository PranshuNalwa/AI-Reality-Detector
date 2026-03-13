"""
EXIF metadata extraction using Pillow.
"""

from PIL import Image
from PIL.ExifTags import TAGS


def extract_metadata(image_path: str) -> dict:
    """
    Open an image and extract human-readable EXIF metadata.
    Returns a dictionary of tag_name → value pairs.
    Returns an empty dict if no EXIF data is present.
    """
    metadata = {}

    try:
        img = Image.open(image_path)
        exif_data = img._getexif()

        if exif_data is None:
            return metadata

        for tag_id, value in exif_data.items():
            tag_name = TAGS.get(tag_id, f"Unknown-{tag_id}")

            # Convert bytes to string for JSON serialisation
            if isinstance(value, bytes):
                try:
                    value = value.decode("utf-8", errors="replace")
                except Exception:
                    value = str(value)

            # Keep only common, useful tags
            if tag_name in {
                "Make",
                "Model",
                "DateTime",
                "DateTimeOriginal",
                "Software",
                "ImageWidth",
                "ImageLength",
                "ExifImageWidth",
                "ExifImageHeight",
                "Orientation",
                "XResolution",
                "YResolution",
                "ISOSpeedRatings",
                "ExposureTime",
                "FNumber",
                "FocalLength",
                "LensModel",
                "GPSInfo",
                "Artist",
                "Copyright",
            }:
                metadata[tag_name] = str(value)

    except Exception:
        # Image has no EXIF or could not be read — return empty dict
        pass

    return metadata
