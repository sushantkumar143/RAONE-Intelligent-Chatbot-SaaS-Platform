"""
RAONE - Admin Email Notifications
Sends branded emails when admin takes actions on user accounts.
"""

from fastapi_mail import FastMail, MessageSchema, MessageType
from app.config import settings
from app.services.email_service import conf
import logging

logger = logging.getLogger(__name__)


async def send_account_status_email(email_to: str, full_name: str, is_active: bool):
    """Notify user when their account is activated/deactivated by admin."""
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        logger.warning("Email credentials not configured. Skipping admin notification.")
        return

    status_text = "Activated" if is_active else "Deactivated"
    color = "#22c55e" if is_active else "#ef4444"
    
    html_body = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚡ RAONE Platform</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Administration Notice</p>
        </div>
        <div style="padding: 32px; color: #e2e8f0;">
            <p style="font-size: 16px;">Hello <strong>{full_name}</strong>,</p>
            <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; border-left: 4px solid {color};">
                <p style="font-size: 14px; color: #94a3b8; margin: 0 0 8px;">Account Status</p>
                <p style="font-size: 24px; font-weight: bold; color: {color}; margin: 0;">{status_text}</p>
            </div>
            <p style="color: #94a3b8; font-size: 14px;">
                {"Your account has been reactivated. You can now log in and use all RAONE services." if is_active else "Your account has been temporarily deactivated by an administrator. If you believe this is an error, please contact support."}
            </p>
        </div>
        <div style="padding: 16px 32px; background: #0f172a; text-align: center;">
            <p style="color: #475569; font-size: 12px; margin: 0;">© 2026 RAONE — Retrieval-Augmented Orchestration Neural Engine</p>
        </div>
    </div>
    """

    message = MessageSchema(
        subject=f"RAONE — Account {status_text}",
        recipients=[email_to],
        body=html_body,
        subtype=MessageType.html,
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        logger.error(f"Failed to send account status email: {e}")


async def send_blacklist_email(email_to: str, full_name: str, company_name: str, is_blacklisted: bool):
    """Notify company owner when their organization is blacklisted/unblacklisted."""
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        logger.warning("Email credentials not configured. Skipping admin notification.")
        return

    status_text = "Suspended" if is_blacklisted else "Reinstated"
    color = "#ef4444" if is_blacklisted else "#22c55e"

    html_body = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚡ RAONE Platform</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Organization Notice</p>
        </div>
        <div style="padding: 32px; color: #e2e8f0;">
            <p style="font-size: 16px;">Hello <strong>{full_name}</strong>,</p>
            <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; border-left: 4px solid {color};">
                <p style="font-size: 14px; color: #94a3b8; margin: 0 0 4px;">Organization: <strong>{company_name}</strong></p>
                <p style="font-size: 24px; font-weight: bold; color: {color}; margin: 8px 0 0;">{status_text}</p>
            </div>
            <p style="color: #94a3b8; font-size: 14px;">
                {"Your organization has been reinstated. All services are now accessible again." if not is_blacklisted else "Your organization has been suspended due to a policy violation. All access has been revoked. If you believe this is an error, please contact our support team."}
            </p>
        </div>
        <div style="padding: 16px 32px; background: #0f172a; text-align: center;">
            <p style="color: #475569; font-size: 12px; margin: 0;">© 2026 RAONE — Retrieval-Augmented Orchestration Neural Engine</p>
        </div>
    </div>
    """

    message = MessageSchema(
        subject=f"RAONE — Organization {status_text}: {company_name}",
        recipients=[email_to],
        body=html_body,
        subtype=MessageType.html,
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        logger.error(f"Failed to send blacklist email: {e}")


async def send_plan_change_email(email_to: str, full_name: str, company_name: str, old_plan: str, new_plan: str):
    """Notify company owner when their subscription plan is changed by admin."""
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        logger.warning("Email credentials not configured. Skipping admin notification.")
        return

    plan_display = {"free": "Free", "pro": "Pro", "ultra_pro": "Ultra Pro"}
    old_display = plan_display.get(old_plan, old_plan)
    new_display = plan_display.get(new_plan, new_plan)

    html_body = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚡ RAONE Platform</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Subscription Update</p>
        </div>
        <div style="padding: 32px; color: #e2e8f0;">
            <p style="font-size: 16px;">Hello <strong>{full_name}</strong>,</p>
            <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="font-size: 14px; color: #94a3b8; margin: 0 0 12px;">Organization: <strong>{company_name}</strong></p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
                    <span style="background: #374151; padding: 8px 16px; border-radius: 8px; color: #9ca3af; font-weight: bold;">{old_display}</span>
                    <span style="color: #3b82f6; font-size: 20px;">→</span>
                    <span style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 8px 16px; border-radius: 8px; color: white; font-weight: bold;">{new_display}</span>
                </div>
            </div>
            <p style="color: #94a3b8; font-size: 14px;">Your subscription plan has been updated by the RAONE administration team. The changes are effective immediately.</p>
        </div>
        <div style="padding: 16px 32px; background: #0f172a; text-align: center;">
            <p style="color: #475569; font-size: 12px; margin: 0;">© 2026 RAONE — Retrieval-Augmented Orchestration Neural Engine</p>
        </div>
    </div>
    """

    message = MessageSchema(
        subject=f"RAONE — Subscription Updated: {new_display}",
        recipients=[email_to],
        body=html_body,
        subtype=MessageType.html,
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
    except Exception as e:
        logger.error(f"Failed to send plan change email: {e}")
