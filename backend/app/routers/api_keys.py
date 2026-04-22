"""
RAONE - API Keys Router
Manage API keys for companies.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.api_key import ApiKey
from app.models.company import Company
from app.middleware.auth_middleware import get_current_company
from app.utils.hashing import generate_api_key, hash_api_key, get_key_prefix
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ApiKeyCreateRequest(BaseModel):
    name: str
    rate_limit: int = 100


class ApiKeyResponse(BaseModel):
    id: UUID
    name: str
    key_prefix: str
    is_active: bool
    rate_limit: int
    last_used_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ApiKeyCreatedResponse(BaseModel):
    id: UUID
    name: str
    api_key: str  # Full key, shown only once
    key_prefix: str
    rate_limit: int
    created_at: datetime


router = APIRouter(prefix="/api-keys", tags=["API Keys"])


@router.post("", response_model=ApiKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    data: ApiKeyCreateRequest,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    """Generate a new API key for the company."""
    raw_key = generate_api_key()
    key_hash = hash_api_key(raw_key)
    prefix = get_key_prefix(raw_key)

    api_key = ApiKey(
        company_id=company.id,
        key_hash=key_hash,
        key_prefix=prefix,
        name=data.name,
        rate_limit=data.rate_limit,
    )
    db.add(api_key)
    await db.flush()

    return ApiKeyCreatedResponse(
        id=api_key.id,
        name=api_key.name,
        api_key=raw_key,
        key_prefix=prefix,
        rate_limit=api_key.rate_limit,
        created_at=api_key.created_at,
    )


@router.get("", response_model=List[ApiKeyResponse])
async def list_api_keys(
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    """List all API keys for the company (without full keys)."""
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.company_id == company.id)
        .order_by(ApiKey.created_at.desc())
    )
    keys = result.scalars().all()
    return [ApiKeyResponse.model_validate(k) for k in keys]


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: UUID,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    """Revoke (deactivate) an API key."""
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id,
            ApiKey.company_id == company.id,
        )
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    api_key.is_active = False
    db.add(api_key)
