"""
RAONE - Payments Router
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.services.payment_service import create_subscription_order, verify_payment_signature
from app.models.user import User

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create-order")
async def create_order(
    plan_type: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Get user's first company (assuming 1 company per user for now, as is typical in this platform setup)
    if not current_user.owned_companies:
        raise HTTPException(status_code=400, detail="User does not own any company")
        
    company_id = str(current_user.owned_companies[0].id)
    
    order = await create_subscription_order(plan_type, company_id)
    return order

@router.post("/verify")
async def verify_payment(
    razorpay_order_id: str = Body(...),
    razorpay_payment_id: str = Body(...),
    razorpay_signature: str = Body(...),
    plan_type: str = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    if not current_user.owned_companies:
        raise HTTPException(status_code=400, detail="User does not own any company")
        
    company_id = str(current_user.owned_companies[0].id)
    
    result = await verify_payment_signature(
        db, 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature, 
        company_id, 
        plan_type,
        current_user
    )
    return result

@router.post("/downgrade-free")
async def downgrade_free(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    if not current_user.owned_companies:
        raise HTTPException(status_code=400, detail="User does not own any company")
        
    company = current_user.owned_companies[0]
    company.subscription_plan = "free"
    company.subscription_expires_at = None
    await db.commit()
    
    return {"status": "success", "message": "Successfully downgraded to free plan", "new_plan": "free"}
