"""
RAONE - Authentication Service
Handles user creation, login, JWT token management.
"""

import uuid
import re
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User
from app.models.company import Company, CompanyMember
from app.utils.hashing import hash_password, verify_password
from app.schemas.auth import SignupRequest, TokenData


def create_access_token(user_id: uuid.UUID, email: str) -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_access_token(token: str) -> Optional[TokenData]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        if user_id is None or email is None:
            return None
        return TokenData(user_id=uuid.UUID(user_id), email=email)
    except JWTError:
        return None


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text


async def create_user_and_company(
    db: AsyncSession,
    signup_data: SignupRequest,
) -> tuple[User, Company]:
    """Create a new user and their company in a single transaction."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == signup_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise ValueError("Email already registered")

    # Create user
    user = User(
        email=signup_data.email,
        password_hash=hash_password(signup_data.password),
        full_name=signup_data.full_name,
    )
    db.add(user)
    await db.flush()  # Get user ID

    # Create company
    slug = slugify(signup_data.company_name)
    # Ensure unique slug
    result = await db.execute(select(Company).where(Company.slug == slug))
    if result.scalar_one_or_none():
        slug = f"{slug}-{str(user.id)[:8]}"

    company = Company(
        name=signup_data.company_name,
        slug=slug,
        owner_id=user.id,
    )
    db.add(company)
    await db.flush()

    # Add owner as company member
    member = CompanyMember(
        company_id=company.id,
        user_id=user.id,
        role="owner",
    )
    db.add(member)

    return user, company


async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str,
) -> Optional[User]:
    """Authenticate user by email and password."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    """Get user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_company(db: AsyncSession, user_id: uuid.UUID) -> Optional[Company]:
    """Get the first company owned by a user."""
    result = await db.execute(
        select(Company).where(Company.owner_id == user_id)
    )
    return result.scalar_one_or_none()
