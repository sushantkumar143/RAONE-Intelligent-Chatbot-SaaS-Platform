import asyncio
from sqlalchemy import text
from app.database import engine

async def migrate():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE companies ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;"))
            print("Successfully added 'subscription_expires_at' column to 'companies' table.")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("'subscription_expires_at' column already exists.")
            else:
                print(f"Error during migration: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
