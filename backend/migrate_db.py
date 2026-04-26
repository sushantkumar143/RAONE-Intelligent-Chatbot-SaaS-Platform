import asyncio
from sqlalchemy import text
from app.database import engine

async def migrate():
    async with engine.begin() as conn:
        try:
            # Adding the column. We use IF NOT EXISTS if supported, but in Postgres for columns, 
            # we just catch the duplicate column exception if it's already there.
            # Using text execution.
            await conn.execute(text("ALTER TABLE companies ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free';"))
            print("Successfully added 'subscription_plan' column to 'companies' table.")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("'subscription_plan' column already exists.")
            else:
                print(f"Error during migration: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
