"""
RAONE - Auth Router
Handles user signup, login, and profile endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse, UserResponse
from app.services.auth_service import (
    create_user_and_company,
    authenticate_user,
    create_access_token,
    get_user_company,
)
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.schemas.company import CompanyResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: SignupRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user and create their company."""
    try:
        user, company = await create_user_and_company(db, data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )

    token = create_access_token(user.id, user.email)

    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        company=CompanyResponse.model_validate(company),
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = await authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    company = await get_user_company(db, user.id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No company associated with this account",
        )

    token = create_access_token(user.id, user.email)

    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        company=CompanyResponse.model_validate(company),
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return UserResponse.model_validate(current_user)
