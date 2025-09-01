from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from api.lifespan import app_lifespan
from api.middlewares import UserConfigEnvUpdateMiddleware
from api.v1.ppt.router import API_V1_PPT_ROUTER
from jose import jwt
import aiohttp
from functools import lru_cache
import time
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("presenton-backend")


CLERK_ISSUER = os.getenv("CLERK_ISSUER")
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")
CLERK_AUDIENCE = os.getenv("CLERK_AUDIENCE", "decky-api")


@lru_cache(maxsize=1)
def _jwks_cache():
    return {"keys": None, "fetched_at": 0}


async def _get_jwks():
    cache = _jwks_cache()
    now = int(time.time())
    if cache["keys"] and now - cache["fetched_at"] < 3600:
        return cache["keys"]
    async with aiohttp.ClientSession(trust_env=True) as session:
        async with session.get(CLERK_JWKS_URL) as resp:
            if resp.status != 200:
                raise HTTPException(401, "Failed to fetch JWKS")
            jwks = await resp.json()
            cache["keys"] = jwks
            cache["fetched_at"] = now
            return jwks


async def require_user(request: Request):
    if not CLERK_ISSUER or not CLERK_JWKS_URL:
        raise HTTPException(500, "Clerk not configured")
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Missing Authorization header")
    token = auth_header.split(" ", 1)[1]
    jwks = await _get_jwks()
    try:
        unverified = jwt.get_unverified_header(token)
        kid = unverified.get("kid")
        key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
        if not key:
            raise HTTPException(401, "Invalid token key")
        claims = jwt.decode(token, key, algorithms=[key.get("alg", "RS256")], audience=CLERK_AUDIENCE, issuer=CLERK_ISSUER)
        user = {"user_id": claims.get("sub"), "claims": claims}
        request.state.user = user
        return user
    except Exception:
        raise HTTPException(401, "Invalid token")


app = FastAPI(lifespan=app_lifespan)

logger.info("FastAPI backend server initializing...")

# Health check endpoint
@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    return {"status": "healthy", "service": "presenton-backend", "timestamp": time.time()}

# Heartbeat endpoint for monitoring
@app.get("/heartbeat")
async def heartbeat():
    return {"status": "alive", "timestamp": time.time()}

# Routers
app.include_router(API_V1_PPT_ROUTER, dependencies=[Depends(require_user)])

# Middlewares
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(UserConfigEnvUpdateMiddleware)
