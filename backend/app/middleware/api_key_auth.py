"""
RAONE - API Key Authentication Middleware
Validates API keys from the X-API-Key header for public/headless access.
"""

from datetime import datetime, timezone
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.api_key import ApiKey
from app.models.company import Company
from app.utils.hashing import hash_api_key

# Define the API key header scheme
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_company_by_api_key(
    api_key: str = Security(api_key_header),
    db: AsyncSession = Depends(get_db),
) -> Company:
    """
    Authenticate a request using the X-API-Key header.

    Flow:
    1. Extract raw key from the X-API-Key header.
    2. Hash the key with SHA-256.
    3. Look up the hash in the api_keys table.
    4. Verify the key is active.
    5. Update last_used_at timestamp.
    6. Return the associated Company.
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key. Provide it via the X-API-Key header.",
        )

    # Hash the incoming key and look it up
    key_hash = hash_api_key(api_key)

    result = await db.execute(
        select(ApiKey).where(
            ApiKey.key_hash == key_hash,
            ApiKey.is_active == True,
        )
    )
    db_key = result.scalar_one_or_none()

    if not db_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key.",
        )

    # Update last_used_at for audit tracking
    db_key.last_used_at = datetime.now(timezone.utc)
    db.add(db_key)

    # Load the associated company
    result = await db.execute(
        select(Company).where(Company.id == db_key.company_id)
    )
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company associated with this API key no longer exists.",
        )

    return company
