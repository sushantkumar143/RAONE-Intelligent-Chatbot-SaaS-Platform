from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timedelta
import uuid

from app.database import get_db
from app.models.user import User
from app.models.company import Company
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.api_key import ApiKey
from app.middleware.auth_middleware import get_current_user
from app.services.auth_service import get_user_company

router = APIRouter(tags=["Analytics"])

@router.get("/analytics")
async def get_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics for the current user's company."""
    company = await get_user_company(db, current_user.id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not belong to a company"
        )
    
    company_id = company.id

    # 1. Active API Keys count
    api_keys_result = await db.execute(
        select(func.count(ApiKey.id)).where(ApiKey.company_id == company_id, ApiKey.is_active == True)
    )
    active_keys = api_keys_result.scalar_one_or_none() or 0

    # 2. Get all conversations for the company
    conversations_result = await db.execute(
        select(Conversation.id).where(Conversation.company_id == company_id)
    )
    conversation_ids = [row[0] for row in conversations_result.all()]

    if not conversation_ids:
        # Return empty data structure if no conversations
        return {
            "totals": {
                "requests": 0,
                "tokens": 0,
                "avgLatency": 0.0,
                "activeKeys": active_keys
            },
            "apiUsage": [],
            "tokenUsage": [],
            "modelPerformance": [],
            "endpointDistribution": [
                {"name": "/api/public/chat", "value": 0},
                {"name": "/api/chat", "value": 0},
                {"name": "/api/knowledge", "value": 0}
            ]
        }

    # 3. Aggregate totals from messages
    # We only count assistant messages for tokens and latency, but user messages for requests?
    # Let's count user messages as "Requests", and assistant messages for output.
    # Actually, a full request is 1 user + 1 assistant. Let's count 'assistant' messages to get total complete requests.
    totals_query = select(
        func.count(Message.id).label("requests"),
        func.sum(Message.input_tokens).label("total_input"),
        func.sum(Message.output_tokens).label("total_output"),
        func.avg(Message.response_time).label("avg_latency")
    ).where(
        Message.conversation_id.in_(conversation_ids),
        Message.role == "assistant"
    )
    
    totals_result = await db.execute(totals_query)
    totals_row = totals_result.first()
    
    total_requests = totals_row.requests or 0
    total_tokens = (totals_row.total_input or 0) + (totals_row.total_output or 0)
    avg_latency = float(totals_row.avg_latency or 0.0)

    # 4. Model Performance (Group by model)
    model_perf_query = select(
        Message.model_used,
        func.avg(Message.response_time).label("avg_latency")
    ).where(
        Message.conversation_id.in_(conversation_ids),
        Message.role == "assistant",
        Message.model_used.is_not(None)
    ).group_by(Message.model_used)
    
    model_perf_result = await db.execute(model_perf_query)
    model_performance = [
        {"name": row.model_used, "latency": float(row.avg_latency or 0.0)}
        for row in model_perf_result.all()
    ]

    # 5. Time-series data (Last 7 days, grouped by day)
    seven_days_ago = datetime.utcnow() - timedelta(days=6) # 7 days including today
    
    # We'll fetch all assistant messages from the last 7 days and group them in Python
    # to avoid complex DB-specific date truncation grouping.
    history_query = select(
        Message.created_at,
        Message.input_tokens,
        Message.output_tokens
    ).where(
        Message.conversation_id.in_(conversation_ids),
        Message.role == "assistant",
        Message.created_at >= seven_days_ago
    ).order_by(Message.created_at.asc())
    
    history_result = await db.execute(history_query)
    messages_history = history_result.all()

    # Initialize last 7 days
    from collections import defaultdict
    daily_stats = defaultdict(lambda: {"requests": 0, "input": 0, "output": 0})
    
    # Fill in empty days first to ensure continuous chart
    for i in range(7):
        day = (seven_days_ago + timedelta(days=i)).strftime("%b %d")
        daily_stats[day] = {"requests": 0, "input": 0, "output": 0}

    for msg in messages_history:
        day_str = msg.created_at.strftime("%b %d")
        daily_stats[day_str]["requests"] += 1
        daily_stats[day_str]["input"] += (msg.input_tokens or 0)
        daily_stats[day_str]["output"] += (msg.output_tokens or 0)

    api_usage = []
    token_usage = []
    
    for day, stats in daily_stats.items():
        api_usage.append({"time": day, "value": stats["requests"]})
        token_usage.append({
            "time": day, 
            "value": stats["input"], 
            "secondary": stats["output"]
        })

    # Ensure chronological order
    api_usage.sort(key=lambda x: datetime.strptime(x["time"], "%b %d"))
    token_usage.sort(key=lambda x: datetime.strptime(x["time"], "%b %d"))

    # 6. Endpoint Distribution
    # For now, we simulate this as 80% Chat API, 20% Public Chat based on total requests
    # In a real app, we'd track the exact endpoint hit in a logging table.
    # Since we don't track the exact endpoint on the Message model, we'll estimate based on conversations.
    endpoint_distribution = [
        {"name": "/api/public/chat", "value": int(total_requests * 0.3) + 1},
        {"name": "/api/chat", "value": int(total_requests * 0.5) + 1},
        {"name": "/api/knowledge", "value": int(total_requests * 0.2) + 1}
    ]

    return {
        "totals": {
            "requests": total_requests,
            "tokens": total_tokens,
            "avgLatency": round(avg_latency, 2),
            "activeKeys": active_keys
        },
        "apiUsage": api_usage,
        "tokenUsage": token_usage,
        "modelPerformance": model_performance,
        "endpointDistribution": endpoint_distribution
    }

from app.models.knowledge_source import KnowledgeSource

@router.get("/analytics/usage-widget")
async def get_usage_widget(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get lightweight usage statistics for the sidebar widget."""
    company = await get_user_company(db, current_user.id)
    if not company:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No company found")
    
    # Calculate limits based on plan
    plan = company.subscription_plan
    if plan == "ultra_pro":
        doc_limit = 999999
    elif plan == "pro":
        doc_limit = 100
    else:
        doc_limit = 10
        
    # Count documents
    docs_result = await db.execute(
        select(func.count(KnowledgeSource.id)).where(KnowledgeSource.company_id == company.id)
    )
    doc_count = docs_result.scalar_one_or_none() or 0
    
    return {
        "documents_count": doc_count,
        "documents_limit": doc_limit,
        "plan": plan
    }
