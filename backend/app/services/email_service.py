"""
RAONE - Email Service
"""

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

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

async def send_subscription_upgrade_email(email_to: str, full_name: str, plan_name: str, expiry_date: str):
    """Send an email confirming the subscription upgrade."""
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        logger.warning("Email credentials not configured. Skipping subscription email.")
        return

    message = MessageSchema(
        subject="Welcome to RAONE Premium!",
        recipients=[email_to],
        template_body={
            "full_name": full_name,
            "plan_name": plan_name.upper().replace("_", " "),
            "expiry_date": expiry_date
        },
        subtype=MessageType.html
    )
    
    try:
        fm = FastMail(conf)
        await fm.send_message(message, template_name="upgrade_success.html")
    except Exception as e:
        logger.error(f"Failed to send upgrade email: {e}")
