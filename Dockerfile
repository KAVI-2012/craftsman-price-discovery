# Multi-stage Docker build for Craftsman Price Intelligence Platform
# 100% Free deployment on Render / Hugging Face Spaces / Koyeb

# Stage 1: Build Frontend (Node.js)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package manifests first for efficient caching
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source (Windows node_modules is ignored by .dockerignore)
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend Runtime
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend static assets from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Render defaults to port 10000
ENV ENVIRONMENT=production
ENV PORT=10000
EXPOSE 10000

WORKDIR /app/backend
CMD ["sh", "-c", "python -c 'from app.db.init_db import init_db; init_db()' && uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}"]
