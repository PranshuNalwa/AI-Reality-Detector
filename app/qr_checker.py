import cv2
import numpy as np

# Initialize once when the module loads
qr_detector = cv2.QRCodeDetector()

def decode_qr_image(file_bytes):
    """
    Takes raw image bytes, converts them to an OpenCV matrix, 
    and returns the decoded QR text (or None if not found).
    """
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image format.")

    data, bbox, _ = qr_detector.detectAndDecode(img)
    
    if not data:
        return None
        
    return data