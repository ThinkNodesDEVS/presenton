import base64
import io
import os
from typing import Optional

import aiohttp

from utils.get_env import (
    get_supabase_bucket_env,
    get_supabase_service_role_key_env,
    get_supabase_url_env,
)


class StorageService:
    async def save(self, key: str, content: bytes, content_type: Optional[str] = None) -> str:
        raise NotImplementedError

    async def get_signed_url(self, key: str, expires_in: int = 3600) -> str:
        raise NotImplementedError

    async def delete(self, key: str) -> None:
        raise NotImplementedError


class SupabaseStorage(StorageService):
    def __init__(self):
        self.base_url = get_supabase_url_env()
        self.bucket = get_supabase_bucket_env()
        self.service_key = get_supabase_service_role_key_env()
        if not self.base_url or not self.bucket or not self.service_key:
            raise RuntimeError("Supabase storage is not configured properly")

    def _headers(self, content_type: Optional[str] = None) -> dict:
        headers = {
            "Authorization": f"Bearer {self.service_key}",
            "apikey": self.service_key,
        }
        if content_type:
            headers["Content-Type"] = content_type
        return headers

    async def save(self, key: str, content: bytes, content_type: Optional[str] = None) -> str:
        # Upload using Supabase Storage REST API
        url = f"{self.base_url}/storage/v1/object/{self.bucket}/{key}"
        async with aiohttp.ClientSession(trust_env=True) as session:
            async with session.put(url, data=content, headers=self._headers(content_type)) as resp:
                if resp.status not in (200, 201):
                    text = await resp.text()
                    raise RuntimeError(f"Supabase upload failed ({resp.status}): {text}")
        # Return a public path (not necessarily public). Consumers should request a signed URL.
        return key

    async def get_signed_url(self, key: str, expires_in: int = 3600) -> str:
        # Create a signed URL for private bucket
        # Supabase REST: POST /object/sign/{bucket}
        sign_url = f"{self.base_url}/storage/v1/object/sign/{self.bucket}"
        payload = {"expiresIn": expires_in, "paths": [key]}
        async with aiohttp.ClientSession(trust_env=True) as session:
            async with session.post(sign_url, json=payload, headers=self._headers()) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise RuntimeError(f"Supabase sign failed ({resp.status}): {text}")
                data = await resp.json()
                # data is a list of { signedUrl, path }
                if not data or not data[0].get("signedURL") and not data[0].get("signedUrl"):
                    raise RuntimeError("Supabase sign returned invalid response")
                # API may return signedURL or signedUrl casing depending on version
                signed = data[0].get("signedURL") or data[0].get("signedUrl")
                return f"{self.base_url}/storage/v1/object/sign/{self.bucket}/{signed}"

    async def delete(self, key: str) -> None:
        # Delete object
        url = f"{self.base_url}/storage/v1/object/{self.bucket}/{key}"
        async with aiohttp.ClientSession(trust_env=True) as session:
            async with session.delete(url, headers=self._headers()) as resp:
                if resp.status not in (200, 204):
                    text = await resp.text()
                    raise RuntimeError(f"Supabase delete failed ({resp.status}): {text}")


def build_user_key(user_id: str, kind: str, filename: str) -> str:
    # kind: images|uploads|exports|fonts
    return f"users/{user_id}/{kind}/{filename}"


