import asyncio
import os
import aiohttp
from google import genai
from google.genai.types import GenerateContentConfig
from openai import AsyncOpenAI
from models.image_prompt import ImagePrompt
from models.sql.image_asset import ImageAsset
from utils.download_helpers import download_file
from services.storage import SupabaseStorage, build_user_key
from services import TEMP_FILE_SERVICE
from utils.get_env import get_pexels_api_key_env
from utils.get_env import get_pixabay_api_key_env
from utils.image_provider import (
    is_pixels_selected,
    is_pixabay_selected,
    is_gemini_flash_selected,
    is_dalle3_selected,
)
from utils.randomizers import get_random_uuid


class ImageGenerationService:

    def __init__(self, output_directory: str, user_id: str = "public"):
        self.output_directory = output_directory
        self.user_id = user_id
        self.image_gen_func = self.get_image_gen_func()

    def get_image_gen_func(self):
        if is_pixabay_selected():
            return self.get_image_from_pixabay
        elif is_pixels_selected():
            return self.get_image_from_pexels
        elif is_gemini_flash_selected():
            return self.generate_image_google
        elif is_dalle3_selected():
            return self.generate_image_openai
        return None

    def is_stock_provider_selected(self):
        return is_pixels_selected() or is_pixabay_selected()

    async def generate_image(self, prompt: ImagePrompt) -> str | ImageAsset:
        """
        Generates an image based on the provided prompt.
        - If no image generation function is available, returns a placeholder image.
        - If the stock provider is selected, it uses the prompt directly,
        otherwise it uses the full image prompt with theme.
        - Output Directory is used for saving the generated image not the stock provider.
        """
        if not self.image_gen_func:
            print("No image generation function found. Using placeholder image.")
            return "/static/images/placeholder.jpg"

        image_prompt = prompt.get_image_prompt(
            with_theme=not self.is_stock_provider_selected()
        )
        print(f"Request - Generating Image for {image_prompt}")

        try:
            if self.is_stock_provider_selected():
                # Stock provider returns URL; proxy unchanged
                image_url = await self.image_gen_func(image_prompt)
                return image_url
            else:
                # Providers generating binary (OpenAI/Gemini): upload to Supabase and return signed URL
                image_url_or_key = await self.image_gen_func(image_prompt, self.output_directory)
                # For compatibility if the provider still writes to disk, upload from disk
                if image_url_or_key and os.path.exists(str(image_url_or_key)):
                    with open(str(image_url_or_key), "rb") as f:
                        content = f.read()
                    filename = os.path.basename(str(image_url_or_key))
                    storage = SupabaseStorage()
                    key = build_user_key(self.user_id, "images", filename)
                    await storage.save(key, content, content_type="image/jpeg")
                    signed_url = await storage.get_signed_url(key, expires_in=3600)
                    return ImageAsset(
                        path=signed_url,
                        extras={
                            "prompt": prompt.prompt,
                            "theme_prompt": prompt.theme_prompt,
                        },
                    )
                # If provider returned already a URL, pass through
                if isinstance(image_url_or_key, str) and image_url_or_key.startswith("http"):
                    return image_url_or_key
            raise Exception(f"Image not found at {image_path}")

        except Exception as e:
            print(f"Error generating image: {e}")
            return "/static/images/placeholder.jpg"

    async def generate_image_openai(self, prompt: str, output_directory: str) -> str:
        client = AsyncOpenAI()
        result = await client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            quality="standard",
            size="1024x1024",
        )
        image_url = result.data[0].url
        # Download into memory and upload to Supabase
        async with aiohttp.ClientSession(trust_env=True) as session:
            async with session.get(image_url) as resp:
                if resp.status != 200:
                    raise Exception(f"Failed to fetch generated image: {resp.status}")
                content = await resp.read()
        filename = f"{get_random_uuid()}.jpg"
        storage = SupabaseStorage()
        key = build_user_key(self.user_id, "images", filename)
        await storage.save(key, content, content_type="image/jpeg")
        signed_url = await storage.get_signed_url(key, expires_in=3600)
        return signed_url

    async def generate_image_google(self, prompt: str, output_directory: str) -> str:
        client = genai.Client()
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.0-flash-preview-image-generation",
            contents=[prompt],
            config=GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
        )

        image_path = None
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                print(part.text)
            elif part.inline_data is not None:
                content = part.inline_data.data
                filename = f"{get_random_uuid()}.jpg"
                storage = SupabaseStorage()
                key = build_user_key(self.user_id, "images", filename)
                await storage.save(key, content, content_type="image/jpeg")
                signed_url = await storage.get_signed_url(key, expires_in=3600)
                image_path = signed_url

        return image_path or "/static/images/placeholder.jpg"

    async def get_image_from_pexels(self, prompt: str) -> str:
        async with aiohttp.ClientSession(trust_env=True) as session:
            response = await session.get(
                f"https://api.pexels.com/v1/search?query={prompt}&per_page=1",
                headers={"Authorization": f"{get_pexels_api_key_env()}"},
            )
            data = await response.json()
            image_url = data["photos"][0]["src"]["large"]
            return image_url

    async def get_image_from_pixabay(self, prompt: str) -> str:
        async with aiohttp.ClientSession(trust_env=True) as session:
            response = await session.get(
                f"https://pixabay.com/api/?key={get_pixabay_api_key_env()}&q={prompt}&image_type=photo&per_page=3"
            )
            data = await response.json()
            image_url = data["hits"][0]["largeImageURL"]
            return image_url
