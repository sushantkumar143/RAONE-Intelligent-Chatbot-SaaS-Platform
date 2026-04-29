"""
RAONE - Admin Router
Full platform administration: users, companies, analytics, access control.
All endpoints require admin JWT authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID

from app.database import get_db
from app.middleware.auth_middleware import get_admin_user
from app.models.user import User
from app.models.company import Company, CompanyMember
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.api_key import ApiKey
from app.models.knowledge_source import KnowledgeSource
from app.services.admin_emails import (
    send_account_status_email,
    send_blacklist_email,
    send_plan_change_email,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Platform-wide Stats ─────────────────────────────────

@router.get("/stats")
async def get_platform_stats(
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get platform-wide statistics."""
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_companies = (await db.execute(select(func.count(Company.id)))).scalar() or 0
    total_conversations = (await db.execute(select(func.count(Conversation.id)))).scalar() or 0
    total_messages = (await db.execute(select(func.count(Message.id)))).scalar() or 0
    total_api_keys = (await db.execute(
        select(func.count(ApiKey.id)).where(ApiKey.is_active == True)
    )).scalar() or 0
    total_knowledge = (await db.execute(select(func.count(KnowledgeSource.id)))).scalar() or 0
    blacklisted_companies = (await db.execute(
        select(func.count(Company.id)).where(Company.is_blacklisted == True)
    )).scalar() or 0

    # Plan distribution
    free_count = (await db.execute(
        select(func.count(Company.id)).where(Company.subscription_plan == "free")
    )).scalar() or 0
    pro_count = (await db.execute(
        select(func.count(Company.id)).where(Company.subscription_plan == "pro")
    )).scalar() or 0
    ultra_pro_count = (await db.execute(
        select(func.count(Company.id)).where(Company.subscription_plan == "ultra_pro")
    )).scalar() or 0

    return {
        "total_users": total_users,
        "total_companies": total_companies,
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "total_api_keys": total_api_keys,
        "total_knowledge_sources": total_knowledge,
        "blacklisted_companies": blacklisted_companies,
        "plan_distribution": {
            "free": free_count,
            "pro": pro_count,
            "ultra_pro": ultra_pro_count,
        },
    }


# ── Users Management ────────────────────────────────────

@router.get("/users")
async def list_all_users(
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all users with their company info."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    user_list = []
    for u in users:
        # Get company
        company_result = await db.execute(
            select(Company).where(Company.owner_id == u.id)
        )
        company = company_result.scalars().first()

        user_list.append({
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "company": {
                "id": str(company.id),
                "name": company.name,
                "subscription_plan": company.subscription_plan,
                "is_blacklisted": company.is_blacklisted,
            } if company else None,
        })

    return user_list


@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: UUID,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Activate or deactivate a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    await db.flush()

    # Send email notification
    await send_account_status_email(user.email, user.full_name, user.is_active)

    return {
        "id": str(user.id),
        "email": user.email,
        "is_active": user.is_active,
        "message": f"User {'activated' if user.is_active else 'deactivated'} successfully",
    }


# ── Companies Management ────────────────────────────────

@router.get("/companies")
async def list_all_companies(
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all companies with owner and member count."""
    result = await db.execute(select(Company).order_by(Company.created_at.desc()))
    companies = result.scalars().all()

    company_list = []
    for c in companies:
        # Get owner
        owner_result = await db.execute(select(User).where(User.id == c.owner_id))
        owner = owner_result.scalar_one_or_none()

        # Get member count
        member_count = (await db.execute(
            select(func.count(CompanyMember.id)).where(CompanyMember.company_id == c.id)
        )).scalar() or 0

        # Get knowledge count
        knowledge_count = (await db.execute(
            select(func.count(KnowledgeSource.id)).where(KnowledgeSource.company_id == c.id)
        )).scalar() or 0

        # Get API key count
        api_key_count = (await db.execute(
            select(func.count(ApiKey.id)).where(ApiKey.company_id == c.id)
        )).scalar() or 0

        company_list.append({
            "id": str(c.id),
            "name": c.name,
            "slug": c.slug,
            "subscription_plan": c.subscription_plan,
            "is_blacklisted": c.is_blacklisted,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "owner": {
                "id": str(owner.id),
                "email": owner.email,
                "full_name": owner.full_name,
            } if owner else None,
            "member_count": member_count,
            "knowledge_count": knowledge_count,
            "api_key_count": api_key_count,
        })

    return company_list


@router.get("/companies/{company_id}")
async def get_company_detail(
    company_id: UUID,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full details of a company including members, API keys, knowledge sources."""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Owner
    owner_result = await db.execute(select(User).where(User.id == company.owner_id))
    owner = owner_result.scalar_one_or_none()

    # Members
    members_result = await db.execute(
        select(CompanyMember, User)
        .join(User, CompanyMember.user_id == User.id)
        .where(CompanyMember.company_id == company_id)
    )
    members = [
        {
            "id": str(m.CompanyMember.id),
            "user_id": str(m.User.id),
            "email": m.User.email,
            "full_name": m.User.full_name,
            "role": m.CompanyMember.role,
            "is_active": m.User.is_active,
        }
        for m in members_result.all()
    ]

    # API Keys
    keys_result = await db.execute(
        select(ApiKey).where(ApiKey.company_id == company_id).order_by(ApiKey.created_at.desc())
    )
    api_keys = [
        {
            "id": str(k.id),
            "name": k.name,
            "key_prefix": k.key_prefix,
            "is_active": k.is_active,
            "created_at": k.created_at.isoformat() if k.created_at else None,
        }
        for k in keys_result.scalars().all()
    ]

    # Knowledge Sources
    ks_result = await db.execute(
        select(KnowledgeSource).where(KnowledgeSource.company_id == company_id).order_by(KnowledgeSource.created_at.desc())
    )
    knowledge = [
        {
            "id": str(ks.id),
            "name": ks.name,
            "source_type": ks.source_type,
            "status": ks.status,
            "created_at": ks.created_at.isoformat() if ks.created_at else None,
        }
        for ks in ks_result.scalars().all()
    ]

    # Conversation count
    conv_count = (await db.execute(
        select(func.count(Conversation.id)).where(Conversation.company_id == company_id)
    )).scalar() or 0

    # Message count
    conv_ids_result = await db.execute(
        select(Conversation.id).where(Conversation.company_id == company_id)
    )
    conv_ids = [r[0] for r in conv_ids_result.all()]
    msg_count = 0
    if conv_ids:
        msg_count = (await db.execute(
            select(func.count(Message.id)).where(Message.conversation_id.in_(conv_ids))
        )).scalar() or 0

    return {
        "id": str(company.id),
        "name": company.name,
        "slug": company.slug,
        "subscription_plan": company.subscription_plan,
        "is_blacklisted": company.is_blacklisted,
        "created_at": company.created_at.isoformat() if company.created_at else None,
        "owner": {
            "id": str(owner.id),
            "email": owner.email,
            "full_name": owner.full_name,
        } if owner else None,
        "members": members,
        "api_keys": api_keys,
        "knowledge_sources": knowledge,
        "total_conversations": conv_count,
        "total_messages": msg_count,
    }


@router.patch("/companies/{company_id}/toggle-blacklist")
async def toggle_company_blacklist(
    company_id: UUID,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Blacklist or unblacklist a company."""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    company.is_blacklisted = not company.is_blacklisted
    await db.flush()

    # Send email to owner
    owner_result = await db.execute(select(User).where(User.id == company.owner_id))
    owner = owner_result.scalar_one_or_none()
    if owner:
        await send_blacklist_email(owner.email, owner.full_name, company.name, company.is_blacklisted)

    return {
        "id": str(company.id),
        "name": company.name,
        "is_blacklisted": company.is_blacklisted,
        "message": f"Company {'blacklisted' if company.is_blacklisted else 'unblacklisted'} successfully",
    }


@router.patch("/companies/{company_id}/change-plan")
async def change_company_plan(
    company_id: UUID,
    plan: str,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Change a company's subscription plan."""
    valid_plans = ["free", "pro", "ultra_pro"]
    if plan not in valid_plans:
        raise HTTPException(status_code=400, detail=f"Invalid plan. Must be one of: {valid_plans}")

    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    old_plan = company.subscription_plan
    company.subscription_plan = plan
    await db.flush()

    # Send email to owner
    owner_result = await db.execute(select(User).where(User.id == company.owner_id))
    owner = owner_result.scalar_one_or_none()
    if owner:
        await send_plan_change_email(owner.email, owner.full_name, company.name, old_plan, plan)

    return {
        "id": str(company.id),
        "name": company.name,
        "old_plan": old_plan,
        "new_plan": plan,
        "message": f"Plan changed from {old_plan} to {plan}",
    }


@router.get("/companies/{company_id}/analytics")
async def get_company_analytics(
    company_id: UUID,
    admin: dict = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get analytics for a specific company."""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Conversations
    conv_count = (await db.execute(
        select(func.count(Conversation.id)).where(Conversation.company_id == company_id)
    )).scalar() or 0

    # Messages and tokens
    conv_ids_result = await db.execute(
        select(Conversation.id).where(Conversation.company_id == company_id)
    )
    conv_ids = [r[0] for r in conv_ids_result.all()]

    total_messages = 0
    total_tokens = 0
    if conv_ids:
        msg_stats = await db.execute(
            select(
                func.count(Message.id),
                func.sum(Message.input_tokens),
                func.sum(Message.output_tokens),
            ).where(Message.conversation_id.in_(conv_ids))
        )
        row = msg_stats.first()
        total_messages = row[0] or 0
        total_tokens = (row[1] or 0) + (row[2] or 0)

    # API Keys
    active_keys = (await db.execute(
        select(func.count(ApiKey.id)).where(ApiKey.company_id == company_id, ApiKey.is_active == True)
    )).scalar() or 0

    # Knowledge
    knowledge_count = (await db.execute(
        select(func.count(KnowledgeSource.id)).where(KnowledgeSource.company_id == company_id)
    )).scalar() or 0

    return {
        "company_name": company.name,
        "subscription_plan": company.subscription_plan,
        "total_conversations": conv_count,
        "total_messages": total_messages,
        "total_tokens": total_tokens,
        "active_api_keys": active_keys,
        "knowledge_sources": knowledge_count,
    }
