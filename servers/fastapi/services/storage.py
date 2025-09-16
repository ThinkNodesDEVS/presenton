import base64
import io
import os
from typing import Optional

import aiohttp

from utils.get_env import (
    get_gcs_bucket_env,
)

try:
    from google.cloud import storage as gcs
except Exception:  # pragma: no cover - optional at import time; validated at runtime
    gcs = None


class StorageService:
    async def save(self, key: str, content: bytes, content_type: Optional[str] = None) -> str:
        raise NotImplementedError

    async def get_signed_url(self, key: str, expires_in: int = 3600) -> str:
        raise NotImplementedError

    async def delete(self, key: str) -> None:
        raise NotImplementedError


class SupabaseStorage(StorageService):
    def __init__(self):
        raise RuntimeError("Supabase storage has been removed. Use GCS by setting GCS_BUCKET.")


def build_user_key(user_id: str, kind: str, filename: str) -> str:
    # kind: images|uploads|exports|fonts
    return f"users/{user_id}/{kind}/{filename}"


class GCSStorage(StorageService):
    def __init__(self):
        self.bucket_name = get_gcs_bucket_env()
        if not self.bucket_name:
            raise RuntimeError("GCS bucket not configured. Set GCS_BUCKET.")
        if gcs is None:
            raise RuntimeError("google-cloud-storage is not installed")
        # Uses Application Default Credentials on Cloud Run
        self.client = gcs.Client()
        self.bucket = self.client.bucket(self.bucket_name)
        # Prefer explicit signer email via env; otherwise try to fetch from GCS API
        self.signer_email = os.getenv("GCS_SIGNING_SERVICE_ACCOUNT")
        if not self.signer_email:
            try:
                # May return a project-level service account for GCS; useful for IAM signing
                self.signer_email = self.client.get_service_account_email()
            except Exception:
                self.signer_email = None

    async def save(self, key: str, content: bytes, content_type: Optional[str] = None) -> str:
        blob = self.bucket.blob(key)
        # Upload from memory
        blob.upload_from_string(content, content_type=content_type or "application/octet-stream")
        return key

    async def get_signed_url(self, key: str, expires_in: int = 3600) -> str:
        blob = self.bucket.blob(key)
        try:
            return blob.generate_signed_url(
                version="v4",
                expiration=expires_in,
                method="GET",
            )
        except AttributeError:
            # Fallback for ADC without private key: use IAM signing if possible
            if not self.signer_email:
                raise
            return blob.generate_signed_url(
                version="v4",
                expiration=expires_in,
                method="GET",
                service_account_email=self.signer_email,
            )

    async def delete(self, key: str) -> None:
        blob = self.bucket.blob(key)
        blob.delete()


def get_storage() -> StorageService:
    """Return the active storage backend.

    Precedence: if GCS_BUCKET is set, use GCS; otherwise fall back to Supabase
    (which requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET).
    """
    if get_gcs_bucket_env():
        return GCSStorage()
    return SupabaseStorage()

