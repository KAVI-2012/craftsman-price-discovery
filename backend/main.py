import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.db.init_db import init_db
from app.connectors.registry import connector_registry
from app.core.database import SessionLocal

# Import API routers
from app.api.auth import router as auth_router
from app.api.search import router as search_router
from app.api.suppliers import router as suppliers_router
from app.api.comparison import router as comparison_router
from app.api.reports import router as reports_router
from app.api.dashboard import router as dashboard_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("craftsman.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Craftsman Market Price Discovery Backend...")
    try:
        init_db()
        db = SessionLocal()
        connector_registry.sync_with_db(db)
        db.close()
        logger.info("Database initialized and connectors synchronized.")
    except Exception as e:
        logger.error(f"Startup initialization error: {e}")
    yield
    logger.info("Shutting down backend services.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Market Price Discovery & Comparison Platform for Craftsman Automation",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers with /api prefix
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(search_router, prefix=settings.API_PREFIX)
app.include_router(suppliers_router, prefix=settings.API_PREFIX)
app.include_router(comparison_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)

@app.get("/health")
def healthcheck():
    return {
        "status": "HEALTHY",
        "suppliers_configured": 7,
        "environment": settings.ENVIRONMENT
    }

# Mount React static files if frontend/dist exists for unified 1-click free hosting
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Exclude API endpoints, Swagger docs, and health checks
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json") or full_path == "health":
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "platform": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "target_organization": "Craftsman Automation",
            "status": "ONLINE",
            "docs_url": "/docs",
            "api_prefix": settings.API_PREFIX
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

