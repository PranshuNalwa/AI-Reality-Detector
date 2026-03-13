import cv2
import numpy as np
import urllib.parse
try:
    from pyzbar.pyzbar import decode
    PYZBAR_AVAILABLE = True
except Exception:
    PYZBAR_AVAILABLE = False

# Initialize once when the module loads
qr_detector = cv2.QRCodeDetector()

def analyze_payment_qr(decoded_text):
    """
    Checks if the decoded text is a payment URI and extracts the details.
    """
    if decoded_text.startswith("upi://pay"):
        # Parse the URI
        parsed = urllib.parse.urlparse(decoded_text)
        query_params = urllib.parse.parse_qs(parsed.query)
        
        # Extract the key financial details
        payee_vpa = query_params.get('pa', ['Unknown VPA'])[0]
        payee_name = query_params.get('pn', ['Unknown Name'])[0]
        amount = query_params.get('am', ['Amount not fixed'])[0]
        
        return {
            "is_payment": True,
            "type": "UPI",
            "payee_name": urllib.parse.unquote(payee_name), # Removes the %20 formatting
            "payee_vpa": payee_vpa,
            "amount": amount,
            "message": "FINANCIAL TRANSACTION DETECTED"
        }
    
    # You can add other payment schemes here later (like crypto wallets: bitcoin://)
    return {"is_payment": False}

def decode_qr_image(file_bytes):
    """
    Takes raw image bytes, converts them to an OpenCV matrix, 
    and returns the decoded QR text (or None if not found).
    """
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image format.")

    # Try pyzbar first for robust decoding (handles logos well) if available
    if PYZBAR_AVAILABLE:
        try:
            decoded_objects = decode(img)
            if decoded_objects:
                return decoded_objects[0].data.decode('utf-8')
        except Exception:
            pass

    # Fallback to OpenCV simple detector
    data, bbox, _ = qr_detector.detectAndDecode(img)
    
    if not data:
        return None
        
    return data