# Multi-stage optimized Dockerfile for faster builds
FROM node:20-slim AS frontend-builder

# Install system dependencies for Next.js build
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Build Next.js app
WORKDIR /app/servers/nextjs
COPY servers/nextjs/package.json servers/nextjs/package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy source and build
COPY servers/nextjs/ ./
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
ENV CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
RUN npm run build

# Python dependencies stage
FROM python:3.11-slim-bookworm AS python-deps

# Install system dependencies in one layer
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ca-certificates \
    gnupg \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    aiohttp aiomysql aiosqlite asyncpg fastapi[standard] \
    pathvalidate pdfplumber chromadb sqlmodel \
    anthropic google-genai openai fastmcp "python-jose[cryptography]"

# Install docling separately (heavy dependency)
RUN pip install --no-cache-dir docling --extra-index-url https://download.pytorch.org/whl/cpu

# Final production stage
FROM python:3.11-slim-bookworm

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    wget \
    ca-certificates \
    gnupg \
    libreoffice \
    fontconfig \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

# Fix ImageMagick policy
RUN sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama (only if needed - consider making this optional)
RUN curl -fsSL https://ollama.com/install.sh | sh

# Create working directory
WORKDIR /app

# Set environment variables
ENV APP_DATA_DIRECTORY=/app_data
ENV TEMP_DIRECTORY=/tmp/presenton

# Copy Python dependencies from previous stage
COPY --from=python-deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-deps /usr/local/bin /usr/local/bin

# Install Puppeteer Chrome (lighter approach)
RUN npm install -g puppeteer@latest && \
    npx puppeteer browsers install chrome --install-deps && \
    npm cache clean --force

# Copy built Next.js app
COPY --from=frontend-builder /app/servers/nextjs/.next /app/servers/nextjs/.next
COPY --from=frontend-builder /app/servers/nextjs/public /app/servers/nextjs/public
COPY --from=frontend-builder /app/servers/nextjs/package.json /app/servers/nextjs/package.json

# Install only production dependencies for runtime
WORKDIR /app/servers/nextjs
RUN npm ci --only=production --no-audit --no-fund && npm cache clean --force

# Copy FastAPI application
COPY servers/fastapi/ ./servers/fastapi/
COPY start.js LICENSE NOTICE ./

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Final cleanup
RUN rm -rf /tmp/* /var/tmp/* ~/.cache/*

# Expose port
EXPOSE 80

# Start the application
CMD ["node", "/app/start.js"]
