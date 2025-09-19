from contextlib import asynccontextmanager
import os
import logging

from fastapi import FastAPI

from services.database import create_db_and_tables
from utils.get_env import get_app_data_directory_env
from utils.model_availability import (
    check_llm_and_image_provider_api_or_model_availability,
)

logger = logging.getLogger("decky-backend")


@asynccontextmanager
async def app_lifespan(_: FastAPI):
    """
    Lifespan context manager for FastAPI application.
    Initializes the application data directory and checks LLM model availability.

    """
    logger.info("🚀 Backend server starting up...")
    
    try:
        logger.info("Creating app data directory...")
        os.makedirs(get_app_data_directory_env(), exist_ok=True)
        
        logger.info("Initializing database...")
        await create_db_and_tables()
        
        logger.info("Checking LLM and image provider availability...")
        await check_llm_and_image_provider_api_or_model_availability()
        
        logger.info("✅ Backend server startup completed successfully")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Backend server startup failed: {e}")
        raise
    finally:
        logger.info("🛑 Backend server shutting down...")
