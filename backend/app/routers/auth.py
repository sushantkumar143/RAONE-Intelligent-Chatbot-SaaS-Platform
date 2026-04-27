"""
RAONE - Auth Router
Handles user signup, login, and profile endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    SignupRequest, LoginRequest, AuthResponse, UserResponse,
    GoogleLoginRequest, ProfileUpdateRequest, ForgotPasswordRequest,
    VerifyOTPRequest, ResetPasswordRequest, AdminLoginRequest
)
from app.services.auth_service import (
    create_user_and_company,
    authenticate_user,
    create_access_token,
    get_user_company,
    authenticate_google_user,
    update_user_profile,
    generate_password_reset_otp,
    verify_password_reset_otp,
    reset_password,
)
from app.services.email_service import send_reset_password_email
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

    if getattr(company, 'is_blacklisted', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your organization has been suspended. Contact support for assistance.",
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


@router.post("/google", response_model=AuthResponse)
async def google_login(data: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user with Google ID Token."""
    try:
        user, company = await authenticate_google_user(db, data.token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    token = create_access_token(user.id, user.email)

    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        company=CompanyResponse.model_validate(company),
    )


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the current authenticated user's profile."""
    try:
        user = await update_user_profile(db, current_user.id, data.full_name)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Generate an OTP and send it via email."""
    try:
        otp_code = await generate_password_reset_otp(db, data.email)
        await send_reset_password_email(data.email, otp_code)
        return {"message": "If your email is registered, an OTP has been sent."}
    except ValueError as e:
        # Don't reveal if user exists or not for security, but we do for now to aid debugging
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )

@router.post("/verify-otp")
async def verify_otp(data: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """Verify the provided OTP."""
    try:
        await verify_password_reset_otp(db, data.email, data.otp_code)
        return {"message": "OTP verified successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.post("/reset-password")
async def perform_reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset the password after verifying the OTP again."""
    try:
        await reset_password(db, data.email, data.otp_code, data.new_password)
        return {"message": "Password reset successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/admin-login")
async def admin_login(data: AdminLoginRequest):
    """Authenticate admin using env-based credentials."""
    from app.config import settings as app_settings
    from jose import jwt
    from datetime import datetime, timedelta, timezone

    if (
        data.username != app_settings.ADMIN_USERNAME
        or data.password != app_settings.ADMIN_PASSWORD
        or data.secret_key != app_settings.ADMIN_SECRET_KEY
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
        )

    expire = datetime.now(timezone.utc) + timedelta(hours=12)
    payload = {
        "sub": data.username,
        "role": "admin",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    token = jwt.encode(payload, app_settings.JWT_SECRET_KEY, algorithm=app_settings.JWT_ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "admin",
        "username": data.username,
    }
