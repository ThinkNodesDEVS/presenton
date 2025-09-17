import asyncio
import time
import logging
import os
import aiohttp
from google import genai
from google.genai.types import GenerateContentConfig
from openai import AsyncOpenAI
from models.image_prompt import ImagePrompt
from models.sql.image_asset import ImageAsset
from utils.download_helpers import download_file
from services.storage import get_storage, build_user_key
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
from typing import Optional


class ImageGenerationService:

    _GEMINI_SEMAPHORE = asyncio.Semaphore(2)  # Limit concurrent requests
    _LAST_REQUEST_TIME = 0
    _MIN_REQUEST_INTERVAL = 0.5  # 500ms between requests

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
                # Providers generating binary (OpenAI/Gemini): get storage key or URL
                result = await self.image_gen_func(image_prompt, self.output_directory)
                
                # Handle different return types from providers
                if isinstance(result, ImageAsset):
                    return result
                elif isinstance(result, str):
                    if result.startswith("http"):
                        # Direct URL
                        return result
                    elif result.startswith("/static/"):
                        # Placeholder
                        return result
                    else:
                        # Storage key - wrap in ImageAsset
                        return ImageAsset(
                            path=result,
                            extras={
                                "prompt": prompt.prompt,
                                "theme_prompt": prompt.theme_prompt,
                            },
                        )
                else:
                    # Unexpected return type
                    return "/static/images/placeholder.jpg"

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
        storage = get_storage()
        key = build_user_key(self.user_id, "images", filename)
        await storage.save(key, content, content_type="image/jpeg")
        # Return storage key (re-sign when serving)
        return key

    # async def generate_image_google(self, prompt: str, output_directory: str) -> str:
    #     client = genai.Client()
    #     response = await asyncio.to_thread(
    #         client.models.generate_content,
    #         model="gemini-2.5-flash-image-preview",
    #         contents=[prompt],
    #         config=GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
    #     )

    #     # Extract image from response
    #     for part in response.candidates[0].content.parts:
    #         if hasattr(part, 'inline_data') and part.inline_data and part.inline_data.data:
    #             content = part.inline_data.data
    #             filename = f"{get_random_uuid()}.jpg"
    #             storage = get_storage()
    #             key = build_user_key(self.user_id, "images", filename)
    #             await storage.save(key, content, content_type="image/jpeg")
    #             return key  # Return storage key
        
    #     return "/static/images/placeholder.jpg"


    async def generate_image_google(self, prompt: str, output_directory: str) -> str:
        """
        Generate image with Google Gemini, includes retries and rate limiting.
        Falls back to OpenAI if all retries fail.
        """
        MAX_RETRIES = 3
        BASE_DELAY = 1.0  # Start with 1 second
        MAX_DELAY = 16.0  # Cap at 16 seconds
        
        # Transient errors that should be retried
        RETRYABLE_ERRORS = {
            503,  # Service Unavailable / Model Overloaded
            429,  # Too Many Requests
            502,  # Bad Gateway
            504,  # Gateway Timeout
        }
        
        RETRYABLE_MESSAGES = {
            "overloaded",
            "unavailable", 
            "try again later",
            "rate limit",
            "temporarily",
        }
        
        async with _GEMINI_SEMAPHORE:  # Limit concurrent requests
            # Rate limiting: ensure minimum time between requests
            global _LAST_REQUEST_TIME
            now = time.time()
            time_since_last = now - _LAST_REQUEST_TIME
            if time_since_last < _MIN_REQUEST_INTERVAL:
                await asyncio.sleep(_MIN_REQUEST_INTERVAL - time_since_last)
            _LAST_REQUEST_TIME = time.time()
            
            # Retry loop with exponential backoff
            for attempt in range(MAX_RETRIES):
                try:
                    print(f"DEBUG: Google image generation attempt {attempt + 1}/{MAX_RETRIES}")
                    
                    client = genai.Client()
                    response = await asyncio.wait_for(
                        asyncio.to_thread(
                            client.models.generate_content,
                            model="gemini-2.5-flash-image-preview", 
                            contents=[prompt],
                            config=GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
                        ),
                        timeout=45.0  # 45 second timeout
                    )
                    
                    # Extract image from response
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data and part.inline_data.data:
                            content = part.inline_data.data
                            filename = f"{get_random_uuid()}.jpg"
                            storage = get_storage()
                            key = build_user_key(self.user_id, "images", filename)
                            await storage.save(key, content, content_type="image/jpeg")
                            print(f"DEBUG: Google image generation succeeded on attempt {attempt + 1}")
                            return key
                    
                    # No image found in response - don't retry this
                    print("WARNING: Google returned response but no image data")
                    break
                    
                except asyncio.TimeoutError:
                    error_msg = f"Google image generation timed out (attempt {attempt + 1})"
                    print(f"ERROR: {error_msg}")
                    last_error = error_msg
                    
                except Exception as e:
                    error_msg = str(e).lower()
                    
                    # Check if it's a retryable error
                    is_retryable = False
                    
                    # Check for specific error codes (503, 429, etc.)
                    if hasattr(e, 'status_code') and e.status_code in RETRYABLE_ERRORS:
                        is_retryable = True
                    elif any(msg in error_msg for msg in RETRYABLE_MESSAGES):
                        is_retryable = True
                    elif "503" in error_msg or "429" in error_msg:
                        is_retryable = True
                    
                    last_error = f"Attempt {attempt + 1}: {str(e)}"
                    print(f"ERROR: {last_error}")
                    
                    # Don't retry on non-transient errors
                    if not is_retryable:
                        print(f"ERROR: Non-retryable error, aborting: {error_msg}")
                        break
                
                # Calculate exponential backoff delay (only if we're going to retry)
                if attempt < MAX_RETRIES - 1:
                    delay = min(BASE_DELAY * (2 ** attempt), MAX_DELAY)
                    # Add jitter to prevent thundering herd
                    jitter = delay * 0.1 * (0.5 + 0.5 * hash(prompt) % 100 / 100)
                    total_delay = delay + jitter
                    
                    print(f"WARNING: Retrying Google image generation in {total_delay:.1f}s...")
                    await asyncio.sleep(total_delay)
            
            # All Google attempts failed - fallback to OpenAI
            print(f"ERROR: Google image generation failed after {MAX_RETRIES} attempts. Falling back to OpenAI...")
            return await self._fallback_to_openai(prompt, output_directory)

    async def _fallback_to_openai(self, prompt: str, output_directory: str) -> str:
        """
        Fallback to OpenAI DALL-E 3 when Google fails.
        """
        try:
            print("INFO: Attempting OpenAI DALL-E 3 fallback...")
            
            # Check if OpenAI is configured
            if not os.getenv("OPENAI_API_KEY"):
                print("ERROR: OpenAI fallback failed - no API key configured")
                return "/static/images/placeholder.jpg"
            
            # Use existing OpenAI method
            result = await self.generate_image_openai(prompt, output_directory)
            print("INFO: OpenAI fallback succeeded")
            return result
            
        except Exception as e:
            print(f"ERROR: OpenAI fallback also failed: {str(e)}")
            return "/static/images/placeholder.jpg"


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
