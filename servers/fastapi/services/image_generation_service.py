import asyncio
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

    async def generate_image_google(self, prompt: str, output_directory: str) -> str:
        client = genai.Client()
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash-image-preview",
            contents=[prompt],
            config=GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
        )

        # Extract image from response
        for part in response.candidates[0].content.parts:
            if hasattr(part, 'inline_data') and part.inline_data and part.inline_data.data:
                content = part.inline_data.data
                filename = f"{get_random_uuid()}.jpg"
                storage = get_storage()
                key = build_user_key(self.user_id, "images", filename)
                await storage.save(key, content, content_type="image/jpeg")
                return key  # Return storage key
        
        return "/static/images/placeholder.jpg"

    # async def generate_image_google(self, prompt: str, output_directory: str) -> str:
    #     try:
    #         client = genai.Client()
    #         response = await asyncio.to_thread(
    #             client.models.generate_content,
    #             model="gemini-2.5-flash-image-preview",
    #             contents=[prompt],
    #             config=GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
    #         )

    #         # Debug: Log the full response structure
    #         print(f"DEBUG: Gemini response received for prompt: {prompt[:50]}...")
    #         print(f"DEBUG: Response type: {type(response)}")
            
    #         # Check if response has candidates
    #         if not hasattr(response, 'candidates') or not response.candidates:
    #             print(f"ERROR: No candidates in response. Response attributes: {dir(response)}")
    #             return "/static/images/placeholder.jpg"
            
    #         print(f"DEBUG: Number of candidates: {len(response.candidates)}")
            
    #         # Check first candidate
    #         candidate = response.candidates[0]
    #         print(f"DEBUG: Candidate type: {type(candidate)}")
    #         print(f"DEBUG: Candidate attributes: {dir(candidate)}")
            
    #         if not hasattr(candidate, 'content') or not candidate.content:
    #             print(f"ERROR: No content in candidate. Candidate: {candidate}")
    #             return "/static/images/placeholder.jpg"
            
    #         # Check content parts
    #         content = candidate.content
    #         print(f"DEBUG: Content type: {type(content)}")
    #         print(f"DEBUG: Content attributes: {dir(content)}")
            
    #         if not hasattr(content, 'parts') or not content.parts:
    #             print(f"ERROR: No parts in content. Content: {content}")
    #             return "/static/images/placeholder.jpg"
            
    #         print(f"DEBUG: Number of parts: {len(content.parts)}")
            
    #         image_path = None
    #         for i, part in enumerate(content.parts):
    #             print(f"DEBUG: Part {i} type: {type(part)}")
    #             print(f"DEBUG: Part {i} attributes: {dir(part)}")
                
    #             if hasattr(part, 'text') and part.text is not None:
    #                 print(f"DEBUG: Part {i} has text: {part.text[:100]}...")
    #             elif hasattr(part, 'inline_data') and part.inline_data is not None:
    #                 print(f"DEBUG: Part {i} has inline_data")
    #                 print(f"DEBUG: Inline data type: {type(part.inline_data)}")
    #                 print(f"DEBUG: Inline data attributes: {dir(part.inline_data)}")
                    
    #                 if hasattr(part.inline_data, 'data') and part.inline_data.data:
    #                     print(f"DEBUG: Found image data, size: {len(part.inline_data.data)} bytes")
    #                     content = part.inline_data.data
    #                     filename = f"{get_random_uuid()}.jpg"
    #                     storage = get_storage()
    #                     key = build_user_key(self.user_id, "images", filename)
    #                     await storage.save(key, content, content_type="image/jpeg")
    #                     image_path = key
    #                     print(f"DEBUG: Successfully saved image as: {key}")
    #                 else:
    #                     print(f"ERROR: Part {i} inline_data has no data attribute or data is empty")
    #             else:
    #                 print(f"DEBUG: Part {i} has neither text nor inline_data")
    #                 print(f"DEBUG: Part {i} content: {part}")

    #         if not image_path:
    #             print(f"ERROR: No image found in any part. Total parts processed: {len(content.parts)}")
            
    #         if image_path:
    #             return ImageAsset(
    #                 path=image_path,
    #                 extras={
    #                     "prompt": prompt,
    #                     "theme_prompt": "",  # or pass the original theme if available
    #                 },
    #             )
    #         return "/static/images/placeholder.jpg"
            
    #     except Exception as e:
    #         print(f"ERROR: Exception in generate_image_google: {type(e).__name__}: {str(e)}")
    #         print(f"ERROR: Prompt was: {prompt}")
    #         import traceback
    #         print(f"ERROR: Traceback: {traceback.format_exc()}")
    #         return "/static/images/placeholder.jpg"

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
