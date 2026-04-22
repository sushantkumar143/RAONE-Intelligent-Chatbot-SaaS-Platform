"""
RAONE - Password Hashing Utilities
"""


from passlib.context import CryptContext
import hashlib
import secrets

# Use Argon2 as primary scheme, keeping bcrypt for compatibility
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using Argon2 (primary) or BCrypt (legacy)."""
    return pwd_context.hash(password)



def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def generate_api_key() -> str:
    """Generate a random API key with 'rk_' prefix."""
    return f"rk_{secrets.token_urlsafe(32)}"


def hash_api_key(api_key: str) -> str:
    """Hash an API key using SHA-256."""
    return hashlib.sha256(api_key.encode()).hexdigest()


def get_key_prefix(api_key: str) -> str:
    """Get the display prefix of an API key (first 12 chars)."""
    return api_key[:12] + "..."
