"""
RAONE - Email Service
"""

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings
import os
from pathlib import Path

# Provide a fallback for MAIL_USERNAME/PASSWORD if not set, to avoid startup crash
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME or "",
    MAIL_PASSWORD=settings.MAIL_PASSWORD or "",
    MAIL_FROM=settings.MAIL_FROM or "noreply@raone.com",
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS,
    TEMPLATE_FOLDER=Path(__file__).parent.parent / "templates" / "email",
)

async def send_reset_password_email(email_to: str, otp_code: str):
    """Send the OTP email to the user."""
    # Ensure credentials are provided
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        raise ValueError("Email credentials are not configured in the environment.")

    message = MessageSchema(
        subject="RAONE - Password Reset OTP",
        recipients=[email_to],
        template_body={"otp_code": otp_code},
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    await fm.send_message(message, template_name="reset_password.html")
