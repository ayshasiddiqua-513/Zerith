import os
from typing import Optional
from dotenv import load_dotenv

# Optional Firebase Admin initialization. If credentials are not provided, the
# backend will fall back to local storage for PDFs.

load_dotenv()

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
FIREBASE_CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL")
FIREBASE_PRIVATE_KEY = os.getenv("FIREBASE_PRIVATE_KEY")
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET")

firebase_available = False
try:
    import firebase_admin
    from firebase_admin import credentials, auth, storage
    if FIREBASE_PROJECT_ID and FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY and FIREBASE_STORAGE_BUCKET:
        # Fix escaped newlines in private key if coming from env
        private_key = FIREBASE_PRIVATE_KEY.replace("\\n", "\n")
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": FIREBASE_PROJECT_ID,
            "private_key_id": "placeholder",
            "private_key": private_key,
            "client_email": FIREBASE_CLIENT_EMAIL,
            "client_id": "placeholder",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{FIREBASE_CLIENT_EMAIL}",
        })
        firebase_admin.initialize_app(cred, {"storageBucket": FIREBASE_STORAGE_BUCKET})
        firebase_available = True
except Exception:
    firebase_available = False


def verify_id_token(id_token: str) -> Optional[str]:
    """Verify Firebase ID token and return uid, or None if unavailable/invalid."""
    if not firebase_available:
        return None
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded.get("uid")
    except Exception:
        return None


def upload_bytes_to_firebase(path: str, data: bytes) -> Optional[str]:
    if not firebase_available:
        return None
    try:
        bucket = storage.bucket()
        blob = bucket.blob(path)
        blob.upload_from_string(data, content_type="application/pdf")
        blob.make_public()
        return blob.public_url
    except Exception:
        return None


