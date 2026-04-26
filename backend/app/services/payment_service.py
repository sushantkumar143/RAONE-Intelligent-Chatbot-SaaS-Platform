"""
RAONE - Payment Service
Handles Razorpay integration for subscription upgrades.
"""

import razorpay
import hmac
import hashlib
import uuid
import logging
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone

from app.config import settings
from app.models.company import Company
from app.models.user import User
from app.services.email_service import send_subscription_upgrade_email

logger = logging.getLogger(__name__)

def get_razorpay_client():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise ValueError("Razorpay credentials not configured")
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

async def create_subscription_order(plan_type: str, company_id: str) -> dict:
    """Creates a Razorpay order for the selected plan."""
    
    # Determine pricing based on plan (in paisa, so multiply by 100)
    if plan_type == "pro":
        amount = 199 * 100
    elif plan_type == "ultra_pro":
        amount = 499 * 100
    else:
        raise HTTPException(status_code=400, detail="Invalid plan type")

    try:
        client = get_razorpay_client()
        data = {
            "amount": amount,
            "currency": "INR",
            "receipt": f"rcpt_{str(company_id)[:8]}_{uuid.uuid4().hex[:8]}",
            "notes": {
                "company_id": company_id,
                "plan_type": plan_type
            }
        }
        order = client.order.create(data=data)
        return order
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")

async def verify_payment_signature(
    db: AsyncSession, 
    razorpay_order_id: str, 
    razorpay_payment_id: str, 
    razorpay_signature: str,
    company_id: str,
    plan_type: str,
    user: User
):
    """Verifies the Razorpay signature and updates the company's plan."""
    try:
        # Verification using razorpay sdk
        client = get_razorpay_client()
        
        # Verify signature
        # This will throw a SignatureVerificationError if it fails
        client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        
        # If successful, update company plan
        result = await db.execute(select(Company).where(Company.id == uuid.UUID(company_id)))
        company = result.scalar_one_or_none()
        
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
            
        company.subscription_plan = plan_type
        # Set expiry to 30 days from now
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        company.subscription_expires_at = expires_at
        await db.commit()
        
        # Send email notification
        formatted_date = expires_at.strftime("%B %d, %Y")
        await send_subscription_upgrade_email(user.email, user.full_name, plan_type, formatted_date)
        
        return {"status": "success", "message": f"Successfully upgraded to {plan_type} plan", "new_plan": plan_type, "expires_at": expires_at.isoformat()}
        
    except razorpay.errors.SignatureVerificationError:
        logger.error("Payment signature verification failed.")
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        logger.error(f"Error processing payment verification: {e}")
        raise HTTPException(status_code=500, detail="Error processing payment verification")
