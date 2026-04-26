"""
RAONE - Application Configuration
Loads settings from .env with fallback chain for LLM providers.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

# Find .env file - check backend dir first, then project root
_backend_dir = Path(__file__).resolve().parent.parent
_project_root = _backend_dir.parent
_env_file = _backend_dir / ".env"
if not _env_file.exists():
    _env_file = _project_root / ".env"


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────
    APP_NAME: str = "RAONE"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ── Database ─────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:sushant@localhost:5432/RAONE"

    # ── JWT ──────────────────────────────────────────────
    JWT_SECRET_KEY: str = "raone-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    # ── LLM Providers (Fallback Chain) ───────────────────
    # Priority: Groq → OpenRouter → HuggingFace → Ollama
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_MODEL: str = "meta-llama/llama-3.3-70b-instruct"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    HUGGINGFACE_API_KEY: Optional[str] = None
    HF_MODEL: str = "meta-llama/Llama-3.3-70B-Instruct"

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.4"

    # ── Embeddings ───────────────────────────────────────
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # ── FAISS ────────────────────────────────────────────
    FAISS_INDEX_PATH: str = str(_backend_dir / "data" / "faiss_indices")

    # ── Uploads ──────────────────────────────────────────
    UPLOAD_DIR: str = str(_backend_dir / "uploads")

    # ── CORS ─────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"

    # ── Email Settings ───────────────────────────────────
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "RAONE Platform"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True

    # ── Razorpay ─────────────────────────────────────────
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None

    class Config:
        env_file = str(_env_file)
        env_file_encoding = "utf-8"
        extra = "ignore"

    def get_active_llm_provider(self) -> str:
        """Returns the first available LLM provider in the fallback chain."""
        if self.GROQ_API_KEY:
            return "groq"
        if self.OPENROUTER_API_KEY:
            return "openrouter"
        if self.HUGGINGFACE_API_KEY:
            return "huggingface"
        return "ollama"


settings = Settings()
