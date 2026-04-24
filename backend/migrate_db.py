import asyncio
import logging
from sqlalchemy import text
from app.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def migrate():
    logger.info("Starting database migration to add analytics fields to messages table...")
    try:
        async with engine.begin() as conn:
            # Add input_tokens column if not exists
            await conn.execute(text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS input_tokens INTEGER;"))
            
            # Add output_tokens column if not exists
            await conn.execute(text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS output_tokens INTEGER;"))
            
            # Add model_used column if not exists
            await conn.execute(text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS model_used VARCHAR(100);"))
            
            logger.info("Migration successful: Added input_tokens, output_tokens, and model_used columns to messages table.")
    except Exception as e:
        logger.error(f"Migration failed: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
