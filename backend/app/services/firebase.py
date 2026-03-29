import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

def init_firebase():
    if not firebase_admin._apps:
        creds_json = os.getenv("FIREBASE_CREDENTIALS")
        if creds_json:
            try:
                creds_dict = json.loads(creds_json)
                cred = credentials.Certificate(creds_dict)
                firebase_admin.initialize_app(cred)
            except Exception as e:
                print(f"Failed to initialize Firebase with custom JSON: {e}")
        else:
            try:
                # Try default credentials (fallback for local dev if ADC is set)
                firebase_admin.initialize_app()
            except ValueError:
                pass

init_firebase()

def get_db():
    try:
        return firestore.client()
    except Exception as e:
        print(f"Firestore not initialized: {e}")
        return None
