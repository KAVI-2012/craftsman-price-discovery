import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("craftsman.database")

database_url = settings.DATABASE_URL

connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        database_url,
        connect_args=connect_args,
        pool_pre_ping=True
    )
    # Test connection
    with engine.connect() as conn:
        pass
    logger.info(f"Database connected successfully: {database_url.split('@')[-1] if '@' in database_url else database_url}")
except Exception as e:
    logger.warning(f"Failed to connect to primary database ({database_url}): {e}. Falling back to SQLite.")
    database_url = "sqlite:///./craftsman_price_discovery.db"
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

